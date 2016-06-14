(function( window ) {
	var folderControls = document.querySelector( '.main__folders__inner__controls' );
	var cardControls = document.querySelector( '.main__content__controls' );
	var folderList = document.querySelector( '.main__folders__inner__content' );
	var cardPane = document.querySelector( '.main__content__cards' );
	var colLeft = document.querySelector( '.main__content__cards__left' );
	var colRight = document.querySelector( '.main__content__cards__right' );
	var addResource = document.querySelector( '#addResource' );
	var modal = document.querySelector( '.modal' );
	var modalDialog = document.querySelector( '.modal__dialog' );
	var modalBody = document.querySelector( '.modal__body' );
	var modalClose = document.querySelector( '.modal__close' );
	var modalCancel = document.querySelector( '.modal__footer__cancel' );
	var modalNext = document.querySelector( '.modal__footer__next' );
	var modalBack = document.querySelector( '.modal__footer__back' );
	var modalBackWrap = document.querySelector( '.modal__footer__back__wrap' );
	var modalBg = document.querySelector( '.modal__bg' );
	var cloneCards = [ document.querySelector( '#clone_card_1' ), document.querySelector( '#clone_card_2' ), document.querySelector( '#clone_card_3' ) ];
	var selectOpts = Array.prototype.slice.call( document.querySelectorAll('.modal__body__content1__select') );
	var modalHeader = document.querySelector('.modal__header');
	var modalFooter = document.querySelector('.modal__footer');
	var modalStep1 = document.querySelector('.modal__body__content1');
	var modalStep2 = document.querySelector('.modal__body__content2');
	var modalOpen = false;
	var i;
	
	// add select clicks for the modal content step 1
	selectOpts.forEach( function( elem, idx ) {
		elem.addEventListener('click', toggleResourceRights);
	});
	// clone card for main page
	for (i=0; i<8; i++) {
		var clone = cloneCards[i%3].cloneNode(true);
		clone.id = '';
		(i%2 === 0 ? colLeft : colRight).appendChild(clone);
	}
	// font size handlers
	document.querySelector('#fontPlus').addEventListener( 'click', function() {
		updateFontSize('plus');
	});
	document.querySelector('#fontMinus').addEventListener( 'click', function() {
		updateFontSize('minus');
	});

	
	modalBg.addEventListener( 'click', function() {
		toggleModal(false);
	})
	// main action listener
	addResource.addEventListener( 'click', function() {
		toggleModal(true);
	});
	// modal close listeners
	modalClose.addEventListener( 'click', function() {
		toggleModal(false);
	});
	modalCancel.addEventListener( 'click', function() {
		toggleModal(false);
	});
	modalNext.addEventListener('click', function() {
		gotoStep(2);
	});
	modalBack.addEventListener('click', function() {
		gotoStep(1);
	});
	modalDialog.addEventListener( 'transitionend', function(e) {
		modalOpen = !modalOpen;
		onTransEnd();
	});

	// resize / scroll handlers
	var delay = 250;
	window.onresize = debounce( resize, delay );
	folderList.onscroll = scrolling;
	cardPane.onscroll = scrolling;
	window.onload = resize;

	setTimeout( function() {
		toggleModal(true);
		gotoStep(2);
	}, 500);
	
	function updateFontSize( dir ) {
		var fontSize = parseInt( getElemStyle( document.body, 'fontSize' ), 0);
		var newSize = fontSize;
		if ( dir === 'minus' && fontSize > 8) { //min size
			newSize -= 1;
		} else if ( dir === 'plus' && fontSize < 24) { //max size
			newSize += 1;
		}
		if ( newSize !== fontSize ) {
			document.body.style.fontSize = newSize+'px';
			resize();
		}
	}
	function onTransEnd() {
		if ( !modalOpen ) {
			// reset modal and go back to step 1
			modalBody.onscroll = null;
			modalBody.scrollTop = 0;
			modalScrolling();
			gotoStep(1);
			// reset step 1 state
			selectOpts.forEach( function( elem, idx ) {
				elem.setAttribute('aria-checked', 'false');
				s = elem.querySelector('.select-text');
				s.textContent = 'Select';
			});
			modalNext.setAttribute('disabled', 'disabled');
			modal.style.display = 'none';
			modalBg.style.display = 'none';
		} else {
			modalBody.onscroll = modalScrolling;
			modalScrolling();
		}
	}
	function gotoStep( step ) {
		modalBody.scrollTop = 0;
		modalScrolling();
		if ( step === 1 ) {
			modalDialog.classList.remove('progress');
			modalBackWrap.classList.add('hidden');
			modalStep1.style.display = 'block';
			modalStep2.style.display = 'none';
			modalNext.removeAttribute('disabled');
		} else {
			// step 2
			modalDialog.classList.add('progress');
			modalBackWrap.classList.remove('hidden');
			modalStep1.style.display = 'none';
			modalStep2.style.display = 'block';
			modalNext.setAttribute('disabled', 'disabled');
		}
	}
	function getElemStyle( elem, style ) {
		var value = '';
		if ( elem.style[style] !== '' ) {
			value = elem.style[style];
		} else {
			value = elem.currentStyle ? elem.currentStyle[style] : getComputedStyle( elem, null )[style];
		}
		return value;
	}
	function toggleResourceRights(e) {
		var target = e.target;
		var s = target.querySelector('.select-text');
		s.textContent = 'Selected';
		target.setAttribute('aria-checked', 'true');
		selectOpts.forEach( function( elem, idx ) {
			if ( elem !== target ) {
				elem.setAttribute('aria-checked', 'false');
				s = elem.querySelector('.select-text');
				s.textContent = 'Select';
			}
			modalNext.removeAttribute('disabled');
		});
	}
	function toggleModal(show) {
		var timeout = 1500;
		if (show) {
			modal.style.display = 'block';
			modalBg.style.display = 'block';
			setTimeout( function() {
				modal.classList.add('shown');
				modalBg.classList.add('shown');
			}, 0);
			// safety call if modal open trans end not handled  
			setTimeout( function() {
				if ( !modalOpen ) {
					modalOpen = true;
					onTransEnd();
				}
			}, timeout);
		} else {
			modal.classList.remove('shown');
			modalBg.classList.remove('shown');
			// safety call if modal close trans end not handled
			setTimeout( function() {
				if ( modalOpen ) {
					modalOpen = false;
					onTransEnd();
				}
			}, timeout);
		}
	}
	function resize() {
		folderList.style.height = (window.innerHeight - folderList.offsetTop) +'px';
		cardPane.style.height = (window.innerHeight - cardPane.offsetTop) +'px';
		modalScrolling();
	}
	function modalScrolling() {		
		modalBody.scrollTop > 0 ? modalHeader.classList.add('scrolled') : modalHeader.classList.remove('scrolled');
		var innerHeight = modalBody.clientHeight - parseInt( getElemStyle(modalBody, 'paddingTop'), 0) - parseInt( getElemStyle(modalBody, 'paddingBottom'), 0);
		modalBody.scrollHeight > modalBody.clientHeight && modalBody.scrollHeight - modalBody.scrollTop - 3 > modalBody.clientHeight ? modalFooter.classList.add('scrolled-inverse') : modalFooter.classList.remove('scrolled-inverse');
	}
	function scrolling(e) {
		var elem = e.target;
		var classList = elem === folderList ? folderControls.classList : cardControls.classList;
		elem.scrollTop > 0 ? classList.add('scrolled') : classList.remove('scrolled');
	}
	function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
})( window )
