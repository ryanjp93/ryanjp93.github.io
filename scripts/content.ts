class Content {	
	public static readonly HOME = ["home.html"];
	public static readonly BEST = ["itt", "b365"]; 
	public static readonly WEB = ["moniacweb", "website2017", "stats", "website", "placement"];
	public static readonly APPS = ["moniac", "dx11", "ab", "water", "fps", "hush", "dx9"];
	
	private static readonly LOCAL_SERVER = location.hostname === "localhost" || location.hostname === "127.0.0.1";
	public static readonly CONTENT_DIRECTORY = Content.LOCAL_SERVER ? "/website-3.0/content/" : "/content/";

	private static readonly FADE_CLASS = "fade";
	private static readonly TILE_PAGE_CLASS = "content-tilePage";
	private static readonly FADE_DELAY = 100; // Fade will usually just occur on load, but for cached content there needs to be a slight delay

	private static readonly SCROLL_STEP = 80;
	private static readonly SCROLL_INTERVAL = 20;
	private static readonly SCROLL_DELAY = 500; // The time waited for a tile open/close animation to finish before beginning autoscroll
	
	private element = document.getElementsByClassName("content")[0];
	private tilesWrapper: Element;

	private homePageHTML: string;

	private isTilePage: boolean;
	private isBigTilePage: boolean;
	private pageData: string[];
	
	private activeTile: Tile;

	private tilesLoaded: number;
	private tilesToLoad: number;

	private intervalHandle: number;
	
	constructor() {
		const iosVersion = Browser.GetIOSVersion()[0];
		if (!Browser.IS_IOS_CHROME && iosVersion !== 0 && iosVersion < 10) {
			const contentWrapper = document.getElementsByClassName("contentWrapper")[0];
			contentWrapper.classList.add("contentWrapper-shifted");
		}
		else if (Browser.IS_IE11) {
			// IE11 has issues dealing with max sizes on flex containers, fixed sizes used instead in these cases
			const foreground = document.getElementsByClassName("foreground")[0];
			foreground.classList.add("foreground-fixed");
			
			this.element.classList.add("content-fixed");
		}
	}

	public getTileWrapper(): Element {
		return this.tilesWrapper;
	}

	public setActiveTile(tile: Tile): void {
		// Remove active tile styling from currently active tile
		if (this.activeTile) {
			const isTileAlreadyActive = tile.getElement() === this.activeTile.getElement();

			this.activeTile.closeTile();

			// If the selected tile was this one, don't reselect it
			if (isTileAlreadyActive) {
				this.activeTile = undefined;
				return;
			}
		}

		this.activeTile = tile;
		tile.openTile();
	}

	public setPageData(pageData: string[], isTilePage = false, isBigTilePage = false): void {
		this.isTilePage = isTilePage;
		this.isBigTilePage =isBigTilePage;
		this.pageData = pageData;
	}

	public getPageDate(): string[] {
		return this.pageData;
	}

	public announceTileLoad(): void {
		this.tilesLoaded++;

		// All tiles loaded, time to fade in
		if (this.tilesLoaded >= this.tilesToLoad) {
			this.element.classList.add(Content.FADE_CLASS);
		}
	}

	public load(): void {
		this.element.innerHTML = "";
		this.element.classList.remove(Content.FADE_CLASS);

		if (this.isTilePage) {
			this.element.classList.add(Content.TILE_PAGE_CLASS);

			this.tilesWrapper = document.createElement("div");
			this.tilesWrapper.classList.add("tilesWrapper");
			this.element.appendChild(this.tilesWrapper);

			this.tilesLoaded = 0;
			this.tilesToLoad = this.pageData.length;

			// iOS versions 10, 10.1 and 10.2 have a bug which causes transition csss to play backwards. Fixed in iOS 10.3
			let disableTransitions = false;
			const iosVersion = Browser.GetIOSVersion();
			if (Browser.IS_IOS && !Browser.IS_IOS_CHROME && !(iosVersion[0] === 10 && iosVersion[1] === 3)) {
				disableTransitions = true;
			}

			for (let i = 0; i < this.pageData.length; i++) {
				new Tile(this, this.pageData[i], this.isBigTilePage, disableTransitions);
			};
		} else {
			if (this.homePageHTML) {
				this.element.innerHTML = this.homePageHTML;

				setTimeout(() => {
					this.element.classList.remove(Content.TILE_PAGE_CLASS);
					this.element.classList.add(Content.FADE_CLASS); // Fade in content
				}, Content.FADE_DELAY);
			} else {
				Website.HttpRequest(this.pageData[0], (tabHTML: string) => {
					this.homePageHTML = tabHTML;
					this.element.innerHTML = tabHTML;
				
					this.element.classList.remove(Content.TILE_PAGE_CLASS);
					this.element.classList.add(Content.FADE_CLASS); // Fade in content
				});
			}
		}
	}

	public scrollToActiveTile(): void {
		if (this.intervalHandle) {
			clearInterval(this.intervalHandle);
		}	
		
		setTimeout(() => {
			if (!this.activeTile || !this.activeTile.getElement()) {
				return;
			}

			const activeTileElement = this.activeTile.getElement() as HTMLElement;
			const scrollContainer = this.element;
			
			const tileStyle = window.getComputedStyle(activeTileElement);
			const marginTop = parseInt(tileStyle.marginTop) / 2;
			const targetTop = activeTileElement.offsetTop - marginTop;
		
			// After a second the tile will be fully expanded, so begin scrolling it into view
			this.intervalHandle = setInterval(() => {
				const differenceY = scrollContainer.scrollTop - targetTop;
				const scrollComplete = differenceY === 0;
				if (scrollComplete) {
					clearInterval(this.intervalHandle);
				} else {
					const shouldScrollDown = differenceY < 0;
					const shouldSnap = shouldScrollDown ? differenceY >= -Content.SCROLL_STEP : differenceY <= Content.SCROLL_STEP;
					if (shouldSnap) {
						scrollContainer.scrollTop = targetTop;
						clearInterval(this.intervalHandle);
					} else {
						scrollContainer.scrollTop += shouldScrollDown ? Content.SCROLL_STEP : -Content.SCROLL_STEP;
					}
				}
			}, Content.SCROLL_INTERVAL);
		}, Content.SCROLL_DELAY);
	}
}
