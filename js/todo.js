define(function () {
	/**
	 * Module that controlls todo entries and archive
	 * @public
	 * @module ToDo
	 */

	/** Cooldown time to remove a completed ToDo */
	const cooldownArchivingTime = 3;

	/** Start of the message on cooldown placeholder */
	const COOLDOWN_ARCHIVING_PLACEHOLDER_START = "Will be moved to archive in ";
	/** End of the message on cooldown placeholder */
	const COOLDOWN_ARCHIVING_PLACEHOLDER_END = " seconds.";

	/** List of current ToDo */
	let list = [];

	/** Archive of completed ToDo */
	let archive = [];

	/** Template element */
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
	 * Create and append to list a new ToDo entry with properly event listeners.
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
	 * Called when user clicks the Add Button. Will create a new ToDo Entry and save to storage.
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
	 * Called when user updates a ToDo value. Will remove empty ToDo. Will save to storage.
	 * @function
	 * @name _updateToDo
	 * @private
	 * @param {Element} ToDo-Table
	 * @param {Event} OnChange Event Data
	 */
	let _updateToDo = function(listElem, ev){
		let target = _getParent("TR", ev.target);
		
		if(ev.target.value.length === 0) return _removeToDo(listElem, target.dataset.todoid);

		list[target.dataset.todoid] = ev.target.value;

		_saveToStorage();
	}

	/**
	 * Called when user click on complete ToDo. Will mark the ToDo as in cooldown, adds new event listeners. Can be cancelled by calling again.
	 * @function
	 * @name _onFinisheToDo
	 * @private
	 * @param {Element} ToDo-Table
	 * @param {Element} Archive-Table
	 * @param {Event} Event Data
	 */
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

	/**
	 * Called when user removes mouse from ToDo. Starts the cooldown count. Removes the event that called it. Starts a Interval.
	 * @function
	 * @name _startArchivingCountdown
	 * @private
	 * @param {Event} Event Data
	 */
	let _startArchivingCountdown = function(ev){
		let target = _getParent("TR", ev.target);
		let input = target.querySelector("input");

		target.dataset.intervalid = setInterval(_countdown, 1000, target, input);
		target.removeEventListener("mouseleave", _startArchivingCountdown);
	}

	/**
	 * Called by the interval of _startArchivingCountdown. Will decrease the cooldown time and update input placeholder text. When cooldown time reaches 0, will stop the interval and dispatch a ArchiveToDo event.
	 * @function
	 * @name _countdown
	 * @private
	 * @param {Element} ToDo-TR-Target
	 * @param {Element} ToDo-Input
	 */
	let _countdown = function(target, input){
		--target.dataset.cooldowntime;
		
		if(target.dataset.cooldowntime < 0){
			target.dataset.cooldowntime = 0;
			target.dispatchEvent(new CustomEvent("archivetodo", {detail: { todoid: target.dataset.todoid }}));
			clearInterval(target.dataset.intervalid);
		}

		input.placeholder = COOLDOWN_ARCHIVING_PLACEHOLDER_START+(target.dataset.cooldowntime)+COOLDOWN_ARCHIVING_PLACEHOLDER_END;
	}

	/**
	 * Creates and Append a new Archive Entry.
	 * @function
	 * @name _createArchiveEntry
	 * @private
	 * @param {String} Text
	 * @param {Element} Archive-Table
	 */
	let _createArchiveEntry = function(text, archiveElem){
		let added = _createTemplateClone(text);

		added.dataset.archiveid = archive.length;
		archive[archive.length] = text;

		archiveElem.appendChild(added);
	}

	/**
	 * Custom event generated by the end of the cooldown countdown. Will remove the ToDo and create a new Archive entry. Will save to Storage.
	 * @function
	 * @name _archiveToDo
	 * @private
	 * @param {Element} ToDo-Table
	 * @param {Element} Archive-Table
	 * @param {Event} ArchiveToDo-Event
	 */
	let _archiveToDo = function(listElem, archiveElem, ev){
		let message = list[ev.detail.todoid];
		
		_removeToDo(listElem, ev.detail.todoid);

		_createArchiveEntry(message, archiveElem);
		_saveToStorage();
	}

	/**
	 * Cancel the move to archive, can be called anytime before the end of the countdown. Will remove all event listeners and data added for the removal. 
	 * @function
	 * @name _cancelMovingToArchive
	 * @private
	 * @param {Element} Target
	 * @param {Function} ArchiveToDo
	 */
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
	 * Saves ToDo list in LocalStorage and Archive in SessionStorage.
	 * @function
	 * @name _saveToStorage
	 * @private
	 */
	let _saveToStorage = function(){
		let listJSON = JSON.stringify(list);
		let archiveJSON = JSON.stringify(archive);
		console.log("Saving...", listJSON, archiveJSON);
		localStorage.setItem('todos', listJSON);
		sessionStorage.setItem('archive', archiveJSON);
	}

	/**
	 * Loads ToDo list from LocalStorage and Archive from SessionStorage.
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
		let newArchive = JSON.parse(sessionStorage.getItem('archive'));
		
		console.log("Loaded...", newList, newArchive);

		let oldTodos = listElem.querySelectorAll("tr:not(.new-todo)");
		oldTodos.forEach((x,i,a) => { x.parentElement.removeChild(x); });

		let oldArchive = archiveElem.querySelectorAll("tr");
		oldArchive.forEach((x,i,a) => { x.parentElement.removeChild(x); });

		delete oldTodos;
		delete oldArchive;

		for(let i = 0; i < newList.length; ++i) _createToDoEntry(newList[i], newToDoInput, listElem, archiveElem, templateElem);
		for(let i = 0; i < newArchive.length; ++i) _createArchiveEntry(newArchive[i], archiveElem);
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