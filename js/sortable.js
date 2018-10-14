
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
	return function(list, listElem){
		let sortableObj = null;

		let startup = function(){
			// console.log("Started", listElem);

			sortableObj = Sortable.create(listElem, {
				handle: ".drag-btn",
				filter: ".drag-btn-add",
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
