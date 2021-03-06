(function($) {
	// base CSS file
	require("./src/interactive.less")

	// this assumes there is already a <div> on the page with the correct id, which Wordpress should have created (see README)
	module.exports = function(el, opts) {
		opts = opts || {};
		// make el a $ object
		if (typeof el === "string" && el[0] != "#") {
			el = '#' + el;
		}
		$el = (el instanceof $) ? el : $(el);

		if ($el.length === 0) {
			console.log("Object not found;");
			return;
		}

		// ought to already have this, but let's be sure
		$el.addClass("time-interactive");

		// remove the default screenshot placed by the short code unless you specify you want to keep
		if (!opts.keepScreenshot) {
			// remove screenshot
			$el.find(".screenshot").remove();	
		}

		// universal tooltip
		//$("<div />").addClass("tooltip").appendTo(".time-interactive").get(0);

		// return the DOM object
		return $el.get(0);
	}

	/* CONVENIENCE FUNCTIONS */

	// right now we are unable to load JSON asynchronously from Time CDN. (See https://timedotcom.atlassian.net/browse/TIM-3567)
	// This hack allows you to load JSON files with JSON-P IF they are wrapped in ticallback()

	module.exports.loadJSON = function(filename, callback, err) {
		if (!err) {
			err = function(e, f, g) { console.log(e, f, g); }		
		}
		jQuery.ajax({
			url: filename,
			dataType: 'jsonp',
	        //jsonp: 'ticallback',
	        contentType: "application/json",
			async: false,
			success: function(d) {
				callback(d);
			},
			error: function(e, f, g) {
				if (err) {
					err(e, f, g);
				}
				if (e.responseStatus == "OK") {

				}
			}
		});
	}

	// add a function to the page resize without overwriting other listeners
	module.exports.onresize = function(f, delay) {
		delay = typeof delay === undefined ? 100 : delay;
		var resizeTimer;
		$(window).resize(function() { 
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(function() {
				f();
			}, delay);
		});
	}

	// add commas to numbers over 1000
	module.exports.commafy = function(val){
		if (typeof val === "string") {
			val = parseInt(val, 10);
		}

	    while (/(\d+)(\d{3})/.test(val.toString())){
	      val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
	    }
	    return val;
	}

	// generate a unique GUID
	module.exports.guid = function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		    return v.toString(16);
		});		
	}

}(jQuery));