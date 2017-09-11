var Browser = (function () {
    function Browser() {
    }
    Browser.GetIOSVersion = function () {
        if (!Browser.IS_IOS) {
            return [0, 0, 0];
        }
        var rawVersion = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
        console.log(rawVersion);
        return [parseInt(rawVersion[1], 10), parseInt(rawVersion[2], 10), parseInt(rawVersion[3] || "0", 10)];
    };
    Browser.IS_OPERA = window.navigator.userAgent.indexOf("OPR") > -1;
    Browser.IS_EDGE = window.navigator.userAgent.indexOf("Edge") > -1;
    Browser.IS_IOS = /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !window.MSStream;
    Browser.IS_IOS_CHROME = window.navigator.userAgent.match("CriOS");
    Browser.IS_CHROME = window.chrome !== null && window.chrome !== undefined && window.navigator.vendor === "Google Inc." && !Browser.IS_OPERA && !Browser.IS_EDGE;
    Browser.IS_IE11 = !!window.MSInputMethodContext && !!document.documentMode;
    return Browser;
}());
var Content = (function () {
    function Content() {
        this.element = document.getElementsByClassName("content")[0];
        var iosVersion = Browser.GetIOSVersion()[0];
        if (!Browser.IS_IOS_CHROME && iosVersion !== 0 && iosVersion < 10) {
            var contentWrapper = document.getElementsByClassName("contentWrapper")[0];
            contentWrapper.classList.add("contentWrapper-shifted");
        }
        else if (Browser.IS_IE11) {
            // IE11 has issues dealing with max sizes on flex containers, fixed sizes used instead in these cases
            var foreground = document.getElementsByClassName("foreground")[0];
            foreground.classList.add("foreground-fixed");
            this.element.classList.add("content-fixed");
        }
    }
    Content.prototype.getTileWrapper = function () {
        return this.tilesWrapper;
    };
    Content.prototype.setActiveTile = function (tile) {
        // Remove active tile styling from currently active tile
        if (this.activeTile) {
            var isTileAlreadyActive = tile.getElement() === this.activeTile.getElement();
            this.activeTile.closeTile();
            // If the selected tile was this one, don't reselect it
            if (isTileAlreadyActive) {
                this.activeTile = undefined;
                return;
            }
        }
        this.activeTile = tile;
        tile.openTile();
    };
    Content.prototype.setPageData = function (pageData, isTilePage, isBigTilePage) {
        if (isTilePage === void 0) { isTilePage = false; }
        if (isBigTilePage === void 0) { isBigTilePage = false; }
        this.isTilePage = isTilePage;
        this.isBigTilePage = isBigTilePage;
        this.pageData = pageData;
    };
    Content.prototype.getPageDate = function () {
        return this.pageData;
    };
    Content.prototype.announceTileLoad = function () {
        this.tilesLoaded++;
        // All tiles loaded, time to fade in
        if (this.tilesLoaded >= this.tilesToLoad) {
            this.element.classList.add(Content.FADE_CLASS);
        }
    };
    Content.prototype.load = function () {
        var _this = this;
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
            var disableTransitions = false;
            var iosVersion = Browser.GetIOSVersion();
            if (Browser.IS_IOS && !Browser.IS_IOS_CHROME && !(iosVersion[0] === 10 && iosVersion[1] === 3)) {
                disableTransitions = true;
            }
            for (var i = 0; i < this.pageData.length; i++) {
                new Tile(this, this.pageData[i], this.isBigTilePage, disableTransitions);
            }
            ;
        }
        else {
            if (this.homePageHTML) {
                this.element.innerHTML = this.homePageHTML;
                setTimeout(function () {
                    _this.element.classList.remove(Content.TILE_PAGE_CLASS);
                    _this.element.classList.add(Content.FADE_CLASS); // Fade in content
                }, Content.FADE_DELAY);
            }
            else {
                Website.HttpRequest(this.pageData[0], function (tabHTML) {
                    _this.homePageHTML = tabHTML;
                    _this.element.innerHTML = tabHTML;
                    _this.element.classList.remove(Content.TILE_PAGE_CLASS);
                    _this.element.classList.add(Content.FADE_CLASS); // Fade in content
                });
            }
        }
    };
    Content.prototype.scrollToActiveTile = function () {
        var _this = this;
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
        }
        setTimeout(function () {
            if (!_this.activeTile || !_this.activeTile.getElement()) {
                return;
            }
            var activeTileElement = _this.activeTile.getElement();
            var scrollContainer = _this.element;
            var tileStyle = window.getComputedStyle(activeTileElement);
            var marginTop = parseInt(tileStyle.marginTop) / 2;
            var targetTop = activeTileElement.offsetTop - marginTop;
            // After a second the tile will be fully expanded, so begin scrolling it into view
            _this.intervalHandle = setInterval(function () {
                var differenceY = scrollContainer.scrollTop - targetTop;
                var scrollComplete = differenceY === 0;
                if (scrollComplete) {
                    clearInterval(_this.intervalHandle);
                }
                else {
                    var shouldScrollDown = differenceY < 0;
                    var shouldSnap = shouldScrollDown ? differenceY >= -Content.SCROLL_STEP : differenceY <= Content.SCROLL_STEP;
                    if (shouldSnap) {
                        scrollContainer.scrollTop = targetTop;
                        clearInterval(_this.intervalHandle);
                    }
                    else {
                        scrollContainer.scrollTop += shouldScrollDown ? Content.SCROLL_STEP : -Content.SCROLL_STEP;
                    }
                }
            }, Content.SCROLL_INTERVAL);
        }, Content.SCROLL_DELAY);
    };
    Content.HOME = ["home.html"];
    Content.BEST = ["itt", "b365"];
    Content.WEB = ["moniacweb", "website2017", "stats", "website", "placement"];
    Content.APPS = ["moniac", "dx11", "ab", "water", "fps", "hush", "dx9"];
    Content.LOCAL_SERVER = location.hostname === "localhost" || location.hostname === "127.0.0.1";
    Content.CONTENT_DIRECTORY = Content.LOCAL_SERVER ? "/website-3.0/content/" : "/content/";
    Content.FADE_CLASS = "fade";
    Content.TILE_PAGE_CLASS = "content-tilePage";
    Content.FADE_DELAY = 100; // Fade will usually just occur on load, but for cached content there needs to be a slight delay
    Content.SCROLL_STEP = 80;
    Content.SCROLL_INTERVAL = 20;
    Content.SCROLL_DELAY = 500; // The time waited for a tile open/close animation to finish before beginning autoscroll
    return Content;
}());
var Tile = (function () {
    function Tile(content, tileName, isBigTilePage, disableTransitions) {
        var _this = this;
        this.content = content;
        this.tileName = tileName;
        var element = this.element = document.createElement("div");
        element.classList.add("tile");
        if (isBigTilePage) {
            element.classList.add("tile-large");
        }
        if (disableTransitions) {
            element.classList.add("tile-noTransitions");
        }
        content.getTileWrapper().appendChild(element);
        Website.HttpRequest(Tile.PREVIEWS_DIRECTORY + tileName + ".html", function (html) {
            _this.element.innerHTML = html;
            // Each tile has a loading css animation which plays until its image is loaded. Create a background image and set up load behaviour.
            var imageElement = element.getElementsByClassName("tileImage")[0];
            var backgroundImage = new Image();
            backgroundImage.onload = function () {
                backgroundImage.classList.add("tileLoadedImage");
                imageElement.innerHTML = ""; // Clear the loading animation
                imageElement.appendChild(backgroundImage); // Image has now finished loading so append it
                _this.previewHTML = _this.element.innerHTML;
            };
            backgroundImage.src = Tile.IMAGES_DIRECTORY + tileName + "-bw.png";
            element.addEventListener("click", function (e) {
                if (e.target.nodeName === "A") {
                    return; // If the user clicked a link, keep the tile open
                }
                _this.content.setActiveTile(_this);
            });
            content.announceTileLoad();
        });
    }
    Tile.prototype.getElement = function () {
        return this.element;
    };
    Tile.prototype.openTile = function () {
        var _this = this;
        this.element.classList.add(Tile.ACTIVE_TILE_CLASS);
        if (this.tileHTML) {
            this.loadTile(this.tileHTML);
        }
        else {
            var url = Tile.TILES_DIRECTORY + this.tileName + ".html";
            Website.HttpRequest(url, function (html) { return _this.loadTile(html); });
        }
    };
    Tile.prototype.closeTile = function () {
        var _this = this;
        this.element.classList.remove(Tile.ACTIVE_TILE_CLASS);
        if (this.previewHTML) {
            this.loadPreview(this.previewHTML);
        }
        else {
            var url = Tile.PREVIEWS_DIRECTORY + this.tileName + ".html";
            Website.HttpRequest(url, function (html) { return _this.loadPreview(html); });
        }
    };
    Tile.prototype.loadTile = function (html) {
        var element = this.element;
        this.tileHTML = html;
        element.innerHTML = html;
        element.classList.add(Tile.ACTIVE_TILE_CLASS);
        // Each image on the tile has a loading animation which plays until the image is loaded. Create a background image and set up load behaviour.
        var imageElements = element.getElementsByClassName("openImage");
        var imageCount = imageElements.length;
        var _loop_1 = function (i) {
            var imageElement = imageElements[i];
            var imageName = imageElement.firstElementChild.textContent;
            var backgroundImage = new Image();
            backgroundImage.onload = function () {
                backgroundImage.classList.add("openLoadedImage");
                imageElement.innerHTML = ""; // Clear the loading animation
                imageElement.appendChild(backgroundImage); // Image has now finished loading so append it
                imageElement.addEventListener("click", function (e) {
                    e.stopPropagation();
                    window.open(backgroundImage.src, '_blank');
                });
            };
            backgroundImage.src = Tile.IMAGES_DIRECTORY + imageName;
        };
        for (var i = 0; i < imageCount; i++) {
            _loop_1(i);
        }
        var videoElements = element.getElementsByClassName("openVideo");
        if (videoElements && videoElements.length > 0) {
            var videoElement = videoElements[0];
            videoElement.addEventListener("click", function (e) {
                e.stopPropagation();
            });
        }
        this.content.scrollToActiveTile();
    };
    Tile.prototype.loadPreview = function (html) {
        var element = this.element;
        element.classList.remove(Tile.ACTIVE_TILE_CLASS);
        element.innerHTML = html;
    };
    Tile.PREVIEWS_DIRECTORY = Content.CONTENT_DIRECTORY + "previews/";
    Tile.TILES_DIRECTORY = Content.CONTENT_DIRECTORY + "tiles/";
    Tile.IMAGES_DIRECTORY = Content.CONTENT_DIRECTORY + "images/";
    Tile.ACTIVE_TILE_CLASS = "tile-active";
    Tile.ACTIVE_IMAGE_WRAPPER_CLASS = "open-Image-active";
    Tile.ACTIVE_IMAGE_CLASS = "open-LoadedImage-active";
    return Tile;
}());
var Nav = (function () {
    function Nav() {
        var _this = this;
        this.tabs = document.getElementsByClassName("tab");
        this.homeTab = this.tabs[0];
        this.bestTab = this.tabs[1];
        this.webTab = this.tabs[2];
        this.appsTab = this.tabs[3];
        this.content = new Content();
        for (var i = 0; i < this.tabs.length; i++) {
            this.tabs[i].addEventListener("click", function (e) {
                var targetElement = e.target;
                if (!targetElement.classList.contains("tab")) {
                    targetElement = targetElement.parentElement;
                }
                _this.setActiveTab(targetElement);
            });
        }
        this.setActiveTab(this.homeTab);
    }
    Nav.prototype.setActiveTab = function (clickedTab) {
        if (clickedTab === this.activeTab) {
            return;
        }
        if (this.activeTab) {
            this.activeTab.classList.remove(Nav.ACTIVE_TAB_CLASS);
        }
        clickedTab.classList.add(Nav.ACTIVE_TAB_CLASS);
        this.activeTab = clickedTab;
        var pageData = [];
        var isTilePage = false;
        var isBigTilePage = false;
        if (clickedTab === this.homeTab) {
            pageData = Content.HOME;
        }
        else if (clickedTab === this.bestTab) {
            pageData = Content.BEST;
            isTilePage = true;
            isBigTilePage = true;
        }
        else if (clickedTab === this.webTab) {
            pageData = Content.WEB;
            isTilePage = true;
        }
        else if (clickedTab === this.appsTab) {
            pageData = Content.APPS;
            isTilePage = true;
        }
        this.content.setPageData(pageData, isTilePage, isBigTilePage);
        this.content.load();
    };
    Nav.ACTIVE_TAB_CLASS = "tab-active";
    return Nav;
}());
var Website = (function () {
    function Website() {
        new Nav();
    }
    Website.HttpRequest = function (url, callback) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                callback(xmlHttp.responseText);
            }
        };
        xmlHttp.open("GET", url, true);
        xmlHttp.send(null);
    };
    return Website;
}());
new Website();
