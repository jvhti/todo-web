define(function () {
	/**
	 * Service Worker Loader Module
	 * @public
	 * @module Service Worker Loader
	 */

	/**
	 * Register the service worker if the navigator supports it. Handle errors when registering or if unavailable.
	 * @function
	 * @name registerSW
	 * @public
	 */
	async function registerSW() {
		console.log("Registering");
		if ('serviceWorker' in navigator) {
			try {
				await navigator.serviceWorker.register('./sw.js');
			} catch (err) {
				alert("Fail to register ServiceWorker.");
				console.error(err);
			}
		} else {
			console.log("ServiceWorker unavailable.");
		}
	}

	return registerSW; 
});