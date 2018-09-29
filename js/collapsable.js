define(function () {
	/**
	 * Module that controlls collapsable elements and controllers.
	 * @public
	 * @module collapsable
	 */

	/** Class to be toggled when collapsing or expanding a element */
	const collapsedClass = "collapsed";

	/** Class of the elements that can toggle collapsable */
	const collapsableControllerClass = "collapsable-controller";

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
	 * @name collapse
	 * @public
	 * @param {String} Selector
	 * @param {Element} Controller that called
	 */
	let collapse = function(selector, cntr){
		let targets = _getTargets(selector);

		//console.log("Collapsing ("+selector+")", targets);
		
		for(let i = 0; i < targets.length; ++i){
			targets[i].classList.toggle(collapsedClass);
			targets[i].dataset.collapsed = targets[i].classList.contains(collapsedClass);
		}

		if(cntr.dataset.activeclass !== undefined && cntr.dataset.activeclass.length != 0) activeClass(cntr.dataset.activeclass, cntr.dataset.activetarget || "this", cntr);
	};

	/**
	 * Sets the active (is collapsed) class of the element.
	 * @function
	 * @name activeClass
	 * @public
	 * @param {String} Class
	 * @param {Element} Element targeted
	 * @param {Element} Controller that called
	 */
	let activeClass = function(cls, elem, cntr){
		let targets = Array();
		let status = _checkIfTargetIsCollapsed(cntr.dataset.collapse);
		
		if(elem.length == 0 || elem === "this") targets[0] = cntr;
		else targets = _getTargets(elem);

		for(let i = 0; i < targets.length; ++i)
			if(status) targets[i].classList.add(cls);
			else targets[i].classList.remove(cls);
	}

	/**
	 * Sets the initial collapsed status, based on the collapsed data, of the elements targeted by selector.
	 * @function
	 * @name _initiateStartupValue
	 * @private
	 * @param {String} Selector
	 */
	let _initiateStartupValue = function(selector){
		let targets = _getTargets(selector);
		
		for(let i = 0; i < targets.length; ++i){
			if(String(targets[i].dataset.collapsed).toLowerCase() === "true") targets[i].classList.add(collapsedClass);
			else targets[i].classList.remove(collapsedClass);
		}
	}

	/**
	 * Starts the module. Adds the onClick event listener to controllers and sets the default status.
	 * @function
	 * @name startup
	 * @public
	 */
	let startup = function(){
		let tmp = document.getElementsByClassName(collapsableControllerClass);
		//console.log(tmp);

		for(let i = 0; i < tmp.length; ++i){
			if(tmp[i].dataset.collapse === undefined){
				console.warn("Element has collapsable controller class but doesn't have a collapse target.", this);
				continue;
			}

			tmp[i].addEventListener("click", function(){
				collapse(this.dataset.collapse, this);
			});

			_initiateStartupValue(tmp[i].dataset.collapse);
		}
	}

    return startup;
});