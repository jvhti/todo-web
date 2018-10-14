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


	/**
	 * Helper function to get the first parent of a element with a class name (and if needed with a set tag).
	 * @function
	 * @name getParentWithClass
	 * @public
	 * @param {Element} Starting point
	 * @param {String} Class to search for
	 * @param {String} Tag to search for
	 */
	let getParentWithClass = function(elem, className, tag="*"){
	 	if(elem.classList.contains(className) && (tag === "*" || tag === elem.tagName)) return elem;
	 	return getParentWithClass(elem.parentElement, className, tag);
	}

	return { getParent, getParentWithClass };
});
