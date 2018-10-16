define(['utils', 'sortable'], function (utils, sortable) {
	return function(addButtonElem, listElem, archiveElem, todoTemplateElem, archiveTemplateElem, totalTodo, totalArchive) {
		/**
		 * Module that controlls ToDo entries and Archive
		 * @public
		 * @module ToDo
		 */

		/** Save archive to session or to local storage */
		const saveArchiveToSession = true;

		/** Cooldown time to remove a completed ToDo */
		const cooldownArchivingTime = 2;

		/** Start of the message on cooldown placeholder */
		const COOLDOWN_ARCHIVING_PLACEHOLDER_START = "Will be moved to archive in ";
		/** End of the message on cooldown placeholder */
		const COOLDOWN_ARCHIVING_PLACEHOLDER_END = " seconds.";

		/** List of current ToDo */
		let list = [];

		/** Archive of completed ToDo */
		let archive = [];

		/** Sortable module instance for list */
		let listSortable = sortable(listElem);

		/** Sortable module instance for archive */
		let archiveSortable = sortable(archiveElem);

		/**
		 * Create a clone of a template and populate the clone's text.
		 * @function
		 * @name _createTemplateClone
		 * @private
		 * @param {String} ToDo-Text
		 * @param {Element} Template
		 */
		 let _createTemplateClone = function(text, template){
			let added = template.content.cloneNode(true);

			added.querySelector("input").value = text;
					
			return added.querySelector("tr");
		 }

		/**
		 * Create and append to list a new ToDo entry with properly event listeners.
		 * @function
		 * @name _createToDoEntry
		 * @private
		 * @param {String} Text
		 * @param {Input} New-ToDo-Input
		 */
		 let _createToDoEntry = function(text, newToDoInput, creationDate){
		 	if(!creationDate) creationDate = new Date();
			let added = _createTemplateClone(text, todoTemplateElem);
			
			added.dataset.todoid = list.length;
			
			list[list.length] = {text, creationDate};
			
			added.querySelector("input").addEventListener("change", _updateToDo);
			added.querySelector(".button--check").addEventListener("click", _onFinisheToDo);
			
			listElem.insertBefore(added, utils.getParent("TR", newToDoInput));
		 }

		/**
		 * Creates and Append a new Archive Entry.
		 * @function
		 * @name _createArchiveEntry
		 * @private
		 * @param {String} Text
		 */
		let _createArchiveEntry = function(text, creationDate, finishedDate){
			if(!finishedDate) finishedDate = new Date();
			let added = _createTemplateClone(text, archiveTemplateElem);

			added.dataset.archiveid = archive.length;
			archive[archive.length] = {text, creationDate, finishedDate};

			added.querySelector("input").readOnly = true;
			added.querySelector(".button--remove").addEventListener("click", _removeArchiveEntry);

			archiveElem.appendChild(added);
		}

		/**
		 * Removes the clicked Archive Entry.
		 * @function
		 * @name _removeArchiveEntry
		 * @private
		 * @param {Event} Click-Event
		 */
		let _removeArchiveEntry = function(ev){
			ev.preventDefault();
			let id = utils.getParent("TR", ev.target).dataset.archiveid;

			if(id > archive.length || id < 0) return;
			
			let x = 0;
			let archivesEntries = archiveElem.querySelectorAll("tr");

			archive.splice(id, 1);
			let tmp = archiveElem.removeChild(archivesEntries[id]);
			tmp.removeEventListener("click", _removeArchiveEntry);

			for(let i = id; i < archivesEntries.length; ++i) --archivesEntries[i].dataset.archiveid;
			_saveToStorage();
		}

		/**
		 * Called when user clicks the Add Button. Will create a new ToDo Entry and save to storage.
		 * @function
		 * @name _addToDo
		 * @private
		 * @param {Input} New-ToDo
		 * @param {Element} ToDo-Table
		 */
		let _addToDo = function(newToDoInput, ev) {
			ev.preventDefault();
			if(newToDoInput.value.trim().length === 0) return;
			
			_createToDoEntry(newToDoInput.value.trim(), newToDoInput);

			newToDoInput.value = "";

			_saveToStorage();
		}
		
		/**
		 * Removes the ToDo at position 'i'.
		 * @function
		 * @name _removeToDo
		 * @private
		 * @param {Number} ID
		 */
		let _removeToDo = function(id){
			if(id > list.length || id < 0) return;
			
			let x = 0;
			let todos = listElem.querySelectorAll("tr:not(.list-table__entry--new-todo)");

			list.splice(id, 1);
			let tmp = listElem.removeChild(todos[id]);
			
			tmp.querySelector("input").removeEventListener("change", _updateToDo);
			tmp.querySelector(".button--check").removeEventListener("click", _onFinisheToDo);

			for(let i = id; i < todos.length; ++i) --todos[i].dataset.todoid;
			_saveToStorage();
		}

		/**
		 * Called when user updates a ToDo value. Will remove empty ToDo. Will save to storage.
		 * @function
		 * @name _updateToDo
		 * @private
		 * @param {Element} ToDo-Table
		 * @param {Event} OnChange-Event-Data
		 */
		let _updateToDo = function(ev){
			let target = utils.getParent("TR", ev.target);
			
			if(ev.target.value.length === 0) return _removeToDo(target.dataset.todoid);

			list[target.dataset.todoid].text = ev.target.value;

			_saveToStorage();
		}

		/**
		 * Called when user click on complete ToDo. Will mark the ToDo as in cooldown, adds new event listeners. Can be cancelled by calling again.
		 * @function
		 * @name _onFinisheToDo
		 * @private
		 * @param {Event} Event-Data
		 */
		let _onFinisheToDo = function(ev){
			ev.preventDefault();
			let target = utils.getParent("TR", ev.target);
			let input = target.querySelector("input");

			if(target.dataset.cooldownarchiving) return _cancelMovingToArchive(target);

			target.dataset.cooldownarchiving = true;
			target.dataset.cooldowntime = cooldownArchivingTime;

			target.dataset.todomessage = input.value;
			
			input.value = "";
			input.placeholder = COOLDOWN_ARCHIVING_PLACEHOLDER_START+(parseInt(cooldownArchivingTime)+1)+COOLDOWN_ARCHIVING_PLACEHOLDER_END;

			target.removeEventListener("change", _updateToDo);
			target.addEventListener("mouseleave", _startArchivingCountdown);
			target.addEventListener("archivetodo", _archiveToDo);
		}

		/**
		 * Called when user removes mouse from ToDo. Starts the cooldown count. Removes the event that called it. Starts a Interval.
		 * @function
		 * @name _startArchivingCountdown
		 * @private
		 * @param {Event} Event Data
		 */
		let _startArchivingCountdown = function(ev){
			let target = utils.getParent("TR", ev.target);
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

			input.placeholder = COOLDOWN_ARCHIVING_PLACEHOLDER_START+(parseInt(target.dataset.cooldowntime)+1)+COOLDOWN_ARCHIVING_PLACEHOLDER_END;
		}

		/**
		 * Custom event generated by the end of the cooldown countdown. Will remove the ToDo and create a new Archive entry. Will save to Storage.
		 * @function
		 * @name _archiveToDo
		 * @private
		 * @param {Event} ArchiveToDo-Event
		 */
		let _archiveToDo = function(ev){
			let message = list[ev.detail.todoid].text;
			let creationDate = list[ev.detail.todoid].creationDate;
			
			_removeToDo(ev.detail.todoid);

			_createArchiveEntry(message, creationDate);
			_saveToStorage();
		}

		/**
		 * Cancel the move to archive, can be called anytime before the end of the countdown. Will remove all event listeners and data added for the removal. 
		 * @function
		 * @name _cancelMovingToArchive
		 * @private
		 * @param {Element} Target
		 */
		let _cancelMovingToArchive = function(target){
			let input = target.querySelector("input");

			target.removeEventListener("mouseleave", _startArchivingCountdown);
			target.removeEventListener("archivetodo", _archiveToDo);
			target.addEventListener("change", _updateToDo);

			if(target.dataset.intervalid){
				// console.log("removed Timer");
				clearInterval(target.dataset.intervalid);
				delete target.dataset.intervalid;
			}

			// input.value = target.dataset.todomessage;
			input.value = list[target.dataset.todoid].text;
			input.placeholder = "";

			delete target.dataset.cooldownarchiving;
			delete target.dataset.cooldowntime;
			delete target.dataset.todomessage;
		}

		/**
		 * Saves ToDo list in LocalStorage and Archive in SessionStorage. Updates Total Count.
		 * @function
		 * @name _saveToStorage
		 * @private
		 */
		let _saveToStorage = function(){
			// let listJSON = JSON.stringify(list);
			// let archiveJSON = JSON.stringify(archive);
			let sortedList = [];
			let sortedArchive = []
			let listChilds = listElem.querySelectorAll("tr");
			let archiveChilds = archiveElem.querySelectorAll("tr");

			for (var i = 0; i < listChilds.length - 1; i++)	sortedList[i] = list[listChilds[i].dataset.todoid];
			for (var i = 0; i < archiveChilds.length; i++)	sortedArchive[i] = archive[archiveChilds[i].dataset.archiveid];
			
			// console.log("Saving...", sortedList, sortedArchive);

			localStorage.setItem('todos', JSON.stringify(sortedList));
			(saveArchiveToSession ? sessionStorage : localStorage).setItem('archive', JSON.stringify(sortedArchive));

			_updateTotal();
		}

		/**
		 * Loads ToDo list from LocalStorage and Archive from SessionStorage. Will clear old values and elements.
		 * @function
		 * @name _loadFromStorage
		 * @private
		 * @param {String} ToDo-Text
		 */
		let _loadFromStorage = function(newToDoInput){
			let newList = JSON.parse(localStorage.getItem('todos')) || [];
			let newArchive = JSON.parse((saveArchiveToSession ? sessionStorage : localStorage).getItem('archive')) || [];
			
			// console.log("Loaded...", newList, newArchive);

			let oldTodos = listElem.querySelectorAll("tr:not(.list-table__entry--new-todo)");
			oldTodos.forEach((x,i,a) => { x.parentElement.removeChild(x); });

			let oldArchive = archiveElem.querySelectorAll("tr");
			oldArchive.forEach((x,i,a) => { x.parentElement.removeChild(x); });

			for(let i = 0; i < newList.length; ++i) _createToDoEntry(newList[i].text, newToDoInput, newList[i].creationDate);
			for(let i = 0; i < newArchive.length; ++i) _createArchiveEntry(newArchive[i].text, newArchive[i].creationDate, newArchive[i].finishedDate);

			_updateTotal();
		}

		/**
		 * Update ToDo and Archive total count.
		 * @function
		 * @name _updateTotals
		 * @private
		 */
		let _updateTotal = function(){
			totalTodo.innerText = list.length;
			totalArchive.innerText = archive.length;
		}

		/**
		 * Starts the module. Adds the onClick event listener to add button, initialize list and archive.
		 * @function
		 * @name startup
		 * @public
		 */
		let startup = function(){
			let newToDoInput = addButtonElem.parentElement.parentElement.querySelector("input");
			let addToDo = _addToDo.bind(null, newToDoInput);

			addButtonElem.addEventListener("click", addToDo);
			newToDoInput.addEventListener("keyup", (e) => { if(e.keyCode != 13) return; addToDo(e);} );

			_loadFromStorage(newToDoInput);

			listSortable.startup();
			archiveSortable.startup();

			listElem.addEventListener("sortableUpdate", () => { _saveToStorage(); });
			archiveElem.addEventListener("sortableUpdate", () => { _saveToStorage(); });

			// console.log("LIST: ",list);
		}

		return startup();
	};
});
