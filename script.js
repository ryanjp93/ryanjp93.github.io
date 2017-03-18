/* Script left intentionally not minified */

// Values which should not be changed
function Constant() {}
Constant.LOCAL_SERVER = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
Constant.ASSETS_DIRECTORY = Constant.LOCAL_SERVER ? '/website-3.0/assets/' : '/assets/';
Constant.TILES_DIRECTORY = Constant.LOCAL_SERVER ? '/website-3.0/tiles/' : '/tiles/';
Constant.FEATURED_PAGE_INDEX = 1;
Constant.RECENT_PAGE_INDEX = 2;
Constant.TAB_URLS = ['home.html', 'featured.html', 'recent.html', 'contact.html'];
Constant.ACTIVE_TAB_CLASS = 'navButton-active';
Constant.ACTIVE_TILE_CLASS = 'tile-Tile-active';
Constant.FEATURED_IMAGE_FILENAMES = ['wip.png', 'wip.png'];
Constant.RECENT_IMAGE_FILENAMES = ['moniac-bw.png', 'dx11-bw.png', 'website-bw.png', 'c-bw.png', 'stats-bw.png', 'pw-bw.png', 'water-bw.png', 'ab-bw.png', 'fps-bw.png', 'chat-bw.png', 'work-bw.png', 'hush-bw.png', 'dx9-bw.png'];
Constant.FEATURED_FILENAME_PREFIX = 'f';

var contentArea = document.getElementsByClassName('content')[0];
var tabs = document.getElementsByClassName('navButton');

var tiles = [];
var scrollElement;

var timeoutHandle;
var intervalHandle;

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
var activeTab;
var activeTabIndex = -1;
function changeActiveTab(index) {
	var isTabAlreadyActive = index === activeTabIndex;
	if (isTabAlreadyActive) {
		return; // Don't bother switching to a tab we are already on
	}
	activeTabIndex = index;
	
	// Manage tab styling
	if (activeTab) {
		activeTab.classList.remove(Constant.ACTIVE_TAB_CLASS);
	}
	
	activeTab = tabs[index];
	activeTab.classList.add(Constant.ACTIVE_TAB_CLASS);
	
	// Manage page content
	fade();
	httpRequest(Constant.TAB_URLS[index], function(html) {
		// Clean up any tiles on the page
		for (var tile of tiles) {
			tile.removeEventListener('click', tileClick);
		}
		tiles = [];
		
		contentArea.innerHTML = html;
		
		// Extra setup is only required on pages containing tiles
		var isTilePage = index === Constant.FEATURED_PAGE_INDEX || index === Constant.RECENT_PAGE_INDEX;
		if (!isTilePage) {
			return;
		}
		
		var isFeaturedPage = activeTabIndex === Constant.FEATURED_PAGE_INDEX;
		scrollElement = isFeaturedPage ? document.getElementsByClassName("tile-ContainerLarge")[0] : document.getElementsByClassName("tile-Container")[0];
		
		// Each tile has a loading css animation which plays until its image is loaded. Create a background image and set up load behaviour.
		var imagesToLoad = isFeaturedPage ? Constant.FEATURED_IMAGE_FILENAMES : Constant.RECENT_IMAGE_FILENAMES;
		var imageElements = document.getElementsByClassName('tile-TileImage');
		var backgroundImages = [];
		var imageCount = imageElements.length;
		for (var i = 0; i < imageCount; i++) {
			(function(index) {
				var backgroundImage = new Image();
				backgroundImage.classList.add('tile-LoadedImage');
				backgroundImage.onload = function() {
					var currentParent = imageElements[index];
					currentParent.innerHTML = ''; // Clear the loading animation
					currentParent.appendChild(backgroundImages[index]); // Image has now finished loading so append it
					delete backgroundImages[index]; // Remvoe the image from memory
				}
				backgroundImage.src = Constant.ASSETS_DIRECTORY + imagesToLoad[i];
				backgroundImages.push(backgroundImage);
			})(i)
		}
		
		// Set up tile click behaviour
		tiles = document.getElementsByClassName('tile-Tile');
		for (var tile of tiles) {
			tile.addEventListener('click', tileClick);
		}
	});
}

var activeTileIndex = -1;
var clickedTile;
var clickedTileHTML;
function tileClick() {
	clickedTile = this;
	var tileIndex = clickedTile.firstElementChild.textContent; // Each tile's first child is a span containing the numerical position of the tile
	
	// Deselect clicked tile if it was already active
	var isTileAlreadyActive = tileIndex === activeTileIndex;
	if (isTileAlreadyActive) {
		activeTileIndex = -1;
		closeTile(this);
		return;
	};
	
	// Remove active tile styling from currently active tile
	var activeTileExists = activeTileIndex > -1;
	if (activeTileExists) {
		var activeTile = tiles[activeTileIndex];
		closeTile(activeTile);
	}
	
	openTile(this, tileIndex);
}

function closeTile(tile) {
	clickedTile.classList.remove(Constant.ACTIVE_TILE_CLASS);
	clickedTile.innerHTML = clickedTileHTML;

	if (intervalHandle) {
		clearInterval(intervalHandle);
	}

	if (timeoutHandle) {
		clearTimeout(timeoutHandle);
	}
}

function openTile(tile, tileIndex) {
	tile.classList.add(Constant.ACTIVE_TILE_CLASS);
	activeTileIndex = tileIndex;
	
	var isFeaturedPage = activeTabIndex === Constant.FEATURED_PAGE_INDEX;
	var prefix = isFeaturedPage ? Constant.FEATURED_FILENAME_PREFIX : '';
	
	httpRequest(Constant.TILES_DIRECTORY + tileIndex + '.html', function(html) {
		clickedTileHTML = tile.innerHTML;
		tile.innerHTML = html;
	});
	
	// After a second the tile will be fully expanded, so begin scrolling it into view
	timeoutHandle = setTimeout(function() {
		intervalHandle = setInterval(function() {
			var differenceY = scrollElement.scrollTop - tile.offsetTop;
			var shouldScrollDown = differenceY < 0;
			var scrollCompvare = shouldScrollDown ? differenceY >= -10 : differenceY < 10;
			if (shouldScrollDown) {
				if (scrollCompvare) {
					clearInterval(intervalHandle);
				}
				else if (differenceY >= -30) {
					scrollElement.scrollTop = tile.offsetTop - 10;
				}
				else {
					scrollElement.scrollTop = scrollElement.scrollTop + 30;
				}
			}
			else {
				if (scrollCompvare) {
					clearInterval(intervalHandle);
				}
				else if (differenceY <= 30) {
					scrollElement.scrollTop = tile.offsetTop - 10;
				}
				else {
					scrollElement.scrollTop = scrollElement.scrollTop - 30;
				}
			}
		}, 30);
		
		if (this.timeout) {
			clearTimeout(timeoutHandle);
		}
	}, 1000);
}

// Program Start
for (var tab of tabs) {
	tab.addEventListener('click', function() {
		changeActiveTab(parseInt(this.id));
	});
}

changeActiveTab(0);
