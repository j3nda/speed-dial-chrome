/*
 * jQuery Reveal Plugin 1.0
 * www.ZURB.com
 * Copyright 2010, ZURB
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
*/


(function($) {

/*---------------------------
 Extend and Execute
----------------------------*/

	$.fn.reveal = function(options) {


		var defaults = {
			animation: 'none',
			//fade, fadeAndPop, none
			animationspeed: 300,
			//how fast animtions are
			closeonbackgroundclick: true,
			//if you click background will modal close?
			dismissmodalclass: 'close-reveal-modal' //the class of a button or element that will close an open modal
		};

		//Extend dem' options
		options = $.extend({}, defaults, options);

		return this.each(function() {

/*---------------------------
 Global Variables
----------------------------*/
			var modal = $(this),
			    topMeasure = parseInt(modal.css('top')),
			    topOffset = modal.height() + topMeasure,
			    locked = false,
			    modalBG = $('.reveal-modal-bg');

/*---------------------------
 Create Modal BG
----------------------------*/
			if (modalBG.length == 0) {
				modalBG = $('<div class="reveal-modal-bg" />').insertAfter(modal);
			}

/*---------------------------
 Open & Close Animations
----------------------------*/
			//Entrance Animations
			modal.on('reveal:open', function() {
				modalBG.off('click.modalEvent');
				$('.' + options.dismissmodalclass).off('click.modalEvent');
				if (!locked) {
					lockModal();
					if (options.animation == "none") {
						modal.css({
							'visibility': 'visible',
							'top': $(document).scrollTop() + topMeasure
						});
						modalBG.css({
							"display": "block"
						});
						unlockModal()
					}
				}
				modal.off('reveal:open');
			});

			//Closing Animation
			modal.on('reveal:close', function() {
				if (!locked) {
					lockModal();
					if (options.animation == "none") {
						modal.css({
							'visibility': 'hidden',
							'top': topMeasure
						});
						modalBG.css({
							'display': 'none'
						});
					}
				}
				modal.off('reveal:close');
			});

/*---------------------------
 Open and add Closing Listeners
----------------------------*/
			//Open Modal Immediately
			modal.trigger('reveal:open')

			//Close Modal Listeners
			var closeButton = $('.' + options.dismissmodalclass).on('click.modalEvent', function() {
				modal.trigger('reveal:close')
			});

			if (options.closeonbackgroundclick) {
				modalBG.css({
					"cursor": "pointer"
				})
				modalBG.on('click.modalEvent', function() {
					modal.trigger('reveal:close');
					$("p").show();
				});
			}
			$('body').on("keyup", function(e) {
				if (e.which === 27) {
					modal.trigger('reveal:close');
				} // 27 is the keycode for the Escape key
			});


/*---------------------------
 Animations Locks
----------------------------*/

			function unlockModal() {
				locked = false;
			}

			function lockModal() {
				locked = true;
			}

		}); //each call
	} //orbit plugin call
})(jQuery);
