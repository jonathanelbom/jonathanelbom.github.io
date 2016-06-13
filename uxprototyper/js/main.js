(function( global ) {
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
	var modalBg = document.querySelector( '.modal__bg' );
	var cloneCards = [ document.querySelector( '#clone_card_1' ), document.querySelector( '#clone_card_2' ), document.querySelector( '#clone_card_3' ) ];
	var selectOpts = document.querySelectorAll('.modal__body__content1__select');

	var modalOpen = false;
	var i;
	for (i=0; i<selectOpts.length; i++) {
		var elem = selectOpts[i];
		elem.addEventListener('click', toggleResourceRights);
	}
	// clone card for main page
	for (i=0; i<8; i++) {
		var clone = cloneCards[i%3].cloneNode(true);
		clone.id = '';
		(i%2 === 0 ? colLeft : colRight).appendChild(clone);
	}
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
	//modalNext.addEventListener('click', nextContent);
	function gotoStep(step) {
	}
	function toggleResourceRights(e) {
		var target = e.target;
		var s = target.querySelector('.select-text');
		s.textContent = 'Selected';
		target.setAttribute('aria-pressed', 'true');
		selectOpts.forEach( function( elem, idx) {
			if ( elem !== target ) {
				elem.setAttribute('aria-pressed', 'false');
				s = elem.querySelector('.select-text');
				s.textContent = 'Select';
			}
			modalNext.removeAttribute('disabled');
		});
	}
	modalDialog.addEventListener( 'transitionend', function(e) {
		modalOpen = !modalOpen;
		if ( !modalOpen ) {
			modal.style.display = 'none';
			modalBg.style.display = 'none';
		}
	});
	function toggleModal(show) {
		if (show) {
			modal.style.display = 'block';
			modalBg.style.display = 'block';
			setTimeout( function() {
				modal.classList.add('in');
				modalBg.classList.add('in');
			}, 0);
		} else {
			modal.classList.remove('in');
			modalBg.classList.remove('in');
		}
	}
	function resize() {
		folderList.style.height = (global.innerHeight - folderList.offsetTop) +'px';
		cardPane.style.height = (global.innerHeight - cardPane.offsetTop) +'px';
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

	// resize / scroll handlers
	var delay = 250;
	global.onresize = debounce( resize, delay );
	folderList.onscroll = scrolling;
	cardPane.onscroll = scrolling;

	global.setTimeout(resize, 250);
	global.setTimeout( function() {
		toggleModal(true);
	}, 1000);

})( window )
