/**
 * Service Worker
 * @public
 * @module Service Worker
 */


/**
 * Namo of the cache.
 * @public
 */
const cacheName = 'todo-pwa';

/**
 * List of static assets to cache.
 * @public
 */
const staticAssets = [
	'./',
	'./index.html',
	'./dist/js/require.js',
	'./build/main-built.min.js',
	'./build/css/main.css',
	"./img/icons/icon-192x192.png",
	"./img/icons8-excluir.svg",
	"./img/icons8-plus.svg",
	"./img/left_chevron.svg",
	"./img/noun_Check Mark_5390_000000.svg",
	"./img/OOjs_UI_icon_draggable.svg"
];

/**
 * Checks if the requested file is cached and returns it. If it isn't cached, fetchs and caches it.
 * @function
 * @name cacheFirstOrCache
 * @public
 */
async function cacheFirstOrCache(req) {
	const cache = await caches.open(cacheName);
	const cachedResponse = await cache.match(req);

	if(cachedResponse === undefined){
		try{
			// console.log("Caching", req);
			const toCache = await fetch(req);
			cache.put(req, toCache.clone());
			return toCache;
		} catch (e) {
			console.log(e);
		}
	} else return cachedResponse;
}


self.addEventListener('install', async (event) => {
	const cache = await caches.open(cacheName);
	await cache.addAll(staticAssets);
});

self.addEventListener('fetch', (event) => {
	const req = event.request;
	event.respondWith(cacheFirstOrCache(req));
});