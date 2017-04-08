class Website {
	private static LOCAL_SERVER = location.hostname === "localhost" || location.hostname === "127.0.0.1";
	private static ASSETS_DIRECTORY = Website.LOCAL_SERVER ? "/website-3.0/assets/" : "/assets/";
	private static TILES_DIRECTORY = Website.LOCAL_SERVER ? "/website-3.0/tiles/" : "/tiles/";
	private static FEATURED_PAGE_INDEX = 1;
	private static RECENT_PAGE_INDEX = 2;
	private static TAB_URLS = ["home.html", "featured.html", "recent.html", "contact.html"];
	private static ACTIVE_TAB_CLASS = "index-NavButton-active";
	private static ACTIVE_TILE_CLASS = "tile-Tile-active";
	private static FADE_CLASS = "fade";
	private static FEATURED_TILE_NAMES = ["moniacweb", "b365"];
	private static RECENT_TILE_NAMES = ["website2017", "moniac", "dx11", "website", "stats", "water", "ab", "fps", "placement", "hush", "dx9"];
	private static SCROLL_STEP = 30;
	private static SCROLL_FINE_STEP = 10;

	private contentArea = document.getElementsByClassName("index-PageContent")[0];
	private tabs = document.getElementsByClassName("index-NavButton");
	
	private tiles: NodeList;
	private scrollElement: HTMLElement;
	
	private timeoutHandle: number;
	private intervalHandle: number;
	
	private activeTab: Element;
	private activeTabIndex = -1;

	private activeTileIndex = -1;
	private activeTileClosedHTML: string;
	
	constructor() {}

	/* Basic http request. */
	private httpRequest(url: string, callback: (response: string) => void): void {
		const xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange = () => { 
	        	if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
	        	    	callback(xmlHttp.responseText);
			}
	    	}
	    	xmlHttp.open("GET", url, true); 
	    	xmlHttp.send(null);
	}
	
	/* Fades in the page content by toggling an opacity change after a delay and animating it with a transition. */
	private fade(): void {
		this.contentArea.classList.remove(Website.FADE_CLASS);
		
		setTimeout(() => { 
			this.contentArea.classList.add(Website.FADE_CLASS);
		}, 100);
	}
	
	/* Switches to the tab represented by the given index. */
	private changeActiveTab(index: number): void {
		const isTabAlreadyActive = index === this.activeTabIndex;
		if (isTabAlreadyActive) {
			return; // Don"t bother switching to a tab we are already on
		}

		this.activeTabIndex = index;

		// If a tab is already selcted, remove its styling here
		let activeTab = this.activeTab;
		if (activeTab) {
			activeTab.classList.remove(Website.ACTIVE_TAB_CLASS);
		}

		activeTab = this.activeTab = this.tabs[index]
		activeTab.classList.add(Website.ACTIVE_TAB_CLASS);
		
		// Load page content
		this.fade();
		this.httpRequest(Website.TAB_URLS[index], (tabHTML: string) => {
			// Clean up any tiles from the previous page
			let tiles = this.tiles;
			if (tiles) {
				const tileCount = tiles.length;
				for (let i = 0; i < tileCount; i++) {
					tiles[i].removeEventListener("click", (e: Event) => this.tileClick(e));
				}
			}

			this.contentArea.innerHTML = tabHTML;
			
			// Extra setup is only required on pages containing tiles
			const isTilePage = index === Website.FEATURED_PAGE_INDEX || index === Website.RECENT_PAGE_INDEX;
			if (isTilePage) {
				this.loadTilePage();
			}	
		});
	}

	/* Tile page require extra setup as the content and images require loading. */
	private loadTilePage(): void {
		const scrollElement = this.scrollElement = document.getElementsByClassName("tile-CenteringContainer")[0] as HTMLElement;
		
		const isFeaturedPage = this.activeTabIndex === Website.FEATURED_PAGE_INDEX;
		const tileNames = isFeaturedPage ? Website.FEATURED_TILE_NAMES : Website.RECENT_TILE_NAMES;
		
		const tiles = this.tiles = document.getElementsByClassName("tile-Tile");

		const tileCount = tileNames.length;
		for (let i = 0; i < tileCount; i++) {
			this.httpRequest("tiles/" + tileNames[i] + "-close.html", (tileHTML) => {
				const tileElement = tiles[i];

				tileElement.innerHTML = tileHTML;
				tileElement.firstElementChild.textContent = i.toString();
		
				// Each tile has a loading css animation which plays until its image is loaded. Create a background image and set up load behaviour.
				const imageElement = tileElement.getElementsByClassName("tile-Image")[0];
				
				const backgroundImage = new Image();
				backgroundImage.classList.add("tile-LoadedImage");
				backgroundImage.onload = () => {
					imageElement.innerHTML = ""; // Clear the loading animation
					imageElement.appendChild(backgroundImage); // Image has now finished loading so append it
				}
				backgroundImage.src = Website.ASSETS_DIRECTORY + tileNames[i] + "-bw.png";
				
				tileElement.addEventListener("click", (e: Event) => this.tileClick(e));
			});
		}
	}

	/* Moves up the dom until a tile is found and return it. */
	private findTileElement(element: HTMLElement): HTMLElement {
		const isTileElement = element.classList.contains("tile-Tile");
		return isTileElement ? element : this.findTileElement(element.parentElement);
	}

	/* Handle click events on tiles by expanding them. */
	private tileClick(e: Event): void {
		const clickedTile = this.findTileElement(e.target as HTMLElement);
		const clickedTileIndex = Number(clickedTile.firstElementChild.textContent); // Each tile"s first child is a span containing the numerical position of the tile
		
		let activeTileIndex = this.activeTileIndex;
		
		// Deselect clicked tile if it was already active
		const isTileAlreadyActive = clickedTileIndex === activeTileIndex;
		if (isTileAlreadyActive) {
			activeTileIndex = -1;
			this.closeTile(clickedTile);
			return;
		};
		
		// Remove active tile styling from currently active tile
		const activeTileExists = activeTileIndex > -1;
		if (activeTileExists) {
			const activeTile = this.tiles[activeTileIndex];
			this.closeTile(activeTile as Element);
		}
		
		this.openTile(clickedTile, clickedTileIndex);
	}

	/* Close the given tile. */
	private closeTile(tile: Element): void {
		tile.classList.remove(Website.ACTIVE_TILE_CLASS);
		tile.innerHTML = this.activeTileClosedHTML;
	
		if (this.intervalHandle) {
			clearInterval(this.intervalHandle);
		}
	
		if (this.timeoutHandle) {
			clearTimeout(this.timeoutHandle);
		}
	}
	
	private openTile(tile: HTMLElement, tileIndex: number): void {
		tile.classList.add(Website.ACTIVE_TILE_CLASS);
		this.activeTileIndex = tileIndex;
		
		const isFeaturedPage = this.activeTabIndex === Website.FEATURED_PAGE_INDEX;
	
		const tileNameArray = isFeaturedPage ? Website.FEATURED_TILE_NAMES : Website.RECENT_TILE_NAMES;
		const tileFullPath = Website.TILES_DIRECTORY + tileNameArray[tileIndex] + "-open.html";	
		this.httpRequest(tileFullPath, (html) => {
			this.activeTileClosedHTML = tile.innerHTML;

			const tileIndexElement = tile.firstElementChild;
			tile.innerHTML = "";
			tile.appendChild(tileIndexElement);
			tile.innerHTML += html;
		});
		
		// After a second the tile will be fully expanded, so begin scrolling it into view
		this.timeoutHandle = setTimeout(() => {
			this.intervalHandle = setInterval(() => {
				const differenceY = this.scrollElement.scrollTop - tile.offsetTop;
				const shouldScrollDown = differenceY < 0;
				const scrollComplete = shouldScrollDown ? differenceY >= -Website.SCROLL_FINE_STEP : differenceY < Website.SCROLL_FINE_STEP;
				if (shouldScrollDown) {
					if (scrollComplete) {
						clearInterval(this.intervalHandle);
					}
					else if (differenceY >= -Website.SCROLL_STEP) {
						this.scrollElement.scrollTop = tile.offsetTop - Website.SCROLL_FINE_STEP;
					}
					else {
						this.scrollElement.scrollTop = this.scrollElement.scrollTop + Website.SCROLL_STEP;
					}
				}
				else {
					if (scrollComplete) {
						clearInterval(this.intervalHandle);
					}
					else if (differenceY <= Website.SCROLL_STEP) {
						this.scrollElement.scrollTop = tile.offsetTop - Website.SCROLL_FINE_STEP;
					}
					else {
						this.scrollElement.scrollTop = this.scrollElement.scrollTop - Website.SCROLL_STEP;
					}
				}
			}, 30);
			
			if (this.timeoutHandle) {
				clearTimeout(this.timeoutHandle);
			}
		}, 1000);
	}

	// Program Start
	public Main(): void {
		const tabs = this.tabs;
		const tabsCount = tabs.length;
		for (let i = 0; i < tabsCount; i++) {
			tabs[i].addEventListener("click", (e: Event) => {
				const target = e.target as Element;

				const isParentSelected = target.classList.contains("index-NavButton");
				let indexElement = isParentSelected ? target.firstElementChild : target.previousElementSibling;
				
				const index = Number(indexElement.textContent);
				this.changeActiveTab(index);
			});
		}
		
		this.changeActiveTab(0);
	}
}

const website = new Website();
website.Main();