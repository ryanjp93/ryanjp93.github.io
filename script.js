var navButtons = document.getElementsByClassName('navElement');
var homeButton = navButtons[0];
var featuredButton = navButtons[1];
var projectsButton = navButtons[2];
var contactButton = navButtons[3];
var activeNavElement = homeButton;

var contentArea = document.getElementsByClassName('content')[0];

var triangleLeft = document.createElement('div');
var triangleRight = document.createElement('div');
triangleLeft.className = 'triangle triangleLeft';
triangleRight.className = 'triangle triangleRight';

/* Sets the styling and moves the little triangles on the active nav element to the new active nav element. */
function changeActiveNavElement(element) {
	var activeNavElementChildren = activeNavElement.children;
	
	// remove active styling from old active nav element
	activeNavElement.removeChild(activeNavElementChildren[2]);
	activeNavElement.removeChild(activeNavElementChildren[0]);
	activeNavElement.classList.remove('activeNavElement');
	
	activeNavElement = element;
	
	// apply active styling to new active nav element
	activeNavElement.insertBefore(triangleLeft, activeNavElement.firstChild);
	activeNavElement.appendChild(triangleRight);
	activeNavElement.classList.add('activeNavElement');
}

/* Determine whether the given element is the active one. */
function isActive(domElement, activeClass) {
	if (domElement.classList.contains(activeClass)) {
		return true;
	}
	
	return false;
}

/* Fades in the page content by removing the fade class (sets opacity to 0) and reapplying (sets opacity to 1) it after a delay,
   which causes the transition effect to play properly. */
function fade() {
	contentArea.classList.remove('fade');
	
	setTimeout(function() { 
		contentArea.classList.add('fade');
	}, 100);
}

var activeImage;
var activeImageClass = 'galleryImageActive';

/* Expanded tiles all have at least one image gallery. Images in these galleries must expand when clicked and shrink when clicked
   again. */
function setupImageGallery(tile) {
	var galleryImages = tile.getElementsByClassName('galleryImage');
	
	// expand an image when clicked, shrink it when clicked again
	for (var i = 0; i < galleryImages.length; i++) {
		galleryImages[i].addEventListener('click', function(event) {
			event.stopPropagation(); // prevent clicks to images marking the tile inactive
			
			var selectedImage = event.target;
	
			if (isActive(selectedImage, activeImageClass)) {
				// make the clicked image inactive
				selectedImage.classList.remove(activeImageClass);
				setTimeout(function() { selectedImage.removeAttribute('style'); }, 10); // Delay to register transition.
				activeImage = null;
				
				return;
			}

			// if there is already an active image, make it inactive (only one active image allowed at a time)
			if (activeImage != null) {
				activeImage.classList.remove(activeImageClass); 
				
				var oldActiveImage = activeImage;
				
				setTimeout(function() { 
					oldActiveImage.removeAttribute('style'); 
				}, 10); // Delay to register transition.
			}
			
			// make the clicked image active
			selectedImage.classList.add(activeImageClass);
			
			// CSS transitions don't like auto sizes. Calculate what the auto size would be and apply it as an inline style instead.
			selectedImage.style.height = 'auto';
			
			// IOS seems to have issues getting a non 0 figure from this, so just make it auto in that case.
			if (selectedImage.height === 0) {
				selectedImage.style.maxHeight = '800px'; // use max-height to get some choppy but passable animation
				activeImage = selectedImage;
				return;
			}
			
			var autoHeight = selectedImage.height + 'px';
			selectedImage.removeAttribute('style');
			
			setTimeout(function() { 
				selectedImage.style.height = autoHeight; 
			}, 10); // Delay to register transition.
			
			activeImage = selectedImage;
		});
	}
}

var activeTileClass = 'activeTile';

/* Tiles are only given their blank shells when a page is switched to. This iterates through each tile applying their default (unclicked)
   innerHTML and setting up a click event which causes them to switch to their detailed content innerHTML (clicked) when active and back
   to the default (unclicked) innerHTML when inactive. */
function loadTiles(unselectedHTMLString, selectedHTMLString) {
	var tiles = document.getElementsByClassName('tile');
	var clickedTile;
		
	for (var i = 0; i < tiles.length; i++) {
		tiles[i].innerHTML = unselectedHTMLString[i]; // give the tiles their default content
		
		// toggle tile content on click
		tiles[i].addEventListener('click', function() {
			clickedTile = this;
			
			var tileIndex = clickedTile.firstElementChild.textContent; // each tile's first child is a span containing the numerical position of the tile
			
			if (isActive(clickedTile, activeTileClass)) {
				// make the clicked tile inactive
				clickedTile.classList.remove(activeTileClass);
				clickedTile.innerHTML = unselectedHTMLString[tileIndex];
				
				return;
			}
			
			// make the clicked tile active
			clickedTile.innerHTML = selectedHTMLString[tileIndex];
			clickedTile.classList.add(activeTileClass);
			//setTimeout(function() { clickedTile.scrollIntoView({block: "start", behavior: "smooth"}); }, 1000); // fit the tile to the screen
			
			setupImageGallery(clickedTile);
		});
	}
}

/* Loads a page by playing the fade transition and assigning the content to the content area. */
function loadPage(content) {
	fade();
	contentArea.innerHTML = content;
}

var homeContent = 
	'<header>\
		<h1 class="titleText">Ryan Phelan\'s Portfolio</h1>\
		<h2 class="headerText">Showcasing a variety of projects I have worked on over the past three years.</h2>\
	</header>\
	<footer>\
		<p class="footer standardText">A recent graduate of the University of Huddersfield with experience in software, web and games programming</p>\
	</footer>';

homeButton.addEventListener('click', function() {
	if (isActive(homeButton)) {
		return;
	}
	
	loadPage(homeContent);
	changeActiveNavElement(homeButton);
});

var featuredContent = 
	'<div class="scrollingContent">\
		<header>\
			<h1 class="titleText">Featured Projects</h1>\
			<h2 class="headerText">Higher quality projects with a large time investment.</h2>\
		</header>\
		<article class="tile largeTile columnFlex">\
		</article>\
		<article class="tile largeTile columnFlex">\
		</article>\
	</div>';
	
var featuredTilesUnselectedContent = [
	'<span class="tileNumber">0</span>\
	<header>\
		<h1 class="largeTileHeader tileHeader largeTileHeader">Phillips Hydraulic Computer</h1>\
		<h2 class="largeTileText tileText">C#, WPF, SharpDX, Hybrid, GUI, MVVM</h2>\
	</header>\
	<image class="largeTileImage tileImage" src="img/moniac.png"/>\
	<p class="largeTileText tileText tileDescription">An emulation of 20th century economist William "Bill" Phillip\'s "Monetary National Income Analogue Computer" (MONIAC).</p>', 
	'<span class="tileNumber">1</span>\
	<header>\
		<h1 class="largeTileHeader tileHeader">DirectX11 Render Core</h1>\
		<h2 class="largeTileText tileText">C++, HLSL, DirectX11, Shaders, Graphics</h2>\
	</header>\
	<image class="largeTileImage tileImage" src="img/dx11.png"/>\
	<p class="largeTileText tileText tileDescription">A render core built completely from scratch using C++ with DirectX11. Note: completely different code base to the DirectX9 render core.</p>'];
	
var featuredTilesSelectedContent = [
		'<span class="tileNumber">0</span>\
		<header>\
			<h1 class="activeTileTitle">Phillips Hydraulic Computer</h1>\
			<h2 class="activeTileHeader">C#, WPF, SharpDX, Software, GUI, MVVM</h2>\
		</header>\
		<p class="activeTileText">\
			<span class="bold">Programming Language:</span> C#<br>\
			<span class="bold">Tools:</span> WPF, SharpDX<br>\
			<span class="bold">Year:</span> 2013 - 2015<br>\
			<span class="bold">Team Size:</span> Solo<br>\
			<span class="bold">Reason:</span> University (dissertation)<br>\
		</p>\
		<section class="activeTileText">\
			<h3 class="bold">Background</h3>\
			<p>\
				The original Phillips Machine, or Monetary National Income Analogue Computer (MONIAC), was a hydraulic representation of cash flow within the UK economy in the early 20th\
				century. The machine was used to represent the circular flow of income, shown by the economic equation Aggregate Demand = Consumer Expenditure + Investment + Government\
				Spending + (Exports - Imports), or Y = C + I + G + (X - M), which is an important equation in determining an economy\'s output. While these machines were originally\
				restricted to military and government use, with the rise of digital computing and fall of Keynesian Economics, they no longer see use outside of museums and universities.\
				The basic flow of the original machine is that water (cash) enter at the top of the machine (as income), where it flows downward through the various pipes and tanks (sectors\
				of the economy) until it arrives at the bottom (as national output) and is pumped back to the top of the machine (completing the circular flow). The machine uses\
				a complicated system of strings, weights and pulleys to enable a user to manipulate this model with economic factors such as interest rates and taxes to see how the\
				economy would be affected as a whole. As a dissertation, the aim of this project was to digitally reproduce the original, with as many of the original features as possible.\
			</p>\
		</section>\
		<div class="gallery">\
			<div class="galleryFrame">\
				<img class="galleryImage" src="img/moniac-0.png"></img>\
			</div>\
			<div class="galleryFrame">\
				<img class="galleryImage" src="img/moniac-1.png"></img>\
			</div>\
			<div class="galleryFrame">\
				<img class="galleryImage" src="img/moniac.png"></img>\
			</div>\
			<div class="galleryFrame">\
				<img class="galleryImage" src="img/moniac-2.png"></img>\
			</div>\
			<div class="galleryFrame">\
				<img class="galleryImage" src="img/moniac-3.png"></img>\
			</div>\
			<div class="galleryFrame">\
				<img class="galleryImage" src="img/moniac-4.png"></img>\
			</div>\
		</div>\
		<section class="activeTileText">\
			<h3 class="bold">Overview</h3>\
			<p>\
				The project is programmed in C# and split into three main parts: the GUI part, the graphics part and the unit tests. In addition to the standard C# libraries, the GUI part\
				uses Windows Presentation Foundation (WPF) and the graphics part uses the SharpDX Toolkit. While each of these parts generally work seperately, the GUI hosts the simulation\'s\
				window, which can be considered the output of the graphics part. In order to make this interaction simpler, the model-view-viewmodel (MVVM) design pattern is used to keep the\
				two as seperate as possible outside of the window hosting.\
			</p>\
		</section>\
		<div class="galleryFrame">\
			<iframe class="video" width="1280" height="720" src="https://www.youtube.com/embed/yLjXQoTw0-A" frameborder="0" allowfullscreen="true"></iframe>\
		</div>\
		<section class="activeTileText">\
			<h3 class="bold">Comments</h3>\
			<p>\
				I originally decided on this topic for my dissertation because it offered me the chance to combine economics, which was my favourite subject at A Level, and programming, which was\
				my university focus. Furthermore, simulations are one of my favourite areas of programming and it was clear that a large part of this project would be just that. An example of this\
				would be planning out different methods of simulating water flow and figuring out how they could be adapted to code. Understanding the original machine and planning how to adapt each\
				part would make up the majority of this project\'s difficulty.\
			</p>\
		</section>\
		<section class="activeTileText">\
			<h3 class="bold">Notes</h3>\
			<p>\
				The project was well received, winning a "Best Overall Performance" award and being one of twelve dissertations published to the University of Huddersfield\'s 2016 Fields\
				journal. This can be downloaded <a class="downloadLink" href="http://eprints.hud.ac.uk/26730/" target="_blank">here</a> and contains more detail on the project, an installer for\
				the software can also be found <a class="downloadLink" href="https://onedrive.live.com/redir?resid=54DE7EFF7828975F!722&authkey=!AFuZ2AgSJoCGIis&ithint=file%2czip"\
				target="_blank">here</a>.\
			</p>\
		</section>', 
		'<span class="tileNumber">1</span>\
		<header>\
			<h1 class="activeTileTitle">DirectX11 Render Core</h1>\
			<h2 class="activeTileHeader">C++, HLSL, DirectX11, Shaders, Graphics</h2>\
		</header>\
		<p class="activeTileText">\
			<span class="bold">Programming Language:</span> C++ (core), HLSL (shaders)<br>\
			<span class="bold">Tools:</span>  DirectX11<br>\
			<span class="bold">Year:</span>  2015<br>\
			<span class="bold">Team Size:</span>  Solo<br>\
			<span class="bold">Reason:</span>  University -> Personal Interest<br>\
		</p>\
		<section class="activeTileText">\
			<h3 class="bold">Overview</h3>\
			<p>\
				This project attempts to create a render core capable of rendering scenes with a variety of impressive graphical effects, most notably using shaders, in a way that allows for minimal\
				effort in adding new objects and effects to a scene. The core is programmed in C++ using Microsoft\'s DirectX11 SDK and the shaders are programmed in High-Level Shader Language (HLSL).\
				The core contains a number of generic shaders for effects such as reflections, bump mapping and lighting and also some more impressive specific shaders for effects such as skyboxes, terrain\
				generation and water. While these shaders make up the majority of the project focus, a great deal of time was also invested in decoupling the core as much as possible to offer a more modular\
				design where adding a new effect is as simple as dropping in a shader file and linking the parts of the core that it requires.\
			</p>\
		</section>\
		<div class="gallery">\
			<div class="galleryFrame">\
				<img class="galleryImage" src="img/dx11.png"></img>\
			</div>\
			<div class="galleryFrame">\
				<img class="galleryImage" src="img/dx11-0.png"></img>\
			</div>\
			<div class="galleryFrame">\
				<img class="galleryImage" src="img/dx11-1.png"></img>\
			</div>\
			<div class="galleryFrame">\
				<img class="galleryImage" src="img/dx11-2.png"></img>\
			</div>\
			<div class="galleryFrame">\
				<img class="galleryImage" src="img/dx11-3.png"></img>\
			</div>\
			<div class="galleryFrame">\
				<img class="galleryImage" src="img/dx11-4.png"></img>\
			</div>\
			<div class="galleryFrame">\
				<img class="galleryImage" src="img/dx11-5.png"></img>\
			</div>\
		</div>\
		<section class="activeTileText">\
			<h3 class="bold">Comments</h3>\
			<p>\
				Prior to working on this project I had already worked on two rendering cores in C++ with DirectX9 as part of university and another in JavaScript with WebGL while on work placement.\
				Despite those experiences, 3D programming had never really "clicked" with me and I did not find it particularly fun to work with. However, after working on this core it has become an\
				area of interest for me along with shaders. Although this was a university project, most of my work on the core itself was not required as part of the course and was not worth extra\
				credit. I did it purely out of a personal interest in learning how to make a render core from scratch, starting with a completely blank project and taking time to consider how it should be\
				structured. The main difficulties of this project were in the binding of shader resources and finding alternatives to deprecated DirectX tools.\
			</p>\
		</section>\
		<div class="galleryFrame">\
			<iframe class="video" width="1280" height="720" src="https://www.youtube.com/embed/EvQ5aC1dpqs" frameborder="0" allowfullscreen="true"></iframe>\
		</div>\
		<section class="activeTileText">\
			<h3 class="bold">Notes</h3>\
			<p>\
				In the future it is likely that the core will be expanded upon, either by continuing on as is or by first moving it over to the new Vulkan API. For more information on the water shader\
				shown in this project, see it\'s project tile in Recent Projects.\
			</p>\
		</section>'];

featuredButton.addEventListener('click', function() {
	if (isActive(featuredButton)) {
		return;
	}
	
	loadPage(featuredContent);
	loadTiles(featuredTilesUnselectedContent, featuredTilesSelectedContent);
	changeActiveNavElement(featuredButton);
});

var projectsContent = 
	'<div class="scrollingContent">\
		<header>\
			<h1 class="titleText">Recent Projects</h1>\
			<h2 class="headerText">A selection of my more complete recent projects, sorted newest to oldest.</h2>\
		</header>\
		<article class="tile columnFlex">\
		</article>\
		<article class="tile columnFlex">\
		</article>\
		<article class="tile columnFlex">\
		</article>\
		<article class="tile columnFlex">\
		</article>\
		<article class="tile columnFlex">\
		</article>\
		<article class="tile columnFlex">\
		</article>\
		<article class="tile columnFlex">\
		</article>\
		<article class="tile columnFlex">\
		</article>\
		<article class="tile columnFlex">\
		</article>\
		<article class="tile columnFlex">\
		</article>\
		<article class="tile columnFlex">\
		</article>\
		<article class="tile columnFlex">\
		</article>\
	</div>';
	
var projectsTilesUnselectedContent = [
	'<span class="tileNumber">0</span>\
	<header>\
		<h1 class="tileHeader">Vulkan Project (Current WIP)</h1>\
		<h2 class="tileText">C++, GLSL, Vulkan, Shaders, Graphics</h2>\
	</header>\
	<image class="tileImage" src="img/vulkan.png"/>\
	<p class="tileText tileDescription">An attempt at creating a render core using the new Vulkan API.</p>',
	'<span class="tileNumber">1</span>\
	<header>\
		<h1 class="tileHeader">This Website</h1>\
		<h2 class="tileText">JavaScript, HTML, CSS, Web</h2>\
	</header>\
	<image class="tileImage" src="img/website.png"/>\
	<p class="tileText tileDescription">A small website built with responsive design and single page application techniques in mind.</p>',
	'<span class="tileNumber">2</span>\
	<header>\
		<h1 class="tileHeader">Various Simple C Projects</h1>\
		<h2 class="tileText">Pure C, Terminal</h2>\
	</header>\
	<image class="tileImage" src="img/c.png"/>\
	<p class="tileText tileDescription">Three small projects (simple XOR encryption, a card game and a credential generator) used to gain a better understanding of pure C.</p>',
	'<span class="tileNumber">3</span>\
	<header>\
		<h1 class="tileHeader">Football Stat Crawler</h1>\
		<h2 class="tileText">JavaScript, Python, Nightmare.js, Web Crawler</h2>\
	</header>\
	<image class="tileImage" src="img/stats.png"/>\
	<p class="tileText tileDescription">A program used to strip recent football statistics from a specific website and add them to a spreadsheet.</p>',
	'<span class="tileNumber">4</span>\
	<header>\
		<h1 class="tileHeader">Password Generator</h1>\
		<h2 class="tileText">Python, Terminal</h2>\
	</header>\
	<image class="tileImage" src="img/pw.png"/>\
	<p class="tileText tileDescription">A simple program which generates a set of passwords from a given dictionary.</p>',
	'<span class="tileNumber">5</span>\
	<header>\
		<h1 class="tileHeader">High Quality Water Shader</h1>\
		<h2 class="tileText">HLSL, Shaders</h2>\
	</header>\
	<image class="tileImage" src="img/water.png"/>\
	<p class="tileText tileDescription">A flat colourless plane brought to life through various shader techniques and mathematics.</p>',
	'<span class="tileNumber">6</span>\
	<header>\
		<h1 class="tileHeader">Angry Birds A.I.</h1>\
		<h2 class="tileText">Java, Artificial Intelligence</h2>\
	</header>\
	<image class="tileImage" src="img/ab-h.png"/>\
	<p class="tileText tileDescription">A game playing agent capable of solving levels from the popular phone game "Angry Birds".</p>',
	'<span class="tileNumber">7</span>\
	<header>\
		<h1 class="tileHeader">Multiplayer FP Shooter</h1>\
		<h2 class="tileText">C#, Unity, Networking, Game</h2>\
	</header>\
	<image class="tileImage" src="img/fps.png"/>\
	<p class="tileText tileDescription">A 3D multiplayer shooting game developed using the Unity engine.</p>',
	'<span class="tileNumber">8</span>\
	<header>\
		<h1 class="tileHeader">Chatroom</h1>\
		<h2 class="tileText">JavaScript, HTML, CSS, Node.js, Socket.IO, Web</h2>\
	</header>\
	<image class="tileImage" src="img/chat.png"/>\
	<p class="tileText tileDescription">A simple chatroom created as a means of experimenting with Socket.IO.</p>',
	'<span class="tileNumber">9</span>\
	<header>\
		<h1 class="tileHeader">Work Placement</h1>\
		<h2 class="tileText">JavaScript, TypeScript, C#, Many Tools (See Tile)</h2>\
	</header>\
	<image class="tileImage" src="img/work.png"/>\
	<p class="tileText tileDescription">A selection of projects undertaken while working as a Junior Developer at DriveWorks Ltd.</p>',
	'<span class="tileNumber">10</span>\
	<header>\
		<h1 class="tileHeader">2D Stealth Platformer</h1>\
		<h2 class="tileText">C#, XNA, Game</h2>\
	</header>\
	<image class="tileImage" src="img/hush-h.png"/>\
	<p class="tileText tileDescription">An older university team project. A 2D platformer with stealth elements and a variety of acrobatic mechanics.</p>',
	'<span class="tileNumber">11</span>\
	<header>\
		<h1 class="tileHeader">DirectX9 Render Core</h1>\
		<h2 class="tileText">C++, DirectX9, Graphics</h2>\
	</header>\
	<image class="tileImage" src="img/dx9.png"/>\
	<p class="tileText tileDescription">An older project. A render core built using C++ with DirectX9. Note: completely different code base to the DirectX11 render core.</p>'];
	
var projectsTilesSelectedContent = [
	'<span class="tileNumber">0</span>\
	<header>\
		<h1 class="activeTileTitle">Vulkan Project (Current WIP)</h1>\
		<h2 class="activeTileHeader">C++, GLSL, Vulkan, Shaders, Graphics</h2>\
	</header>\
	<p class="activeTileText">\
		<span class="bold">Programming Language:</span> C++ (core), GLSL (shaders)<br>\
		<span class="bold">Tools:</span> Vulkan<br>\
		<span class="bold">Year:</span> 2016<br>\
		<span class="bold">Team Size:</span> Solo<br>\
		<span class="bold">Reason:</span> Personal Interest<br>\
	</p>\
	<section class="activeTileText">\
		<h3 class="bold">Overview</h3>\
		<p>\
			This project will focus on either porting parts of the DirectX11 Render Core (see tile in Featured Projects) to use Vulkan or creating a new core from scratch in Vulkan.\
			It is currently a work in progress.\
		</p>\
	</section>\
	<div class="gallery">\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/vulkan.png"></img>\
		</div>\
	</div>',
	'<span class="tileNumber">1</span>\
	<header>\
		<h1 class="activeTileTitle">This Website</h1>\
		<h2 class="activeTileHeader">JavaScript, HTML, CSS, Web</h2>\
	</header>\
	<p class="activeTileText">\
		<span class="bold">Programming Language:</span> JavaScript<br>\
		<span class="bold">Tools:</span> HTML, CSS<br>\
		<span class="bold">Year:</span> 2016<br>\
		<span class="bold">Team Size:</span> Solo<br>\
		<span class="bold">Reason:</span> Practice -> Personal Interest<br>\
	</p>\
	<section class="activeTileText">\
		<h3 class="bold">Overview</h3>\
		<p>\
			This website was originally created as a means of practicing modern web design, in particular responsive design. It is written using HTML, CSS and JavaScript and targets\
			most modern browsers, resolutions and devices. This includes tablets and phones both in landscape and portrait. In achieve its responsive design, the site uses only CSS media\
			queries which adjust the content styling whenever a device passes a threshold. The core CSS targets the smallest screens first and is overridden each time a decent amount of space\
			becomes available. In trying to target both phones and desktops, which sit on completely opposite ends of the screen size scale, the site design also shifts between a portrait and\
			landscape layout as phones typically have more vertical space than horizontal space, while desktop monitors are the opposite.\
		</p>\
	</section>\
	<div class="gallery">\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/website.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/website-1.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/website-2.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/website-3.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/website-4.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/website-5.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/website-6.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/website-7.png"></img>\
		</div>\
	</div>\
	<section class="activeTileText">\
		<h3 class="bold">Comments</h3>\
		<p>\
			The website was originally intended to be a single-page application (SPA) which would request its content from a server using Node.js and Express.js. However, once the website began to\
			take shape, I removed the server side and converted it into an online portfolio because I thought that the SPA and responsive design elements would fit this purpose. As previously\
			mentioned, I originally created the website to practice modern web design. In most of my previous web projects I was either working on a specific feature which did not prioritise\
			design elements or I was developing with older browsers such as Internet Explorer 7 and 8 in mind, which is highly limiting. Needless to say the responsive design, particularly with\
			the tiles, was the most difficult part of this project.\
		</p>\
	</section>',
	'<span class="tileNumber">2</span>\
	<header>\
		<h1 class="activeTileTitle">Various Simple C Projects</h1>\
		<h2 class="activeTileHeader">Pure C, Terminal</h2>\
	</header>\
	<p class="activeTileText">\
		<span class="bold">Programming Language:</span> C (no C++)<br>\
		<span class="bold">Tools:</span> None<br>\
		<span class="bold">Year:</span> 2016<br>\
		<span class="bold">Team Size:</span> Solo<br>\
		<span class="bold">Reason:</span> Practice<br>\
	</p>\
	<section class="activeTileText">\
		<h3 class="bold">Overview</h3>\
		<p>\
			This project is made up of three components: a higher or lower card game, a simple XOR encyption tool and a credential generator. The higher or lower card game simply picks a random card\
			from a deck and asks the player to choose either higher or lower, the player then wins or loses depending on whether they were correct about the card they drew. The XOR encryption tool is\
			likely the most simple possible implementation of encryption, using the XOR operator on each of the given characters in a string to encrypt or decrypt it. Finally, the credential generator\
			randomly generates a set of names and personal information. The focus behind these projects was to learn the differences between how C and C++ handle concepts such as pointers and to\
			practice the use of C without using any C++ functions or features in general.\
		</p>\
	</section>\
	<div class="gallery">\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/c.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/c-0.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/c-1.png"></img>\
		</div>\
	</div>\
	<section class="activeTileText">\
		<h3 class="bold">Comments</h3>\
		<p>\
			A lot of time in this project was spent researching good practices for writing in C and learning to structure code to be less like C++. To make sure I was keeping to these rules, I used a C\
			compiler which would not accept any C++ features as typically modern compilers will accept both. Although the three projects are simple, they allowed me to seperate the two languages better\
			in my head. The biggest challenge in this project, aside from adhering to good practices, was understanding C\'s different ways of handling strings.\
		</p>\
	</section>',
	'<span class="tileNumber">3</span>\
	<header>\
		<h1 class="activeTileTitle">Football Stat Crawler</h1>\
		<h2 class="activeTileHeader">JavaScript, Python, Nightmare.js, Web Crawler</h2>\
	</header>\
	<p class="activeTileText">\
		<span class="bold">Programming Language:</span> JavaScript (data gathering), Python (run script, spreadsheet manipulation)<br>\
		<span class="bold">Tools:</span> Nightmare.js<br>\
		<span class="bold">Year:</span> 2016<br>\
		<span class="bold">Team Size:</span> Solo<br>\
		<span class="bold">Reason:</span> Request (unprofessional- from a friend)<br>\
	</p>\
	<section class="activeTileText">\
		<h3 class="bold">Overview</h3>\
		<p>\
			Detailed statistics from recent football games are not easy to find without buying an expensive <a class="downloadLink" href="http://www.optasports.com/" target="_blank">Opta</a> subscription.\
			The request for this project was to find a way to interpret a Scaleable Vector Graphic (SVG) element hosted on a\
			<a class="downloadLink" href="http://www.squawka.com/match-results" target="_blank">specific website</a> to determine how many shots each team had in different zones of the pitch and if possible to\
			automatically write this information to the given spreadsheet. The project went a step further and is capable of repeating this for every game played during that week. There are three key parts\
			to this project: the browser automation part which uses JavaScript and Nightmare.js to visit the site, gather the data and write it to a JSON file. The spreadsheet part using Python which takes\
			the JSON file and edits it into the spreadsheet, and finally the run script, which also uses Python, responsible for tying it together and reporting any errors that occur.\
		</p>\
	</section>\
	<div class="gallery">\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/stats.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/stats-0.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/stats-1.png"></img>\
		</div>\
	</div>\
	<section class="activeTileText">\
		<h3 class="bold">Comments</h3>\
		<p>\
			Prior to starting this project I had expected to face most of the challenge in trying to interpret the SVG data. However, since the website had used simple CSS it was straightforward to gather\
			the information. Instead, the difficulty came from finding a browser automation library. I had initially planned to use Phantom.js but after encountering a number of problems I found that the\
			Nightmare.js library, which sits on top of Phantom.js, was much easier to use. Another unexpected issue came from the requests to the website occasionally stalling, likely due to the website\
			not loading in time after automated mouse clicks, which was solved by resending the request after a set interval if there was no response. The spreadsheet manipulation was also unexpectedly\
			straightforward due to pythons\'s xlrd package.\
		</p>\
	</section>',
	'<span class="tileNumber">4</span>\
	<header>\
		<h1 class="activeTileTitle">Password Generator</h1>\
		<h2 class="activeTileHeader">Python, Terminal</h2>\
	</header>\
	<p class="activeTileText">\
		<span class="bold">Programming Language:</span> Python<br>\
		<span class="bold">Tools:</span> None<br>\
		<span class="bold">Year:</span> 2015<br>\
		<span class="bold">Team Size:</span> Solo<br>\
		<span class="bold">Reason:</span> Practice<br>\
	</p>\
	<section class="activeTileText">\
		<h3 class="bold">Overview</h3>\
		<p>\
			This is a simple Python project which randomly generates a set of passwords using words from the English Scrabble dictionary according to the given program arguments. The areas of practice\
			focused on by this project were parsing arguments and file reading.\
		</p>\
	</section>\
	<div class="gallery">\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/pw.png"></img>\
		</div>\
	</div>\
	<section class="activeTileText">\
		<h3 class="bold">Comments</h3>\
		<p>\
			Overall one of the simpler projects I have completed, at the time I had little experience with Python and this project functioned more as a way of learning the Python equivalents of certain\
			functions. The format of the generated passwords is taken from Edward Snowden\'s advice of using randomized passphrases as opposed to passwords, which are supposedly easier to remember and\
			harder to crack.\
		</p>\
	</section>',
	'<span class="tileNumber">5</span>\
	<header>\
		<h1 class="activeTileTitle">High Quality Water Shader</h1>\
		<h2 class="activeTileHeader">HLSL, Shaders</h2>\
	</header>\
	<p class="activeTileText">\
		<span class="bold">Programming Language:</span> HLSL<br>\
		<span class="bold">Tools:</span> Custom Engine (used for rendering, see DirectX11 Render Core in Featured Projects)<br>\
		<span class="bold">Year:</span> 2015<br>\
		<span class="bold">Team Size:</span> Solo<br>\
		<span class="bold">Reason:</span> University<br>\
	</p>\
	<section class="activeTileText">\
		<h3 class="bold">Overview</h3>\
		<p>\
			The aim of this project was to produce realistic looking water using the High-Level Shader Language (HLSL).<br>\
			<br>\
			Below is a breakdown of how it is created (images correspond with each step number):<br>\
			1) Before the program is run, the water is a flat colourless plane.<br>\
			2) The plane is given a colour which ranges between dark blue (deep waves) and light blue (shallow waves). However, the wave at this point is still flat.<br>\
			3) Two Gerstner Waves are combined and used to displace the plane\'s vertices, which causes it to move in a manner similar to real water.<br>\
			4) Using the newly generated normals from the vertex displacement, a reflection is applied on the water from the skybox around it.<br>\
			5) Lighting is taken into account and in this case that is in the form of the moon which circles around the ocean in the sky, causing shadows and lit areas.<br>\
			6) Refraction and Fresnel reflection equations are applied to the final water colours to make the water react with lighting and reflections in a more natural way.<br>\
			7) Finally, High-Dynamic-Range (HDR) lighting is applied by reading hidden values stored in the skybox texture.<br>\
			8/9) Because the water colours are generated dynamically from the skybox, if the skybox is changed then the water colour adjusts to it automatically.\
		</p>\
	</section>\
	<div class="gallery">\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/water-0.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/water-1.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/water-2.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/water-3.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/water-4.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/water-5.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/water-6.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/water-7.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/water.png"></img>\
		</div>\
	</div>\
	<section class="activeTileText">\
		<h3 class="bold">Comments</h3>\
		<p>\
			This project became quite the learning experience as I rewrote the shader entirely at least five times before I was pleased with the water\'s appearance. I started work on the shader\
			with a very limited understanding of shaders and the HLSL language in general. This caused problems because HLSL functions in a completely different way to other programming languages\
			where it is deeply tied to DirectX and requires a good understanding of how it interacts with it. Despite this, the biggest problem encountered in this project was in the maths.\
			Learning to think with respect to 3x3 matrices and calculating how a reflection is affected by the position and direction of the viewer and then by a normal value from an object and so\
			on made every step of this project hard. However, because I spent so long researching shader concepts, since completing this project I have found shaders to be fairly fun and\
			straightforward to work with.\
		</p>\
	</section>\
	<div class="galleryFrame">\
		<iframe class="video" width="1280" height="720" src="https://www.youtube.com/embed/N78xnpxIxB0" frameborder="0" allowfullscreen="true"></iframe>\
	</div>',
	'<span class="tileNumber">6</span>\
	<header>\
		<h1 class="activeTileTitle">Angry Birds Artificial Intelligence</h1>\
		<h2 class="activeTileHeader">Java, Artificial Intelligence</h2>\
	</header>\
	<p class="activeTileText">\
		<span class="bold">Programming Language:</span> Java<br>\
		<span class="bold">Tools:</span> <a class="downloadLink" href="http://aibirds.org/basic-game-playing-software.html" target="_blank">AIBIRDS Agent</a><br>\
		<span class="bold">Year:</span> 2015<br>\
		<span class="bold">Team Size:</span> Solo<br>\
		<span class="bold">Reason:</span> University<br>\
	</p>\
	<section class="activeTileText">\
		<h3 class="bold">Overview</h3>\
		<p>\
			The goal of this project was to create an agent capable of automatically playing and completing the popular phone game "Angry Birds". This idea was taken from a competition\
			which is run yearly to see who can create the best game playing agent and it was an option to submit a completed version of this project to that competition (see footer for why\
			this didn\'t happen). Each entrant is provided with a game playing library programmed using Java which reads in colour data from the screen and uses it to determine important\
			information for solving the level such as the position of the pigs, the number of birds and the positions and types of obstacles. To create a successful agent, the user needs to\
			first gain a good understanding of how this library works and then implement it into their own code, which the agent uses as a base for its logic.\
		</p>\
	</section>\
	<div class="gallery">\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/ab.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/ab-0.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/ab-1.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/ab-2.png"></img>\
		</div>\
	</div>\
	<section class="activeTileText">\
		<h3 class="bold">Comments</h3>\
		<p>\
			This project was straightforward from a programming perspective as most of the necessary classes were supplied in the AIBIRDS library. The difficulty of the project instead\
			came from building up the logic that would allow the agent to solve the levels. A good agent was one which would learn as it played, taking knowledge gained from the current\
			level into the next one until it could eventually solve levels with next to no failures. In my first attempt I had the agent simply log any shots which were deemed good (which\
			was determined simply from whether it landed a hit within the next two shots) and prioritise those, however this fell apart once the obstacles became more complex. The next\
			attempt introduced a "shot impact" system where when no pigs were available to be hit, it would instead aim to destroy the obstacle that would leave the biggest impact on the\
			level, since pigs could also be hit from falling structures. Additionally, further improvements were made such as having the agent ignore any obstacles which were unbreakable.\
			However, because this solution relied entirely on long term memory, it led to a problem where the agent would build up a very unfavourable impression of certain shots which would\
			actually be the only single solution to some levels, resulting in a failure loop. This failure loop would then skew future data by logging good shots as bad and bad shots as good.\
			The final iteration therefore added a short term memory system to adjust to individual levels. It would also avoid logging outlying data to the long term memory to prevent the\
			skewing of future level attempts.\
		</p>\
	</section>\
	<section class="activeTileText">\
		<h3 class="bold">Notes</h3>\
		<p>\
			The official free <a class="downloadLink" href="http://chrome.angrybirds.com/" target="_blank">Angry Birds Chrome application</a> was taken down before this\
			project could be completed, but not before a large amount of time had been invested into planning and programming parts of the AI. Prior to it being removed, the agent could solve\
			about 70% of the levels first time.\
		</p>\
	</section>',
	'<span class="tileNumber">7</span>\
	<header>\
		<h1 class="activeTileTitle">Multiplayer First Person Shooter</h1>\
		<h2 class="activeTileHeader">C#, Unity, Networking, Game</h2>\
	</header>\
	<p class="activeTileText">\
		<span class="bold">Programming Language:</span> C#<br>\
		<span class="bold">Tools:</span> Unity, Unity Networking<br>\
		<span class="bold">Year:</span> 2014<br>\
		<span class="bold">Team Size:</span> 8 -> 6<br>\
		<span class="bold">Reason:</span> University<br>\
	</p>\
	<section class="activeTileText">\
		<h3 class="bold">Overview</h3>\
		<p>\
			This project aimed to create a fast paced multiplayer first person shooting game using C# in the Unity engine. Unity\'s networking tools are also used to ensure that the game is\
			simple to connect to and disconnect from similar to many Valve shooters, which was prioritised to encourage people to try it out. In terms of art design, the game uses an exaggerated\
			cartoony style which contrasts with the excessively gory gameplay. It was worked on by four designers and four programmers, though these numbers eventually dropped to three and three.\
		</p>\
	</section>\
	<div class="gallery">\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/fps.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/fps-3.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/fps-0.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/fps-1.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/fps-2.png"></img>\
		</div>\
	</div>\
	<section class="activeTileText">\
		<h3 class="bold">Comments</h3>\
		<p>\
			The project experienced many management problems such as over scoping, poorly nailed down mechanics and both the lead designer and lead programmer quitting university\
			early. Furthermore, there was a gap in individual skill and motivation between the programmers which means that the quality of features varies greatly. Further still, the\
			design team experienced even more mismanagement in addition to skill and motivation differences which has left the already inconsistent art and assets in a place between\
			incomplete and alpha level. Despite this, the team was able to pull together and deliver a game which, while unpolished and incomplete, has most of the complicated systems\
			such as networking, leaderboards, respawns and round management in place. All in, the project was a bit of a nightmare and the networking didn\'t make things any easier, but\
			it was a learning experience, especially in being able to see alternate ways to handle clients and servers outside of web programming.\
		</p>\
	</section>\
	<section class="activeTileText">\
		<h3 class="bold">Notes</h3>\
		<p>\
			The images are taken from a slightly old build missing the gore effects.\
		</p>\
	</section>',
	'<span class="tileNumber">8</span>\
	<header>\
		<h1 class="activeTileTitle">Chatroom</h1>\
		<h2 class="activeTileHeader">JavaScript, HTML, CSS, Node.js, Socket.IO</h2>\
	</header>\
	<p class="activeTileText">\
		<span class="bold">Programming Language:</span> JavaScript<br>\
		<span class="bold">Tools:</span> HTML, CSS, Node.js, Socket.IO<br>\
		<span class="bold">Year:</span> 2014<br>\
		<span class="bold">Team Size:</span> Solo<br>\
		<span class="bold">Reason:</span> Practice<br>\
	</p>\
	<section class="activeTileText">\
		<h3 class="bold">Overview</h3>\
		<p>\
			A browser based chatroom system working over a local server which uses a mixture of JavaScript, HTML and CSS for the client side and JavaScript, Socket.IO and Node.js for the server. The\
			project was created as a means of practicing Socket.IO, which turned out to be very straightforward to use.\
		</p>\
	</section>\
	<div class="gallery">\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/chat.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/chat-0.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/chat-1.png"></img>\
		</div>\
	</div>\
	<section class="activeTileText">\
		<h3 class="bold">Comments</h3>\
		<p>\
			A simple project which I barely spent an hour on total as Socket.IO handles most of the hard work and it was just a case of tying it together properly. No effort was put into the styling.\
		</p>\
	</section>',
	'<span class="tileNumber">9</span>\
	<header>\
		<h1 class="activeTileTitle">Work Placement</h1>\
		<h2 class="activeTileHeader">JavaScript, TypeScript, C#, Many Tools (See Tile)</h2>\
	</header>\
	<p class="activeTileText">\
		<span class="bold">Programming Language:</span> JavaScript, TypeScript, C#, VB (minor)<br>\
		<span class="bold">Main Tools:</span> HTML, CSS, ASP.NET, MVC, Razor, JQuery, Knockout, Node.js, RequireJS, AMD, Express.js, SVG<br>\
		<span class="bold">Minor Tools:</span> WebGL, WPF, WinForms, Socket.IO, CouchDB, Nano<br>\
		<span class="bold">Year:</span> 2013 - 2014<br>\
		<span class="bold">Team Size:</span> 8 - 10<br>\
		<span class="bold">Reason:</span> Work<br>\
	</p>\
	<section class="activeTileText">\
		<h3 class="bold">Overview</h3>\
		<p>\
			This tile discusses the year I worked at DriveWorks Ltd. as a Junior Developer primarily using web technologies. DriveWorks at the time developed two main pieces of software, the DriveWorks plugin for\
			the SolidWorks CAD software and a standalone extension of this product known as DriveWorks 11 (later 12). DriveWorks allows a user to automate the design of products which will fundamentally function\
			the same and therefore save time on recreating these same designs, with further configuration it allows the user to also automate extra steps such as invoice and e-mail creation. The main DriveWorks\
			software has a desktop part programmed in C# and VB and a web part programmed using JavaScript and TypeScript. Initially the company source controlled its software using TFS, though towards the end the\
			company was switching over to Git. While using TFS the company followed the Agile development process, with bi-weekly sprints and daily standup meetings as it fit well with the TFS work item and code\
			review systems.\
		</p>\
	</section>\
	<div class="gallery">\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/work-0.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/work-1.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/work-2.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/work-3.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/work-4.png"></img>\
		</div>\
	</div>\
	<section class="activeTileText">\
		<h3 class="bold">Comments</h3>\
		<p>\
			When I first began working at DriveWorks I was given a full month of web training by the other developers. This training covered HTML, CSS, JavaScript, JQuery, ASP.NET, MVC, Razor and Knockout, as they would\
			be my primary tools for the first three or four months. During this time I contributed to the DriveWorks 11 release, creating new widgets (named controls in this case) for the web application and later\
			porting existing JavaScript controls to use TypeScript. The complexity of this task was due to each control having a client side and server side version and using MVC extensively, which I had limited experience\
			with at the time. Additionally, the web application had a classic theme and a metro theme, meaning that every control was required to have two very different skins and needed to support all browsers Internet\
			Explorer 7 and up. These tasks were further complicated by the fact that the DriveWorks codebase was eleven iterations in the making and therefore very large, meaning it took time for me to grasp it. Leading up\
			to the DriveWorks 11 release I worked on high priorty feature requests from the customers and later testing the software and reporting bugs in TFS, which occasionally also led to me fixing them myself when I had\
			the skills to do so. In my final months at DriveWorks I was given the chance to work on a completely new product, named "Atlas" during development. This product aimed to be a modern single page application which\
			functioned similarly to Microsoft\'s OneDrive. Unlike the main software it dropped support for older browsers such as Internet explorer 7, 8 and 9 which drastically simplified the web development process. I\
			was given three primary tasks during these final months: to assist work on a WebGL based model renderer due to my experience with graphics programming, to create a web based file directory similar to Dropbox\
			and OneDrive, and finally to learn to programmatically generate interactive SVG line and pie charts.\
		</p>\
	</section>\
	<section class="activeTileText">\
		<h3 class="bold">Notes</h3>\
		<p>\
			Unfortunately, I did not keep many images of my DriveWorks work.\
		</p>\
	</section>', 
	'<span class="tileNumber">10</span>\
	<header>\
		<h1 class="activeTileTitle">2D Stealth Platformer</h1>\
		<h2 class="activeTileHeader">C#, XNA, Custom Engine, Game</h2>\
	</header>\
	<p class="activeTileText">\
		<span class="bold">Programming Language:</span> C#<br>\
		<span class="bold">Tools:</span> XNA, Custom Engine<br>\
		<span class="bold">Year:</span> 2012 - 2013<br>\
		<span class="bold">Team Size:</span> 6<br>\
		<span class="bold">Reason:</span> University<br>\
	</p>\
	<section class="activeTileText">\
		<h3 class="bold">Overview</h3>\
		<p>\
			This game, named Hush, is a 2D stealth platformer created in C# using Microsoft\'s now deprecated XNA framework, it is the most "complete" game project on this website. Despite being an older\
			project, the game has several noteworthy features such as stealth AI mechanics, a level editor, branching paths, item vendors and acrobatic player movement. The game is actually built using\
			a custom made game engine, which sits on top of XNA, developed during the course of the project which allows for straightforward "drag and drop" level creation.\
		</p>\
	</section>\
	<div class="gallery">\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/hush.jpg"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/hush-0.jpg"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/hush-1.jpg"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/hush-2.jpg"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/hush-3.jpg"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/hush-4.jpg"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/hush-5.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/hush-6.jpg"></img>\
		</div>\
	</div>\
	<section class="activeTileText">\
		<h3 class="bold">Comments</h3>\
		<p>\
			The team experience for this game was the complete opposite of the experience mentioned in the "Multiplayer FP Shooter" project. The team worked well together, the project was well organised\
			and individual skill levels and motivation were both high. Additionally, the decision to create a game making engine as opposed to a game for the first few months paid off immensely when it\
			reached a point that we could create new content for the game by simpling handing the engine a black and white collision map, picking a level background and then dragging and dropping enemies\
			and obstacles onto it. While some features still did not make it into the game, most notably a storyline, from a mechanics perspective the game was sound.\
		</p>\
	</section>',
	'<span class="tileNumber">11</span>\
	<header>\
		<h1 class="activeTileTitle">DirectX9 Render Core</h1>\
		<h2 class="activeTileHeader">C++, DirectX9, Graphics</h2>\
	</header>\
	<p class="activeTileText">\
		<span class="bold">Programming Language:</span> C++<br>\
		<span class="bold">Tools:</span> DirectX9<br>\
		<span class="bold">Year:</span> 2012<br>\
		<span class="bold">Team Size:</span> Solo<br>\
		<span class="bold">Reason:</span> University<br>\
	</p>\
	<section class="activeTileText">\
		<h3 class="bold">Overview</h3>\
		<p>\
			This render core is created using C++ with Microsoft\'s DirectX9 SDK. Its main features are mesh rendering, multiple light sources, a first person camera and particle effects.\
			This is the oldest project on this site and is improved on in every aspect by the DirectX11 Render Core (see Featured Projects).\
		</p>\
	</section>\
	<div class="gallery">\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/dx9.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/dx9-0.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/dx9-1.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/dx9-2.png"></img>\
		</div>\
		<div class="galleryFrame">\
			<img class="galleryImage" src="img/dx9-3.png"></img>\
		</div>\
	</div>\
	<section class="activeTileText">\
		<h3 class="bold">Comments</h3>\
		<p>\
			This project looks like it could be part of a game released ten years ago, which is not bad considering it was used to help me get to grips with the C++ language and 3D maths.\
		</p>\
	</section>'];

projectsButton.addEventListener('click', function() {
	if (isActive(projectsButton)) {
		return;
	}
	
	loadPage(projectsContent);
	loadTiles(projectsTilesUnselectedContent, projectsTilesSelectedContent);
	changeActiveNavElement(projectsButton);
});

var contactContent = 
	'<header>\
		<h1 class="titleText">Contact & CV</h1>\
	</header>\
	<address>\
		<p class="headerText">Mobile: 07804666318</p>\
		<p class="headerText">E-mail: mail@ryanjp.co.uk</p>\
	</address>\
	<p class="headerText">CV download: <a class="downloadLink" href="https://onedrive.live.com/redir?resid=54DE7EFF7828975F!829&authkey=!AEEFVD54hEEtJt4&ithint=file%2cdocx" target="_blank">here</a></p>\
	<footer>\
		<p class="footer standardText">A recent graduate of the University of Huddersfield with experience in software, web and games programming.</p>\
	</footer>';

contactButton.addEventListener('click', function() {
	if (isActive(contactButton)) {
		return;
	}
	
	loadPage(contactContent);
	changeActiveNavElement(contactButton);
});