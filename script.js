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

const contentArea = document.getElementsByClassName('content')[0];
const tabs = document.getElementsByClassName('navButton');

let tiles = [];
let scrollElement;

let timeoutHandle;
let intervalHandle;

/* Basic http request. */
function httpRequest(url, callback) {
	const xmlHttp = new XMLHttpRequest();
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
let activeTab;
let activeTabIndex = -1;
function changeActiveTab(index) {
	const isTabAlreadyActive = index === activeTabIndex;
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
		for (const tile of tiles) {
			tile.removeEventListener('click', tileClick);
		}
		tiles = [];
		
		contentArea.innerHTML = html;
		
		// Extra setup is only required on pages containing tiles
		const isTilePage = index === Constant.FEATURED_PAGE_INDEX || index === Constant.RECENT_PAGE_INDEX;
		if (!isTilePage) {
			return;
		}
		
		const isFeaturedPage = activeTabIndex === Constant.FEATURED_PAGE_INDEX;
		scrollElement = isFeaturedPage ? document.getElementsByClassName("tile-ContainerLarge")[0] : document.getElementsByClassName("tile-Container")[0];
		
		// Each tile has a loading css animation which plays until its image is loaded. Create a background image and set up load behaviour.
		const imagesToLoad = isFeaturedPage ? Constant.FEATURED_IMAGE_FILENAMES : Constant.RECENT_IMAGE_FILENAMES;
		const imageElements = document.getElementsByClassName('tile-TileImage');
		const backgroundImages = [];
		const imageCount = imageElements.length;
		for (let i = 0; i < imageCount; i++) {
			const backgroundImage = new Image();
			backgroundImage.classList.add('tile-LoadedImage');
			backgroundImage.onload = function() {
				const currentParent = imageElements[i];
				currentParent.innerHTML = ''; // Clear the loading animation
				currentParent.appendChild(backgroundImages[i]); // Image has now finished loading so append it
				delete backgroundImages[i]; // Remvoe the image from memory
			}
			backgroundImage.src = Constant.ASSETS_DIRECTORY + imagesToLoad[i];
			backgroundImages.push(backgroundImage);
		}
		
		// Set up tile click behaviour
		tiles = document.getElementsByClassName('tile-Tile');
		for (const tile of tiles) {
			tile.addEventListener('click', tileClick);
		}
	});
}


let activeTileIndex = -1;
let clickedTile;
let clickedTileHTML;
function tileClick() {
	clickedTile = this;
	const tileIndex = clickedTile.firstElementChild.textContent; // Each tile's first child is a span containing the numerical position of the tile
	
	// Deselect clicked tile if it was already active
	const isTileAlreadyActive = tileIndex === activeTileIndex;
	if (isTileAlreadyActive) {
		activeTileIndex = -1;
		clickedTile.classList.remove(Constant.ACTIVE_TILE_CLASS);
		clickedTile.innerHTML = clickedTileHTML;
		return;
	};
	
	// Remove active tile styling from currently active tile
	const activeTileExists = activeTileIndex > -1;
	if (activeTileExists) {
		const activeTile = tiles[activeTileIndex];
		activeTile.classList.remove(Constant.ACTIVE_TILE_CLASS);
		activeTile.innerHTML = clickedTileHTML;
	}
	
	clickedTile.classList.add(Constant.ACTIVE_TILE_CLASS);
	activeTileIndex = tileIndex;
	
	const isFeaturedPage = activeTabIndex === Constant.FEATURED_PAGE_INDEX;
	const prefix = isFeaturedPage ? Constant.FEATURED_FILENAME_PREFIX : '';
	
	httpRequest(Constant.TILES_DIRECTORY + tileIndex + '.html', function(html) {
		clickedTileHTML = clickedTile.innerHTML;
		clickedTile.innerHTML = html;
	});
	
	// After a second the tile will be fully expanded, so begin scrolling it into view
	timeoutHandle = setTimeout(function() {
		intervalHandle = setInterval(function() {
			const differenceY = scrollElement.scrollTop - clickedTile.offsetTop;
			const shouldScrollDown = differenceY < 0;
			const scrollComplete = shouldScrollDown ? differenceY >= -10 : differenceY < 10;
			if (shouldScrollDown) {
				if (scrollComplete) {
					clearInterval(intervalHandle);
				}
				else if (differenceY >= -30) {
					scrollElement.scrollTop = clickedTile.offsetTop - 10;
				}
				else {
					scrollElement.scrollTop = scrollElement.scrollTop + 30;
				}
			}
			else {
				if (scrollComplete) {
					clearInterval(intervalHandle);
				}
				else if (differenceY <= 30) {
					scrollElement.scrollTop = clickedTile.offsetTop - 10;
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
for (const tab of tabs) {
	tab.addEventListener('click', function() {
		changeActiveTab(parseInt(this.id));
	});
}

changeActiveTab(0);
