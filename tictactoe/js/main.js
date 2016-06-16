(function() {
	// turn count. used to change mark (x or o) and keep count
	var turn = 0;
	// cached collection of jquery wrapped cells
	var $cells = $('div[class^="cell-"]');
	// cached collection of jquery wrapped cells
	var eventType = Modernizr.touch ? 'touchstart' : 'click'
	// possible winning combination of cells
	var wins = [
		[1, 2, 3],
		[4, 5, 6],
		[7, 8, 9],
		[1, 4, 7],
		[2, 5, 8],
		[3, 6, 9],
		[1, 5, 9],
		[3, 5, 7]
	];
	// cached array of possible wins for each cell number
	var winsCache = [];
	for (var i=1; i<=9; i++) {
		winsCache[i] = getPossibleWins(i); 
	}
	// starting out in playing mode, so hide the end game status
	toggleStatus('hidden');
	// on a move, check to see if that is the winning move
	function checkForWin( cell, mark ) {
		var win = false;
		// get all possible wins for that move
		var possibleWins = winsCache[cell];
		var line;
		for (var i=0; i<possibleWins.length; i++ ) {
			if ( checkLine(possibleWins[i], mark ) ) {
				win = true;
				line = possibleWins[i];
				break;
			}
		}
		if (win || turn >= 9) {
			// style cell based on winning cell or not
			$cells.each( function(idx, elem) {
				var $cell = $(elem).addClass('filled');
				var cellNum = getCellNum( $cell );
				var className = !line || line.indexOf(cellNum) === -1 ? 'not-winner' : 'winner'
				$cell.addClass( className )
			});
			var message = win ? mark.toUpperCase() + '\'s win!' : ''
			var state = win ? 'win' : 'tie';
			toggleStatus(state, message);
		}
	}
	// check a line to see if all cells match the mark passed
	function checkLine( possibleWin, mark ) {
		for (var i=0; i<possibleWin.length; i++) {
			// get the mark for each cell in the win and see if it is the same as the passed mark
			var cellMark = $cells.eq( possibleWin[i] - 1 ).text();
			if ( mark !== cellMark ) {
				return false;
			}
		}
		return true;		
	}	
	// get all possible winning lines for a cell
	function getPossibleWins( cell ) {
		var a = [];
		wins.forEach(function (elem, index, array) {
			if ( elem.indexOf(cell) > -1 ) {
				a.push(elem)
			}
		});
		return a;
	}
	// toggle game status display
	function toggleStatus( state, message ) {
		switch ( state ) {
			case 'hidden':
				$('#status').hide();
				break;
			case 'tie':
				$('#status').show();
				$('.tie').show();
				$('.win').hide();
				break;
			case 'win':
				$('#status').show();
				$('.tie').hide();
				$('.win').show().find('span').text(message);
				break;
		}
	}
	// utility method
	function getCellNum($cell) {
		return parseInt( $cell.attr('class').split('-')[1], 10 );
	}
	// grid click
	$('#grid').on(eventType, 'div[class^="cell-"]', function() {
		var $cell = $(this);
		if ( !$cell.hasClass('filled') ) {
			var cellNum = getCellNum($cell);
			var mark = turn % 2 === 1 ? 'o' : 'x';
			$cell.addClass( 'filled '+ mark ).text( mark );
			turn++;
			checkForWin( getCellNum($cell), mark );
		}
	});
	// close status
	$('#status').on(eventType, 'i.close', function() {
		$(this).closest('.message').hide();
	});
	// reset game
	$('#reset').on(eventType, function() {
		$cells.removeClass('filled not-involved o x not-winner winner').text('');
		turn = 0;
		toggleStatus('hidden');
	});
})();