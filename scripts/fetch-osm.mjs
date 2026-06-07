/**
 * Сборка данных карты из OpenStreetMap (Overpass API).
 * Запускается вручную при обновлении данных:  node scripts/fetch-osm.mjs
 *
 * Пишет статические файлы (коммитятся в репозиторий, посетители к API не ходят):
 *   public/data/vladimir-oblast.geojson  — точная граница области (relation 72197)
 *   public/data/poi.geojson              — объекты по категориям (named)
 *
 * Данные © участники OpenStreetMap, лицензия ODbL — атрибуция обязательна.
 */
import osmtogeojson from 'osmtogeojson';
import { writeFile, mkdir } from 'node:fs/promises';

const OVERPASS = 'https://overpass-api.de/api/interpreter';
const REL_ID = 72197;
const AREA_ID = 3600000000 + REL_ID;
const UA = 'vladimir33-map/1.0 (static tourism site)';
const OUT = new URL('../public/data/', import.meta.url);

async function overpass(query) {
  const res = await fetch(OVERPASS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
    body: 'data=' + encodeURIComponent(query),
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

function categorize(t = {}) {
  const { amenity: a, tourism: to, shop: s, historic: h, leisure: l } = t;
  const notable = t.wikidata || t.wikipedia;

  if (to === 'museum' || a === 'arts_centre') return 'museum';
  if (a === 'theatre' || a === 'cinema' || to === 'gallery') return 'cultural';
  if (['hotel', 'guest_house', 'hostel', 'motel', 'apartment', 'resort'].includes(to)) return 'hotel';
  if (['gift', 'souvenir', 'craft'].includes(s)) return 'souvenir';
  if (['restaurant', 'cafe', 'fast_food', 'bar', 'pub'].includes(a)) return 'gastronomic';

  const histGood = [
    'castle', 'monastery', 'church', 'cathedral', 'chapel', 'ruins', 'monument',
    'memorial', 'archaeological_site', 'fort', 'city_gate', 'manor', 'tomb', 'building',
  ];
  if (['attraction', 'viewpoint', 'artwork'].includes(to)) return 'touristic';
  if (h && histGood.includes(h)) return 'touristic';
  if (a === 'place_of_worship' && notable) return 'touristic';

  if (['park', 'nature_reserve'].includes(l) || to === 'camp_site') return 'natural';
  return null;
}

const KIND = {
  museum: 'Музей', cultural: 'Культура', hotel: 'Где остановиться',
  souvenir: 'Сувениры', gastronomic: 'Где поесть', touristic: 'Достопримечательность',
  natural: 'Природа',
};

async function fetchBoundary() {
  console.log('• Граница области…');
  const json = await overpass(`[out:json][timeout:180];relation(${REL_ID});out geom;`);
  const fc = osmtogeojson(json);
  const poly = fc.features.find(
    (f) => f.geometry && /Polygon$/.test(f.geometry.type)
  );
  if (!poly) throw new Error('Граница не собралась в полигон');
  const out = {
    type: 'FeatureCollection',
    features: [{ type: 'Feature', properties: { name: 'Владимирская область' }, geometry: poly.geometry }],
  };
  await writeFile(new URL('vladimir-oblast.geojson', OUT), JSON.stringify(out));
  console.log('  ✓ vladimir-oblast.geojson');
}

async function fetchPOI() {
  console.log('• Объекты (POI)…');
  const q = `[out:json][timeout:240];
    area(${AREA_ID})->.a;
    (
      nwr["amenity"~"^(restaurant|cafe|fast_food|bar|pub|theatre|cinema|arts_centre|place_of_worship)$"](area.a);
      nwr["tourism"~"^(attraction|viewpoint|artwork|museum|gallery|hotel|guest_house|hostel|motel|apartment|resort|camp_site)$"](area.a);
      nwr["shop"~"^(gift|souvenir|craft)$"](area.a);
      nwr["historic"](area.a);
      nwr["leisure"~"^(park|nature_reserve)$"](area.a);
    );
    out center tags;`;
  const json = await overpass(q);

  const seen = new Set();
  const features = [];
  let skippedNoName = 0;

  for (const el of json.elements) {
    const t = el.tags || {};
    const name = t['name:ru'] || t.name;
    if (!name) { skippedNoName++; continue; }
    const cat = categorize(t);
    if (!cat) continue;

    const lon = el.lon ?? el.center?.lon;
    const lat = el.lat ?? el.center?.lat;
    if (lon == null || lat == null) continue;

    const key = `${cat}|${name}|${lat.toFixed(4)}|${lon.toFixed(4)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lon, lat] },
      properties: {
        name,
        cat,
        kind: KIND[cat],
        website: t.website || t['contact:website'] || t.url || null,
      },
    });
  }

  features.sort((a, b) => a.properties.cat.localeCompare(b.properties.cat));
  await writeFile(
    new URL('poi.geojson', OUT),
    JSON.stringify({ type: 'FeatureCollection', features })
  );

  const byCat = {};
  for (const f of features) byCat[f.properties.cat] = (byCat[f.properties.cat] || 0) + 1;
  console.log('  ✓ poi.geojson —', features.length, 'объектов');
  console.table(byCat);
}

await mkdir(OUT, { recursive: true });
await fetchBoundary();
await fetchPOI();
console.log('Готово.');
