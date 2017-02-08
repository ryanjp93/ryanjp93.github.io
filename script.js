var contentArea = document.getElementsByClassName('content')[0];

var tabs = document.getElementsByClassName('navButton');
var tabUrls = ['home.html', 'featured.html', 'recent.html', 'contact.html'];

var tiles = [];
var activeTileIndex = -1;
var activeTileClass = 'tile-Tile-active';
var clickedTile;
var clickedTileHTML;

var activeTab;
var activeTabIndex = -1;
var activeTabClass = 'navButton-active';
changeActiveTab(0);

/* Basic http request. */
function httpRequest(url, callback) {
	var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            callback(xmlHttp.responseText);
		}
    }
    xmlHttp.open('GET', url, true); 
    xmlHttp.send(null);
}

/* Fades in the page content by toggling an opacity change after a delay and animating it with a transition. */
function fade() {
	contentArea.className = 'content';
	
	setTimeout(function() { 
		contentArea.className = 'content fade';
	}, 100);
}

/* Switches to the given tab by changing classes. */
function changeActiveTab(index) {
	var isTabAlreadyActive = index === activeTabIndex;
	if (isTabAlreadyActive) {
		return; // Don't bother switching to a tab we are already on
	}
	activeTabIndex = index;
	
	// Manage tab styling
	if (activeTab) {
		activeTab.classList.remove(activeTabClass);
	}
	
	activeTab = tabs[index];
	activeTab.classList.add(activeTabClass);
	
	// Manage page content
	fade();
	httpRequest(tabUrls[index], function(html) {
		// Clean up any tiles on the page
		var numberOfTiles = tiles.length;
		if (numberOfTiles > 0) {
			for (var i = 0; i < numberOfTiles; i++) {
				tiles[i].removeEventListener('click', tileClick);
			}
			tiles = [];
		}
		
		contentArea.innerHTML = html;
		
		// Extra setup is only required on pages containing tiles
		var isTilePage = index === 1 || index === 2;
		if (!isTilePage) {
			return;
		}
		
		// Set up tile click behaviour
		tiles = document.getElementsByClassName('tile-Tile');
		numberOfTiles = tiles.length;
		if (numberOfTiles > 0) {
			for (var i = 0; i < numberOfTiles; i++) {
				tiles[i].addEventListener('click', tileClick);
			}
		}
	});
}

function tileClick() {
	clickedTile = this;
	var tileIndex = clickedTile.firstElementChild.textContent; // Each tile's first child is a span containing the numerical position of the tile
	
	// Deselect clicked tile if it was already active
	var isTileAlreadyActive = tileIndex === activeTileIndex;
	if (isTileAlreadyActive) {
		clickedTile.classList.remove(activeTileClass);
		activeTileIndex = -1;
		activeTile.innerHTML = clickedTileHTML;
		return;
	};
	
	// Remove active tile styling from currently active tab
	var activeTabExists = activeTileIndex > -1;
	if (activeTabExists) {
		var activeTile = tiles[activeTileIndex];
		activeTile.classList.remove(activeTileClass);
		activeTile.innerHTML = clickedTileHTML;
	}
	
	clickedTile.classList.add(activeTileClass);
	activeTileIndex = tileIndex;
	
	var prefix = activeTabIndex === 1 ? 'f' : '';
	httpRequest('/tiles/' + tileIndex + '.html', function(html) {
		clickedTileHTML = clickedTile.innerHTML;
		clickedTile.innerHTML = html;
	});
}

for (var i = 0, count = tabs.length; i < count; i++) {
	tabs[i].addEventListener('click', function() {
		changeActiveTab(parseInt(this.id));
	});
}