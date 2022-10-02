/**
 * jQuery Anchor Menu for single pages
 *
 * @author DaVee8k
 * @version 0.3.2
 * @license WTFNMFPL 1.0
 */
(function ($) {
	$.fn.anchorMenu = function (option) {
		var self = this;
		this.historyIE = (typeof history.pushState === "undefined") ? window.location : false;
		this.activeClass = option['activeClass'] !== undefined ? option['activeClass'] : 'active';
		this.easing = option['easing'] !== undefined ? option['easing'] : 'swing';
		this.parentElm = option['parent'] !== undefined ? option['parent'] : 'li';
		this.onStart = option['onStart'] !== undefined ? option['onStart'] : true;
		this.speed = option['speed'] !== undefined ? option['speed'] : 1;
		this.padding = option['padding'] !== undefined ? option['padding'] : 0;
		this.include = option['include'] !== undefined ? option['include'] : [];
		this.active = false;
		this.isActive = false;
		this.list = {};

		/**
		 * Scroll to selcted element
		 * @param {String} ident
		 * @param {DOMelement} elmLink
		 * @param {Boolean} checkout
		 * @param {Boolean} jump
		 */
		this.scrollTo = function (ident, elmLink, checkout, jump) {
			this.isActive = true;
			var posFrom = $(window).scrollTop();
			var posTo = this.getPosition(ident);
			if (posTo < 0) posTo = 0;

			$("html, body").stop(true).animate(
				{scrollTop: posTo + 'px'},
				jump === true ? 10 : Math.round(Math.abs(posFrom - posTo) * this.speed), this.easing,
				function () {
					if (self.isActive === true && elmLink !== undefined) {
						self.setActive(elmLink, true);
						self.isActive = false;
						// fix potencial lazy loading content
						var posCheck = self.getPosition(ident);
						if (checkout && $(window).scrollTop() != posCheck > 0 ? posCheck : 0) self.scrollTo(ident, elmLink, false);
					}
				}
			);
		};

		/**
		 * Set active item in menu
		 * @param {DOMelement} elmLink
		 * @param {Boolean} history
		 */
		this.setActive = function (elmLink, history) {
			this.active = elmLink;
			if (this.activeClass) {
				$(this).find(this.parentElm ? this.parentElm : 'a').removeClass(this.activeClass);
				var elm = this.parentElm ? $(elmLink).closest(this.parentElm) : elmLink;
				$(elm).addClass(this.activeClass);
			}
			if (history && !this.isActive) this.setHistory(elmLink);
		};

		/**
		 * Add link to browser history
		 * @param {DOMelement} elmLink
		 */
		this.setHistory = function (elmLink) {
			if (typeof history.pushState !== "undefined") history.pushState({}, document.title, $(elmLink).prop("href"));
			else this.historyIE = $(elmLink)[0];
		};

		/**
		 * Return possible hashes from current url
		 * @param {DOMelement} elmLink
		 * @returns {String}
		 */
		this.getExistingHash = function (elmLink) {
			var mask = /\/index.php($|\/)/i;
			var maskStrip = /\/$/;
			var current = window.location;
			var link = $(elmLink)[0];
			var pathLink = (link.pathname.charAt(0) === '/' ? '' : '/') + link.pathname;	// fix IE9
			// external link or different page
			if ((link.hostname && link.hostname !== current.hostname) || link.search !== current.search
				 || pathLink.replace(mask,'/').replace(maskStrip,'') !== current.pathname.replace(mask,'/').replace(maskStrip,'')) return false;
			return link.hash === false ? '' : link.hash;
		};

		/**
		 * Get top (floating menu) space
		 * @returns {Number}
		 */
		this.getPadding = function () {
			if (this.padding) {
				if (parseInt(this.padding) === this.padding) {
					return this.padding;
				}
				else {
					return $(this.padding).height();
				}
			}
			return 0;
		};

		/**
		 * Returns selected element position
		 * @param {String} ident
		 * @returns {Number}
		 */
		this.getPosition = function (ident) {
			return ident && $(ident).length !== 0 ? Math.round($(ident).offset().top - this.getPadding()) : 0;
		};

		/**
		 * Tries to find item from menu based on hash in clicked link
		 * @param {Event} e
		 * @param {DOMelement} elmLink
		 * @returns {Boolean}
		 */
		this.clickEvent = function (e, elmLink) {
			var hash = this.getExistingHash(elmLink);

			if (hash !== false) {
				if (hash !== window.location.hash || (this.historyIE !== false && hash !== this.historyIE.hash)) {
					e.preventDefault();
					this.scrollTo(hash, elmLink, true);
					this.setHistory(elmLink);
				}
				return false;
			}
			return true;
		};

		/**
		 * Check actual position on page to update active item in menu
		 */
		this.scrollEvent = function () {
			var showed = false;
			var posShowed = 0;
			var posCurrent = $(window).scrollTop() + this.getPadding();
			if (posCurrent <= this.getPadding()) posCurrent = 0;

			this.list.each( function () {
				var ident = self.getExistingHash(this);

				if (ident && $(ident).length !== 0) {
					var posElm = Math.round($(ident).offset().top);
					if (posCurrent >= posElm) {
						if (showed === false || posElm > posShowed) {
							posShowed = posElm;
							showed = this;
						}
					}
				}
			});

			if (showed && showed !== this.active) this.setActive(showed, false);
		};

		/**
		 * Add scroll action to additional elements
		 * @param {String} elm
		 */
		this.loadInclude = function (elm) {
			$(elm).find("a").each( function () {
				var hash = self.getExistingHash(this);
				if (hash !== false) {
					$(this).click( function () {
						self.scrollTo(hash, this, true);
						return false;
					});
				}
			});
		};

		/**
		 * Add scroll action to items in menu
		 */
		this.load = function () {
			this.list = $(this).find((this.parentElm ? this.parentElm + ' ' : '') + "a");
			if (this.list.length !== 0) {
				$(this.list).click( function (e) {
					return self.clickEvent(e, this);
				});
			}
			var key;
			for (key in this.include) {
				this.loadInclude(this.include[key]);
			}
		};

		this.load();

		if (this.activeClass) {
			$(window).scroll( function () { self.scrollEvent(); });
		}

		var anchor = window.location.hash;
		if (this.onStart && $(this).find(this.activeClass).length === 0) {
			if (anchor.length === 0) $(this).find(this.parentElm + ":first-child").addClass(this.activeClass);
			else $(this).find("a[href$='" + anchor + "']").closest(this.parentElm).addClass(this.activeClass);
		}

		if (anchor.length > 0) {
			this.scrollTo(anchor, undefined, false, true);
		}
	};
}(jQuery));