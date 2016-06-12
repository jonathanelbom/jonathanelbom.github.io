(function( global ) {
	var folderControls = document.querySelector( '.main__folders__inner__controls' );
	var cardControls = document.querySelector( '.main__content__controls' );
	var folderList = document.querySelector( '.main__folders__inner__content' );
	var cardPane = document.querySelector( '.main__content__cards' );
	var colLeft = document.querySelector( '.main__content__cards__left' );
	var colRight = document.querySelector( '.main__content__cards__right' );
	var addResource = document.querySelector( '#addResource' );
	var modal = document.querySelector( '.modal' );
	var modalClose = document.querySelector( '.modal__close' );
	var modalCancel = document.querySelector( '.modal__footer__cancel' );
	var modalNext = document.querySelector( '.modal__footer__next' );
	var modalBg = document.querySelector( '.modal__bg' );
	var cloneCards = [ document.querySelector( '#clone_card_1' ), document.querySelector( '#clone_card_2' ), document.querySelector( '#clone_card_3' ) ];
	
	// clone card for main page
	for (var i=0; i<8; i++) {
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
	})
	function toggleModal(show) {
		if (show) {
			modal.style.display = 'block';
			modalBg.style.display = 'block';
		} else {
			modal.style.display = 'none';
			modalBg.style.display = 'none';
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

	toggleModal(true);
})( window )
