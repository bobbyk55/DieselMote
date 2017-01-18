
var http = require('http');
var url = require('url');
var fs = require('fs');
var Gpio = require('onoff').Gpio;
var kitchen_led = new Gpio(27, 'out');
var cabinet_leds = new Gpio(24,'out');
var cabinets = 0;
 
lirc_node = require('./lirc_node.js');
lirc_node.init();

const PORT = 3000;

//app.listen(PORT);

//handles passed in request
function handleRequest(request, response) {
	
	var s_data = url.parse(request.url, true).query;
	var s_url = request.url;
	var s_function = s_data.f;
	var s_remote = s_data.remote;
	var s_command = s_data.command;
	var s_send_times = s_data.send_times;
	var b_homepage = s_data.homepage;
	var custom_led;

	 //console.log("s_function: " + s_function );
	 //console.log("s_remote: " + s_remote );
	 //console.log("s_command: " + s_command );
	 //console.log("s_send_times: " + s_send_times );

	clearAllIntervals();

	if( s_function === "irsend") {
		if( s_send_times === "1" ) {
			irsendSendOnce( s_command );
			sendReturn();
		} else if( s_send_times === "varied" ) {
			if( s_command === "lg_tv_brightness_max" ) {
				getToBrightnessScreen( s_remote );
				callCommandSendOnce( "lg_tv_right_arrow", 30 );
				setTimeout( function() { returnFromBrightness(); }, 4000 );
			} else if ( s_command === "lg_tv_brightness_min" ) {
				getToBrightnessScreen( s_remote );
				callCommandSendOnce( "lg_tv_left_arrow", 30 );
				setTimeout( function() { returnFromBrightness(); }, 4000 );
			} else if( s_command === "apple_tv_home_screen" ) {
				getToAppleTvHomeScreen();
				setTimeout( function() { sendReturn(); }, 4000 );
			} else if( s_command === "apple_tv_netflix" ) {
				getToAppleTvHomeScreen();
				getToAppleTvNetflix();
			} else if( s_command === "apple_tv_hbo" ) {
				getToAppleTvHomeScreen();
				getToAppleTvHbo();
			} else if( s_command === "apple_tv_settings" ) {
				getToAppleTvHomeScreen();
				getToAppleTvSettings();
			} else if( s_command === "apple_tv_youtube" ) {
				getToAppleTvHomeScreen();
				getToAppleTvYoutube();
			} else if( s_command === "led_color_max" ) {
				ledColorMax();
			} else if( s_command === "led_color_min" ) {
				ledColorMin();
			} else if( s_command === "led_white_max" ) {
				ledWhiteMax();
			} else if( s_command === "led_white_min" ) {
				ledWhiteMin();
			}else if( s_command === "lg_tv_volume_up_10" ) {
				lgTvVolumeUp10();
			} else if( s_command === "lg_tv_volume_down_10" ) {
				lgTvVolumeDown10();
			} else if( s_command === "tv_leds_custom_fade" ) {
				customLED();
				sendReturn();
			}else if( s_command === "cabinet_leds" ) {
                toggleCabinetLEDs();
             } else {
				return404();
			}
		} else {
			return404();
		}
	} else if( s_url === "/index" ) {
		returnHtmlFile( "index.html" );
	} else if( s_url === "/js/functions.js") {
		fs.readFile("js/functions.js", function(err, text) {
      		response.setHeader("Content-Type", "text/javascript");
      		response.end( text );
    	});
  	} else if( s_url === "/css/style.css") {
    	fs.readFile("css/style.css", function(err, text) {
      		response.setHeader("Content-Type", "text/css");
      		response.end( text );
    	});
    	return;
  	} else if( s_url === "/apple-touch-icon.png") {
		var img = fs.readFileSync('apple-touch-icon.png');
		response.writeHead(200, {'Content-Type': 'image/png' });
		response.end(img, 'binary');
		return;
	} else if( s_function === "appleTvRemote" ) {
  		returnHtmlFile( "appleTV.html" );
  	} else if( s_function === "lgTvRemote" ) {
  		returnHtmlFile( "lgTV.html" );
  	} else if( s_function === "sendCommand" ) {
		return;
  	} else if( s_function === "tvLEDS" ) {
  		returnHtmlFile( "tvLEDS.html" );
  	}  else if( s_function === "kitchenLedsRemote" ) {
  		returnHtmlFile( "kitchenLEDS.html" );
  	}  else if( s_function === "showAllCommands" ) {
		console.log(lirc_node.remotes);
		response.end();
    	return;
  	} else if( s_function === "testthis" ) {
  		//returnHtmlFile( "mainTemplate.html" );
  		console.log("testing this thing");
  		
  	} else if( s_command === "testButton" ) {
		colsole.log("butt cheeks");
		response.end(); 
  	} else {
		return404();
	}


	//toggles between on and off of the cabinet LEDs
	function toggleCabinetLEDs() {

	    if( cabinets === 0 ) {
	        cabinet_leds.writeSync( 1 );
	        cabinets = 1;
	    } else {
	        cabinet_leds.writeSync( 0 );
	        cabinets = 0;
	    }

	    sendReturn();

	}
	
	//color max works but not min
	function ledColorMax() {
		callCommandSendOnce( "led_color_brightness_up", 20 );
		//var o_inter = setInterval( function() {
		//	lirc_node.irsend.send_once( "LED_REMOTE", "led_color_brightness_up", function() {
		//	});
		//	console.log("led_color_brightness_up");
		//}, 200 );
		
		//setTimeout( function() { clearInterval( o_inter ); }, 10000 );
		setTimeout( function() { sendReturn(); }, 4000 );
	}
	
	function ledColorMin() {
		callCommandSendOnce( "led_color_brightness_down", 20 );
		//var o_inter = setInterval( function() {
		//	lirc_node.irsend.send_once( "LED_REMOTE", "led_color_brightness_down", function() {
		//	});
		//	console.log("led_color_brightness_down");
		//}, 200 );
		
		//setTimeout( function() { clearInterval( o_inter ); }, 10000 );
		setTimeout( function() { sendReturn(); }, 4000 );
	}
	
	function ledWhiteMax() {
		callCommandSendOnce( "led_white_brightness_up", 40 );
		setTimeout( function() { sendReturn(); }, 4000 );
	}
	
	function ledWhiteMin() {
		callCommandSendOnce( "led_light_brightness_down", 40 );
		setTimeout( function() { sendReturn(); }, 4000 );
	}
	
	function lgTvVolumeUp10() {
		callCommandSendOnce( "lg_tv_volume_up", 11 );
		setTimeout( function() { sendReturn(); }, 1000 );
	}
	
	function lgTvVolumeDown10() {
		callCommandSendOnce( "lg_tv_volume_down", 11 );
		setTimeout( function() { sendReturn(); }, 1000 );
	}
	
	function getToAppleTvHbo() {
		setTimeout( function() {
			irsendSendOnce( "apple_tv_down" );
		}, 500 );
		setTimeout( function() {
			irsendSendOnce( "apple_tv_right" );
		}, 1000 );
		setTimeout( function() {
			irsendSendOnce( "apple_tv_enter" );
		}, 1500 );
		setTimeout( function() { sendReturn(); }, 4000 );
	}
	
	function getToAppleTvSettings() {
		setTimeout( function() {
			irsendSendOnce( "apple_tv_down" );
		}, 500 );
		setTimeout( function() {
			irsendSendOnce( "apple_tv_right" );
		}, 1000 );
		setTimeout( function() {
			irsendSendOnce( "apple_tv_right" );
		}, 1500 );
		setTimeout( function() {
			irsendSendOnce( "apple_tv_right" );
		}, 2000 );
		setTimeout( function() {
			irsendSendOnce( "apple_tv_enter" );
		}, 2500 );
		setTimeout( function() { sendReturn(); }, 6000 );
	}
	
	function getToAppleTvYoutube() {
		setTimeout( function() {
			irsendSendOnce( "apple_tv_down" );
		}, 500 );
		setTimeout( function() {
			irsendSendOnce( "apple_tv_right" );
		}, 1000 );
		setTimeout( function() {
			irsendSendOnce( "apple_tv_right" );
		}, 1500 );
		setTimeout( function() {
			irsendSendOnce( "apple_tv_enter" );
		}, 2000 );
		setTimeout( function() { sendReturn(); }, 5000 );
	}
	
	function irsendSendOnce( vs_command ) {
		//need to check if its kitchen leds to see whether if should send power to switch or not
		if( s_remote === 'KITCHEN_LEDS' ) {
			//turn the kitchen led on
			kitchen_led.writeSync( 1 );
			setTimeout( function() {
				lirc_node.irsend.send_once( "LED_REMOTE", vs_command, function() {
					console.log("irsend kitchen leds send_once: " + s_remote + " " + vs_command );
				});
			}, 100 );
			
			setTimeout( function() {
				kitchen_led.writeSync( 0 );
			}, 150 );
		} else if( s_remote === 'TV_LEDS' ) {
			lirc_node.irsend.send_once( "LED_REMOTE", vs_command, function() {
				console.log("irsend send_once: " + s_remote + " " + vs_command );
			});
		} else {
			lirc_node.irsend.send_once( s_remote, vs_command, function() {
				console.log("irsend send_once: " + s_remote + " " + vs_command );
			});
		}
	}
	
	function customLED() {
	
		setTimeout( function() {
			lirc_node.irsend.send_once( "LED_REMOTE", "led_white", function() {
			});
		}, 1000);
		
		setTimeout( function() {
			lirc_node.irsend.send_once( "LED_REMOTE", "led_green", function() {
			});
		}, 3000);
		
		setTimeout( function() {
			lirc_node.irsend.send_once( "LED_REMOTE", "led_blue", function() {
			});
		}, 5000);
		
		setTimeout( function() {
			lirc_node.irsend.send_once( "LED_REMOTE", "led_red", function() {
			});
		}, 7000);
			
		var custom_led = setInterval( function() {
		
			setTimeout( function() {
				lirc_node.irsend.send_once( "LED_REMOTE", "led_white", function() {
				});
			}, 1000);
			
			setTimeout( function() {
				lirc_node.irsend.send_once( "LED_REMOTE", "led_green", function() {
				});
			}, 3000);
			
			setTimeout( function() {
				lirc_node.irsend.send_once( "LED_REMOTE", "led_blue", function() {
				});
			}, 5000);
			
			setTimeout( function() {
				lirc_node.irsend.send_once( "LED_REMOTE", "led_red", function() {
				});
			}, 7000);
			
		}, 10000);
	
	}
	
	function clearAllIntervals() {
	
		if( custom_led != undefined ) {
			clearInterval(custom_led);
		}
	
	}
	
	function getToAppleTvHomeScreen() {
		console.log("getToAppleTvHomeScreen()");
		callCommandSendOnce( "apple_tv_menu", 20 );
	}
			
	function getToAppleTvNetflix() {
			
		setTimeout( function() {
			irsendSendOnce( "apple_tv_down" );
		}, 500 );
		setTimeout( function() {
			irsendSendOnce( "apple_tv_enter" );
		}, 1000 );
		setTimeout( function() {
			irsendSendOnce( "apple_tv_enter" );
		}, 10000 );
		
		setTimeout( function() { sendReturn(); }, 4000 );
	}

	//settings,ok,down,down,ok
	function getToBrightnessScreen() {
		console.log("getToBrightnessScreen start new");
		irsendSendOnce( "lg_tv_settings" );
		irsendSendOnce( "lg_tv_ok" );
		irsendSendOnce( "lg_tv_down_arrow" );
		irsendSendOnce( "lg_tv_down_arrow" );
		irsendSendOnce( "lg_tv_ok" );
		console.log("getToBrightnessScreen end");
	}

	//calls send_once lirc command for s_function, for n_times
	function callCommandSendOnce( vs_function, n_times ) {
	  	console.log("callCommandSendOnce: " + s_remote + " " + vs_function + " " + n_times );
		
		if( s_remote === 'KITCHEN_LEDS' ) {
			
			kitchen_led.writeSync( 1 );
			for( var i = 0; i < n_times; i++ ) {
				setTimeout( function() {
					lirc_node.irsend.send_once( "LED_REMOTE", vs_function, function() {
					});
				}, 200 );
			}
			
			setTimeout( function() {
				kitchen_led.writeSync( 0 );
			}, 325*n_times );
			
		} else if( s_remote === 'TV_LEDS' ) {
			
			for( var i = 0; i < n_times; i++ ) {
				lirc_node.irsend.send_once( "LED_REMOTE", vs_function, function() {
				});
			}
			
		} else {
			for( var i = 0; i < n_times; i++ ) {
				lirc_node.irsend.send_once( s_remote, vs_function, function() {
				});
			}
		}
	}

	function callCommandSendStop( vs_command) {
		lirc_node.irsend.send_stop( s_remote, vs_command, function() {
	  		console.log("send_stop: " + s_remote + " " + vs_command );
		});
	}

	function callCommandSendStart( vs_command ) {
		lirc_node.irsend.send_start( s_remote, vs_command, function() {
	  		console.log("send_start: " + s_remote + " " + vs_command );
		});
	}
			
	function returnFromBrightness() {
		//back,up,up,exit
		irsendSendOnce( "lg_tv_back" );
		setTimeout( function() {
			irsendSendOnce( "lg_tv_up_arrow" );
		}, 1000 );
		setTimeout( function() {
			irsendSendOnce( "lg_tv_up_arrow" );
		}, 2000 );
		setTimeout( function() {
			irsendSendOnce( "lg_tv_exit" );
		}, 3000 );
		setTimeout( function() {
			sendReturn();
		}, 4000 );
		
	}

	function sendReturn() {
		console.log("sendReturn");
		if( b_homepage ) {
			returnHtmlFile ( "index.html" );
		} else if( s_remote === "APPLE_TV" ) {
			returnHtmlFile ( "appleTV.html" );
  		} else if( s_remote === "LG_TV" ) {
  			returnHtmlFile ( "lgTV.html" );
  		} else if( s_remote === "TV_LEDS" ) {
  			returnHtmlFile ( "tvLEDS.html" );
  		} else if( s_remote === "KITCHEN_LEDS" ) {
  			returnHtmlFile ( "kitchenLEDS.html" );
  		} else {
  			returnHtmlFile ( "index.html" );
		}
	}
	
	function returnHtmlFile( vs_name ) {
		var s_path = "html/" + vs_name;
		fs.readFile( s_path, function(err, text) {
      		response.setHeader("Content-Type", "text/html");
      		response.end( text );
    	});
	}
	
	function return404() {
		var img = fs.readFileSync('images/jerry2.png');
		response.writeHead(200, {'Content-Type': 'image/png' });
		response.end(img, 'binary');

		//response.writeHead(404, {'Content-Type': 'text/html'});
		//response.write('<!doctype html><html><head><title>404</title></head><body><h1>404: Nothing to see here</h1></body></html>');
		//response.end();
	}
	
}

//Create the server
var o_server = http.createServer( handleRequest );

//starting the server
o_server.listen(PORT, function() {
    //Callback triggered when server is successfully listening
    console.log("This Bitching server is up and running, listening on: http://universalremote.local: " + PORT );
});