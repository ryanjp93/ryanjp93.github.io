var Website = (function () {
    function Website() {
        this.contentArea = document.getElementsByClassName("index-PageContent")[0];
        this.tabs = document.getElementsByClassName("index-NavButton");
        this.activeTabIndex = -1;
        this.activeTileIndex = -1;
    }
    /* Basic http request. */
    Website.prototype.httpRequest = function (url, callback) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                callback(xmlHttp.responseText);
            }
        };
        xmlHttp.open("GET", url, true);
        xmlHttp.send(null);
    };
    /* Fades in the page content by toggling an opacity change after a delay and animating it with a transition. */
    Website.prototype.fade = function () {
        var _this = this;
        this.contentArea.classList.remove(Website.FADE_CLASS);
        setTimeout(function () {
            _this.contentArea.classList.add(Website.FADE_CLASS);
        }, 100);
    };
    /* Switches to the tab represented by the given index. */
    Website.prototype.changeActiveTab = function (index) {
        var _this = this;
        var isTabAlreadyActive = index === this.activeTabIndex;
        if (isTabAlreadyActive) {
            return; // Don"t bother switching to a tab we are already on
        }
        this.activeTabIndex = index;
        // If a tab is already selcted, remove its styling here
        var activeTab = this.activeTab;
        if (activeTab) {
            activeTab.classList.remove(Website.ACTIVE_TAB_CLASS);
        }
        activeTab = this.activeTab = this.tabs[index];
        activeTab.classList.add(Website.ACTIVE_TAB_CLASS);
        // Load page content
        this.fade();
        this.httpRequest(Website.TAB_URLS[index], function (tabHTML) {
            // Clean up any tiles from the previous page
            var tiles = _this.tiles;
            if (tiles) {
                var tileCount = tiles.length;
                for (var i = 0; i < tileCount; i++) {
                    tiles[i].removeEventListener("click", function (e) { return _this.tileClick(e); });
                }
            }
            _this.contentArea.innerHTML = tabHTML;
            // Extra setup is only required on pages containing tiles
            var isTilePage = index === Website.FEATURED_PAGE_INDEX || index === Website.RECENT_PAGE_INDEX;
            if (isTilePage) {
                _this.loadTilePage();
            }
        });
    };
    /* Tile page require extra setup as the content and images require loading. */
    Website.prototype.loadTilePage = function () {
        var _this = this;
        var scrollElement = this.scrollElement = document.getElementsByClassName("tile-CenteringContainer")[0];
        var isFeaturedPage = this.activeTabIndex === Website.FEATURED_PAGE_INDEX;
        var tileNames = isFeaturedPage ? Website.FEATURED_TILE_NAMES : Website.RECENT_TILE_NAMES;
        var tiles = this.tiles = document.getElementsByClassName("tile-Tile");
        var tileCount = tileNames.length;
        var _loop_1 = function (i) {
            this_1.httpRequest("tiles/" + tileNames[i] + "-close.html", function (tileHTML) {
                var tileElement = tiles[i];
                tileElement.innerHTML = tileHTML;
                tileElement.firstElementChild.textContent = i.toString();
                // Each tile has a loading css animation which plays until its image is loaded. Create a background image and set up load behaviour.
                var imageElement = tileElement.getElementsByClassName("tile-Image")[0];
                var backgroundImage = new Image();
                backgroundImage.classList.add("tile-LoadedImage");
                backgroundImage.onload = function () {
                    imageElement.innerHTML = ""; // Clear the loading animation
                    imageElement.appendChild(backgroundImage); // Image has now finished loading so append it
                };
                backgroundImage.src = Website.ASSETS_DIRECTORY + tileNames[i] + "-bw.png";
                tileElement.addEventListener("click", function (e) { return _this.tileClick(e); });
            });
        };
        var this_1 = this;
        for (var i = 0; i < tileCount; i++) {
            _loop_1(i);
        }
    };
    /* Moves up the dom until a tile is found and return it. */
    Website.prototype.findTileElement = function (element) {
        var isTileElement = element.classList.contains("tile-Tile");
        return isTileElement ? element : this.findTileElement(element.parentElement);
    };
    /* Handle click events on tiles by expanding them. */
    Website.prototype.tileClick = function (e) {
        var clickedTile = this.findTileElement(e.target);
        var clickedTileIndex = Number(clickedTile.firstElementChild.textContent); // Each tile"s first child is a span containing the numerical position of the tile
        var activeTileIndex = this.activeTileIndex;
        // Deselect clicked tile if it was already active
        var isTileAlreadyActive = clickedTileIndex === activeTileIndex;
        if (isTileAlreadyActive) {
            this.activeTileIndex = -1;
            this.closeTile(clickedTile);
            return;
        }
        ;
        // Remove active tile styling from currently active tile
        var activeTileExists = activeTileIndex > -1;
        if (activeTileExists) {
            var activeTile = this.tiles[activeTileIndex];
            this.closeTile(activeTile);
        }
        this.openTile(clickedTile, clickedTileIndex);
    };
    /* Close the given tile. */
    Website.prototype.closeTile = function (tile) {
        var _this = this;
        tile.classList.remove(Website.ACTIVE_TILE_CLASS);
        // CLean up any image event listeners
        var imageElements = this.imageElements;
        var imageCount = imageElements.length;
        for (var i = 0; i < imageCount; i++) {
            imageElements[i].removeEventListener("click", function (e) { return _this.imageClick(e); });
        }
        this.gallery.addEventListener("click", function (e) { return e.stopImmediatePropagation(); });
        tile.innerHTML = this.activeTileClosedHTML;
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
        }
        if (this.timeoutHandle) {
            clearTimeout(this.timeoutHandle);
        }
    };
    Website.prototype.openTile = function (tile, tileIndex) {
        var _this = this;
        tile.classList.add(Website.ACTIVE_TILE_CLASS);
        this.activeTileIndex = tileIndex;
        var isFeaturedPage = this.activeTabIndex === Website.FEATURED_PAGE_INDEX;
        var tileNameArray = isFeaturedPage ? Website.FEATURED_TILE_NAMES : Website.RECENT_TILE_NAMES;
        var tileFullPath = Website.TILES_DIRECTORY + tileNameArray[tileIndex] + "-open.html";
        this.httpRequest(tileFullPath, function (html) {
            _this.activeTileClosedHTML = tile.innerHTML;
            var tileIndexElement = tile.firstElementChild;
            tile.innerHTML = "";
            tile.appendChild(tileIndexElement);
            tile.innerHTML += html;
            var gallery = _this.gallery = tile.getElementsByClassName("open-Gallery")[0];
            gallery.addEventListener("click", function (e) { return e.stopImmediatePropagation(); });
            // Each image on the tile has a loading animation which plays until the image is loaded. Create a background image and set up load behaviour.
            var imageElements = _this.imageElements = gallery.getElementsByClassName("open-Image");
            var imageCount = imageElements.length;
            var _loop_2 = function (i) {
                var imageElement = imageElements[i];
                var imageName = imageElement.firstElementChild.textContent;
                var backgroundImage = new Image();
                backgroundImage.classList.add("open-LoadedImage");
                backgroundImage.onload = function () {
                    imageElement.innerHTML = ""; // Clear the loading animation
                    imageElement.appendChild(backgroundImage); // Image has now finished loading so append it
                };
                backgroundImage.src = Website.ASSETS_DIRECTORY + imageName;
                imageElement.addEventListener("click", function (e) { return _this.imageClick(e); });
            };
            for (var i = 0; i < imageCount; i++) {
                _loop_2(i);
            }
        });
        // After a second the tile will be fully expanded, so begin scrolling it into view
        this.timeoutHandle = setTimeout(function () {
            _this.intervalHandle = setInterval(function () {
                var differenceY = _this.scrollElement.scrollTop - tile.offsetTop;
                var shouldScrollDown = differenceY < 0;
                var scrollComplete = shouldScrollDown ? differenceY >= -Website.SCROLL_FINE_STEP : differenceY < Website.SCROLL_FINE_STEP;
                if (shouldScrollDown) {
                    if (scrollComplete) {
                        clearInterval(_this.intervalHandle);
                    }
                    else if (differenceY >= -Website.SCROLL_STEP) {
                        _this.scrollElement.scrollTop = tile.offsetTop - Website.SCROLL_FINE_STEP;
                    }
                    else {
                        _this.scrollElement.scrollTop = _this.scrollElement.scrollTop + Website.SCROLL_STEP;
                    }
                }
                else {
                    if (scrollComplete) {
                        clearInterval(_this.intervalHandle);
                    }
                    else if (differenceY <= Website.SCROLL_STEP) {
                        _this.scrollElement.scrollTop = tile.offsetTop - Website.SCROLL_FINE_STEP;
                    }
                    else {
                        _this.scrollElement.scrollTop = _this.scrollElement.scrollTop - Website.SCROLL_STEP;
                    }
                }
            }, 30);
            if (_this.timeoutHandle) {
                clearTimeout(_this.timeoutHandle);
            }
        }, 1000);
    };
    /* Marks the clicked image as active if it wasn't already, deselecting the previous active image if it exists. */
    Website.prototype.imageClick = function (e) {
        e.stopImmediatePropagation();
        var clickedImage = e.target;
        var childClicked = clickedImage.classList.contains("open-LoadedImage");
        if (childClicked) {
            clickedImage = clickedImage.parentElement;
        }
        var activeImage = this.activeImage;
        if (activeImage) {
            activeImage.classList.remove(Website.ACTIVE_IMAGE_WRAPPER_CLASS);
            activeImage.firstElementChild.classList.remove(Website.ACTIVE_IMAGE_CLASS);
            this.activeImage = null;
            var imageAlreadyActive = activeImage === clickedImage;
            if (imageAlreadyActive) {
                return;
            }
        }
        this.activeImage = clickedImage;
        clickedImage.classList.add(Website.ACTIVE_IMAGE_WRAPPER_CLASS);
        clickedImage.firstElementChild.classList.add(Website.ACTIVE_IMAGE_CLASS);
    };
    // Program Start
    Website.prototype.Main = function () {
        var _this = this;
        var tabs = this.tabs;
        var tabsCount = tabs.length;
        for (var i = 0; i < tabsCount; i++) {
            tabs[i].addEventListener("click", function (e) {
                var target = e.target;
                var isParentSelected = target.classList.contains("index-NavButton");
                var indexElement = isParentSelected ? target.firstElementChild : target.previousElementSibling;
                var index = Number(indexElement.textContent);
                _this.changeActiveTab(index);
            });
        }
        this.changeActiveTab(0);
    };
    return Website;
}());
Website.LOCAL_SERVER = location.hostname === "localhost" || location.hostname === "127.0.0.1";
Website.ASSETS_DIRECTORY = Website.LOCAL_SERVER ? "/website-3.0/assets/" : "/assets/";
Website.TILES_DIRECTORY = Website.LOCAL_SERVER ? "/website-3.0/tiles/" : "/tiles/";
Website.FEATURED_PAGE_INDEX = 1;
Website.RECENT_PAGE_INDEX = 2;
Website.TAB_URLS = ["home.html", "featured.html", "recent.html", "contact.html"];
Website.ACTIVE_TAB_CLASS = "index-NavButton-active";
Website.ACTIVE_TILE_CLASS = "tile-Tile-active";
Website.FADE_CLASS = "fade";
Website.FEATURED_TILE_NAMES = ["moniacweb", "b365"];
Website.RECENT_TILE_NAMES = ["website2017", "moniac", "dx11", "website", "stats", "water", "ab", "fps", "placement", "hush", "dx9"];
Website.SCROLL_STEP = 30;
Website.SCROLL_FINE_STEP = 10;
Website.ACTIVE_IMAGE_WRAPPER_CLASS = "open-Image-active";
Website.ACTIVE_IMAGE_CLASS = "open-LoadedImage-active";
var website = new Website();
website.Main();
