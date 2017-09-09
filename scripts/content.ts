class Content {	
	public static readonly HOME = ["home.html"];
	public static readonly BEST = ["itt", "b365"]; 
	public static readonly WEB = ["moniacweb", "website2017", "stats", "website", "placement"];
	public static readonly APPS = ["moniac", "dx11", "ab", "water", "fps", "hush", "dx9"];
	
	private static readonly LOCAL_SERVER = location.hostname === "localhost" || location.hostname === "127.0.0.1";
	public static readonly CONTENT_DIRECTORY = Content.LOCAL_SERVER ? "/website-3.0/content/" : "/content/";

	private static readonly FADE_CLASS = "fade";
	
	private static readonly SCROLL_STEP = 60;
	private static readonly SCROLL_FINE_STEP = 20;
	private static readonly SCROLL_INTERVAL = 30;
	private static readonly SCROLL_DELAY = 1000; // The time waited for a tile open/close animation to finish before beginning autoscroll
	
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
	
	constructor() {}

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
			this.element.classList.add("content-tilePage");

			this.tilesWrapper = document.createElement("div");
			this.tilesWrapper.classList.add("tilesWrapper");
			this.element.appendChild(this.tilesWrapper);

			this.tilesLoaded = 0;
			this.tilesToLoad = this.pageData.length;

			for (let i = 0; i < this.pageData.length; i++) {
				new Tile(this, this.pageData[i], this.isBigTilePage);
			};
		} else {
			if (this.homePageHTML) {
				this.element.innerHTML = this.homePageHTML;

				setTimeout(() => {
					this.element.classList.remove("content-tilePage");
					this.element.classList.add(Content.FADE_CLASS); // Fade in content
				}, 100);
			} else {
				Website.HttpRequest(this.pageData[0], (tabHTML: string) => {
					this.homePageHTML = tabHTML;
					this.element.innerHTML = tabHTML;
				
					this.element.classList.remove("content-tilePage");
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
			const activeTileElement = this.activeTile.getElement() as HTMLElement;
			const tileStyle = window.getComputedStyle(activeTileElement);

			const marginTop = parseInt(tileStyle.marginTop) / 2;
			let targetTop = activeTileElement.offsetTop - marginTop;
			//	if (marginTop > 8) {
			//	const paddingTop = parseInt(tileStyle.paddingTop);
			//	targetTop = targetTop + paddingTop;
			//}

			const scrollContainer = this.element;
		
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
					} else {
						scrollContainer.scrollTop += shouldScrollDown ? Content.SCROLL_STEP : -Content.SCROLL_STEP;
					}
				}
			}, Content.SCROLL_INTERVAL);
		}, Content.SCROLL_DELAY);
	}
}
