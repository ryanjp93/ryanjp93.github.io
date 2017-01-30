var contentArea = document.getElementsByClassName('content')[0];

var tabs = document.querySelectorAll('.navButton');
var tabUrls = ['home.html', 'featured.html', 'recent.html', 'contact.html'];

var tiles = [];
var activeTileIndex = -1;
var clickedTile;

var activeTab;
var activeTabIndex = -1;
changeActiveTab(0);

/* Basic http request. */
function httpRequest(url, callback) {
	var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            callback(xmlHttp.responseText);
		}
    }
    xmlHttp.open("GET", url, true); 
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
	if (index === activeTabIndex) {
		return; // Don't bother switching to a tab we are already on
	}
	
	// Manage tab styling
	if (activeTab) {
		activeTab.className = "navButton";
	}
	activeTab = tabs[index];
	activeTab.className = "navButton navButton-active";
	
	// Manage page content
	fade();
	httpRequest(tabUrls[index], function(html) {
		contentArea.innerHTML = html;
		
		// Clean up any tiles on the page
		var numberOfTiles = tiles.length;
		if (numberOfTiles > 0) {
			for (var i = numberOfTiles - 1; i >= 0; i--) {
				tiles[i].pop().removeEventListener("click", tileClick);
			}
		}
		
		var isTilePage = index === 1 || index === 2;
		if (!isTilePage) {
			return;
		}
		
		tiles = document.querySelectorAll('.tile');
		numberOfTiles = tiles.length;
		if (numberOfTiles > 0) {
			for (var i = 0; i < numberOfTiles; i++) {
				tiles[i].addEventListener("click", tileClick);
			}
		}
	});
}

function tileClick() {
	clickedTile = this;
	
	var tileIndex = clickedTile.firstElementChild.textContent; // each tile's first child is a span containing the numerical position of the tile
	if (tileIndex === activeTileIndex) {
		clickedTile.className = "tile";
		activeTileIndex = -1;
		return;
	};
	
	clickedTile.className = "tile tile-active";
}

for (var i = 0, count = tabs.length; i < count; i++) {
	tabs[i].addEventListener('click', function() {
		changeActiveTab(parseInt(this.id));
	});
}