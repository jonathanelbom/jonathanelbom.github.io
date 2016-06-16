(function() {

	var checkbox = document.querySelector('.checkbox');
	var heart = document.querySelector('.heart');
	var heartOutline = heart.querySelector('.fa-heart-o');
	var heartSolid = heart.querySelector('.fa-heart');
	var favorites = document.querySelector('.favorites');
	var rental = document.querySelector('.rental');

	// on heart click, go to step 2
	heart.addEventListener('click', gotoStep2);
	// on checkbox click, add to favorites
	checkbox.addEventListener('click', checkboxClicked);

	function gotoStep2() {
		heartOutline.classList.add('clicked');
		rental.classList.add('out');
		favorites.classList.add('in');
	}

	function checkboxClicked() {
		checkbox.classList.add('checked');
		heartSolid.classList.add('full');
	}

})();