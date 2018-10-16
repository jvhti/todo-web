define(["../dist/js/Sortable.min","utils"], function (Sortable, utils) {
	/**
	 * Sortable module, lets lists be rearranged.
	 * @public
	 * @module Sortable'
 	 * @param {Element} container ToDo List or Archive
	 */
	return function(container){
		/** Sortable.js object for current instance. */
		let sortableObj = null;

		/**
		 * Start the Sortable.js on the container given by Constructor.
		 * @function
		 * @name startup
		 * @public
		 */
		let startup = function(){
			// console.log("Started", container);

			sortableObj = Sortable.create(container, {
				handle: ".button--drag",
				draggable: "tr:not(.list-table__entry--new-todo)",
				onUpdate: function(e){
					let ev = new CustomEvent("sortableUpdate");
					e.target.dispatchEvent(ev);
				}
			});

		}


		/**
		 * Destroy Sortable.js on the container given by Constructor.
		 * @function
		 * @name remove
		 * @public
		 */
		let remove = function(){
			sortableObj.destroy();
		}

		return {startup, remove};
	};
});
