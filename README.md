Time Interactive deployment files
====

Time.com interactives are developed independently from the CMS and bundled into discrete, self-assembling Javascript files using [browserify](https://www.npmjs.org/package/browserify). This repository provides both a [command-line script](/bin/generate.js) for generating new projects and a [client-side script](/index.js) with a few convenience functions.

## Philosophy

Apps need to be decoupled from the current page environment so that they stand the greatest chance of surviving changes to the page or the CMS. At the same time, they need to be good DOM citizens when running in an article page without an iframe's prophylactic embrace. Bundling apps with `browserify` allows us to enclose everything the app needs to survive in one file that can run either inside a Time.com page or on its own via the bare-bones `index.html` that accompanies each new app generated with this module. jQuery is the only dependency for our apps that is not bundled into the final script file.

## Installation

You'll want to [install Node.js](http://nodejs.org/) first. Then clone this repo and then install the dependencies:

	git clone https://github.com/TimeMagazine/time-interactive.git
	cd time-interactive
	npm install

## Getting started

The module comes with a script called ```generate``` that creates a new skeleton project. It takes two command-line arguments: The unique id of the interactive and the directory to which it should install.

	./bin/generate.js my_test_app ./apps

By default, if the second argument is missing, the script creates a new folder in the current directory. You can change that location by adding the following to the ```package.json``` file: 

    "time-interactive": {
        "app_dir": "/path/to/my/app/folder/"
    }

This script creates a handful of files:

+ `debug.js` is your main file for writing client-side Javascript with the help of Node.js `require()` statements. You'll see some default code in there to get you started.
+ `index.html` is an HTML file for previewing your app after it is bundled.
+ `package.json` is a set of instructions for Node and Browserify, including transforms that Browserify needs to correctly include LESS and CSV files in the interactive.
+ `src/styles.less` is the stylesheet for this interactive, using the [LESS](http://lesscss.org/) dynamic style sheet language.
+ `src/base.html` is the app-specific HTML for this interactive. By default, it's only a headline and introduction.
+ `screenshot.png` is the image that is loaded by default and then overwritten when the interactive loads. The default is an 800x1 white image.

### How it works

Run `./bin/generate.js my_test_app ./apps` and you'll see that it creates a folder called `my_test_app` in the `apps` directory (which it will also create if such a directory doesn't exist). That new folder includes a `debug.js` that looks like this:

	(function($) {
		var time = require('time-interactive');	
		var el = time("my_test_app");

		//CSS
		require("./src/styles.less");

		//MARKUP
		require("./src/base.html")({
			headline: "Headline",
			intro: "Introduction goes here."
		}).appendTo(el);
	}(window.jQuery));

If you look inside `index.html`, however, you'll see that it references a file called `script.js`, which does not exist in the repo. That's because you need to run the Browserify command to take the highly modular, clean code from `debug.js` and compile it into a single file:

	browserify debug.js > script.js

That command uses the [node-lessify](https://www.npmjs.org/package/node-lessify) module that Chris Wilson maintains to compile the LESS syntax in `styles.less` into valid CSS and wrap it in Javascript that appends that CSS to the DOM at run time. This will happen automatically when you run the `browserify` command inside the `my_test_app` directory.

Once you've compiled that script, you can preview the app by opening `index.html`. It is recommended that you do so on a local server instead of via the `file://` schema. 

## Automatic browserify-ification

###To run browserify in Intellij:

Goto IntelliJ - Preferences - External Tools, and click the plus button on the [lower, left corner](http://screencast.com/t/rAAc50bQyWWg)

###To add the browserify command to a toolbar:
Goto IntelliJ - Preferences - Menus and Toolbars, and click on the arrow next to "Main Toolbar", select the position the browserify is supposed to appear, click on "Add After" button and add the browserify external tool action.

###Beefy
You can also use [beefy](https://github.com/chrisdickinson/beefy) to automatically compile the `script.js` file each time you make a change to `debug.js`.

## Deployment

Time.com interactives are bootstrapped onto pages with a Wordpress short code:
 
	[time-interactive id=<unique_id_of_interactive>]

The short code creates a ```<div>``` at its location in the page with the following markup:

	<div id="<unique_id_of_interactive>" class="time-interactive">
		<img src="http://www.time.com/time/wp/interactives/apps/<unique_id_of_interactive>/screenshot.png" class="screenshot" style="width:100%;">
	</div>

Second, it appends a script to the end of the page:

	<script type='text/javascript' src='http://www.time.com/time/wp/interactives/apps/<unique_id_of_interactive>/script-min.js'></script>

This is the extent of an interactive's purchase on the DOM at page load time. All further elements must be self-assembled from the script.

When the code you've written in `debug.js` is ready for deployment, pipe it through a minifier to a file named `script-min.js`:

	browserify debug.js | uglifyjs > script-min.js

The beauty of the bundled scripts is that they can live anywhere when combined with the `index.html` file, which mimics the markup created by the short code.

## Best practices

Since these apps are designed to run smoothly on a page in which many other Javascript libraries are firing, it's important to minimize the possibility of namespace collisions and other unwanted consequences.

### Scope
You will notice that, default, the code in `debug.js` runs inside a closure that passes `jQuery` to a variable named `$`, which is necessary since the jQuery script that on Time.com runs in `.noConflict()` mode. (Browserify further wraps modules in closures for extra effect.)

Beyond jQuery, our apps have no dependencies on external scripts. If you want to use a third-party library, you have to `require()` it in `debug.js`, thus bundling it into the final `script.js`. While this can push up the file size of the final app, it's a reasonable tradeoff for an entire project that loads and assembles with a single HTTP request.

### Selectors

All Time.com interactives should run inside the ```.time-interactive``` selector--that is, the class automatically assigned to the parent ```<div>```. They should not be messing with the DOM outside of this element without a specific reason to do so (such as tweaking a template).

One of the reasons we use LESS for stylesheets is that it allows us to easily wrap this class around all styles specific to the interactive, thus preventing them from screwing up the styling of the page. Likewise, *all jQuery selectors should start with .time-interactive.* Otherwise, there is a risk that an ID assigned to something inside the interactive will also appear elsewhere.

By default, a new script requires the ```time-interactive``` script [included in this repo](/index.js), which contains some convenience functions for getting started. Running `var el = time("my_test_app")` adds the necessary classes and ids to the parent `<div>` and removes the screenshot that is included on page load. 

###options for `time()`

+ ```headline```: The headline at the top of the interactive. Default: none
+ ```intro```: The subhead
+ ```keepscreenshot```: Do not delete the screenshot when the interactive loads. Default: false.