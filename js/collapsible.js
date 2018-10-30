define(['utils'], function (utils) {
	/**
	 * Module that controlls collapsible elements and controllers.
	 * @public
	 * @module Collapsible
	 * @param {String} Controller-Class Class of the elements that can toggle a collapse
	 * @param {String} Collapsed-Class Class to be toggled on targets
	 */
	return function(collapsibleControllerClass = "collapsible-controller", collapsedClass = "collapsed"){

		/**
		 * Returns an array of targets for the selector.
		 * @function
		 * @name _getTargets
		 * @private
		 * @param {String} Selector
		 * @return {Array} Elements targeted by selector
		 */
		let _getTargets = function(selector){
			let targets = document.querySelectorAll(selector);

			if(targets.length === 0){
				console.error("Empty target list for selector \"" + selector + "\".");
				return;
			}

			return targets;
		}

		/**
		 * Returns whether the first targeted element is currently collapsed.
		 * @function
		 * @name _checkIfTargetIsCollapsed
		 * @private
		 * @param {String} Selector
		 * @return {Boolean} Whether first targeted element is collapsed
		 */
		let _checkIfTargetIsCollapsed = function(selector){
			let targets = _getTargets(selector);

			return targets.length != 0 && (String(targets[0].dataset.collapsed).toLowerCase() === "true");
		}

		/**
		 * Collapses or Expands the target elements by the selector.
		 * @function
		 * @name _toggleCollapsed
		 * @private
		 * @param {Event} Click-Event
		 */
		let _toggleCollapsed = function(ev){
			ev.preventDefault();
			let cntr = utils.getParentWithClass(ev.target, collapsibleControllerClass);
			let targets = _getTargets(cntr.dataset.collapse);

			//console.log("Collapsing ("+selector+")", targets);
		
			for(let i = 0; i < targets.length; ++i){
				targets[i].classList.toggle(collapsedClass);
				targets[i].dataset.collapsed = targets[i].classList.contains(collapsedClass);
			}

			_updateActiveState(cntr.dataset.activeclass, cntr.dataset.activetarget || "this", cntr);
		};

		/**
		 * Sets the ARIA Pressed value and active (is collapsed) class of the element.
		 * @function
		 * @name _updateActiveState
		 * @private
		 * @param {String} Class Controller Active Class
		 * @param {Element} Element targeted
		 * @param {Element} Controller
		 */
		let _updateActiveState = function(cls, elem, cntr){
			let targets = Array();
			let status = _checkIfTargetIsCollapsed(cntr.dataset.collapse);
		
			cntr.setAttribute("aria-pressed", status);

			if(cntr.dataset.saveas !== undefined && cntr.dataset.saveas.length !== 0) sessionStorage.setItem(cntr.dataset.saveas, status.toString());

			if(cls === undefined || cntr.dataset.activeclass.length == 0) return;

			if(elem.length == 0 || elem === "this") targets[0] = cntr;
			else targets = _getTargets(elem);

			for(let i = 0; i < targets.length; ++i){
				if(status) targets[i].classList.add(cls);
				else targets[i].classList.remove(cls);
			}
		}

		/**
		 * Sets the initial collapsed status, based on the collapsed data, of the elements targeted by selector.
		 * @function
		 * @name _initiateStartupValue
		 * @private
		 * @param {Element} Controller
		 * @param {String} Selector
		 */
		let _initiateStartupValue = function(elem, selector){
			let targets = _getTargets(selector);
			let status = false;

			if(elem.dataset.saveas !== undefined && elem.dataset.saveas.length !== 0) status = ((sessionStorage.getItem(elem.dataset.saveas) || "").toLowerCase() === "true");

			for(let i = 0; i < targets.length; ++i){
				if(String(targets[i].dataset.collapsed).toLowerCase() === "true" || status) targets[i].classList.add(collapsedClass);
				else targets[i].classList.remove(collapsedClass);
			}
		}
		
		/**
		 * Apply Collapsible to a element
		 * @function
		 * @name applyTo
		 * @public
		 */
		let applyTo = function(elem){
			if(elem.dataset.collapse === undefined){
				console.warn("Element has collapsible controller class but doesn't have a collapse target.", elem);
				return;
			}

			elem.addEventListener("click", _toggleCollapsed);

			_initiateStartupValue(elem, elem.dataset.collapse);
		}

		/**
		 * Starts the module. Adds the onClick event listener to controllers and sets the default status.
		 * @function
		 * @name startup
		 * @public
		 */
		let startup = function(){
			let tmp = document.getElementsByClassName(collapsibleControllerClass);
			// console.log(tmp);
	
			for(let i = 0; i < tmp.length; ++i)	applyTo(tmp[i]);
		}

		/**
		 * Unloads the module. Removes events listeners added by the startup. Won't work in case of calling applyTo a element without the collapsible controller class.
		 * @function
		 * @name unload
		 * @public
		 */		
		let unload = function(){
			let tmp = document.getElementsByClassName(collapsibleControllerClass);
			
			for(let i = 0; i < tmp.length; ++i)
				tmp[i].removeEventListener("click", _toggleCollapsed);
		}

		return {startup, unload, applyTo};
	}
});
