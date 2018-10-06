define(function () {
	/**
	 * Module that controlls todo entries and archive
	 * @public
	 * @module ToDo
	 */

	const cooldownArchivingTime = 5; 
	const COOLDOWN_ARCHIVING_PLACEHOLDER_START = "Will be moved to archive in ";
	const COOLDOWN_ARCHIVING_PLACEHOLDER_END = " seconds.";

	let list = [];
	let archive = [];

	let templateElem = null;

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
	 * Create a clone of template and populate text.
	 * @function
	 * @name _createTemplateClone
	 * @private
	 * @param {String} ToDo-Text
	 */
	 let _createTemplateClone = function(text){
		let added = templateElem.content.cloneNode(true);

		added.querySelector("input").value = text;
				
		return added.querySelector("tr");
	 }

	/**
	 * Create and append to list a new ToDo entry.
	 * @function
	 * @name _createToDoEntry
	 * @private
	 * @param {String} ToDo-Text
	 * @param {Input} New-ToDo
	 * @param {Element} ToDo-Table
	 * @param {Element} Archive-Table
	 */
	 let _createToDoEntry = function(text, newToDoInput, listElem, archiveElem){
		let added = _createTemplateClone(text, templateElem);
		
		added.dataset.todoid = list.length;
		
		list[list.length] = text;
		
		added.querySelector("input").addEventListener("change", _updateToDo.bind(null, listElem));
		added.querySelector(".check-btn").addEventListener("click", _onFinisheToDo.bind(null, listElem, archiveElem));
		
		listElem.insertBefore(added, _getParent("TR", newToDoInput));
	 }

	/**
	 * Called when user clicks the Add Button. Will create a new ToDo Entry and add it to List.
	 * @function
	 * @name _addToDo
	 * @private
	 * @param {Input} New-ToDo
	 * @param {Element} ToDo-Table
	 * @param {Element} Archive-Table
	 * @param {Element} ToDo-Template
	 */
	let _addToDo = function(newToDoInput, listElem, archiveElem, templateElem) {
		if(newToDoInput.value.length === 0) return;
		
		_createToDoEntry(newToDoInput.value, newToDoInput, listElem, archiveElem, templateElem);

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

	let _onFinisheToDo = function(listElem, archiveElem, ev){
		console.log(ev);
		
		let target = _getParent("TR", ev.target);
		let input = target.querySelector("input");
		let archiveToDo = _archiveToDo.bind(null, listElem, archiveElem);

		if(target.dataset.cooldownarchiving) return _cancelMovingToArchive(target, archiveToDo);

		target.dataset.cooldownarchiving = true;
		target.dataset.cooldowntime = cooldownArchivingTime;

		target.dataset.todomessage = input.value;
		input.value = "";
		input.placeholder = COOLDOWN_ARCHIVING_PLACEHOLDER_START+(cooldownArchivingTime)+COOLDOWN_ARCHIVING_PLACEHOLDER_END;

		target.addEventListener("mouseleave", _startArchivingCountdown);
		target.addEventListener("archivetodo", archiveToDo);
	}

	let _startArchivingCountdown = function(ev){
		let target = _getParent("TR", ev.target);
		let input = target.querySelector("input");

		target.dataset.intervalid = setInterval(_countdown, 1000, target, input);
		target.removeEventListener("mouseleave", _startArchivingCountdown);
	}

	let _countdown = function(target, input){
		--target.dataset.cooldowntime;
		
		if(target.dataset.cooldowntime < 0){
			target.dataset.cooldowntime = 0;
			target.dispatchEvent(new CustomEvent("archivetodo", {detail: { todoid: target.dataset.todoid }}));
			clearInterval(target.dataset.intervalid);
		}

		input.placeholder = COOLDOWN_ARCHIVING_PLACEHOLDER_START+(target.dataset.cooldowntime)+COOLDOWN_ARCHIVING_PLACEHOLDER_END;
	}

	let _archiveToDo = function(listElem, archiveElem, ev){
		let message = list[ev.detail.todoid];
		
		_removeToDo(listElem, ev.detail.todoid);
		
		let added = _createTemplateClone(message);

		added.dataset.archiveid = archive.length;
		archive[archive.length] = message;

		// let tmp = elem.querySelector(".check-btn");
		// tmp.parentElement.removeChild(tmp);

		archiveElem.appendChild(added);
	}

	let _cancelMovingToArchive = function(target, archiveToDo){
		let input = target.querySelector("input");

		target.removeEventListener("mouseleave", _startArchivingCountdown);
		target.removeEventListener("archivetodo", archiveToDo);

		if(target.dataset.intervalid){
			console.log("removed Timer");
			clearInterval(target.dataset.intervalid);
			delete target.dataset.intervalid;
		}

		// input.value = target.dataset.todomessage;
		input.value = list[target.dataset.todoid];
		input.placeholder = "";

		delete target.dataset.cooldownarchiving;
		delete target.dataset.cooldowntime;
		delete target.dataset.todomessage;
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
		let tmp = listElem.removeChild(todos[id]);

		for(let i = id; i < todos.length; ++i) --todos[i].dataset.todoid;
		_saveToStorage();
		return tmp;
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
	 * @param {Element} Archive-Table
	 * @param {Element} ToDo-Template
	 */
	let _loadFromStorage = function(newToDoInput, listElem, archiveElem, templateElem){
		let newList = JSON.parse(localStorage.getItem('todos'));
		
		console.log("Loaded...", newList);

		let oldTodos = listElem.querySelectorAll("tr:not(.new-todo)");
		oldTodos.forEach((x,i,a) => { x.parentElement.removeChild(x); });

		delete oldTodos;

		for(let i = 0; i < newList.length; ++i) _createToDoEntry(newList[i], newToDoInput, listElem, archiveElem, templateElem);
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
	let startup = function(addButtonElem, listElem, archiveElem, _templateElem){
		templateElem = _templateElem;
		let newToDoInput = addButtonElem.parentElement.parentElement.querySelector("input");
		let addToDo = _addToDo.bind(null, newToDoInput, listElem, archiveElem, templateElem);

		addButtonElem.addEventListener("click", addToDo);
		newToDoInput.addEventListener("keyup", (e) => { if(e.keyCode != 13) return; addToDo();} );

		_loadFromStorage(newToDoInput, listElem, archiveElem, templateElem);
	}

	return startup;
});