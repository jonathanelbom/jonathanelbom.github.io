(function() {

	var checkbox = document.querySelector('.checkbox');
	var heart = document.querySelector('.heart');
	//var heartOutline = heart.querySelector('.fa-heart-o');
	var heartSolid = heart.querySelector('.fa-heart');
	var favorites = document.querySelector('.favorites');
	var rental = document.querySelector('.rental');

	heart.addEventListener('click', gotoStep2);
	checkbox.addEventListener('click', toggleCheckbox);

	function gotoStep2() {
		heart.classList.add('clicked');
		rental.classList.add('out');
		favorites.classList.add('in');
	}

	function toggleCheckbox() {
		var checked = checkbox.dataset.checked === 'true';
		if ( !checked ) { // set state to checked
			checkbox.classList.add('checked');
			heartSolid.classList.add('full');
		} else { // set state to unchecked
			checkbox.classList.remove('checked');
			heartSolid.classList.remove('full');
		}
		// set checkbox checked data-attribute to updated state
		checkbox.dataset.checked = !checked;
	}

})();