class Nav {
	private static readonly ACTIVE_TAB_CLASS = "tab-active";
	
	private tabs = document.getElementsByClassName("tab");
	private homeTab = this.tabs[0];
	private bestTab = this.tabs[1];
	private webTab = this.tabs[2];
	private appsTab = this.tabs[3];
	private activeTab: Element;

	private content = new Content();

	constructor() {
		for (let i = 0; i < this.tabs.length; i++) {
			this.tabs[i].addEventListener("click", (e: Event) => {
				let targetElement = e.target as HTMLElement;
				if (!targetElement.classList.contains("tab")) {
					targetElement = targetElement.parentElement;	
				}

				this.setActiveTab(targetElement);
			});
		}

		this.setActiveTab(this.homeTab as HTMLElement);
	}

	private setActiveTab(clickedTab: HTMLElement) {
		if (clickedTab === this.activeTab) {
			return;
		}
		
		if (this.activeTab) {
			this.activeTab.classList.remove(Nav.ACTIVE_TAB_CLASS);
		}

		clickedTab.classList.add(Nav.ACTIVE_TAB_CLASS);
		this.activeTab = clickedTab;

		let pageData: string[] = [];
		let isTilePage = false;
		let isBigTilePage = false;
		if (clickedTab === this.homeTab) {
			pageData = Content.HOME;
		} else if (clickedTab === this.bestTab) {
			pageData = Content.BEST;
			isTilePage = true;
			isBigTilePage = true;
		} else if (clickedTab === this.webTab) {
			pageData = Content.WEB;
			isTilePage = true;
		} else if (clickedTab === this.appsTab) {
			pageData = Content.APPS;
			isTilePage = true;
		}

		this.content.setPageData(pageData, isTilePage, isBigTilePage);
		this.content.load();	
	}	
}
