
// require.config({
//     paths: {
//     	"SortableJS": "../dist/js/Sortable.min"
//     }
// }

define(["../dist/js/Sortable.min","utils"], function (Sortable, utils) {
	/**
	 * Sortable module, lets lists be rearranged.
	 * @public
	 * @module Sortable
	 */
	return function(container){
		let sortableObj = null;

		let startup = function(){
			// console.log("Started", container);

			sortableObj = Sortable.create(container, {
				handle: ".drag-btn",
				draggable: "tr:not(.new-todo)",
				onUpdate: function(e){
					let ev = new CustomEvent("sortableUpdate");
					e.target.dispatchEvent(ev);
				}
			});

		}

		let remove = function(){
			sortableObj.destroy();
		}

		return {startup, remove};
	};
});
