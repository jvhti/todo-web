define(function () {
	/**
	 * Module that controlls todo entries and archive
	 * @public
	 * @module ToDo
	 */

	 let list = [];
	 let archive = [];

	/**
	 * Helper function to get the first parent of a element with a set tag name.
	 * @function
	 * @name _getParent
	 * @private
	 * @param {String} Tag to search for
	 * @param {Element} Starting point
	 */
	 let _getParent = function(tag, elem){
	 	if(elem.tagName === tag) return elem;
	 	return _getParent(tag, elem.parentElement);
	 }

	/**
	 * Create and append to list a new ToDo entry.
	 * @function
	 * @name _createToDoEntry
	 * @private
	 * @param {String} ToDo-Text
	 * @param {Input} New-ToDo
	 * @param {Element} ToDo-Table
	 * @param {Element} ToDo-Template
	 */
	 let _createToDoEntry = function(text, newToDoInput, listElem, templateElem){
		let added = templateElem.content.cloneNode(true);

		added.querySelector("tr").dataset.todoid = list.length;
		
		list[list.length] = added.querySelector("input").value = text;
		
		added.querySelector("input").addEventListener("change", _updateToDo.bind(null, listElem));
		
		listElem.insertBefore(added, _getParent("TR", newToDoInput));
	 }

	/**
	 * Called when user clicks the Add Button. Will create a new ToDo Entry and add it to List.
	 * @function
	 * @name _addToDo
	 * @private
	 * @param {Input} New-ToDo
	 * @param {Element} ToDo-Table
	 * @param {Element} ToDo-Template
	 */
	let _addToDo = function(newToDoInput, listElem, templateElem) {
		if(newToDoInput.value.length === 0) return;
		
		_createToDoEntry(newToDoInput.value, newToDoInput, listElem, templateElem);

		newToDoInput.value = "";

		_saveToStorage();
	}

	/**
	 * Called when user updates a ToDo value. Will remove empty ToDo.
	 * @function
	 * @name _addToDo
	 * @private
	 * @param {Event} OnChange Event Data
	 * @param {Element} ToDo-Table
	 */
	let _updateToDo = function(listElem, ev){
		let target = _getParent("TR", ev.target);
		
		if(ev.target.value.length === 0) return _removeToDo(listElem, target.dataset.todoid);

		list[target.dataset.todoid] = ev.target.value;
		_saveToStorage();
	}
	
	/**
	 * Removes the ToDo at position 'i'.
	 * @function
	 * @name _removeToDo
	 * @private
	 * @param {Element} ToDo-Table
	 * @param {Number} ID
	 */
	let _removeToDo = function(listElem, id){
		if(id > list.length || id < 0) return;
		
		let x = 0;
		let todos = listElem.querySelectorAll("tr:not(.new-todo)");

		list.splice(id, 1);
		listElem.removeChild(todos[id]);

		for(let i = id; i < todos.length; ++i) --todos[i].dataset.todoid;
		_saveToStorage();
	}

	/**
	 * Saves ToDo list in LocalStorage.
	 * @function
	 * @name _saveToStorage
	 * @private
	 */
	let _saveToStorage = function(){
		let json = JSON.stringify(list);
		console.log("Saving...", json);
		localStorage.setItem('todos', json);
	}

	/**
	 * Loads ToDo list from LocalStorage.
	 * @function
	 * @name _loadFromStorage
	 * @private
	 * @param {String} ToDo-Text
	 * @param {Element} ToDo-Table
	 * @param {Element} ToDo-Template
	 */
	let _loadFromStorage = function(newToDoInput, listElem, templateElem){
		let newList = JSON.parse(localStorage.getItem('todos'));
		
		console.log("Loaded...", newList);

		let oldTodos = listElem.querySelectorAll("tr:not(.new-todo)");
		oldTodos.forEach((x,i,a) => { x.parentElement.removeChild(x); });

		delete oldTodos;

		for(let i = 0; i < newList.length; ++i) _createToDoEntry(newList[i], newToDoInput, listElem, templateElem);
	}

	/**
	 * Starts the module. Adds the onClick event listener to add button, initialize list and archive.
	 * @function
	 * @name startup
	 * @public
	 * @param {Element} Add-Button
	 * @param {Element} ToDo-Table
	 * @param {Element} Archive-Table
	 * @param {Element} ToDo-Template
	 */
	let startup = function(addButtonElem, listElem, archiveElem, templateElem){
		let newToDoInput = addButtonElem.parentElement.parentElement.querySelector("input");
		let addToDo = _addToDo.bind(null, newToDoInput, listElem, templateElem);

		addButtonElem.addEventListener("click", addToDo);
		newToDoInput.addEventListener("keyup", (e) => { if(e.keyCode != 13) return; addToDo();} );

		_loadFromStorage(newToDoInput, listElem, templateElem);
	}

	return startup;
});