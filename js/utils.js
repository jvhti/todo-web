define(function () {
	/**
	 * Utility module
	 * @public
	 * @module Utils
	 */

	/**
	 * Helper function to get the first parent of a element with a set tag name.
	 * @function
	 * @name getParent
	 * @public
	 * @param {String} Tag to search for
	 * @param {Element} Starting point
	 */
	let getParent = function(tag, elem){
	 	if(elem.tagName === tag) return elem;
	 	return getParent(tag, elem.parentElement);
	}

	return { getParent };
});
