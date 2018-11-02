define('utils',[],function () {
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

define('collapsible',['utils'], function (utils) {
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

/*! Sortable 1.7.0 - MIT | git://github.com/rubaxa/Sortable.git */

!function(t){"use strict";"function"==typeof define&&define.amd?define('../dist/js/Sortable.min',t):"undefined"!=typeof module&&void 0!==module.exports?module.exports=t():window.Sortable=t()}(function(){"use strict";if("undefined"==typeof window||!window.document)return function(){throw new Error("Sortable.js requires a window with a document")};var t,e,n,o,i,r,a,l,s,c,d,h,u,f,p,g,v,m,_,b,D,y={},w=/\s+/g,T=/left|right|inline/,S="Sortable"+(new Date).getTime(),C=window,E=C.document,x=C.parseInt,k=C.setTimeout,N=C.jQuery||C.Zepto,B=C.Polymer,P=!1,Y="draggable"in E.createElement("div"),X=!navigator.userAgent.match(/(?:Trident.*rv[ :]?11\.|msie)/i)&&((D=E.createElement("x")).style.cssText="pointer-events:auto","auto"===D.style.pointerEvents),O=!1,I=Math.abs,M=Math.min,A=[],R=[],L=function(){return!1},F=ot(function(t,e,n){if(n&&e.scroll){var o,i,r,a,d,h,u=n[S],f=e.scrollSensitivity,p=e.scrollSpeed,g=t.clientX,v=t.clientY,m=window.innerWidth,b=window.innerHeight;if(s!==n&&(l=e.scroll,s=n,c=e.scrollFn,!0===l)){l=n;do{if(l.offsetWidth<l.scrollWidth||l.offsetHeight<l.scrollHeight)break}while(l=l.parentNode)}l&&(o=l,i=l.getBoundingClientRect(),r=(I(i.right-g)<=f)-(I(i.left-g)<=f),a=(I(i.bottom-v)<=f)-(I(i.top-v)<=f)),r||a||(a=(b-v<=f)-(v<=f),((r=(m-g<=f)-(g<=f))||a)&&(o=C)),y.vx===r&&y.vy===a&&y.el===o||(y.el=o,y.vx=r,y.vy=a,clearInterval(y.pid),o&&(y.pid=setInterval(function(){h=a?a*p:0,d=r?r*p:0,"function"==typeof c&&"continue"!==c.call(u,d,h,t,_,o)||(o===C?C.scrollTo(C.pageXOffset+d,C.pageYOffset+h):(o.scrollTop+=h,o.scrollLeft+=d))},24)))}},30),H=function(t){function e(t,e){return null!=t&&!0!==t||null!=(t=n.name)?"function"==typeof t?t:function(n,o){var i=o.options.group.name;return e?t:t&&(t.join?t.indexOf(i)>-1:i==t)}:L}var n={},o=t.group;o&&"object"==typeof o||(o={name:o}),n.name=o.name,n.checkPull=e(o.pull,!0),n.checkPut=e(o.put),n.revertClone=o.revertClone,t.group=n};try{window.addEventListener("test",null,Object.defineProperty({},"passive",{get:function(){P={capture:!1,passive:!1}}}))}catch(t){}function W(t,e){if(!t||!t.nodeType||1!==t.nodeType)throw"Sortable: `el` must be HTMLElement, and not "+{}.toString.call(t);this.el=t,this.options=e=it({},e),t[S]=this;var n={group:null,sort:!0,disabled:!1,store:null,handle:null,scroll:!0,scrollSensitivity:30,scrollSpeed:10,draggable:/[uo]l/i.test(t.nodeName)?"li":">*",ghostClass:"sortable-ghost",chosenClass:"sortable-chosen",dragClass:"sortable-drag",ignore:"a, img",filter:null,preventOnFilter:!0,animation:0,setData:function(t,e){t.setData("Text",e.textContent)},dropBubble:!1,dragoverBubble:!1,dataIdAttr:"data-id",delay:0,forceFallback:!1,fallbackClass:"sortable-fallback",fallbackOnBody:!1,fallbackTolerance:0,fallbackOffset:{x:0,y:0},supportPointer:!1!==W.supportPointer};for(var o in n)!(o in e)&&(e[o]=n[o]);H(e);for(var i in this)"_"===i.charAt(0)&&"function"==typeof this[i]&&(this[i]=this[i].bind(this));this.nativeDraggable=!e.forceFallback&&Y,V(t,"mousedown",this._onTapStart),V(t,"touchstart",this._onTapStart),e.supportPointer&&V(t,"pointerdown",this._onTapStart),this.nativeDraggable&&(V(t,"dragover",this),V(t,"dragenter",this)),R.push(this._onDragOver),e.store&&this.sort(e.store.get(this))}function j(e,n){"clone"!==e.lastPullMode&&(n=!0),o&&o.state!==n&&(G(o,"display",n?"none":""),n||o.state&&(e.options.group.revertClone?(i.insertBefore(o,r),e._animate(t,o)):i.insertBefore(o,t)),o.state=n)}function U(t,e,n){if(t){n=n||E;do{if(">*"===e&&t.parentNode===n||nt(t,e))return t}while(void 0,t=(i=(o=t).host)&&i.nodeType?i:o.parentNode)}var o,i;return null}function V(t,e,n){t.addEventListener(e,n,P)}function q(t,e,n){t.removeEventListener(e,n,P)}function z(t,e,n){if(t)if(t.classList)t.classList[n?"add":"remove"](e);else{var o=(" "+t.className+" ").replace(w," ").replace(" "+e+" "," ");t.className=(o+(n?" "+e:"")).replace(w," ")}}function G(t,e,n){var o=t&&t.style;if(o){if(void 0===n)return E.defaultView&&E.defaultView.getComputedStyle?n=E.defaultView.getComputedStyle(t,""):t.currentStyle&&(n=t.currentStyle),void 0===e?n:n[e];e in o||(e="-webkit-"+e),o[e]=n+("string"==typeof n?"":"px")}}function Q(t,e,n){if(t){var o=t.getElementsByTagName(e),i=0,r=o.length;if(n)for(;i<r;i++)n(o[i],i);return o}return[]}function Z(t,e,n,i,r,a,l,s,c){t=t||e[S];var d=E.createEvent("Event"),h=t.options,u="on"+n.charAt(0).toUpperCase()+n.substr(1);d.initEvent(n,!0,!0),d.to=r||e,d.from=a||e,d.item=i||e,d.clone=o,d.oldIndex=l,d.newIndex=s,d.originalEvent=c,e.dispatchEvent(d),h[u]&&h[u].call(t,d)}function J(t,e,n,o,i,r,a,l){var s,c,d=t[S],h=d.options.onMove;return(s=E.createEvent("Event")).initEvent("move",!0,!0),s.to=e,s.from=t,s.dragged=n,s.draggedRect=o,s.related=i||e,s.relatedRect=r||e.getBoundingClientRect(),s.willInsertAfter=l,s.originalEvent=a,t.dispatchEvent(s),h&&(c=h.call(d,s,a)),c}function K(t){t.draggable=!1}function $(){O=!1}function tt(t){for(var e=t.tagName+t.className+t.src+t.href+t.textContent,n=e.length,o=0;n--;)o+=e.charCodeAt(n);return o.toString(36)}function et(t,e){var n=0;if(!t||!t.parentNode)return-1;for(;t&&(t=t.previousElementSibling);)"TEMPLATE"===t.nodeName.toUpperCase()||">*"!==e&&!nt(t,e)||n++;return n}function nt(t,e){if(t){if(t.matches)return t.matches(e);if(t.msMatchesSelector)return t.msMatchesSelector(e)}return!1}function ot(t,e){var n,o;return function(){void 0===n&&(n=arguments,o=this,k(function(){1===n.length?t.call(o,n[0]):t.apply(o,n),n=void 0},e))}}function it(t,e){if(t&&e)for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);return t}function rt(t){return B&&B.dom?B.dom(t).cloneNode(!0):N?N(t).clone(!0)[0]:t.cloneNode(!0)}function at(t){return k(t,0)}function lt(t){return clearTimeout(t)}return W.prototype={constructor:W,_onTapStart:function(e){var n,o=this,i=this.el,r=this.options,l=r.preventOnFilter,s=e.type,c=e.touches&&e.touches[0],d=(c||e).target,h=e.target.shadowRoot&&e.path&&e.path[0]||d,u=r.filter;if(function(t){A.length=0;var e=t.getElementsByTagName("input"),n=e.length;for(;n--;){var o=e[n];o.checked&&A.push(o)}}(i),!t&&!(/mousedown|pointerdown/.test(s)&&0!==e.button||r.disabled)&&!h.isContentEditable&&(d=U(d,r.draggable,i))&&a!==d){if(n=et(d,r.draggable),"function"==typeof u){if(u.call(this,e,d,this))return Z(o,h,"filter",d,i,i,n),void(l&&e.preventDefault())}else if(u&&(u=u.split(",").some(function(t){if(t=U(h,t.trim(),i))return Z(o,t,"filter",d,i,i,n),!0})))return void(l&&e.preventDefault());r.handle&&!U(h,r.handle,i)||this._prepareDragStart(e,c,d,n)}},_prepareDragStart:function(n,o,l,s){var c,d=this,h=d.el,u=d.options,p=h.ownerDocument;l&&!t&&l.parentNode===h&&(m=n,i=h,e=(t=l).parentNode,r=t.nextSibling,a=l,g=u.group,f=s,this._lastX=(o||n).clientX,this._lastY=(o||n).clientY,t.style["will-change"]="all",c=function(){d._disableDelayedDrag(),t.draggable=d.nativeDraggable,z(t,u.chosenClass,!0),d._triggerDragStart(n,o),Z(d,i,"choose",t,i,i,f)},u.ignore.split(",").forEach(function(e){Q(t,e.trim(),K)}),V(p,"mouseup",d._onDrop),V(p,"touchend",d._onDrop),V(p,"touchcancel",d._onDrop),V(p,"selectstart",d),u.supportPointer&&V(p,"pointercancel",d._onDrop),u.delay?(V(p,"mouseup",d._disableDelayedDrag),V(p,"touchend",d._disableDelayedDrag),V(p,"touchcancel",d._disableDelayedDrag),V(p,"mousemove",d._disableDelayedDrag),V(p,"touchmove",d._disableDelayedDrag),u.supportPointer&&V(p,"pointermove",d._disableDelayedDrag),d._dragStartTimer=k(c,u.delay)):c())},_disableDelayedDrag:function(){var t=this.el.ownerDocument;clearTimeout(this._dragStartTimer),q(t,"mouseup",this._disableDelayedDrag),q(t,"touchend",this._disableDelayedDrag),q(t,"touchcancel",this._disableDelayedDrag),q(t,"mousemove",this._disableDelayedDrag),q(t,"touchmove",this._disableDelayedDrag),q(t,"pointermove",this._disableDelayedDrag)},_triggerDragStart:function(e,n){(n=n||("touch"==e.pointerType?e:null))?(m={target:t,clientX:n.clientX,clientY:n.clientY},this._onDragStart(m,"touch")):this.nativeDraggable?(V(t,"dragend",this),V(i,"dragstart",this._onDragStart)):this._onDragStart(m,!0);try{E.selection?at(function(){E.selection.empty()}):window.getSelection().removeAllRanges()}catch(t){}},_dragStarted:function(){if(i&&t){var e=this.options;z(t,e.ghostClass,!0),z(t,e.dragClass,!1),W.active=this,Z(this,i,"start",t,i,i,f)}else this._nulling()},_emulateDragOver:function(){if(_){if(this._lastX===_.clientX&&this._lastY===_.clientY)return;this._lastX=_.clientX,this._lastY=_.clientY,X||G(n,"display","none");var t=E.elementFromPoint(_.clientX,_.clientY),e=t,o=R.length;if(t&&t.shadowRoot&&(e=t=t.shadowRoot.elementFromPoint(_.clientX,_.clientY)),e)do{if(e[S]){for(;o--;)R[o]({clientX:_.clientX,clientY:_.clientY,target:t,rootEl:e});break}t=e}while(e=e.parentNode);X||G(n,"display","")}},_onTouchMove:function(t){if(m){var e=this.options,o=e.fallbackTolerance,i=e.fallbackOffset,r=t.touches?t.touches[0]:t,a=r.clientX-m.clientX+i.x,l=r.clientY-m.clientY+i.y,s=t.touches?"translate3d("+a+"px,"+l+"px,0)":"translate("+a+"px,"+l+"px)";if(!W.active){if(o&&M(I(r.clientX-this._lastX),I(r.clientY-this._lastY))<o)return;this._dragStarted()}this._appendGhost(),b=!0,_=r,G(n,"webkitTransform",s),G(n,"mozTransform",s),G(n,"msTransform",s),G(n,"transform",s),t.preventDefault()}},_appendGhost:function(){if(!n){var e,o=t.getBoundingClientRect(),r=G(t),a=this.options;z(n=t.cloneNode(!0),a.ghostClass,!1),z(n,a.fallbackClass,!0),z(n,a.dragClass,!0),G(n,"top",o.top-x(r.marginTop,10)),G(n,"left",o.left-x(r.marginLeft,10)),G(n,"width",o.width),G(n,"height",o.height),G(n,"opacity","0.8"),G(n,"position","fixed"),G(n,"zIndex","100000"),G(n,"pointerEvents","none"),a.fallbackOnBody&&E.body.appendChild(n)||i.appendChild(n),e=n.getBoundingClientRect(),G(n,"width",2*o.width-e.width),G(n,"height",2*o.height-e.height)}},_onDragStart:function(e,n){var r=this,a=e.dataTransfer,l=r.options;r._offUpEvents(),g.checkPull(r,r,t,e)&&((o=rt(t)).draggable=!1,o.style["will-change"]="",G(o,"display","none"),z(o,r.options.chosenClass,!1),r._cloneId=at(function(){i.insertBefore(o,t),Z(r,i,"clone",t)})),z(t,l.dragClass,!0),n?("touch"===n?(V(E,"touchmove",r._onTouchMove),V(E,"touchend",r._onDrop),V(E,"touchcancel",r._onDrop),l.supportPointer&&(V(E,"pointermove",r._onTouchMove),V(E,"pointerup",r._onDrop))):(V(E,"mousemove",r._onTouchMove),V(E,"mouseup",r._onDrop)),r._loopId=setInterval(r._emulateDragOver,50)):(a&&(a.effectAllowed="move",l.setData&&l.setData.call(r,a,t)),V(E,"drop",r),r._dragStartId=at(r._dragStarted))},_onDragOver:function(a){var l,s,c,f,p,m,_=this.el,D=this.options,y=D.group,w=W.active,C=g===y,E=!1,x=D.sort;if((void 0!==a.preventDefault&&(a.preventDefault(),!D.dragoverBubble&&a.stopPropagation()),!t.animated)&&(b=!0,w&&!D.disabled&&(C?x||(f=!i.contains(t)):v===this||(w.lastPullMode=g.checkPull(this,w,t,a))&&y.checkPut(this,w,t,a))&&(void 0===a.rootEl||a.rootEl===this.el))){if(F(a,D,this.el),O)return;if(l=U(a.target,D.draggable,_),s=t.getBoundingClientRect(),v!==this&&(v=this,E=!0),f)return j(w,!0),e=i,void(o||r?i.insertBefore(t,o||r):x||i.appendChild(t));if(0===_.children.length||_.children[0]===n||_===a.target&&(p=a,m=_.lastElementChild.getBoundingClientRect(),p.clientY-(m.top+m.height)>5||p.clientX-(m.left+m.width)>5)){if(0!==_.children.length&&_.children[0]!==n&&_===a.target&&(l=_.lastElementChild),l){if(l.animated)return;c=l.getBoundingClientRect()}j(w,C),!1!==J(i,_,t,s,l,c,a)&&(t.contains(_)||(_.appendChild(t),e=_),this._animate(s,t),l&&this._animate(c,l))}else if(l&&!l.animated&&l!==t&&void 0!==l.parentNode[S]){d!==l&&(d=l,h=G(l),u=G(l.parentNode));var N=(c=l.getBoundingClientRect()).right-c.left,B=c.bottom-c.top,P=T.test(h.cssFloat+h.display)||"flex"==u.display&&0===u["flex-direction"].indexOf("row"),Y=l.offsetWidth>t.offsetWidth,X=l.offsetHeight>t.offsetHeight,I=(P?(a.clientX-c.left)/N:(a.clientY-c.top)/B)>.5,M=l.nextElementSibling,A=!1;if(P){var R=t.offsetTop,L=l.offsetTop;A=R===L?l.previousElementSibling===t&&!Y||I&&Y:l.previousElementSibling===t||t.previousElementSibling===l?(a.clientY-c.top)/B>.5:L>R}else E||(A=M!==t&&!X||I&&X);var H=J(i,_,t,s,l,c,a,A);!1!==H&&(1!==H&&-1!==H||(A=1===H),O=!0,k($,30),j(w,C),t.contains(_)||(A&&!M?_.appendChild(t):l.parentNode.insertBefore(t,A?M:l)),e=t.parentNode,this._animate(s,t),this._animate(c,l))}}},_animate:function(t,e){var n=this.options.animation;if(n){var o=e.getBoundingClientRect();1===t.nodeType&&(t=t.getBoundingClientRect()),G(e,"transition","none"),G(e,"transform","translate3d("+(t.left-o.left)+"px,"+(t.top-o.top)+"px,0)"),e.offsetWidth,G(e,"transition","all "+n+"ms"),G(e,"transform","translate3d(0,0,0)"),clearTimeout(e.animated),e.animated=k(function(){G(e,"transition",""),G(e,"transform",""),e.animated=!1},n)}},_offUpEvents:function(){var t=this.el.ownerDocument;q(E,"touchmove",this._onTouchMove),q(E,"pointermove",this._onTouchMove),q(t,"mouseup",this._onDrop),q(t,"touchend",this._onDrop),q(t,"pointerup",this._onDrop),q(t,"touchcancel",this._onDrop),q(t,"pointercancel",this._onDrop),q(t,"selectstart",this)},_onDrop:function(a){var l=this.el,s=this.options;clearInterval(this._loopId),clearInterval(y.pid),clearTimeout(this._dragStartTimer),lt(this._cloneId),lt(this._dragStartId),q(E,"mouseover",this),q(E,"mousemove",this._onTouchMove),this.nativeDraggable&&(q(E,"drop",this),q(l,"dragstart",this._onDragStart)),this._offUpEvents(),a&&(b&&(a.preventDefault(),!s.dropBubble&&a.stopPropagation()),n&&n.parentNode&&n.parentNode.removeChild(n),i!==e&&"clone"===W.active.lastPullMode||o&&o.parentNode&&o.parentNode.removeChild(o),t&&(this.nativeDraggable&&q(t,"dragend",this),K(t),t.style["will-change"]="",z(t,this.options.ghostClass,!1),z(t,this.options.chosenClass,!1),Z(this,i,"unchoose",t,e,i,f,null,a),i!==e?(p=et(t,s.draggable))>=0&&(Z(null,e,"add",t,e,i,f,p,a),Z(this,i,"remove",t,e,i,f,p,a),Z(null,e,"sort",t,e,i,f,p,a),Z(this,i,"sort",t,e,i,f,p,a)):t.nextSibling!==r&&(p=et(t,s.draggable))>=0&&(Z(this,i,"update",t,e,i,f,p,a),Z(this,i,"sort",t,e,i,f,p,a)),W.active&&(null!=p&&-1!==p||(p=f),Z(this,i,"end",t,e,i,f,p,a),this.save()))),this._nulling()},_nulling:function(){i=t=e=n=r=o=a=l=s=m=_=b=p=d=h=v=g=W.active=null,A.forEach(function(t){t.checked=!0}),A.length=0},handleEvent:function(e){switch(e.type){case"drop":case"dragend":this._onDrop(e);break;case"dragover":case"dragenter":t&&(this._onDragOver(e),function(t){t.dataTransfer&&(t.dataTransfer.dropEffect="move");t.preventDefault()}(e));break;case"mouseover":this._onDrop(e);break;case"selectstart":e.preventDefault()}},toArray:function(){for(var t,e=[],n=this.el.children,o=0,i=n.length,r=this.options;o<i;o++)U(t=n[o],r.draggable,this.el)&&e.push(t.getAttribute(r.dataIdAttr)||tt(t));return e},sort:function(t){var e={},n=this.el;this.toArray().forEach(function(t,o){var i=n.children[o];U(i,this.options.draggable,n)&&(e[t]=i)},this),t.forEach(function(t){e[t]&&(n.removeChild(e[t]),n.appendChild(e[t]))})},save:function(){var t=this.options.store;t&&t.set(this)},closest:function(t,e){return U(t,e||this.options.draggable,this.el)},option:function(t,e){var n=this.options;if(void 0===e)return n[t];n[t]=e,"group"===t&&H(n)},destroy:function(){var t=this.el;t[S]=null,q(t,"mousedown",this._onTapStart),q(t,"touchstart",this._onTapStart),q(t,"pointerdown",this._onTapStart),this.nativeDraggable&&(q(t,"dragover",this),q(t,"dragenter",this)),Array.prototype.forEach.call(t.querySelectorAll("[draggable]"),function(t){t.removeAttribute("draggable")}),R.splice(R.indexOf(this._onDragOver),1),this._onDrop(),this.el=t=null}},V(E,"touchmove",function(t){W.active&&t.preventDefault()}),W.utils={on:V,off:q,css:G,find:Q,is:function(t,e){return!!U(t,e,t)},extend:it,throttle:ot,closest:U,toggleClass:z,clone:rt,index:et,nextTick:at,cancelNextTick:lt},W.create=function(t,e){return new W(t,e)},W.version="1.7.0",W});

define('sortable',["../dist/js/Sortable.min","utils"], function (Sortable, utils) {
	/**
	 * Sortable module, lets lists be rearranged.
	 * @public
	 * @module Sortable
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
				animation: 150,
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

define('todo',['utils', 'sortable'], function (utils, sortable) {
	/**
	 * Module that controlls ToDo entries and Archive
	 * @public
	 * @module ToDo
 	 * @param {Element} addButtonElem Button that adds a new ToDo entry
 	 * @param {Element} listElem List of ToDo (table body)
 	 * @param {Element} archiveElem List of Archive (table body)
 	 * @param {Element} todoTemplateElem Template of a ToDo entry
 	 * @param {Element} archiveTemplateElem Template of a Archive entry
 	 * @param {Element} totalTodo Display total count of ToDos
 	 * @param {Element} totalArchive Display total count of archive
	 */
	return function(addButtonElem, listElem, archiveElem, todoTemplateElem, archiveTemplateElem, totalTodo, totalArchive) {

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
			
			let input = added.querySelector("input");
			input.id = "todoEntry"+added.dataset.todoid;
			input.addEventListener("change", _updateToDo);

			let label = added.querySelector("label");
			label.setAttribute("for", input.id);
			label.innerText += (parseInt(added.dataset.todoid) + 1);

			let bc = added.querySelector(".button--check");
			bc.addEventListener("click", _onFinisheToDo);
			bc.addEventListener("touchend", _onFinisheToDo);
			
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

			let input = added.querySelector("input");
			input.readOnly = true;
			input.id = "archiveEntry"+added.dataset.archiveid;

			let label = added.querySelector("label");
			label.setAttribute("for", input.id);
			label.innerText += (parseInt(added.dataset.archiveid) + 1);

			added.querySelector("label").setAttribute("for", input.id);
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
			
			newToDoInput.focus();
			newToDoInput.scrollIntoView(false);

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

			let bc = tmp.querySelector(".button--check");
			bc.removeEventListener("click", _onFinisheToDo);
			bc.removeEventListener("touchend", _onFinisheToDo);

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
			utils.getParent("TR", addButtonElem).querySelector("input").blur();

			ev.target.focus();
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

			if(ev.type === "touchend")
				_startArchivingCountdown(ev);
		}

		/**
		 * Called when user removes mouse from ToDo. Starts the cooldown count. Removes the event that called it. Starts a Interval.
		 * @function
		 * @name _startArchivingCountdown
		 * @private
		 * @param {Event} Event Data
		 */
		let _startArchivingCountdown = function(ev){
			ev.preventDefault();
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
		 * Saves ToDo list in LocalStorage and Archive in SessionStorage. Updates Total Count. Update IDs and Texts;
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

			for (var i = 0; i < listChilds.length - 1; i++)	{
				if(i == listChilds[i].dataset.todoid){
					sortedList[i] = list[i];
					continue;
				}

				sortedList[i] = list[listChilds[i].dataset.todoid];
				listChilds[i].dataset.todoid = i;

				let input = listChilds[i].querySelector("input");
				input.id = "todoEntry"+i;

				let label = listChilds[i].querySelector("label");
				label.setAttribute("for", input.id);
				label.innerText = "Text of ToDo " + (parseInt(i) + 1);
			}

			for (var i = 0; i < archiveChilds.length; i++){
				if(i == archiveChilds[i].dataset.archiveid){
					sortedArchive[i] = archive[i];					
					continue;
				}

				sortedArchive[i] = archive[archiveChilds[i].dataset.archiveid];
				archiveChilds[i].dataset.archiveid = i;

				let input = archiveChilds[i].querySelector("input");
				input.id = "archiveEntry"+i;

				let label = archiveChilds[i].querySelector("label");
				label.setAttribute("for", input.id);
				label.innerText = "Text of Archive " + (parseInt(i) + 1);
			}
			
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

define('serviceWorker',[],function () {
	/**
	 * Service Worker Loader Module
	 * @public
	 * @module Service Worker Loader
	 */

	/**
	 * Register the service worker if the navigator supports it. Handle errors when registering or if unavailable.
	 * @function
	 * @name registerSW
	 * @public
	 */
	async function registerSW() {
		if ('serviceWorker' in navigator) {
			try {
				await navigator.serviceWorker.register('./sw.js');
			} catch (err) {
				alert("Fail to register ServiceWorker.");
				console.error(err);
			}
		} else {
			console.log("ServiceWorker unavailable.");
		}
	}

	return registerSW; 
});
/**
 * @projectname ToDo-Web
 * @version 1.0
 * @author João Víctor de Oliveira Santos (jvhti@hotmail.com)
 * @file Entry point for RequireJS. Selects needed elements and start the ToDo and Collapsible Modules.
 */
requirejs(["collapsible", "todo", "serviceWorker"], function(collapsible, todo, serviceWorker) {
	let addBtn = document.getElementById("add-todo");
	let todoList = document.getElementsByClassName("list-table__body--todo")[0];
	let archiveList = document.getElementsByClassName("list-table__body--archive")[0];
	let todoTemplate = document.getElementById("todoTemplate");
	let archiveTemplate = document.getElementById("archiveTemplate");
	let totalArchive = document.getElementById("totalArchive");
	let totalTodo = document.getElementById("totalTodo");

	todo(addBtn, todoList, archiveList, todoTemplate, archiveTemplate, totalTodo, totalArchive);

	let col = collapsible("button--collapsible-controller", "list-table__body--collapsed");
	col.startup();

	window.addEventListener('load', (e) => {
		serviceWorker();
	});

});

define("main", function(){});

