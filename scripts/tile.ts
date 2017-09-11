class Tile {
	private static readonly PREVIEWS_DIRECTORY = Content.CONTENT_DIRECTORY + "previews/";
	private static readonly TILES_DIRECTORY = Content.CONTENT_DIRECTORY + "tiles/";
	private static readonly IMAGES_DIRECTORY = Content.CONTENT_DIRECTORY + "images/";

	private static readonly ACTIVE_TILE_CLASS = "tile-active";
	private static readonly ACTIVE_IMAGE_WRAPPER_CLASS = "open-Image-active";
	private static readonly ACTIVE_IMAGE_CLASS = "open-LoadedImage-active";

	private content: Content;

	private tileName: string;
	private element: HTMLElement;
	
	private tileHTML: string;
	private previewHTML: string;
	
	constructor(content: Content, tileName: string, isBigTilePage: boolean, disableTransitions: boolean) {
		this.content = content;
		this.tileName = tileName;

		const element = this.element = document.createElement("div");
		element.classList.add("tile");

		if (isBigTilePage) {
			element.classList.add("tile-large");
		}

		if (disableTransitions) {
			element.classList.add("tile-noTransitions");
		}

		content.getTileWrapper().appendChild(element);	
		
		Website.HttpRequest(Tile.PREVIEWS_DIRECTORY + tileName + ".html", (html) => {	
			this.element.innerHTML = html;
			
			// Each tile has a loading css animation which plays until its image is loaded. Create a background image and set up load behaviour.
			const imageElement = element.getElementsByClassName("tileImage")[0];
			
			const backgroundImage = new Image();
			backgroundImage.onload = () => {
				backgroundImage.classList.add("tileLoadedImage");
				imageElement.innerHTML = ""; // Clear the loading animation
				imageElement.appendChild(backgroundImage); // Image has now finished loading so append it
				this.previewHTML = this.element.innerHTML	
			}
			backgroundImage.src = Tile.IMAGES_DIRECTORY + tileName + "-bw.png";
			
			element.addEventListener("click", (e) => {
				if ((e.target as HTMLElement).nodeName === "A") {
					return;	// If the user clicked a link, keep the tile open
				}
				
				this.content.setActiveTile(this);
			});

			content.announceTileLoad();
		});
	}

	public getElement(): Element {
		return this.element;
	}
	
	public openTile(): void {
		this.element.classList.add(Tile.ACTIVE_TILE_CLASS);
		
		if (this.tileHTML) {
			this.loadTile(this.tileHTML);	
		} else {
			const url = Tile.TILES_DIRECTORY + this.tileName + ".html";	
			Website.HttpRequest(url, (html) => this.loadTile(html));
		}
	}
	
	public closeTile(): void {
		this.element.classList.remove(Tile.ACTIVE_TILE_CLASS);
		
		if (this.previewHTML) {
			this.loadPreview(this.previewHTML);
		} else {
			const url = Tile.PREVIEWS_DIRECTORY + this.tileName + ".html";
			Website.HttpRequest(url, (html) => this.loadPreview(html));
		}
	}

	private loadTile(html: string) {
		const element = this.element;
		
		this.tileHTML = html;
		element.innerHTML = html;

		element.classList.add(Tile.ACTIVE_TILE_CLASS);
		
		// Each image on the tile has a loading animation which plays until the image is loaded. Create a background image and set up load behaviour.
		const imageElements = element.getElementsByClassName("openImage");
		const imageCount = imageElements.length
		for (let i = 0; i < imageCount; i++) {
			const imageElement = imageElements[i];
			const imageName = imageElement.firstElementChild.textContent;
	
			const backgroundImage = new Image();
			backgroundImage.onload = () => {
				backgroundImage.classList.add("openLoadedImage");
				imageElement.innerHTML = ""; // Clear the loading animation
				imageElement.appendChild(backgroundImage); // Image has now finished loading so append it
				
				imageElement.addEventListener("click", (e) => {
					e.stopPropagation();
					window.open(backgroundImage.src, '_blank');
				});
			}
			backgroundImage.src = Tile.IMAGES_DIRECTORY + imageName;
		}

		const videoElements = element.getElementsByClassName("openVideo");
		if (videoElements && videoElements.length > 0) {
			const videoElement = videoElements[0];
			videoElement.addEventListener("click", (e) => {
				e.stopPropagation();
			});
		}

		this.content.scrollToActiveTile();
	}	

	private loadPreview(html: string): void { 
		const element = this.element;
		element.classList.remove(Tile.ACTIVE_TILE_CLASS);
		element.innerHTML = html;
	}
}
