/**
 * Сборка «пулов» мест для блоков «Где перекусить» и «Где остановиться».
 * Данные из OpenStreetMap (Overpass). Город определяется по ближайшему городу
 * области (в OSM addr:city проставлен лишь у ~6% точек).
 *
 *   node scripts/build-pools.mjs
 *
 * Пишет: src/data/food-pool.json, src/data/stay-pool.json  (коммитятся).
 * Данные © OpenStreetMap (ODbL).
 */
import { writeFile, mkdir } from 'node:fs/promises';

const OVERPASS = 'https://overpass-api.de/api/interpreter';
const AREA_ID = 3600072197;
const UA = 'vladimir33-map/1.0 (static tourism site)';
const OUT = new URL('../src/data/', import.meta.url);

const CITIES = [
  ['Владимир', 56.1290, 40.4070], ['Суздаль', 56.4194, 40.4493],
  ['Муром', 55.5731, 42.0520], ['Ковров', 56.3569, 41.3196],
  ['Гусь-Хрустальный', 55.6190, 40.6580], ['Александров', 56.3942, 38.7115],
  ['Юрьев-Польский', 56.4969, 39.6792], ['Гороховец', 56.2017, 42.6939],
  ['Кольчугино', 56.2961, 39.3786], ['Вязники', 56.2417, 42.1583],
  ['Киржач', 56.1531, 38.8639], ['Петушки', 55.9281, 39.4544],
  ['Покров', 55.9181, 39.1739], ['Собинка', 56.0094, 40.0228],
  ['Судогда', 55.9514, 40.8556], ['Камешково', 56.3492, 41.0011],
  ['Меленки', 55.3358, 41.6336], ['Лакинск', 56.0181, 39.9472],
  ['Карабаново', 56.3119, 38.7039], ['Боголюбово', 56.1969, 40.5294],
];

function nearestCity(lat, lon) {
  let best = null, bestD = Infinity;
  for (const [name, clat, clon] of CITIES) {
    const dx = (lon - clon) * Math.cos((lat * Math.PI) / 180);
    const dy = lat - clat;
    const d = Math.hypot(dx, dy) * 111;
    if (d < bestD) { bestD = d; best = name; }
  }
  return bestD <= 40 ? best : null;
}

async function overpass(query) {
  const res = await fetch(OVERPASS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
    body: 'data=' + encodeURIComponent(query),
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  return res.json();
}

const CUISINE = {
  russian: 'русская кухня', regional: 'местная кухня', asian: 'азиатская кухня',
  pizza: 'пицца', sushi: 'суши', italian: 'итальянская кухня', georgian: 'грузинская кухня',
  caucasian: 'кавказская кухня', japanese: 'японская кухня', coffee_shop: 'кофейня',
  burger: 'бургеры', seafood: 'морепродукты', turkish: 'турецкая кухня',
  european: 'европейская кухня', chinese: 'китайская кухня', uzbek: 'узбекская кухня',
  steak_house: 'стейк-хаус', international: 'кухня мира', bakery: 'выпечка',
  dessert: 'десерты', pancake: 'блины', american: 'американская кухня',
  mediterranean: 'средиземноморская', vegetarian: 'вегетарианская',
};
const STAY = {
  hotel: 'отель', guest_house: 'гостевой дом', hostel: 'хостел',
  motel: 'мотель', apartment: 'апартаменты', resort: 'база отдыха', chalet: 'шале',
};

function build(elements, detailFn) {
  const seen = new Set();
  const pool = [];
  for (const el of elements) {
    const t = el.tags || {};
    const name = t['name:ru'] || t.name;
    if (!name || seen.has(name)) continue;
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (lat == null || lon == null) continue;
    seen.add(name);
    pool.push({
      name,
      detail: detailFn(t),
      city: t['addr:city'] || nearestCity(lat, lon),
      website: t.website || t['contact:website'] || null,
    });
  }
  pool.sort((a, b) => score(b) - score(a));
  return pool.slice(0, 80);
}
const score = (p) => (p.city ? 2 : 0) + (p.detail ? 1 : 0) + (p.website ? 1 : 0);

async function main() {
  await mkdir(OUT, { recursive: true });

  const food = await overpass(`[out:json][timeout:120];
    nwr["amenity"~"^(restaurant|cafe|bar|pub)$"](area:${AREA_ID});out center tags;`);
  const foodPool = build(food.elements, (t) => {
    const c = (t.cuisine || '').split(';')[0].trim();
    return CUISINE[c] || ({ restaurant: 'ресторан', cafe: 'кафе', bar: 'бар', pub: 'паб' }[t.amenity]);
  });
  await writeFile(new URL('food-pool.json', OUT), JSON.stringify(foodPool, null, 1));
  console.log('food-pool:', foodPool.length, '| с городом:', foodPool.filter((p) => p.city).length);

  const stay = await overpass(`[out:json][timeout:120];
    nwr["tourism"~"^(hotel|guest_house|hostel|motel|apartment|resort|chalet)$"](area:${AREA_ID});out center tags;`);
  const stayPool = build(stay.elements, (t) => STAY[t.tourism] || 'размещение');
  await writeFile(new URL('stay-pool.json', OUT), JSON.stringify(stayPool, null, 1));
  console.log('stay-pool:', stayPool.length, '| с городом:', stayPool.filter((p) => p.city).length);
}

await main();
