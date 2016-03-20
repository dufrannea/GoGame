/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var io = __webpack_require__(2);
	var ko = __webpack_require__(49);
	var board = __webpack_require__(51).board;
	
	var socket = io.connect('http://localhost:8080');
	socket.on('message', function(data) {
	    messages.push(data);
	});
	
	socket.on('connected', function(data) {
	    connected(data);
	});
	
	socket.on('started', function(data) {
	    var localboard = board("#go-board-container");
	    
	    localboard.create([], function(coords) {
	        console.info("player played" + coords);
	        
	        socket.emit("played", coords);
	    });
	});
	
	var state = ko.observableArray();
	var messages = ko.observableArray();
	var connected = ko.observableArray();
	
	ko.applyBindings({
	    start: function() {
	        socket.emit("start");
	    },
	    messages: messages,
	    connected: connected,
	    state: state
	});

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */
	
	var url = __webpack_require__(3);
	var parser = __webpack_require__(8);
	var Manager = __webpack_require__(16);
	var debug = __webpack_require__(5)('socket.io-client');
	
	/**
	 * Module exports.
	 */
	
	module.exports = exports = lookup;
	
	/**
	 * Managers cache.
	 */
	
	var cache = exports.managers = {};
	
	/**
	 * Looks up an existing `Manager` for multiplexing.
	 * If the user summons:
	 *
	 *   `io('http://localhost/a');`
	 *   `io('http://localhost/b');`
	 *
	 * We reuse the existing instance based on same scheme/port/host,
	 * and we initialize sockets for each namespace.
	 *
	 * @api public
	 */
	
	function lookup(uri, opts) {
	  if (typeof uri == 'object') {
	    opts = uri;
	    uri = undefined;
	  }
	
	  opts = opts || {};
	
	  var parsed = url(uri);
	  var source = parsed.source;
	  var id = parsed.id;
	  var path = parsed.path;
	  var sameNamespace = cache[id] && path in cache[id].nsps;
	  var newConnection = opts.forceNew || opts['force new connection'] ||
	                      false === opts.multiplex || sameNamespace;
	
	  var io;
	
	  if (newConnection) {
	    debug('ignoring socket cache for %s', source);
	    io = Manager(source, opts);
	  } else {
	    if (!cache[id]) {
	      debug('new io instance for %s', source);
	      cache[id] = Manager(source, opts);
	    }
	    io = cache[id];
	  }
	
	  return io.socket(parsed.path);
	}
	
	/**
	 * Protocol version.
	 *
	 * @api public
	 */
	
	exports.protocol = parser.protocol;
	
	/**
	 * `connect`.
	 *
	 * @param {String} uri
	 * @api public
	 */
	
	exports.connect = lookup;
	
	/**
	 * Expose constructors for standalone build.
	 *
	 * @api public
	 */
	
	exports.Manager = __webpack_require__(16);
	exports.Socket = __webpack_require__(42);


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {
	/**
	 * Module dependencies.
	 */
	
	var parseuri = __webpack_require__(4);
	var debug = __webpack_require__(5)('socket.io-client:url');
	
	/**
	 * Module exports.
	 */
	
	module.exports = url;
	
	/**
	 * URL parser.
	 *
	 * @param {String} url
	 * @param {Object} An object meant to mimic window.location.
	 *                 Defaults to window.location.
	 * @api public
	 */
	
	function url(uri, loc){
	  var obj = uri;
	
	  // default to window.location
	  var loc = loc || global.location;
	  if (null == uri) uri = loc.protocol + '//' + loc.host;
	
	  // relative path support
	  if ('string' == typeof uri) {
	    if ('/' == uri.charAt(0)) {
	      if ('/' == uri.charAt(1)) {
	        uri = loc.protocol + uri;
	      } else {
	        uri = loc.host + uri;
	      }
	    }
	
	    if (!/^(https?|wss?):\/\//.test(uri)) {
	      debug('protocol-less url %s', uri);
	      if ('undefined' != typeof loc) {
	        uri = loc.protocol + '//' + uri;
	      } else {
	        uri = 'https://' + uri;
	      }
	    }
	
	    // parse
	    debug('parse %s', uri);
	    obj = parseuri(uri);
	  }
	
	  // make sure we treat `localhost:80` and `localhost` equally
	  if (!obj.port) {
	    if (/^(http|ws)$/.test(obj.protocol)) {
	      obj.port = '80';
	    }
	    else if (/^(http|ws)s$/.test(obj.protocol)) {
	      obj.port = '443';
	    }
	  }
	
	  obj.path = obj.path || '/';
	
	  var ipv6 = obj.host.indexOf(':') !== -1;
	  var host = ipv6 ? '[' + obj.host + ']' : obj.host;
	
	  // define unique id
	  obj.id = obj.protocol + '://' + host + ':' + obj.port;
	  // define href
	  obj.href = obj.protocol + '://' + host + (loc && loc.port == obj.port ? '' : (':' + obj.port));
	
	  return obj;
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 4 */
/***/ function(module, exports) {

	/**
	 * Parses an URI
	 *
	 * @author Steven Levithan <stevenlevithan.com> (MIT license)
	 * @api private
	 */
	
	var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
	
	var parts = [
	    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
	];
	
	module.exports = function parseuri(str) {
	    var src = str,
	        b = str.indexOf('['),
	        e = str.indexOf(']');
	
	    if (b != -1 && e != -1) {
	        str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
	    }
	
	    var m = re.exec(str || ''),
	        uri = {},
	        i = 14;
	
	    while (i--) {
	        uri[parts[i]] = m[i] || '';
	    }
	
	    if (b != -1 && e != -1) {
	        uri.source = src;
	        uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
	        uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
	        uri.ipv6uri = true;
	    }
	
	    return uri;
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the web browser implementation of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */
	
	exports = module.exports = __webpack_require__(6);
	exports.log = log;
	exports.formatArgs = formatArgs;
	exports.save = save;
	exports.load = load;
	exports.useColors = useColors;
	exports.storage = 'undefined' != typeof chrome
	               && 'undefined' != typeof chrome.storage
	                  ? chrome.storage.local
	                  : localstorage();
	
	/**
	 * Colors.
	 */
	
	exports.colors = [
	  'lightseagreen',
	  'forestgreen',
	  'goldenrod',
	  'dodgerblue',
	  'darkorchid',
	  'crimson'
	];
	
	/**
	 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	 * and the Firebug extension (any Firefox version) are known
	 * to support "%c" CSS customizations.
	 *
	 * TODO: add a `localStorage` variable to explicitly enable/disable colors
	 */
	
	function useColors() {
	  // is webkit? http://stackoverflow.com/a/16459606/376773
	  return ('WebkitAppearance' in document.documentElement.style) ||
	    // is firebug? http://stackoverflow.com/a/398120/376773
	    (window.console && (console.firebug || (console.exception && console.table))) ||
	    // is firefox >= v31?
	    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
	    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
	}
	
	/**
	 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	 */
	
	exports.formatters.j = function(v) {
	  return JSON.stringify(v);
	};
	
	
	/**
	 * Colorize log arguments if enabled.
	 *
	 * @api public
	 */
	
	function formatArgs() {
	  var args = arguments;
	  var useColors = this.useColors;
	
	  args[0] = (useColors ? '%c' : '')
	    + this.namespace
	    + (useColors ? ' %c' : ' ')
	    + args[0]
	    + (useColors ? '%c ' : ' ')
	    + '+' + exports.humanize(this.diff);
	
	  if (!useColors) return args;
	
	  var c = 'color: ' + this.color;
	  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));
	
	  // the final "%c" is somewhat tricky, because there could be other
	  // arguments passed either before or after the %c, so we need to
	  // figure out the correct index to insert the CSS into
	  var index = 0;
	  var lastC = 0;
	  args[0].replace(/%[a-z%]/g, function(match) {
	    if ('%%' === match) return;
	    index++;
	    if ('%c' === match) {
	      // we only are interested in the *last* %c
	      // (the user may have provided their own)
	      lastC = index;
	    }
	  });
	
	  args.splice(lastC, 0, c);
	  return args;
	}
	
	/**
	 * Invokes `console.log()` when available.
	 * No-op when `console.log` is not a "function".
	 *
	 * @api public
	 */
	
	function log() {
	  // this hackery is required for IE8/9, where
	  // the `console.log` function doesn't have 'apply'
	  return 'object' === typeof console
	    && console.log
	    && Function.prototype.apply.call(console.log, console, arguments);
	}
	
	/**
	 * Save `namespaces`.
	 *
	 * @param {String} namespaces
	 * @api private
	 */
	
	function save(namespaces) {
	  try {
	    if (null == namespaces) {
	      exports.storage.removeItem('debug');
	    } else {
	      exports.storage.debug = namespaces;
	    }
	  } catch(e) {}
	}
	
	/**
	 * Load `namespaces`.
	 *
	 * @return {String} returns the previously persisted debug modes
	 * @api private
	 */
	
	function load() {
	  var r;
	  try {
	    r = exports.storage.debug;
	  } catch(e) {}
	  return r;
	}
	
	/**
	 * Enable namespaces listed in `localStorage.debug` initially.
	 */
	
	exports.enable(load());
	
	/**
	 * Localstorage attempts to return the localstorage.
	 *
	 * This is necessary because safari throws
	 * when a user disables cookies/localstorage
	 * and you attempt to access it.
	 *
	 * @return {LocalStorage}
	 * @api private
	 */
	
	function localstorage(){
	  try {
	    return window.localStorage;
	  } catch (e) {}
	}


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 *
	 * Expose `debug()` as the module.
	 */
	
	exports = module.exports = debug;
	exports.coerce = coerce;
	exports.disable = disable;
	exports.enable = enable;
	exports.enabled = enabled;
	exports.humanize = __webpack_require__(7);
	
	/**
	 * The currently active debug mode names, and names to skip.
	 */
	
	exports.names = [];
	exports.skips = [];
	
	/**
	 * Map of special "%n" handling functions, for the debug "format" argument.
	 *
	 * Valid key names are a single, lowercased letter, i.e. "n".
	 */
	
	exports.formatters = {};
	
	/**
	 * Previously assigned color.
	 */
	
	var prevColor = 0;
	
	/**
	 * Previous log timestamp.
	 */
	
	var prevTime;
	
	/**
	 * Select a color.
	 *
	 * @return {Number}
	 * @api private
	 */
	
	function selectColor() {
	  return exports.colors[prevColor++ % exports.colors.length];
	}
	
	/**
	 * Create a debugger with the given `namespace`.
	 *
	 * @param {String} namespace
	 * @return {Function}
	 * @api public
	 */
	
	function debug(namespace) {
	
	  // define the `disabled` version
	  function disabled() {
	  }
	  disabled.enabled = false;
	
	  // define the `enabled` version
	  function enabled() {
	
	    var self = enabled;
	
	    // set `diff` timestamp
	    var curr = +new Date();
	    var ms = curr - (prevTime || curr);
	    self.diff = ms;
	    self.prev = prevTime;
	    self.curr = curr;
	    prevTime = curr;
	
	    // add the `color` if not set
	    if (null == self.useColors) self.useColors = exports.useColors();
	    if (null == self.color && self.useColors) self.color = selectColor();
	
	    var args = Array.prototype.slice.call(arguments);
	
	    args[0] = exports.coerce(args[0]);
	
	    if ('string' !== typeof args[0]) {
	      // anything else let's inspect with %o
	      args = ['%o'].concat(args);
	    }
	
	    // apply any `formatters` transformations
	    var index = 0;
	    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
	      // if we encounter an escaped % then don't increase the array index
	      if (match === '%%') return match;
	      index++;
	      var formatter = exports.formatters[format];
	      if ('function' === typeof formatter) {
	        var val = args[index];
	        match = formatter.call(self, val);
	
	        // now we need to remove `args[index]` since it's inlined in the `format`
	        args.splice(index, 1);
	        index--;
	      }
	      return match;
	    });
	
	    if ('function' === typeof exports.formatArgs) {
	      args = exports.formatArgs.apply(self, args);
	    }
	    var logFn = enabled.log || exports.log || console.log.bind(console);
	    logFn.apply(self, args);
	  }
	  enabled.enabled = true;
	
	  var fn = exports.enabled(namespace) ? enabled : disabled;
	
	  fn.namespace = namespace;
	
	  return fn;
	}
	
	/**
	 * Enables a debug mode by namespaces. This can include modes
	 * separated by a colon and wildcards.
	 *
	 * @param {String} namespaces
	 * @api public
	 */
	
	function enable(namespaces) {
	  exports.save(namespaces);
	
	  var split = (namespaces || '').split(/[\s,]+/);
	  var len = split.length;
	
	  for (var i = 0; i < len; i++) {
	    if (!split[i]) continue; // ignore empty strings
	    namespaces = split[i].replace(/\*/g, '.*?');
	    if (namespaces[0] === '-') {
	      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
	    } else {
	      exports.names.push(new RegExp('^' + namespaces + '$'));
	    }
	  }
	}
	
	/**
	 * Disable debug output.
	 *
	 * @api public
	 */
	
	function disable() {
	  exports.enable('');
	}
	
	/**
	 * Returns true if the given mode name is enabled, false otherwise.
	 *
	 * @param {String} name
	 * @return {Boolean}
	 * @api public
	 */
	
	function enabled(name) {
	  var i, len;
	  for (i = 0, len = exports.skips.length; i < len; i++) {
	    if (exports.skips[i].test(name)) {
	      return false;
	    }
	  }
	  for (i = 0, len = exports.names.length; i < len; i++) {
	    if (exports.names[i].test(name)) {
	      return true;
	    }
	  }
	  return false;
	}
	
	/**
	 * Coerce `val`.
	 *
	 * @param {Mixed} val
	 * @return {Mixed}
	 * @api private
	 */
	
	function coerce(val) {
	  if (val instanceof Error) return val.stack || val.message;
	  return val;
	}


/***/ },
/* 7 */
/***/ function(module, exports) {

	/**
	 * Helpers.
	 */
	
	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var y = d * 365.25;
	
	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} options
	 * @return {String|Number}
	 * @api public
	 */
	
	module.exports = function(val, options){
	  options = options || {};
	  if ('string' == typeof val) return parse(val);
	  return options.long
	    ? long(val)
	    : short(val);
	};
	
	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */
	
	function parse(str) {
	  str = '' + str;
	  if (str.length > 10000) return;
	  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
	  if (!match) return;
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	  }
	}
	
	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */
	
	function short(ms) {
	  if (ms >= d) return Math.round(ms / d) + 'd';
	  if (ms >= h) return Math.round(ms / h) + 'h';
	  if (ms >= m) return Math.round(ms / m) + 'm';
	  if (ms >= s) return Math.round(ms / s) + 's';
	  return ms + 'ms';
	}
	
	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */
	
	function long(ms) {
	  return plural(ms, d, 'day')
	    || plural(ms, h, 'hour')
	    || plural(ms, m, 'minute')
	    || plural(ms, s, 'second')
	    || ms + ' ms';
	}
	
	/**
	 * Pluralization helper.
	 */
	
	function plural(ms, n, name) {
	  if (ms < n) return;
	  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
	  return Math.ceil(ms / n) + ' ' + name + 's';
	}


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */
	
	var debug = __webpack_require__(5)('socket.io-parser');
	var json = __webpack_require__(9);
	var isArray = __webpack_require__(12);
	var Emitter = __webpack_require__(13);
	var binary = __webpack_require__(14);
	var isBuf = __webpack_require__(15);
	
	/**
	 * Protocol version.
	 *
	 * @api public
	 */
	
	exports.protocol = 4;
	
	/**
	 * Packet types.
	 *
	 * @api public
	 */
	
	exports.types = [
	  'CONNECT',
	  'DISCONNECT',
	  'EVENT',
	  'ACK',
	  'ERROR',
	  'BINARY_EVENT',
	  'BINARY_ACK'
	];
	
	/**
	 * Packet type `connect`.
	 *
	 * @api public
	 */
	
	exports.CONNECT = 0;
	
	/**
	 * Packet type `disconnect`.
	 *
	 * @api public
	 */
	
	exports.DISCONNECT = 1;
	
	/**
	 * Packet type `event`.
	 *
	 * @api public
	 */
	
	exports.EVENT = 2;
	
	/**
	 * Packet type `ack`.
	 *
	 * @api public
	 */
	
	exports.ACK = 3;
	
	/**
	 * Packet type `error`.
	 *
	 * @api public
	 */
	
	exports.ERROR = 4;
	
	/**
	 * Packet type 'binary event'
	 *
	 * @api public
	 */
	
	exports.BINARY_EVENT = 5;
	
	/**
	 * Packet type `binary ack`. For acks with binary arguments.
	 *
	 * @api public
	 */
	
	exports.BINARY_ACK = 6;
	
	/**
	 * Encoder constructor.
	 *
	 * @api public
	 */
	
	exports.Encoder = Encoder;
	
	/**
	 * Decoder constructor.
	 *
	 * @api public
	 */
	
	exports.Decoder = Decoder;
	
	/**
	 * A socket.io Encoder instance
	 *
	 * @api public
	 */
	
	function Encoder() {}
	
	/**
	 * Encode a packet as a single string if non-binary, or as a
	 * buffer sequence, depending on packet type.
	 *
	 * @param {Object} obj - packet object
	 * @param {Function} callback - function to handle encodings (likely engine.write)
	 * @return Calls callback with Array of encodings
	 * @api public
	 */
	
	Encoder.prototype.encode = function(obj, callback){
	  debug('encoding packet %j', obj);
	
	  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
	    encodeAsBinary(obj, callback);
	  }
	  else {
	    var encoding = encodeAsString(obj);
	    callback([encoding]);
	  }
	};
	
	/**
	 * Encode packet as string.
	 *
	 * @param {Object} packet
	 * @return {String} encoded
	 * @api private
	 */
	
	function encodeAsString(obj) {
	  var str = '';
	  var nsp = false;
	
	  // first is type
	  str += obj.type;
	
	  // attachments if we have them
	  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
	    str += obj.attachments;
	    str += '-';
	  }
	
	  // if we have a namespace other than `/`
	  // we append it followed by a comma `,`
	  if (obj.nsp && '/' != obj.nsp) {
	    nsp = true;
	    str += obj.nsp;
	  }
	
	  // immediately followed by the id
	  if (null != obj.id) {
	    if (nsp) {
	      str += ',';
	      nsp = false;
	    }
	    str += obj.id;
	  }
	
	  // json data
	  if (null != obj.data) {
	    if (nsp) str += ',';
	    str += json.stringify(obj.data);
	  }
	
	  debug('encoded %j as %s', obj, str);
	  return str;
	}
	
	/**
	 * Encode packet as 'buffer sequence' by removing blobs, and
	 * deconstructing packet into object with placeholders and
	 * a list of buffers.
	 *
	 * @param {Object} packet
	 * @return {Buffer} encoded
	 * @api private
	 */
	
	function encodeAsBinary(obj, callback) {
	
	  function writeEncoding(bloblessData) {
	    var deconstruction = binary.deconstructPacket(bloblessData);
	    var pack = encodeAsString(deconstruction.packet);
	    var buffers = deconstruction.buffers;
	
	    buffers.unshift(pack); // add packet info to beginning of data list
	    callback(buffers); // write all the buffers
	  }
	
	  binary.removeBlobs(obj, writeEncoding);
	}
	
	/**
	 * A socket.io Decoder instance
	 *
	 * @return {Object} decoder
	 * @api public
	 */
	
	function Decoder() {
	  this.reconstructor = null;
	}
	
	/**
	 * Mix in `Emitter` with Decoder.
	 */
	
	Emitter(Decoder.prototype);
	
	/**
	 * Decodes an ecoded packet string into packet JSON.
	 *
	 * @param {String} obj - encoded packet
	 * @return {Object} packet
	 * @api public
	 */
	
	Decoder.prototype.add = function(obj) {
	  var packet;
	  if ('string' == typeof obj) {
	    packet = decodeString(obj);
	    if (exports.BINARY_EVENT == packet.type || exports.BINARY_ACK == packet.type) { // binary packet's json
	      this.reconstructor = new BinaryReconstructor(packet);
	
	      // no attachments, labeled binary but no binary data to follow
	      if (this.reconstructor.reconPack.attachments === 0) {
	        this.emit('decoded', packet);
	      }
	    } else { // non-binary full packet
	      this.emit('decoded', packet);
	    }
	  }
	  else if (isBuf(obj) || obj.base64) { // raw binary data
	    if (!this.reconstructor) {
	      throw new Error('got binary data when not reconstructing a packet');
	    } else {
	      packet = this.reconstructor.takeBinaryData(obj);
	      if (packet) { // received final buffer
	        this.reconstructor = null;
	        this.emit('decoded', packet);
	      }
	    }
	  }
	  else {
	    throw new Error('Unknown type: ' + obj);
	  }
	};
	
	/**
	 * Decode a packet String (JSON data)
	 *
	 * @param {String} str
	 * @return {Object} packet
	 * @api private
	 */
	
	function decodeString(str) {
	  var p = {};
	  var i = 0;
	
	  // look up type
	  p.type = Number(str.charAt(0));
	  if (null == exports.types[p.type]) return error();
	
	  // look up attachments if type binary
	  if (exports.BINARY_EVENT == p.type || exports.BINARY_ACK == p.type) {
	    var buf = '';
	    while (str.charAt(++i) != '-') {
	      buf += str.charAt(i);
	      if (i == str.length) break;
	    }
	    if (buf != Number(buf) || str.charAt(i) != '-') {
	      throw new Error('Illegal attachments');
	    }
	    p.attachments = Number(buf);
	  }
	
	  // look up namespace (if any)
	  if ('/' == str.charAt(i + 1)) {
	    p.nsp = '';
	    while (++i) {
	      var c = str.charAt(i);
	      if (',' == c) break;
	      p.nsp += c;
	      if (i == str.length) break;
	    }
	  } else {
	    p.nsp = '/';
	  }
	
	  // look up id
	  var next = str.charAt(i + 1);
	  if ('' !== next && Number(next) == next) {
	    p.id = '';
	    while (++i) {
	      var c = str.charAt(i);
	      if (null == c || Number(c) != c) {
	        --i;
	        break;
	      }
	      p.id += str.charAt(i);
	      if (i == str.length) break;
	    }
	    p.id = Number(p.id);
	  }
	
	  // look up json data
	  if (str.charAt(++i)) {
	    try {
	      p.data = json.parse(str.substr(i));
	    } catch(e){
	      return error();
	    }
	  }
	
	  debug('decoded %s as %j', str, p);
	  return p;
	}
	
	/**
	 * Deallocates a parser's resources
	 *
	 * @api public
	 */
	
	Decoder.prototype.destroy = function() {
	  if (this.reconstructor) {
	    this.reconstructor.finishedReconstruction();
	  }
	};
	
	/**
	 * A manager of a binary event's 'buffer sequence'. Should
	 * be constructed whenever a packet of type BINARY_EVENT is
	 * decoded.
	 *
	 * @param {Object} packet
	 * @return {BinaryReconstructor} initialized reconstructor
	 * @api private
	 */
	
	function BinaryReconstructor(packet) {
	  this.reconPack = packet;
	  this.buffers = [];
	}
	
	/**
	 * Method to be called when binary data received from connection
	 * after a BINARY_EVENT packet.
	 *
	 * @param {Buffer | ArrayBuffer} binData - the raw binary data received
	 * @return {null | Object} returns null if more binary data is expected or
	 *   a reconstructed packet object if all buffers have been received.
	 * @api private
	 */
	
	BinaryReconstructor.prototype.takeBinaryData = function(binData) {
	  this.buffers.push(binData);
	  if (this.buffers.length == this.reconPack.attachments) { // done with buffer list
	    var packet = binary.reconstructPacket(this.reconPack, this.buffers);
	    this.finishedReconstruction();
	    return packet;
	  }
	  return null;
	};
	
	/**
	 * Cleans up binary packet reconstruction variables.
	 *
	 * @api private
	 */
	
	BinaryReconstructor.prototype.finishedReconstruction = function() {
	  this.reconPack = null;
	  this.buffers = [];
	};
	
	function error(data){
	  return {
	    type: exports.ERROR,
	    data: 'parser error'
	  };
	}


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
	;(function () {
	  // Detect the `define` function exposed by asynchronous module loaders. The
	  // strict `define` check is necessary for compatibility with `r.js`.
	  var isLoader = "function" === "function" && __webpack_require__(11);
	
	  // A set of types used to distinguish objects from primitives.
	  var objectTypes = {
	    "function": true,
	    "object": true
	  };
	
	  // Detect the `exports` object exposed by CommonJS implementations.
	  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
	
	  // Use the `global` object exposed by Node (including Browserify via
	  // `insert-module-globals`), Narwhal, and Ringo as the default context,
	  // and the `window` object in browsers. Rhino exports a `global` function
	  // instead.
	  var root = objectTypes[typeof window] && window || this,
	      freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;
	
	  if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
	    root = freeGlobal;
	  }
	
	  // Public: Initializes JSON 3 using the given `context` object, attaching the
	  // `stringify` and `parse` functions to the specified `exports` object.
	  function runInContext(context, exports) {
	    context || (context = root["Object"]());
	    exports || (exports = root["Object"]());
	
	    // Native constructor aliases.
	    var Number = context["Number"] || root["Number"],
	        String = context["String"] || root["String"],
	        Object = context["Object"] || root["Object"],
	        Date = context["Date"] || root["Date"],
	        SyntaxError = context["SyntaxError"] || root["SyntaxError"],
	        TypeError = context["TypeError"] || root["TypeError"],
	        Math = context["Math"] || root["Math"],
	        nativeJSON = context["JSON"] || root["JSON"];
	
	    // Delegate to the native `stringify` and `parse` implementations.
	    if (typeof nativeJSON == "object" && nativeJSON) {
	      exports.stringify = nativeJSON.stringify;
	      exports.parse = nativeJSON.parse;
	    }
	
	    // Convenience aliases.
	    var objectProto = Object.prototype,
	        getClass = objectProto.toString,
	        isProperty, forEach, undef;
	
	    // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
	    var isExtended = new Date(-3509827334573292);
	    try {
	      // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
	      // results for certain dates in Opera >= 10.53.
	      isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
	        // Safari < 2.0.2 stores the internal millisecond time value correctly,
	        // but clips the values returned by the date methods to the range of
	        // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
	        isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
	    } catch (exception) {}
	
	    // Internal: Determines whether the native `JSON.stringify` and `parse`
	    // implementations are spec-compliant. Based on work by Ken Snyder.
	    function has(name) {
	      if (has[name] !== undef) {
	        // Return cached feature test result.
	        return has[name];
	      }
	      var isSupported;
	      if (name == "bug-string-char-index") {
	        // IE <= 7 doesn't support accessing string characters using square
	        // bracket notation. IE 8 only supports this for primitives.
	        isSupported = "a"[0] != "a";
	      } else if (name == "json") {
	        // Indicates whether both `JSON.stringify` and `JSON.parse` are
	        // supported.
	        isSupported = has("json-stringify") && has("json-parse");
	      } else {
	        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
	        // Test `JSON.stringify`.
	        if (name == "json-stringify") {
	          var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
	          if (stringifySupported) {
	            // A test function object with a custom `toJSON` method.
	            (value = function () {
	              return 1;
	            }).toJSON = value;
	            try {
	              stringifySupported =
	                // Firefox 3.1b1 and b2 serialize string, number, and boolean
	                // primitives as object literals.
	                stringify(0) === "0" &&
	                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
	                // literals.
	                stringify(new Number()) === "0" &&
	                stringify(new String()) == '""' &&
	                // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
	                // does not define a canonical JSON representation (this applies to
	                // objects with `toJSON` properties as well, *unless* they are nested
	                // within an object or array).
	                stringify(getClass) === undef &&
	                // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
	                // FF 3.1b3 pass this test.
	                stringify(undef) === undef &&
	                // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
	                // respectively, if the value is omitted entirely.
	                stringify() === undef &&
	                // FF 3.1b1, 2 throw an error if the given value is not a number,
	                // string, array, object, Boolean, or `null` literal. This applies to
	                // objects with custom `toJSON` methods as well, unless they are nested
	                // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
	                // methods entirely.
	                stringify(value) === "1" &&
	                stringify([value]) == "[1]" &&
	                // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
	                // `"[null]"`.
	                stringify([undef]) == "[null]" &&
	                // YUI 3.0.0b1 fails to serialize `null` literals.
	                stringify(null) == "null" &&
	                // FF 3.1b1, 2 halts serialization if an array contains a function:
	                // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
	                // elides non-JSON values from objects and arrays, unless they
	                // define custom `toJSON` methods.
	                stringify([undef, getClass, null]) == "[null,null,null]" &&
	                // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
	                // where character escape codes are expected (e.g., `\b` => `\u0008`).
	                stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
	                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
	                stringify(null, value) === "1" &&
	                stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
	                // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
	                // serialize extended years.
	                stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
	                // The milliseconds are optional in ES 5, but required in 5.1.
	                stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
	                // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
	                // four-digit years instead of six-digit years. Credits: @Yaffle.
	                stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
	                // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
	                // values less than 1000. Credits: @Yaffle.
	                stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
	            } catch (exception) {
	              stringifySupported = false;
	            }
	          }
	          isSupported = stringifySupported;
	        }
	        // Test `JSON.parse`.
	        if (name == "json-parse") {
	          var parse = exports.parse;
	          if (typeof parse == "function") {
	            try {
	              // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
	              // Conforming implementations should also coerce the initial argument to
	              // a string prior to parsing.
	              if (parse("0") === 0 && !parse(false)) {
	                // Simple parsing test.
	                value = parse(serialized);
	                var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
	                if (parseSupported) {
	                  try {
	                    // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
	                    parseSupported = !parse('"\t"');
	                  } catch (exception) {}
	                  if (parseSupported) {
	                    try {
	                      // FF 4.0 and 4.0.1 allow leading `+` signs and leading
	                      // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
	                      // certain octal literals.
	                      parseSupported = parse("01") !== 1;
	                    } catch (exception) {}
	                  }
	                  if (parseSupported) {
	                    try {
	                      // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
	                      // points. These environments, along with FF 3.1b1 and 2,
	                      // also allow trailing commas in JSON objects and arrays.
	                      parseSupported = parse("1.") !== 1;
	                    } catch (exception) {}
	                  }
	                }
	              }
	            } catch (exception) {
	              parseSupported = false;
	            }
	          }
	          isSupported = parseSupported;
	        }
	      }
	      return has[name] = !!isSupported;
	    }
	
	    if (!has("json")) {
	      // Common `[[Class]]` name aliases.
	      var functionClass = "[object Function]",
	          dateClass = "[object Date]",
	          numberClass = "[object Number]",
	          stringClass = "[object String]",
	          arrayClass = "[object Array]",
	          booleanClass = "[object Boolean]";
	
	      // Detect incomplete support for accessing string characters by index.
	      var charIndexBuggy = has("bug-string-char-index");
	
	      // Define additional utility methods if the `Date` methods are buggy.
	      if (!isExtended) {
	        var floor = Math.floor;
	        // A mapping between the months of the year and the number of days between
	        // January 1st and the first of the respective month.
	        var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
	        // Internal: Calculates the number of days between the Unix epoch and the
	        // first day of the given month.
	        var getDay = function (year, month) {
	          return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
	        };
	      }
	
	      // Internal: Determines if a property is a direct property of the given
	      // object. Delegates to the native `Object#hasOwnProperty` method.
	      if (!(isProperty = objectProto.hasOwnProperty)) {
	        isProperty = function (property) {
	          var members = {}, constructor;
	          if ((members.__proto__ = null, members.__proto__ = {
	            // The *proto* property cannot be set multiple times in recent
	            // versions of Firefox and SeaMonkey.
	            "toString": 1
	          }, members).toString != getClass) {
	            // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
	            // supports the mutable *proto* property.
	            isProperty = function (property) {
	              // Capture and break the object's prototype chain (see section 8.6.2
	              // of the ES 5.1 spec). The parenthesized expression prevents an
	              // unsafe transformation by the Closure Compiler.
	              var original = this.__proto__, result = property in (this.__proto__ = null, this);
	              // Restore the original prototype chain.
	              this.__proto__ = original;
	              return result;
	            };
	          } else {
	            // Capture a reference to the top-level `Object` constructor.
	            constructor = members.constructor;
	            // Use the `constructor` property to simulate `Object#hasOwnProperty` in
	            // other environments.
	            isProperty = function (property) {
	              var parent = (this.constructor || constructor).prototype;
	              return property in this && !(property in parent && this[property] === parent[property]);
	            };
	          }
	          members = null;
	          return isProperty.call(this, property);
	        };
	      }
	
	      // Internal: Normalizes the `for...in` iteration algorithm across
	      // environments. Each enumerated key is yielded to a `callback` function.
	      forEach = function (object, callback) {
	        var size = 0, Properties, members, property;
	
	        // Tests for bugs in the current environment's `for...in` algorithm. The
	        // `valueOf` property inherits the non-enumerable flag from
	        // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
	        (Properties = function () {
	          this.valueOf = 0;
	        }).prototype.valueOf = 0;
	
	        // Iterate over a new instance of the `Properties` class.
	        members = new Properties();
	        for (property in members) {
	          // Ignore all properties inherited from `Object.prototype`.
	          if (isProperty.call(members, property)) {
	            size++;
	          }
	        }
	        Properties = members = null;
	
	        // Normalize the iteration algorithm.
	        if (!size) {
	          // A list of non-enumerable properties inherited from `Object.prototype`.
	          members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
	          // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
	          // properties.
	          forEach = function (object, callback) {
	            var isFunction = getClass.call(object) == functionClass, property, length;
	            var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
	            for (property in object) {
	              // Gecko <= 1.0 enumerates the `prototype` property of functions under
	              // certain conditions; IE does not.
	              if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
	                callback(property);
	              }
	            }
	            // Manually invoke the callback for each non-enumerable property.
	            for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
	          };
	        } else if (size == 2) {
	          // Safari <= 2.0.4 enumerates shadowed properties twice.
	          forEach = function (object, callback) {
	            // Create a set of iterated properties.
	            var members = {}, isFunction = getClass.call(object) == functionClass, property;
	            for (property in object) {
	              // Store each property name to prevent double enumeration. The
	              // `prototype` property of functions is not enumerated due to cross-
	              // environment inconsistencies.
	              if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
	                callback(property);
	              }
	            }
	          };
	        } else {
	          // No bugs detected; use the standard `for...in` algorithm.
	          forEach = function (object, callback) {
	            var isFunction = getClass.call(object) == functionClass, property, isConstructor;
	            for (property in object) {
	              if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
	                callback(property);
	              }
	            }
	            // Manually invoke the callback for the `constructor` property due to
	            // cross-environment inconsistencies.
	            if (isConstructor || isProperty.call(object, (property = "constructor"))) {
	              callback(property);
	            }
	          };
	        }
	        return forEach(object, callback);
	      };
	
	      // Public: Serializes a JavaScript `value` as a JSON string. The optional
	      // `filter` argument may specify either a function that alters how object and
	      // array members are serialized, or an array of strings and numbers that
	      // indicates which properties should be serialized. The optional `width`
	      // argument may be either a string or number that specifies the indentation
	      // level of the output.
	      if (!has("json-stringify")) {
	        // Internal: A map of control characters and their escaped equivalents.
	        var Escapes = {
	          92: "\\\\",
	          34: '\\"',
	          8: "\\b",
	          12: "\\f",
	          10: "\\n",
	          13: "\\r",
	          9: "\\t"
	        };
	
	        // Internal: Converts `value` into a zero-padded string such that its
	        // length is at least equal to `width`. The `width` must be <= 6.
	        var leadingZeroes = "000000";
	        var toPaddedString = function (width, value) {
	          // The `|| 0` expression is necessary to work around a bug in
	          // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
	          return (leadingZeroes + (value || 0)).slice(-width);
	        };
	
	        // Internal: Double-quotes a string `value`, replacing all ASCII control
	        // characters (characters with code unit values between 0 and 31) with
	        // their escaped equivalents. This is an implementation of the
	        // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
	        var unicodePrefix = "\\u00";
	        var quote = function (value) {
	          var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
	          var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
	          for (; index < length; index++) {
	            var charCode = value.charCodeAt(index);
	            // If the character is a control character, append its Unicode or
	            // shorthand escape sequence; otherwise, append the character as-is.
	            switch (charCode) {
	              case 8: case 9: case 10: case 12: case 13: case 34: case 92:
	                result += Escapes[charCode];
	                break;
	              default:
	                if (charCode < 32) {
	                  result += unicodePrefix + toPaddedString(2, charCode.toString(16));
	                  break;
	                }
	                result += useCharIndex ? symbols[index] : value.charAt(index);
	            }
	          }
	          return result + '"';
	        };
	
	        // Internal: Recursively serializes an object. Implements the
	        // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
	        var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
	          var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
	          try {
	            // Necessary for host object support.
	            value = object[property];
	          } catch (exception) {}
	          if (typeof value == "object" && value) {
	            className = getClass.call(value);
	            if (className == dateClass && !isProperty.call(value, "toJSON")) {
	              if (value > -1 / 0 && value < 1 / 0) {
	                // Dates are serialized according to the `Date#toJSON` method
	                // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
	                // for the ISO 8601 date time string format.
	                if (getDay) {
	                  // Manually compute the year, month, date, hours, minutes,
	                  // seconds, and milliseconds if the `getUTC*` methods are
	                  // buggy. Adapted from @Yaffle's `date-shim` project.
	                  date = floor(value / 864e5);
	                  for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
	                  for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
	                  date = 1 + date - getDay(year, month);
	                  // The `time` value specifies the time within the day (see ES
	                  // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
	                  // to compute `A modulo B`, as the `%` operator does not
	                  // correspond to the `modulo` operation for negative numbers.
	                  time = (value % 864e5 + 864e5) % 864e5;
	                  // The hours, minutes, seconds, and milliseconds are obtained by
	                  // decomposing the time within the day. See section 15.9.1.10.
	                  hours = floor(time / 36e5) % 24;
	                  minutes = floor(time / 6e4) % 60;
	                  seconds = floor(time / 1e3) % 60;
	                  milliseconds = time % 1e3;
	                } else {
	                  year = value.getUTCFullYear();
	                  month = value.getUTCMonth();
	                  date = value.getUTCDate();
	                  hours = value.getUTCHours();
	                  minutes = value.getUTCMinutes();
	                  seconds = value.getUTCSeconds();
	                  milliseconds = value.getUTCMilliseconds();
	                }
	                // Serialize extended years correctly.
	                value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
	                  "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
	                  // Months, dates, hours, minutes, and seconds should have two
	                  // digits; milliseconds should have three.
	                  "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
	                  // Milliseconds are optional in ES 5.0, but required in 5.1.
	                  "." + toPaddedString(3, milliseconds) + "Z";
	              } else {
	                value = null;
	              }
	            } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
	              // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
	              // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
	              // ignores all `toJSON` methods on these objects unless they are
	              // defined directly on an instance.
	              value = value.toJSON(property);
	            }
	          }
	          if (callback) {
	            // If a replacement function was provided, call it to obtain the value
	            // for serialization.
	            value = callback.call(object, property, value);
	          }
	          if (value === null) {
	            return "null";
	          }
	          className = getClass.call(value);
	          if (className == booleanClass) {
	            // Booleans are represented literally.
	            return "" + value;
	          } else if (className == numberClass) {
	            // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
	            // `"null"`.
	            return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
	          } else if (className == stringClass) {
	            // Strings are double-quoted and escaped.
	            return quote("" + value);
	          }
	          // Recursively serialize objects and arrays.
	          if (typeof value == "object") {
	            // Check for cyclic structures. This is a linear search; performance
	            // is inversely proportional to the number of unique nested objects.
	            for (length = stack.length; length--;) {
	              if (stack[length] === value) {
	                // Cyclic structures cannot be serialized by `JSON.stringify`.
	                throw TypeError();
	              }
	            }
	            // Add the object to the stack of traversed objects.
	            stack.push(value);
	            results = [];
	            // Save the current indentation level and indent one additional level.
	            prefix = indentation;
	            indentation += whitespace;
	            if (className == arrayClass) {
	              // Recursively serialize array elements.
	              for (index = 0, length = value.length; index < length; index++) {
	                element = serialize(index, value, callback, properties, whitespace, indentation, stack);
	                results.push(element === undef ? "null" : element);
	              }
	              result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
	            } else {
	              // Recursively serialize object members. Members are selected from
	              // either a user-specified list of property names, or the object
	              // itself.
	              forEach(properties || value, function (property) {
	                var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
	                if (element !== undef) {
	                  // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
	                  // is not the empty string, let `member` {quote(property) + ":"}
	                  // be the concatenation of `member` and the `space` character."
	                  // The "`space` character" refers to the literal space
	                  // character, not the `space` {width} argument provided to
	                  // `JSON.stringify`.
	                  results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
	                }
	              });
	              result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
	            }
	            // Remove the object from the traversed object stack.
	            stack.pop();
	            return result;
	          }
	        };
	
	        // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
	        exports.stringify = function (source, filter, width) {
	          var whitespace, callback, properties, className;
	          if (objectTypes[typeof filter] && filter) {
	            if ((className = getClass.call(filter)) == functionClass) {
	              callback = filter;
	            } else if (className == arrayClass) {
	              // Convert the property names array into a makeshift set.
	              properties = {};
	              for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
	            }
	          }
	          if (width) {
	            if ((className = getClass.call(width)) == numberClass) {
	              // Convert the `width` to an integer and create a string containing
	              // `width` number of space characters.
	              if ((width -= width % 1) > 0) {
	                for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
	              }
	            } else if (className == stringClass) {
	              whitespace = width.length <= 10 ? width : width.slice(0, 10);
	            }
	          }
	          // Opera <= 7.54u2 discards the values associated with empty string keys
	          // (`""`) only if they are used directly within an object member list
	          // (e.g., `!("" in { "": 1})`).
	          return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
	        };
	      }
	
	      // Public: Parses a JSON source string.
	      if (!has("json-parse")) {
	        var fromCharCode = String.fromCharCode;
	
	        // Internal: A map of escaped control characters and their unescaped
	        // equivalents.
	        var Unescapes = {
	          92: "\\",
	          34: '"',
	          47: "/",
	          98: "\b",
	          116: "\t",
	          110: "\n",
	          102: "\f",
	          114: "\r"
	        };
	
	        // Internal: Stores the parser state.
	        var Index, Source;
	
	        // Internal: Resets the parser state and throws a `SyntaxError`.
	        var abort = function () {
	          Index = Source = null;
	          throw SyntaxError();
	        };
	
	        // Internal: Returns the next token, or `"$"` if the parser has reached
	        // the end of the source string. A token may be a string, number, `null`
	        // literal, or Boolean literal.
	        var lex = function () {
	          var source = Source, length = source.length, value, begin, position, isSigned, charCode;
	          while (Index < length) {
	            charCode = source.charCodeAt(Index);
	            switch (charCode) {
	              case 9: case 10: case 13: case 32:
	                // Skip whitespace tokens, including tabs, carriage returns, line
	                // feeds, and space characters.
	                Index++;
	                break;
	              case 123: case 125: case 91: case 93: case 58: case 44:
	                // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
	                // the current position.
	                value = charIndexBuggy ? source.charAt(Index) : source[Index];
	                Index++;
	                return value;
	              case 34:
	                // `"` delimits a JSON string; advance to the next character and
	                // begin parsing the string. String tokens are prefixed with the
	                // sentinel `@` character to distinguish them from punctuators and
	                // end-of-string tokens.
	                for (value = "@", Index++; Index < length;) {
	                  charCode = source.charCodeAt(Index);
	                  if (charCode < 32) {
	                    // Unescaped ASCII control characters (those with a code unit
	                    // less than the space character) are not permitted.
	                    abort();
	                  } else if (charCode == 92) {
	                    // A reverse solidus (`\`) marks the beginning of an escaped
	                    // control character (including `"`, `\`, and `/`) or Unicode
	                    // escape sequence.
	                    charCode = source.charCodeAt(++Index);
	                    switch (charCode) {
	                      case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
	                        // Revive escaped control characters.
	                        value += Unescapes[charCode];
	                        Index++;
	                        break;
	                      case 117:
	                        // `\u` marks the beginning of a Unicode escape sequence.
	                        // Advance to the first character and validate the
	                        // four-digit code point.
	                        begin = ++Index;
	                        for (position = Index + 4; Index < position; Index++) {
	                          charCode = source.charCodeAt(Index);
	                          // A valid sequence comprises four hexdigits (case-
	                          // insensitive) that form a single hexadecimal value.
	                          if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
	                            // Invalid Unicode escape sequence.
	                            abort();
	                          }
	                        }
	                        // Revive the escaped character.
	                        value += fromCharCode("0x" + source.slice(begin, Index));
	                        break;
	                      default:
	                        // Invalid escape sequence.
	                        abort();
	                    }
	                  } else {
	                    if (charCode == 34) {
	                      // An unescaped double-quote character marks the end of the
	                      // string.
	                      break;
	                    }
	                    charCode = source.charCodeAt(Index);
	                    begin = Index;
	                    // Optimize for the common case where a string is valid.
	                    while (charCode >= 32 && charCode != 92 && charCode != 34) {
	                      charCode = source.charCodeAt(++Index);
	                    }
	                    // Append the string as-is.
	                    value += source.slice(begin, Index);
	                  }
	                }
	                if (source.charCodeAt(Index) == 34) {
	                  // Advance to the next character and return the revived string.
	                  Index++;
	                  return value;
	                }
	                // Unterminated string.
	                abort();
	              default:
	                // Parse numbers and literals.
	                begin = Index;
	                // Advance past the negative sign, if one is specified.
	                if (charCode == 45) {
	                  isSigned = true;
	                  charCode = source.charCodeAt(++Index);
	                }
	                // Parse an integer or floating-point value.
	                if (charCode >= 48 && charCode <= 57) {
	                  // Leading zeroes are interpreted as octal literals.
	                  if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
	                    // Illegal octal literal.
	                    abort();
	                  }
	                  isSigned = false;
	                  // Parse the integer component.
	                  for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
	                  // Floats cannot contain a leading decimal point; however, this
	                  // case is already accounted for by the parser.
	                  if (source.charCodeAt(Index) == 46) {
	                    position = ++Index;
	                    // Parse the decimal component.
	                    for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
	                    if (position == Index) {
	                      // Illegal trailing decimal.
	                      abort();
	                    }
	                    Index = position;
	                  }
	                  // Parse exponents. The `e` denoting the exponent is
	                  // case-insensitive.
	                  charCode = source.charCodeAt(Index);
	                  if (charCode == 101 || charCode == 69) {
	                    charCode = source.charCodeAt(++Index);
	                    // Skip past the sign following the exponent, if one is
	                    // specified.
	                    if (charCode == 43 || charCode == 45) {
	                      Index++;
	                    }
	                    // Parse the exponential component.
	                    for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
	                    if (position == Index) {
	                      // Illegal empty exponent.
	                      abort();
	                    }
	                    Index = position;
	                  }
	                  // Coerce the parsed value to a JavaScript number.
	                  return +source.slice(begin, Index);
	                }
	                // A negative sign may only precede numbers.
	                if (isSigned) {
	                  abort();
	                }
	                // `true`, `false`, and `null` literals.
	                if (source.slice(Index, Index + 4) == "true") {
	                  Index += 4;
	                  return true;
	                } else if (source.slice(Index, Index + 5) == "false") {
	                  Index += 5;
	                  return false;
	                } else if (source.slice(Index, Index + 4) == "null") {
	                  Index += 4;
	                  return null;
	                }
	                // Unrecognized token.
	                abort();
	            }
	          }
	          // Return the sentinel `$` character if the parser has reached the end
	          // of the source string.
	          return "$";
	        };
	
	        // Internal: Parses a JSON `value` token.
	        var get = function (value) {
	          var results, hasMembers;
	          if (value == "$") {
	            // Unexpected end of input.
	            abort();
	          }
	          if (typeof value == "string") {
	            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
	              // Remove the sentinel `@` character.
	              return value.slice(1);
	            }
	            // Parse object and array literals.
	            if (value == "[") {
	              // Parses a JSON array, returning a new JavaScript array.
	              results = [];
	              for (;; hasMembers || (hasMembers = true)) {
	                value = lex();
	                // A closing square bracket marks the end of the array literal.
	                if (value == "]") {
	                  break;
	                }
	                // If the array literal contains elements, the current token
	                // should be a comma separating the previous element from the
	                // next.
	                if (hasMembers) {
	                  if (value == ",") {
	                    value = lex();
	                    if (value == "]") {
	                      // Unexpected trailing `,` in array literal.
	                      abort();
	                    }
	                  } else {
	                    // A `,` must separate each array element.
	                    abort();
	                  }
	                }
	                // Elisions and leading commas are not permitted.
	                if (value == ",") {
	                  abort();
	                }
	                results.push(get(value));
	              }
	              return results;
	            } else if (value == "{") {
	              // Parses a JSON object, returning a new JavaScript object.
	              results = {};
	              for (;; hasMembers || (hasMembers = true)) {
	                value = lex();
	                // A closing curly brace marks the end of the object literal.
	                if (value == "}") {
	                  break;
	                }
	                // If the object literal contains members, the current token
	                // should be a comma separator.
	                if (hasMembers) {
	                  if (value == ",") {
	                    value = lex();
	                    if (value == "}") {
	                      // Unexpected trailing `,` in object literal.
	                      abort();
	                    }
	                  } else {
	                    // A `,` must separate each object member.
	                    abort();
	                  }
	                }
	                // Leading commas are not permitted, object property names must be
	                // double-quoted strings, and a `:` must separate each property
	                // name and value.
	                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
	                  abort();
	                }
	                results[value.slice(1)] = get(lex());
	              }
	              return results;
	            }
	            // Unexpected token encountered.
	            abort();
	          }
	          return value;
	        };
	
	        // Internal: Updates a traversed object member.
	        var update = function (source, property, callback) {
	          var element = walk(source, property, callback);
	          if (element === undef) {
	            delete source[property];
	          } else {
	            source[property] = element;
	          }
	        };
	
	        // Internal: Recursively traverses a parsed JSON object, invoking the
	        // `callback` function for each value. This is an implementation of the
	        // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
	        var walk = function (source, property, callback) {
	          var value = source[property], length;
	          if (typeof value == "object" && value) {
	            // `forEach` can't be used to traverse an array in Opera <= 8.54
	            // because its `Object#hasOwnProperty` implementation returns `false`
	            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
	            if (getClass.call(value) == arrayClass) {
	              for (length = value.length; length--;) {
	                update(value, length, callback);
	              }
	            } else {
	              forEach(value, function (property) {
	                update(value, property, callback);
	              });
	            }
	          }
	          return callback.call(source, property, value);
	        };
	
	        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
	        exports.parse = function (source, callback) {
	          var result, value;
	          Index = 0;
	          Source = "" + source;
	          result = get(lex());
	          // If a JSON string contains multiple tokens, it is invalid.
	          if (lex() != "$") {
	            abort();
	          }
	          // Reset the parser state.
	          Index = Source = null;
	          return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
	        };
	      }
	    }
	
	    exports["runInContext"] = runInContext;
	    return exports;
	  }
	
	  if (freeExports && !isLoader) {
	    // Export for CommonJS environments.
	    runInContext(root, freeExports);
	  } else {
	    // Export for web browsers and JavaScript engines.
	    var nativeJSON = root.JSON,
	        previousJSON = root["JSON3"],
	        isRestored = false;
	
	    var JSON3 = runInContext(root, (root["JSON3"] = {
	      // Public: Restores the original value of the global `JSON` object and
	      // returns a reference to the `JSON3` object.
	      "noConflict": function () {
	        if (!isRestored) {
	          isRestored = true;
	          root.JSON = nativeJSON;
	          root["JSON3"] = previousJSON;
	          nativeJSON = previousJSON = null;
	        }
	        return JSON3;
	      }
	    }));
	
	    root.JSON = {
	      "parse": JSON3.parse,
	      "stringify": JSON3.stringify
	    };
	  }
	
	  // Export for asynchronous module loaders.
	  if (isLoader) {
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	      return JSON3;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	}).call(this);
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10)(module), (function() { return this; }())))

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 11 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {module.exports = __webpack_amd_options__;
	
	/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = Array.isArray || function (arr) {
	  return Object.prototype.toString.call(arr) == '[object Array]';
	};


/***/ },
/* 13 */
/***/ function(module, exports) {

	
	/**
	 * Expose `Emitter`.
	 */
	
	module.exports = Emitter;
	
	/**
	 * Initialize a new `Emitter`.
	 *
	 * @api public
	 */
	
	function Emitter(obj) {
	  if (obj) return mixin(obj);
	};
	
	/**
	 * Mixin the emitter properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */
	
	function mixin(obj) {
	  for (var key in Emitter.prototype) {
	    obj[key] = Emitter.prototype[key];
	  }
	  return obj;
	}
	
	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.on =
	Emitter.prototype.addEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	  (this._callbacks[event] = this._callbacks[event] || [])
	    .push(fn);
	  return this;
	};
	
	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.once = function(event, fn){
	  var self = this;
	  this._callbacks = this._callbacks || {};
	
	  function on() {
	    self.off(event, on);
	    fn.apply(this, arguments);
	  }
	
	  on.fn = fn;
	  this.on(event, on);
	  return this;
	};
	
	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.off =
	Emitter.prototype.removeListener =
	Emitter.prototype.removeAllListeners =
	Emitter.prototype.removeEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	
	  // all
	  if (0 == arguments.length) {
	    this._callbacks = {};
	    return this;
	  }
	
	  // specific event
	  var callbacks = this._callbacks[event];
	  if (!callbacks) return this;
	
	  // remove all handlers
	  if (1 == arguments.length) {
	    delete this._callbacks[event];
	    return this;
	  }
	
	  // remove specific handler
	  var cb;
	  for (var i = 0; i < callbacks.length; i++) {
	    cb = callbacks[i];
	    if (cb === fn || cb.fn === fn) {
	      callbacks.splice(i, 1);
	      break;
	    }
	  }
	  return this;
	};
	
	/**
	 * Emit `event` with the given args.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 */
	
	Emitter.prototype.emit = function(event){
	  this._callbacks = this._callbacks || {};
	  var args = [].slice.call(arguments, 1)
	    , callbacks = this._callbacks[event];
	
	  if (callbacks) {
	    callbacks = callbacks.slice(0);
	    for (var i = 0, len = callbacks.length; i < len; ++i) {
	      callbacks[i].apply(this, args);
	    }
	  }
	
	  return this;
	};
	
	/**
	 * Return array of callbacks for `event`.
	 *
	 * @param {String} event
	 * @return {Array}
	 * @api public
	 */
	
	Emitter.prototype.listeners = function(event){
	  this._callbacks = this._callbacks || {};
	  return this._callbacks[event] || [];
	};
	
	/**
	 * Check if this emitter has `event` handlers.
	 *
	 * @param {String} event
	 * @return {Boolean}
	 * @api public
	 */
	
	Emitter.prototype.hasListeners = function(event){
	  return !! this.listeners(event).length;
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/*global Blob,File*/
	
	/**
	 * Module requirements
	 */
	
	var isArray = __webpack_require__(12);
	var isBuf = __webpack_require__(15);
	
	/**
	 * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
	 * Anything with blobs or files should be fed through removeBlobs before coming
	 * here.
	 *
	 * @param {Object} packet - socket.io event packet
	 * @return {Object} with deconstructed packet and list of buffers
	 * @api public
	 */
	
	exports.deconstructPacket = function(packet){
	  var buffers = [];
	  var packetData = packet.data;
	
	  function _deconstructPacket(data) {
	    if (!data) return data;
	
	    if (isBuf(data)) {
	      var placeholder = { _placeholder: true, num: buffers.length };
	      buffers.push(data);
	      return placeholder;
	    } else if (isArray(data)) {
	      var newData = new Array(data.length);
	      for (var i = 0; i < data.length; i++) {
	        newData[i] = _deconstructPacket(data[i]);
	      }
	      return newData;
	    } else if ('object' == typeof data && !(data instanceof Date)) {
	      var newData = {};
	      for (var key in data) {
	        newData[key] = _deconstructPacket(data[key]);
	      }
	      return newData;
	    }
	    return data;
	  }
	
	  var pack = packet;
	  pack.data = _deconstructPacket(packetData);
	  pack.attachments = buffers.length; // number of binary 'attachments'
	  return {packet: pack, buffers: buffers};
	};
	
	/**
	 * Reconstructs a binary packet from its placeholder packet and buffers
	 *
	 * @param {Object} packet - event packet with placeholders
	 * @param {Array} buffers - binary buffers to put in placeholder positions
	 * @return {Object} reconstructed packet
	 * @api public
	 */
	
	exports.reconstructPacket = function(packet, buffers) {
	  var curPlaceHolder = 0;
	
	  function _reconstructPacket(data) {
	    if (data && data._placeholder) {
	      var buf = buffers[data.num]; // appropriate buffer (should be natural order anyway)
	      return buf;
	    } else if (isArray(data)) {
	      for (var i = 0; i < data.length; i++) {
	        data[i] = _reconstructPacket(data[i]);
	      }
	      return data;
	    } else if (data && 'object' == typeof data) {
	      for (var key in data) {
	        data[key] = _reconstructPacket(data[key]);
	      }
	      return data;
	    }
	    return data;
	  }
	
	  packet.data = _reconstructPacket(packet.data);
	  packet.attachments = undefined; // no longer useful
	  return packet;
	};
	
	/**
	 * Asynchronously removes Blobs or Files from data via
	 * FileReader's readAsArrayBuffer method. Used before encoding
	 * data as msgpack. Calls callback with the blobless data.
	 *
	 * @param {Object} data
	 * @param {Function} callback
	 * @api private
	 */
	
	exports.removeBlobs = function(data, callback) {
	  function _removeBlobs(obj, curKey, containingObject) {
	    if (!obj) return obj;
	
	    // convert any blob
	    if ((global.Blob && obj instanceof Blob) ||
	        (global.File && obj instanceof File)) {
	      pendingBlobs++;
	
	      // async filereader
	      var fileReader = new FileReader();
	      fileReader.onload = function() { // this.result == arraybuffer
	        if (containingObject) {
	          containingObject[curKey] = this.result;
	        }
	        else {
	          bloblessData = this.result;
	        }
	
	        // if nothing pending its callback time
	        if(! --pendingBlobs) {
	          callback(bloblessData);
	        }
	      };
	
	      fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
	    } else if (isArray(obj)) { // handle array
	      for (var i = 0; i < obj.length; i++) {
	        _removeBlobs(obj[i], i, obj);
	      }
	    } else if (obj && 'object' == typeof obj && !isBuf(obj)) { // and object
	      for (var key in obj) {
	        _removeBlobs(obj[key], key, obj);
	      }
	    }
	  }
	
	  var pendingBlobs = 0;
	  var bloblessData = data;
	  _removeBlobs(bloblessData);
	  if (!pendingBlobs) {
	    callback(bloblessData);
	  }
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 15 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {
	module.exports = isBuf;
	
	/**
	 * Returns true if obj is a buffer or an arraybuffer.
	 *
	 * @api private
	 */
	
	function isBuf(obj) {
	  return (global.Buffer && global.Buffer.isBuffer(obj)) ||
	         (global.ArrayBuffer && obj instanceof ArrayBuffer);
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */
	
	var eio = __webpack_require__(17);
	var Socket = __webpack_require__(42);
	var Emitter = __webpack_require__(43);
	var parser = __webpack_require__(8);
	var on = __webpack_require__(45);
	var bind = __webpack_require__(46);
	var debug = __webpack_require__(5)('socket.io-client:manager');
	var indexOf = __webpack_require__(40);
	var Backoff = __webpack_require__(48);
	
	/**
	 * IE6+ hasOwnProperty
	 */
	
	var has = Object.prototype.hasOwnProperty;
	
	/**
	 * Module exports
	 */
	
	module.exports = Manager;
	
	/**
	 * `Manager` constructor.
	 *
	 * @param {String} engine instance or engine uri/opts
	 * @param {Object} options
	 * @api public
	 */
	
	function Manager(uri, opts){
	  if (!(this instanceof Manager)) return new Manager(uri, opts);
	  if (uri && ('object' == typeof uri)) {
	    opts = uri;
	    uri = undefined;
	  }
	  opts = opts || {};
	
	  opts.path = opts.path || '/socket.io';
	  this.nsps = {};
	  this.subs = [];
	  this.opts = opts;
	  this.reconnection(opts.reconnection !== false);
	  this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
	  this.reconnectionDelay(opts.reconnectionDelay || 1000);
	  this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
	  this.randomizationFactor(opts.randomizationFactor || 0.5);
	  this.backoff = new Backoff({
	    min: this.reconnectionDelay(),
	    max: this.reconnectionDelayMax(),
	    jitter: this.randomizationFactor()
	  });
	  this.timeout(null == opts.timeout ? 20000 : opts.timeout);
	  this.readyState = 'closed';
	  this.uri = uri;
	  this.connecting = [];
	  this.lastPing = null;
	  this.encoding = false;
	  this.packetBuffer = [];
	  this.encoder = new parser.Encoder();
	  this.decoder = new parser.Decoder();
	  this.autoConnect = opts.autoConnect !== false;
	  if (this.autoConnect) this.open();
	}
	
	/**
	 * Propagate given event to sockets and emit on `this`
	 *
	 * @api private
	 */
	
	Manager.prototype.emitAll = function() {
	  this.emit.apply(this, arguments);
	  for (var nsp in this.nsps) {
	    if (has.call(this.nsps, nsp)) {
	      this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
	    }
	  }
	};
	
	/**
	 * Update `socket.id` of all sockets
	 *
	 * @api private
	 */
	
	Manager.prototype.updateSocketIds = function(){
	  for (var nsp in this.nsps) {
	    if (has.call(this.nsps, nsp)) {
	      this.nsps[nsp].id = this.engine.id;
	    }
	  }
	};
	
	/**
	 * Mix in `Emitter`.
	 */
	
	Emitter(Manager.prototype);
	
	/**
	 * Sets the `reconnection` config.
	 *
	 * @param {Boolean} true/false if it should automatically reconnect
	 * @return {Manager} self or value
	 * @api public
	 */
	
	Manager.prototype.reconnection = function(v){
	  if (!arguments.length) return this._reconnection;
	  this._reconnection = !!v;
	  return this;
	};
	
	/**
	 * Sets the reconnection attempts config.
	 *
	 * @param {Number} max reconnection attempts before giving up
	 * @return {Manager} self or value
	 * @api public
	 */
	
	Manager.prototype.reconnectionAttempts = function(v){
	  if (!arguments.length) return this._reconnectionAttempts;
	  this._reconnectionAttempts = v;
	  return this;
	};
	
	/**
	 * Sets the delay between reconnections.
	 *
	 * @param {Number} delay
	 * @return {Manager} self or value
	 * @api public
	 */
	
	Manager.prototype.reconnectionDelay = function(v){
	  if (!arguments.length) return this._reconnectionDelay;
	  this._reconnectionDelay = v;
	  this.backoff && this.backoff.setMin(v);
	  return this;
	};
	
	Manager.prototype.randomizationFactor = function(v){
	  if (!arguments.length) return this._randomizationFactor;
	  this._randomizationFactor = v;
	  this.backoff && this.backoff.setJitter(v);
	  return this;
	};
	
	/**
	 * Sets the maximum delay between reconnections.
	 *
	 * @param {Number} delay
	 * @return {Manager} self or value
	 * @api public
	 */
	
	Manager.prototype.reconnectionDelayMax = function(v){
	  if (!arguments.length) return this._reconnectionDelayMax;
	  this._reconnectionDelayMax = v;
	  this.backoff && this.backoff.setMax(v);
	  return this;
	};
	
	/**
	 * Sets the connection timeout. `false` to disable
	 *
	 * @return {Manager} self or value
	 * @api public
	 */
	
	Manager.prototype.timeout = function(v){
	  if (!arguments.length) return this._timeout;
	  this._timeout = v;
	  return this;
	};
	
	/**
	 * Starts trying to reconnect if reconnection is enabled and we have not
	 * started reconnecting yet
	 *
	 * @api private
	 */
	
	Manager.prototype.maybeReconnectOnOpen = function() {
	  // Only try to reconnect if it's the first time we're connecting
	  if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
	    // keeps reconnection from firing twice for the same reconnection loop
	    this.reconnect();
	  }
	};
	
	
	/**
	 * Sets the current transport `socket`.
	 *
	 * @param {Function} optional, callback
	 * @return {Manager} self
	 * @api public
	 */
	
	Manager.prototype.open =
	Manager.prototype.connect = function(fn){
	  debug('readyState %s', this.readyState);
	  if (~this.readyState.indexOf('open')) return this;
	
	  debug('opening %s', this.uri);
	  this.engine = eio(this.uri, this.opts);
	  var socket = this.engine;
	  var self = this;
	  this.readyState = 'opening';
	  this.skipReconnect = false;
	
	  // emit `open`
	  var openSub = on(socket, 'open', function() {
	    self.onopen();
	    fn && fn();
	  });
	
	  // emit `connect_error`
	  var errorSub = on(socket, 'error', function(data){
	    debug('connect_error');
	    self.cleanup();
	    self.readyState = 'closed';
	    self.emitAll('connect_error', data);
	    if (fn) {
	      var err = new Error('Connection error');
	      err.data = data;
	      fn(err);
	    } else {
	      // Only do this if there is no fn to handle the error
	      self.maybeReconnectOnOpen();
	    }
	  });
	
	  // emit `connect_timeout`
	  if (false !== this._timeout) {
	    var timeout = this._timeout;
	    debug('connect attempt will timeout after %d', timeout);
	
	    // set timer
	    var timer = setTimeout(function(){
	      debug('connect attempt timed out after %d', timeout);
	      openSub.destroy();
	      socket.close();
	      socket.emit('error', 'timeout');
	      self.emitAll('connect_timeout', timeout);
	    }, timeout);
	
	    this.subs.push({
	      destroy: function(){
	        clearTimeout(timer);
	      }
	    });
	  }
	
	  this.subs.push(openSub);
	  this.subs.push(errorSub);
	
	  return this;
	};
	
	/**
	 * Called upon transport open.
	 *
	 * @api private
	 */
	
	Manager.prototype.onopen = function(){
	  debug('open');
	
	  // clear old subs
	  this.cleanup();
	
	  // mark as open
	  this.readyState = 'open';
	  this.emit('open');
	
	  // add new subs
	  var socket = this.engine;
	  this.subs.push(on(socket, 'data', bind(this, 'ondata')));
	  this.subs.push(on(socket, 'ping', bind(this, 'onping')));
	  this.subs.push(on(socket, 'pong', bind(this, 'onpong')));
	  this.subs.push(on(socket, 'error', bind(this, 'onerror')));
	  this.subs.push(on(socket, 'close', bind(this, 'onclose')));
	  this.subs.push(on(this.decoder, 'decoded', bind(this, 'ondecoded')));
	};
	
	/**
	 * Called upon a ping.
	 *
	 * @api private
	 */
	
	Manager.prototype.onping = function(){
	  this.lastPing = new Date;
	  this.emitAll('ping');
	};
	
	/**
	 * Called upon a packet.
	 *
	 * @api private
	 */
	
	Manager.prototype.onpong = function(){
	  this.emitAll('pong', new Date - this.lastPing);
	};
	
	/**
	 * Called with data.
	 *
	 * @api private
	 */
	
	Manager.prototype.ondata = function(data){
	  this.decoder.add(data);
	};
	
	/**
	 * Called when parser fully decodes a packet.
	 *
	 * @api private
	 */
	
	Manager.prototype.ondecoded = function(packet) {
	  this.emit('packet', packet);
	};
	
	/**
	 * Called upon socket error.
	 *
	 * @api private
	 */
	
	Manager.prototype.onerror = function(err){
	  debug('error', err);
	  this.emitAll('error', err);
	};
	
	/**
	 * Creates a new socket for the given `nsp`.
	 *
	 * @return {Socket}
	 * @api public
	 */
	
	Manager.prototype.socket = function(nsp){
	  var socket = this.nsps[nsp];
	  if (!socket) {
	    socket = new Socket(this, nsp);
	    this.nsps[nsp] = socket;
	    var self = this;
	    socket.on('connecting', onConnecting);
	    socket.on('connect', function(){
	      socket.id = self.engine.id;
	    });
	
	    if (this.autoConnect) {
	      // manually call here since connecting evnet is fired before listening
	      onConnecting();
	    }
	  }
	
	  function onConnecting() {
	    if (!~indexOf(self.connecting, socket)) {
	      self.connecting.push(socket);
	    }
	  }
	
	  return socket;
	};
	
	/**
	 * Called upon a socket close.
	 *
	 * @param {Socket} socket
	 */
	
	Manager.prototype.destroy = function(socket){
	  var index = indexOf(this.connecting, socket);
	  if (~index) this.connecting.splice(index, 1);
	  if (this.connecting.length) return;
	
	  this.close();
	};
	
	/**
	 * Writes a packet.
	 *
	 * @param {Object} packet
	 * @api private
	 */
	
	Manager.prototype.packet = function(packet){
	  debug('writing packet %j', packet);
	  var self = this;
	
	  if (!self.encoding) {
	    // encode, then write to engine with result
	    self.encoding = true;
	    this.encoder.encode(packet, function(encodedPackets) {
	      for (var i = 0; i < encodedPackets.length; i++) {
	        self.engine.write(encodedPackets[i], packet.options);
	      }
	      self.encoding = false;
	      self.processPacketQueue();
	    });
	  } else { // add packet to the queue
	    self.packetBuffer.push(packet);
	  }
	};
	
	/**
	 * If packet buffer is non-empty, begins encoding the
	 * next packet in line.
	 *
	 * @api private
	 */
	
	Manager.prototype.processPacketQueue = function() {
	  if (this.packetBuffer.length > 0 && !this.encoding) {
	    var pack = this.packetBuffer.shift();
	    this.packet(pack);
	  }
	};
	
	/**
	 * Clean up transport subscriptions and packet buffer.
	 *
	 * @api private
	 */
	
	Manager.prototype.cleanup = function(){
	  debug('cleanup');
	
	  var sub;
	  while (sub = this.subs.shift()) sub.destroy();
	
	  this.packetBuffer = [];
	  this.encoding = false;
	  this.lastPing = null;
	
	  this.decoder.destroy();
	};
	
	/**
	 * Close the current socket.
	 *
	 * @api private
	 */
	
	Manager.prototype.close =
	Manager.prototype.disconnect = function(){
	  debug('disconnect');
	  this.skipReconnect = true;
	  this.reconnecting = false;
	  if ('opening' == this.readyState) {
	    // `onclose` will not fire because
	    // an open event never happened
	    this.cleanup();
	  }
	  this.backoff.reset();
	  this.readyState = 'closed';
	  if (this.engine) this.engine.close();
	};
	
	/**
	 * Called upon engine close.
	 *
	 * @api private
	 */
	
	Manager.prototype.onclose = function(reason){
	  debug('onclose');
	
	  this.cleanup();
	  this.backoff.reset();
	  this.readyState = 'closed';
	  this.emit('close', reason);
	
	  if (this._reconnection && !this.skipReconnect) {
	    this.reconnect();
	  }
	};
	
	/**
	 * Attempt a reconnection.
	 *
	 * @api private
	 */
	
	Manager.prototype.reconnect = function(){
	  if (this.reconnecting || this.skipReconnect) return this;
	
	  var self = this;
	
	  if (this.backoff.attempts >= this._reconnectionAttempts) {
	    debug('reconnect failed');
	    this.backoff.reset();
	    this.emitAll('reconnect_failed');
	    this.reconnecting = false;
	  } else {
	    var delay = this.backoff.duration();
	    debug('will wait %dms before reconnect attempt', delay);
	
	    this.reconnecting = true;
	    var timer = setTimeout(function(){
	      if (self.skipReconnect) return;
	
	      debug('attempting reconnect');
	      self.emitAll('reconnect_attempt', self.backoff.attempts);
	      self.emitAll('reconnecting', self.backoff.attempts);
	
	      // check again for the case socket closed in above events
	      if (self.skipReconnect) return;
	
	      self.open(function(err){
	        if (err) {
	          debug('reconnect attempt error');
	          self.reconnecting = false;
	          self.reconnect();
	          self.emitAll('reconnect_error', err.data);
	        } else {
	          debug('reconnect success');
	          self.onreconnect();
	        }
	      });
	    }, delay);
	
	    this.subs.push({
	      destroy: function(){
	        clearTimeout(timer);
	      }
	    });
	  }
	};
	
	/**
	 * Called upon successful reconnect.
	 *
	 * @api private
	 */
	
	Manager.prototype.onreconnect = function(){
	  var attempt = this.backoff.attempts;
	  this.reconnecting = false;
	  this.backoff.reset();
	  this.updateSocketIds();
	  this.emitAll('reconnect', attempt);
	};


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	
	module.exports =  __webpack_require__(18);


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	
	module.exports = __webpack_require__(19);
	
	/**
	 * Exports parser
	 *
	 * @api public
	 *
	 */
	module.exports.parser = __webpack_require__(26);


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Module dependencies.
	 */
	
	var transports = __webpack_require__(20);
	var Emitter = __webpack_require__(13);
	var debug = __webpack_require__(5)('engine.io-client:socket');
	var index = __webpack_require__(40);
	var parser = __webpack_require__(26);
	var parseuri = __webpack_require__(4);
	var parsejson = __webpack_require__(41);
	var parseqs = __webpack_require__(34);
	
	/**
	 * Module exports.
	 */
	
	module.exports = Socket;
	
	/**
	 * Noop function.
	 *
	 * @api private
	 */
	
	function noop(){}
	
	/**
	 * Socket constructor.
	 *
	 * @param {String|Object} uri or options
	 * @param {Object} options
	 * @api public
	 */
	
	function Socket(uri, opts){
	  if (!(this instanceof Socket)) return new Socket(uri, opts);
	
	  opts = opts || {};
	
	  if (uri && 'object' == typeof uri) {
	    opts = uri;
	    uri = null;
	  }
	
	  if (uri) {
	    uri = parseuri(uri);
	    opts.hostname = uri.host;
	    opts.secure = uri.protocol == 'https' || uri.protocol == 'wss';
	    opts.port = uri.port;
	    if (uri.query) opts.query = uri.query;
	  } else if (opts.host) {
	    opts.hostname = parseuri(opts.host).host;
	  }
	
	  this.secure = null != opts.secure ? opts.secure :
	    (global.location && 'https:' == location.protocol);
	
	  if (opts.hostname && !opts.port) {
	    // if no port is specified manually, use the protocol default
	    opts.port = this.secure ? '443' : '80';
	  }
	
	  this.agent = opts.agent || false;
	  this.hostname = opts.hostname ||
	    (global.location ? location.hostname : 'localhost');
	  this.port = opts.port || (global.location && location.port ?
	       location.port :
	       (this.secure ? 443 : 80));
	  this.query = opts.query || {};
	  if ('string' == typeof this.query) this.query = parseqs.decode(this.query);
	  this.upgrade = false !== opts.upgrade;
	  this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
	  this.forceJSONP = !!opts.forceJSONP;
	  this.jsonp = false !== opts.jsonp;
	  this.forceBase64 = !!opts.forceBase64;
	  this.enablesXDR = !!opts.enablesXDR;
	  this.timestampParam = opts.timestampParam || 't';
	  this.timestampRequests = opts.timestampRequests;
	  this.transports = opts.transports || ['polling', 'websocket'];
	  this.readyState = '';
	  this.writeBuffer = [];
	  this.policyPort = opts.policyPort || 843;
	  this.rememberUpgrade = opts.rememberUpgrade || false;
	  this.binaryType = null;
	  this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;
	  this.perMessageDeflate = false !== opts.perMessageDeflate ? (opts.perMessageDeflate || {}) : false;
	
	  if (true === this.perMessageDeflate) this.perMessageDeflate = {};
	  if (this.perMessageDeflate && null == this.perMessageDeflate.threshold) {
	    this.perMessageDeflate.threshold = 1024;
	  }
	
	  // SSL options for Node.js client
	  this.pfx = opts.pfx || null;
	  this.key = opts.key || null;
	  this.passphrase = opts.passphrase || null;
	  this.cert = opts.cert || null;
	  this.ca = opts.ca || null;
	  this.ciphers = opts.ciphers || null;
	  this.rejectUnauthorized = opts.rejectUnauthorized === undefined ? null : opts.rejectUnauthorized;
	
	  // other options for Node.js client
	  var freeGlobal = typeof global == 'object' && global;
	  if (freeGlobal.global === freeGlobal) {
	    if (opts.extraHeaders && Object.keys(opts.extraHeaders).length > 0) {
	      this.extraHeaders = opts.extraHeaders;
	    }
	  }
	
	  this.open();
	}
	
	Socket.priorWebsocketSuccess = false;
	
	/**
	 * Mix in `Emitter`.
	 */
	
	Emitter(Socket.prototype);
	
	/**
	 * Protocol version.
	 *
	 * @api public
	 */
	
	Socket.protocol = parser.protocol; // this is an int
	
	/**
	 * Expose deps for legacy compatibility
	 * and standalone browser access.
	 */
	
	Socket.Socket = Socket;
	Socket.Transport = __webpack_require__(25);
	Socket.transports = __webpack_require__(20);
	Socket.parser = __webpack_require__(26);
	
	/**
	 * Creates transport of the given type.
	 *
	 * @param {String} transport name
	 * @return {Transport}
	 * @api private
	 */
	
	Socket.prototype.createTransport = function (name) {
	  debug('creating transport "%s"', name);
	  var query = clone(this.query);
	
	  // append engine.io protocol identifier
	  query.EIO = parser.protocol;
	
	  // transport name
	  query.transport = name;
	
	  // session id if we already have one
	  if (this.id) query.sid = this.id;
	
	  var transport = new transports[name]({
	    agent: this.agent,
	    hostname: this.hostname,
	    port: this.port,
	    secure: this.secure,
	    path: this.path,
	    query: query,
	    forceJSONP: this.forceJSONP,
	    jsonp: this.jsonp,
	    forceBase64: this.forceBase64,
	    enablesXDR: this.enablesXDR,
	    timestampRequests: this.timestampRequests,
	    timestampParam: this.timestampParam,
	    policyPort: this.policyPort,
	    socket: this,
	    pfx: this.pfx,
	    key: this.key,
	    passphrase: this.passphrase,
	    cert: this.cert,
	    ca: this.ca,
	    ciphers: this.ciphers,
	    rejectUnauthorized: this.rejectUnauthorized,
	    perMessageDeflate: this.perMessageDeflate,
	    extraHeaders: this.extraHeaders
	  });
	
	  return transport;
	};
	
	function clone (obj) {
	  var o = {};
	  for (var i in obj) {
	    if (obj.hasOwnProperty(i)) {
	      o[i] = obj[i];
	    }
	  }
	  return o;
	}
	
	/**
	 * Initializes transport to use and starts probe.
	 *
	 * @api private
	 */
	Socket.prototype.open = function () {
	  var transport;
	  if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') != -1) {
	    transport = 'websocket';
	  } else if (0 === this.transports.length) {
	    // Emit error on next tick so it can be listened to
	    var self = this;
	    setTimeout(function() {
	      self.emit('error', 'No transports available');
	    }, 0);
	    return;
	  } else {
	    transport = this.transports[0];
	  }
	  this.readyState = 'opening';
	
	  // Retry with the next transport if the transport is disabled (jsonp: false)
	  try {
	    transport = this.createTransport(transport);
	  } catch (e) {
	    this.transports.shift();
	    this.open();
	    return;
	  }
	
	  transport.open();
	  this.setTransport(transport);
	};
	
	/**
	 * Sets the current transport. Disables the existing one (if any).
	 *
	 * @api private
	 */
	
	Socket.prototype.setTransport = function(transport){
	  debug('setting transport %s', transport.name);
	  var self = this;
	
	  if (this.transport) {
	    debug('clearing existing transport %s', this.transport.name);
	    this.transport.removeAllListeners();
	  }
	
	  // set up transport
	  this.transport = transport;
	
	  // set up transport listeners
	  transport
	  .on('drain', function(){
	    self.onDrain();
	  })
	  .on('packet', function(packet){
	    self.onPacket(packet);
	  })
	  .on('error', function(e){
	    self.onError(e);
	  })
	  .on('close', function(){
	    self.onClose('transport close');
	  });
	};
	
	/**
	 * Probes a transport.
	 *
	 * @param {String} transport name
	 * @api private
	 */
	
	Socket.prototype.probe = function (name) {
	  debug('probing transport "%s"', name);
	  var transport = this.createTransport(name, { probe: 1 })
	    , failed = false
	    , self = this;
	
	  Socket.priorWebsocketSuccess = false;
	
	  function onTransportOpen(){
	    if (self.onlyBinaryUpgrades) {
	      var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
	      failed = failed || upgradeLosesBinary;
	    }
	    if (failed) return;
	
	    debug('probe transport "%s" opened', name);
	    transport.send([{ type: 'ping', data: 'probe' }]);
	    transport.once('packet', function (msg) {
	      if (failed) return;
	      if ('pong' == msg.type && 'probe' == msg.data) {
	        debug('probe transport "%s" pong', name);
	        self.upgrading = true;
	        self.emit('upgrading', transport);
	        if (!transport) return;
	        Socket.priorWebsocketSuccess = 'websocket' == transport.name;
	
	        debug('pausing current transport "%s"', self.transport.name);
	        self.transport.pause(function () {
	          if (failed) return;
	          if ('closed' == self.readyState) return;
	          debug('changing transport and sending upgrade packet');
	
	          cleanup();
	
	          self.setTransport(transport);
	          transport.send([{ type: 'upgrade' }]);
	          self.emit('upgrade', transport);
	          transport = null;
	          self.upgrading = false;
	          self.flush();
	        });
	      } else {
	        debug('probe transport "%s" failed', name);
	        var err = new Error('probe error');
	        err.transport = transport.name;
	        self.emit('upgradeError', err);
	      }
	    });
	  }
	
	  function freezeTransport() {
	    if (failed) return;
	
	    // Any callback called by transport should be ignored since now
	    failed = true;
	
	    cleanup();
	
	    transport.close();
	    transport = null;
	  }
	
	  //Handle any error that happens while probing
	  function onerror(err) {
	    var error = new Error('probe error: ' + err);
	    error.transport = transport.name;
	
	    freezeTransport();
	
	    debug('probe transport "%s" failed because of error: %s', name, err);
	
	    self.emit('upgradeError', error);
	  }
	
	  function onTransportClose(){
	    onerror("transport closed");
	  }
	
	  //When the socket is closed while we're probing
	  function onclose(){
	    onerror("socket closed");
	  }
	
	  //When the socket is upgraded while we're probing
	  function onupgrade(to){
	    if (transport && to.name != transport.name) {
	      debug('"%s" works - aborting "%s"', to.name, transport.name);
	      freezeTransport();
	    }
	  }
	
	  //Remove all listeners on the transport and on self
	  function cleanup(){
	    transport.removeListener('open', onTransportOpen);
	    transport.removeListener('error', onerror);
	    transport.removeListener('close', onTransportClose);
	    self.removeListener('close', onclose);
	    self.removeListener('upgrading', onupgrade);
	  }
	
	  transport.once('open', onTransportOpen);
	  transport.once('error', onerror);
	  transport.once('close', onTransportClose);
	
	  this.once('close', onclose);
	  this.once('upgrading', onupgrade);
	
	  transport.open();
	
	};
	
	/**
	 * Called when connection is deemed open.
	 *
	 * @api public
	 */
	
	Socket.prototype.onOpen = function () {
	  debug('socket open');
	  this.readyState = 'open';
	  Socket.priorWebsocketSuccess = 'websocket' == this.transport.name;
	  this.emit('open');
	  this.flush();
	
	  // we check for `readyState` in case an `open`
	  // listener already closed the socket
	  if ('open' == this.readyState && this.upgrade && this.transport.pause) {
	    debug('starting upgrade probes');
	    for (var i = 0, l = this.upgrades.length; i < l; i++) {
	      this.probe(this.upgrades[i]);
	    }
	  }
	};
	
	/**
	 * Handles a packet.
	 *
	 * @api private
	 */
	
	Socket.prototype.onPacket = function (packet) {
	  if ('opening' == this.readyState || 'open' == this.readyState) {
	    debug('socket receive: type "%s", data "%s"', packet.type, packet.data);
	
	    this.emit('packet', packet);
	
	    // Socket is live - any packet counts
	    this.emit('heartbeat');
	
	    switch (packet.type) {
	      case 'open':
	        this.onHandshake(parsejson(packet.data));
	        break;
	
	      case 'pong':
	        this.setPing();
	        this.emit('pong');
	        break;
	
	      case 'error':
	        var err = new Error('server error');
	        err.code = packet.data;
	        this.onError(err);
	        break;
	
	      case 'message':
	        this.emit('data', packet.data);
	        this.emit('message', packet.data);
	        break;
	    }
	  } else {
	    debug('packet received with socket readyState "%s"', this.readyState);
	  }
	};
	
	/**
	 * Called upon handshake completion.
	 *
	 * @param {Object} handshake obj
	 * @api private
	 */
	
	Socket.prototype.onHandshake = function (data) {
	  this.emit('handshake', data);
	  this.id = data.sid;
	  this.transport.query.sid = data.sid;
	  this.upgrades = this.filterUpgrades(data.upgrades);
	  this.pingInterval = data.pingInterval;
	  this.pingTimeout = data.pingTimeout;
	  this.onOpen();
	  // In case open handler closes socket
	  if  ('closed' == this.readyState) return;
	  this.setPing();
	
	  // Prolong liveness of socket on heartbeat
	  this.removeListener('heartbeat', this.onHeartbeat);
	  this.on('heartbeat', this.onHeartbeat);
	};
	
	/**
	 * Resets ping timeout.
	 *
	 * @api private
	 */
	
	Socket.prototype.onHeartbeat = function (timeout) {
	  clearTimeout(this.pingTimeoutTimer);
	  var self = this;
	  self.pingTimeoutTimer = setTimeout(function () {
	    if ('closed' == self.readyState) return;
	    self.onClose('ping timeout');
	  }, timeout || (self.pingInterval + self.pingTimeout));
	};
	
	/**
	 * Pings server every `this.pingInterval` and expects response
	 * within `this.pingTimeout` or closes connection.
	 *
	 * @api private
	 */
	
	Socket.prototype.setPing = function () {
	  var self = this;
	  clearTimeout(self.pingIntervalTimer);
	  self.pingIntervalTimer = setTimeout(function () {
	    debug('writing ping packet - expecting pong within %sms', self.pingTimeout);
	    self.ping();
	    self.onHeartbeat(self.pingTimeout);
	  }, self.pingInterval);
	};
	
	/**
	* Sends a ping packet.
	*
	* @api private
	*/
	
	Socket.prototype.ping = function () {
	  var self = this;
	  this.sendPacket('ping', function(){
	    self.emit('ping');
	  });
	};
	
	/**
	 * Called on `drain` event
	 *
	 * @api private
	 */
	
	Socket.prototype.onDrain = function() {
	  this.writeBuffer.splice(0, this.prevBufferLen);
	
	  // setting prevBufferLen = 0 is very important
	  // for example, when upgrading, upgrade packet is sent over,
	  // and a nonzero prevBufferLen could cause problems on `drain`
	  this.prevBufferLen = 0;
	
	  if (0 === this.writeBuffer.length) {
	    this.emit('drain');
	  } else {
	    this.flush();
	  }
	};
	
	/**
	 * Flush write buffers.
	 *
	 * @api private
	 */
	
	Socket.prototype.flush = function () {
	  if ('closed' != this.readyState && this.transport.writable &&
	    !this.upgrading && this.writeBuffer.length) {
	    debug('flushing %d packets in socket', this.writeBuffer.length);
	    this.transport.send(this.writeBuffer);
	    // keep track of current length of writeBuffer
	    // splice writeBuffer and callbackBuffer on `drain`
	    this.prevBufferLen = this.writeBuffer.length;
	    this.emit('flush');
	  }
	};
	
	/**
	 * Sends a message.
	 *
	 * @param {String} message.
	 * @param {Function} callback function.
	 * @param {Object} options.
	 * @return {Socket} for chaining.
	 * @api public
	 */
	
	Socket.prototype.write =
	Socket.prototype.send = function (msg, options, fn) {
	  this.sendPacket('message', msg, options, fn);
	  return this;
	};
	
	/**
	 * Sends a packet.
	 *
	 * @param {String} packet type.
	 * @param {String} data.
	 * @param {Object} options.
	 * @param {Function} callback function.
	 * @api private
	 */
	
	Socket.prototype.sendPacket = function (type, data, options, fn) {
	  if('function' == typeof data) {
	    fn = data;
	    data = undefined;
	  }
	
	  if ('function' == typeof options) {
	    fn = options;
	    options = null;
	  }
	
	  if ('closing' == this.readyState || 'closed' == this.readyState) {
	    return;
	  }
	
	  options = options || {};
	  options.compress = false !== options.compress;
	
	  var packet = {
	    type: type,
	    data: data,
	    options: options
	  };
	  this.emit('packetCreate', packet);
	  this.writeBuffer.push(packet);
	  if (fn) this.once('flush', fn);
	  this.flush();
	};
	
	/**
	 * Closes the connection.
	 *
	 * @api private
	 */
	
	Socket.prototype.close = function () {
	  if ('opening' == this.readyState || 'open' == this.readyState) {
	    this.readyState = 'closing';
	
	    var self = this;
	
	    if (this.writeBuffer.length) {
	      this.once('drain', function() {
	        if (this.upgrading) {
	          waitForUpgrade();
	        } else {
	          close();
	        }
	      });
	    } else if (this.upgrading) {
	      waitForUpgrade();
	    } else {
	      close();
	    }
	  }
	
	  function close() {
	    self.onClose('forced close');
	    debug('socket closing - telling transport to close');
	    self.transport.close();
	  }
	
	  function cleanupAndClose() {
	    self.removeListener('upgrade', cleanupAndClose);
	    self.removeListener('upgradeError', cleanupAndClose);
	    close();
	  }
	
	  function waitForUpgrade() {
	    // wait for upgrade to finish since we can't send packets while pausing a transport
	    self.once('upgrade', cleanupAndClose);
	    self.once('upgradeError', cleanupAndClose);
	  }
	
	  return this;
	};
	
	/**
	 * Called upon transport error
	 *
	 * @api private
	 */
	
	Socket.prototype.onError = function (err) {
	  debug('socket error %j', err);
	  Socket.priorWebsocketSuccess = false;
	  this.emit('error', err);
	  this.onClose('transport error', err);
	};
	
	/**
	 * Called upon transport close.
	 *
	 * @api private
	 */
	
	Socket.prototype.onClose = function (reason, desc) {
	  if ('opening' == this.readyState || 'open' == this.readyState || 'closing' == this.readyState) {
	    debug('socket close with reason: "%s"', reason);
	    var self = this;
	
	    // clear timers
	    clearTimeout(this.pingIntervalTimer);
	    clearTimeout(this.pingTimeoutTimer);
	
	    // stop event from firing again for transport
	    this.transport.removeAllListeners('close');
	
	    // ensure transport won't stay open
	    this.transport.close();
	
	    // ignore further transport communication
	    this.transport.removeAllListeners();
	
	    // set ready state
	    this.readyState = 'closed';
	
	    // clear session id
	    this.id = null;
	
	    // emit close event
	    this.emit('close', reason, desc);
	
	    // clean buffers after, so users can still
	    // grab the buffers on `close` event
	    self.writeBuffer = [];
	    self.prevBufferLen = 0;
	  }
	};
	
	/**
	 * Filters upgrades, returning only those matching client transports.
	 *
	 * @param {Array} server upgrades
	 * @api private
	 *
	 */
	
	Socket.prototype.filterUpgrades = function (upgrades) {
	  var filteredUpgrades = [];
	  for (var i = 0, j = upgrades.length; i<j; i++) {
	    if (~index(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
	  }
	  return filteredUpgrades;
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Module dependencies
	 */
	
	var XMLHttpRequest = __webpack_require__(21);
	var XHR = __webpack_require__(23);
	var JSONP = __webpack_require__(37);
	var websocket = __webpack_require__(38);
	
	/**
	 * Export transports.
	 */
	
	exports.polling = polling;
	exports.websocket = websocket;
	
	/**
	 * Polling transport polymorphic constructor.
	 * Decides on xhr vs jsonp based on feature detection.
	 *
	 * @api private
	 */
	
	function polling(opts){
	  var xhr;
	  var xd = false;
	  var xs = false;
	  var jsonp = false !== opts.jsonp;
	
	  if (global.location) {
	    var isSSL = 'https:' == location.protocol;
	    var port = location.port;
	
	    // some user agents have empty `location.port`
	    if (!port) {
	      port = isSSL ? 443 : 80;
	    }
	
	    xd = opts.hostname != location.hostname || port != opts.port;
	    xs = opts.secure != isSSL;
	  }
	
	  opts.xdomain = xd;
	  opts.xscheme = xs;
	  xhr = new XMLHttpRequest(opts);
	
	  if ('open' in xhr && !opts.forceJSONP) {
	    return new XHR(opts);
	  } else {
	    if (!jsonp) throw new Error('JSONP disabled');
	    return new JSONP(opts);
	  }
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	// browser shim for xmlhttprequest module
	var hasCORS = __webpack_require__(22);
	
	module.exports = function(opts) {
	  var xdomain = opts.xdomain;
	
	  // scheme must be same when usign XDomainRequest
	  // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
	  var xscheme = opts.xscheme;
	
	  // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
	  // https://github.com/Automattic/engine.io-client/pull/217
	  var enablesXDR = opts.enablesXDR;
	
	  // XMLHttpRequest can be disabled on IE
	  try {
	    if ('undefined' != typeof XMLHttpRequest && (!xdomain || hasCORS)) {
	      return new XMLHttpRequest();
	    }
	  } catch (e) { }
	
	  // Use XDomainRequest for IE8 if enablesXDR is true
	  // because loading bar keeps flashing when using jsonp-polling
	  // https://github.com/yujiosaka/socke.io-ie8-loading-example
	  try {
	    if ('undefined' != typeof XDomainRequest && !xscheme && enablesXDR) {
	      return new XDomainRequest();
	    }
	  } catch (e) { }
	
	  if (!xdomain) {
	    try {
	      return new ActiveXObject('Microsoft.XMLHTTP');
	    } catch(e) { }
	  }
	}


/***/ },
/* 22 */
/***/ function(module, exports) {

	
	/**
	 * Module exports.
	 *
	 * Logic borrowed from Modernizr:
	 *
	 *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
	 */
	
	try {
	  module.exports = typeof XMLHttpRequest !== 'undefined' &&
	    'withCredentials' in new XMLHttpRequest();
	} catch (err) {
	  // if XMLHttp support is disabled in IE then it will throw
	  // when trying to create
	  module.exports = false;
	}


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Module requirements.
	 */
	
	var XMLHttpRequest = __webpack_require__(21);
	var Polling = __webpack_require__(24);
	var Emitter = __webpack_require__(13);
	var inherit = __webpack_require__(35);
	var debug = __webpack_require__(5)('engine.io-client:polling-xhr');
	
	/**
	 * Module exports.
	 */
	
	module.exports = XHR;
	module.exports.Request = Request;
	
	/**
	 * Empty function
	 */
	
	function empty(){}
	
	/**
	 * XHR Polling constructor.
	 *
	 * @param {Object} opts
	 * @api public
	 */
	
	function XHR(opts){
	  Polling.call(this, opts);
	
	  if (global.location) {
	    var isSSL = 'https:' == location.protocol;
	    var port = location.port;
	
	    // some user agents have empty `location.port`
	    if (!port) {
	      port = isSSL ? 443 : 80;
	    }
	
	    this.xd = opts.hostname != global.location.hostname ||
	      port != opts.port;
	    this.xs = opts.secure != isSSL;
	  } else {
	    this.extraHeaders = opts.extraHeaders;
	  }
	}
	
	/**
	 * Inherits from Polling.
	 */
	
	inherit(XHR, Polling);
	
	/**
	 * XHR supports binary
	 */
	
	XHR.prototype.supportsBinary = true;
	
	/**
	 * Creates a request.
	 *
	 * @param {String} method
	 * @api private
	 */
	
	XHR.prototype.request = function(opts){
	  opts = opts || {};
	  opts.uri = this.uri();
	  opts.xd = this.xd;
	  opts.xs = this.xs;
	  opts.agent = this.agent || false;
	  opts.supportsBinary = this.supportsBinary;
	  opts.enablesXDR = this.enablesXDR;
	
	  // SSL options for Node.js client
	  opts.pfx = this.pfx;
	  opts.key = this.key;
	  opts.passphrase = this.passphrase;
	  opts.cert = this.cert;
	  opts.ca = this.ca;
	  opts.ciphers = this.ciphers;
	  opts.rejectUnauthorized = this.rejectUnauthorized;
	
	  // other options for Node.js client
	  opts.extraHeaders = this.extraHeaders;
	
	  return new Request(opts);
	};
	
	/**
	 * Sends data.
	 *
	 * @param {String} data to send.
	 * @param {Function} called upon flush.
	 * @api private
	 */
	
	XHR.prototype.doWrite = function(data, fn){
	  var isBinary = typeof data !== 'string' && data !== undefined;
	  var req = this.request({ method: 'POST', data: data, isBinary: isBinary });
	  var self = this;
	  req.on('success', fn);
	  req.on('error', function(err){
	    self.onError('xhr post error', err);
	  });
	  this.sendXhr = req;
	};
	
	/**
	 * Starts a poll cycle.
	 *
	 * @api private
	 */
	
	XHR.prototype.doPoll = function(){
	  debug('xhr poll');
	  var req = this.request();
	  var self = this;
	  req.on('data', function(data){
	    self.onData(data);
	  });
	  req.on('error', function(err){
	    self.onError('xhr poll error', err);
	  });
	  this.pollXhr = req;
	};
	
	/**
	 * Request constructor
	 *
	 * @param {Object} options
	 * @api public
	 */
	
	function Request(opts){
	  this.method = opts.method || 'GET';
	  this.uri = opts.uri;
	  this.xd = !!opts.xd;
	  this.xs = !!opts.xs;
	  this.async = false !== opts.async;
	  this.data = undefined != opts.data ? opts.data : null;
	  this.agent = opts.agent;
	  this.isBinary = opts.isBinary;
	  this.supportsBinary = opts.supportsBinary;
	  this.enablesXDR = opts.enablesXDR;
	
	  // SSL options for Node.js client
	  this.pfx = opts.pfx;
	  this.key = opts.key;
	  this.passphrase = opts.passphrase;
	  this.cert = opts.cert;
	  this.ca = opts.ca;
	  this.ciphers = opts.ciphers;
	  this.rejectUnauthorized = opts.rejectUnauthorized;
	
	  // other options for Node.js client
	  this.extraHeaders = opts.extraHeaders;
	
	  this.create();
	}
	
	/**
	 * Mix in `Emitter`.
	 */
	
	Emitter(Request.prototype);
	
	/**
	 * Creates the XHR object and sends the request.
	 *
	 * @api private
	 */
	
	Request.prototype.create = function(){
	  var opts = { agent: this.agent, xdomain: this.xd, xscheme: this.xs, enablesXDR: this.enablesXDR };
	
	  // SSL options for Node.js client
	  opts.pfx = this.pfx;
	  opts.key = this.key;
	  opts.passphrase = this.passphrase;
	  opts.cert = this.cert;
	  opts.ca = this.ca;
	  opts.ciphers = this.ciphers;
	  opts.rejectUnauthorized = this.rejectUnauthorized;
	
	  var xhr = this.xhr = new XMLHttpRequest(opts);
	  var self = this;
	
	  try {
	    debug('xhr open %s: %s', this.method, this.uri);
	    xhr.open(this.method, this.uri, this.async);
	    try {
	      if (this.extraHeaders) {
	        xhr.setDisableHeaderCheck(true);
	        for (var i in this.extraHeaders) {
	          if (this.extraHeaders.hasOwnProperty(i)) {
	            xhr.setRequestHeader(i, this.extraHeaders[i]);
	          }
	        }
	      }
	    } catch (e) {}
	    if (this.supportsBinary) {
	      // This has to be done after open because Firefox is stupid
	      // http://stackoverflow.com/questions/13216903/get-binary-data-with-xmlhttprequest-in-a-firefox-extension
	      xhr.responseType = 'arraybuffer';
	    }
	
	    if ('POST' == this.method) {
	      try {
	        if (this.isBinary) {
	          xhr.setRequestHeader('Content-type', 'application/octet-stream');
	        } else {
	          xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
	        }
	      } catch (e) {}
	    }
	
	    // ie6 check
	    if ('withCredentials' in xhr) {
	      xhr.withCredentials = true;
	    }
	
	    if (this.hasXDR()) {
	      xhr.onload = function(){
	        self.onLoad();
	      };
	      xhr.onerror = function(){
	        self.onError(xhr.responseText);
	      };
	    } else {
	      xhr.onreadystatechange = function(){
	        if (4 != xhr.readyState) return;
	        if (200 == xhr.status || 1223 == xhr.status) {
	          self.onLoad();
	        } else {
	          // make sure the `error` event handler that's user-set
	          // does not throw in the same tick and gets caught here
	          setTimeout(function(){
	            self.onError(xhr.status);
	          }, 0);
	        }
	      };
	    }
	
	    debug('xhr data %s', this.data);
	    xhr.send(this.data);
	  } catch (e) {
	    // Need to defer since .create() is called directly fhrom the constructor
	    // and thus the 'error' event can only be only bound *after* this exception
	    // occurs.  Therefore, also, we cannot throw here at all.
	    setTimeout(function() {
	      self.onError(e);
	    }, 0);
	    return;
	  }
	
	  if (global.document) {
	    this.index = Request.requestsCount++;
	    Request.requests[this.index] = this;
	  }
	};
	
	/**
	 * Called upon successful response.
	 *
	 * @api private
	 */
	
	Request.prototype.onSuccess = function(){
	  this.emit('success');
	  this.cleanup();
	};
	
	/**
	 * Called if we have data.
	 *
	 * @api private
	 */
	
	Request.prototype.onData = function(data){
	  this.emit('data', data);
	  this.onSuccess();
	};
	
	/**
	 * Called upon error.
	 *
	 * @api private
	 */
	
	Request.prototype.onError = function(err){
	  this.emit('error', err);
	  this.cleanup(true);
	};
	
	/**
	 * Cleans up house.
	 *
	 * @api private
	 */
	
	Request.prototype.cleanup = function(fromError){
	  if ('undefined' == typeof this.xhr || null === this.xhr) {
	    return;
	  }
	  // xmlhttprequest
	  if (this.hasXDR()) {
	    this.xhr.onload = this.xhr.onerror = empty;
	  } else {
	    this.xhr.onreadystatechange = empty;
	  }
	
	  if (fromError) {
	    try {
	      this.xhr.abort();
	    } catch(e) {}
	  }
	
	  if (global.document) {
	    delete Request.requests[this.index];
	  }
	
	  this.xhr = null;
	};
	
	/**
	 * Called upon load.
	 *
	 * @api private
	 */
	
	Request.prototype.onLoad = function(){
	  var data;
	  try {
	    var contentType;
	    try {
	      contentType = this.xhr.getResponseHeader('Content-Type').split(';')[0];
	    } catch (e) {}
	    if (contentType === 'application/octet-stream') {
	      data = this.xhr.response;
	    } else {
	      if (!this.supportsBinary) {
	        data = this.xhr.responseText;
	      } else {
	        try {
	          data = String.fromCharCode.apply(null, new Uint8Array(this.xhr.response));
	        } catch (e) {
	          var ui8Arr = new Uint8Array(this.xhr.response);
	          var dataArray = [];
	          for (var idx = 0, length = ui8Arr.length; idx < length; idx++) {
	            dataArray.push(ui8Arr[idx]);
	          }
	
	          data = String.fromCharCode.apply(null, dataArray);
	        }
	      }
	    }
	  } catch (e) {
	    this.onError(e);
	  }
	  if (null != data) {
	    this.onData(data);
	  }
	};
	
	/**
	 * Check if it has XDomainRequest.
	 *
	 * @api private
	 */
	
	Request.prototype.hasXDR = function(){
	  return 'undefined' !== typeof global.XDomainRequest && !this.xs && this.enablesXDR;
	};
	
	/**
	 * Aborts the request.
	 *
	 * @api public
	 */
	
	Request.prototype.abort = function(){
	  this.cleanup();
	};
	
	/**
	 * Aborts pending requests when unloading the window. This is needed to prevent
	 * memory leaks (e.g. when using IE) and to ensure that no spurious error is
	 * emitted.
	 */
	
	if (global.document) {
	  Request.requestsCount = 0;
	  Request.requests = {};
	  if (global.attachEvent) {
	    global.attachEvent('onunload', unloadHandler);
	  } else if (global.addEventListener) {
	    global.addEventListener('beforeunload', unloadHandler, false);
	  }
	}
	
	function unloadHandler() {
	  for (var i in Request.requests) {
	    if (Request.requests.hasOwnProperty(i)) {
	      Request.requests[i].abort();
	    }
	  }
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */
	
	var Transport = __webpack_require__(25);
	var parseqs = __webpack_require__(34);
	var parser = __webpack_require__(26);
	var inherit = __webpack_require__(35);
	var yeast = __webpack_require__(36);
	var debug = __webpack_require__(5)('engine.io-client:polling');
	
	/**
	 * Module exports.
	 */
	
	module.exports = Polling;
	
	/**
	 * Is XHR2 supported?
	 */
	
	var hasXHR2 = (function() {
	  var XMLHttpRequest = __webpack_require__(21);
	  var xhr = new XMLHttpRequest({ xdomain: false });
	  return null != xhr.responseType;
	})();
	
	/**
	 * Polling interface.
	 *
	 * @param {Object} opts
	 * @api private
	 */
	
	function Polling(opts){
	  var forceBase64 = (opts && opts.forceBase64);
	  if (!hasXHR2 || forceBase64) {
	    this.supportsBinary = false;
	  }
	  Transport.call(this, opts);
	}
	
	/**
	 * Inherits from Transport.
	 */
	
	inherit(Polling, Transport);
	
	/**
	 * Transport name.
	 */
	
	Polling.prototype.name = 'polling';
	
	/**
	 * Opens the socket (triggers polling). We write a PING message to determine
	 * when the transport is open.
	 *
	 * @api private
	 */
	
	Polling.prototype.doOpen = function(){
	  this.poll();
	};
	
	/**
	 * Pauses polling.
	 *
	 * @param {Function} callback upon buffers are flushed and transport is paused
	 * @api private
	 */
	
	Polling.prototype.pause = function(onPause){
	  var pending = 0;
	  var self = this;
	
	  this.readyState = 'pausing';
	
	  function pause(){
	    debug('paused');
	    self.readyState = 'paused';
	    onPause();
	  }
	
	  if (this.polling || !this.writable) {
	    var total = 0;
	
	    if (this.polling) {
	      debug('we are currently polling - waiting to pause');
	      total++;
	      this.once('pollComplete', function(){
	        debug('pre-pause polling complete');
	        --total || pause();
	      });
	    }
	
	    if (!this.writable) {
	      debug('we are currently writing - waiting to pause');
	      total++;
	      this.once('drain', function(){
	        debug('pre-pause writing complete');
	        --total || pause();
	      });
	    }
	  } else {
	    pause();
	  }
	};
	
	/**
	 * Starts polling cycle.
	 *
	 * @api public
	 */
	
	Polling.prototype.poll = function(){
	  debug('polling');
	  this.polling = true;
	  this.doPoll();
	  this.emit('poll');
	};
	
	/**
	 * Overloads onData to detect payloads.
	 *
	 * @api private
	 */
	
	Polling.prototype.onData = function(data){
	  var self = this;
	  debug('polling got data %s', data);
	  var callback = function(packet, index, total) {
	    // if its the first message we consider the transport open
	    if ('opening' == self.readyState) {
	      self.onOpen();
	    }
	
	    // if its a close packet, we close the ongoing requests
	    if ('close' == packet.type) {
	      self.onClose();
	      return false;
	    }
	
	    // otherwise bypass onData and handle the message
	    self.onPacket(packet);
	  };
	
	  // decode payload
	  parser.decodePayload(data, this.socket.binaryType, callback);
	
	  // if an event did not trigger closing
	  if ('closed' != this.readyState) {
	    // if we got data we're not polling
	    this.polling = false;
	    this.emit('pollComplete');
	
	    if ('open' == this.readyState) {
	      this.poll();
	    } else {
	      debug('ignoring poll - transport state "%s"', this.readyState);
	    }
	  }
	};
	
	/**
	 * For polling, send a close packet.
	 *
	 * @api private
	 */
	
	Polling.prototype.doClose = function(){
	  var self = this;
	
	  function close(){
	    debug('writing close packet');
	    self.write([{ type: 'close' }]);
	  }
	
	  if ('open' == this.readyState) {
	    debug('transport open - closing');
	    close();
	  } else {
	    // in case we're trying to close while
	    // handshaking is in progress (GH-164)
	    debug('transport not open - deferring close');
	    this.once('open', close);
	  }
	};
	
	/**
	 * Writes a packets payload.
	 *
	 * @param {Array} data packets
	 * @param {Function} drain callback
	 * @api private
	 */
	
	Polling.prototype.write = function(packets){
	  var self = this;
	  this.writable = false;
	  var callbackfn = function() {
	    self.writable = true;
	    self.emit('drain');
	  };
	
	  var self = this;
	  parser.encodePayload(packets, this.supportsBinary, function(data) {
	    self.doWrite(data, callbackfn);
	  });
	};
	
	/**
	 * Generates uri for connection.
	 *
	 * @api private
	 */
	
	Polling.prototype.uri = function(){
	  var query = this.query || {};
	  var schema = this.secure ? 'https' : 'http';
	  var port = '';
	
	  // cache busting is forced
	  if (false !== this.timestampRequests) {
	    query[this.timestampParam] = yeast();
	  }
	
	  if (!this.supportsBinary && !query.sid) {
	    query.b64 = 1;
	  }
	
	  query = parseqs.encode(query);
	
	  // avoid port if default for schema
	  if (this.port && (('https' == schema && this.port != 443) ||
	     ('http' == schema && this.port != 80))) {
	    port = ':' + this.port;
	  }
	
	  // prepend ? to query
	  if (query.length) {
	    query = '?' + query;
	  }
	
	  var ipv6 = this.hostname.indexOf(':') !== -1;
	  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
	};


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */
	
	var parser = __webpack_require__(26);
	var Emitter = __webpack_require__(13);
	
	/**
	 * Module exports.
	 */
	
	module.exports = Transport;
	
	/**
	 * Transport abstract constructor.
	 *
	 * @param {Object} options.
	 * @api private
	 */
	
	function Transport (opts) {
	  this.path = opts.path;
	  this.hostname = opts.hostname;
	  this.port = opts.port;
	  this.secure = opts.secure;
	  this.query = opts.query;
	  this.timestampParam = opts.timestampParam;
	  this.timestampRequests = opts.timestampRequests;
	  this.readyState = '';
	  this.agent = opts.agent || false;
	  this.socket = opts.socket;
	  this.enablesXDR = opts.enablesXDR;
	
	  // SSL options for Node.js client
	  this.pfx = opts.pfx;
	  this.key = opts.key;
	  this.passphrase = opts.passphrase;
	  this.cert = opts.cert;
	  this.ca = opts.ca;
	  this.ciphers = opts.ciphers;
	  this.rejectUnauthorized = opts.rejectUnauthorized;
	
	  // other options for Node.js client
	  this.extraHeaders = opts.extraHeaders;
	}
	
	/**
	 * Mix in `Emitter`.
	 */
	
	Emitter(Transport.prototype);
	
	/**
	 * Emits an error.
	 *
	 * @param {String} str
	 * @return {Transport} for chaining
	 * @api public
	 */
	
	Transport.prototype.onError = function (msg, desc) {
	  var err = new Error(msg);
	  err.type = 'TransportError';
	  err.description = desc;
	  this.emit('error', err);
	  return this;
	};
	
	/**
	 * Opens the transport.
	 *
	 * @api public
	 */
	
	Transport.prototype.open = function () {
	  if ('closed' == this.readyState || '' == this.readyState) {
	    this.readyState = 'opening';
	    this.doOpen();
	  }
	
	  return this;
	};
	
	/**
	 * Closes the transport.
	 *
	 * @api private
	 */
	
	Transport.prototype.close = function () {
	  if ('opening' == this.readyState || 'open' == this.readyState) {
	    this.doClose();
	    this.onClose();
	  }
	
	  return this;
	};
	
	/**
	 * Sends multiple packets.
	 *
	 * @param {Array} packets
	 * @api private
	 */
	
	Transport.prototype.send = function(packets){
	  if ('open' == this.readyState) {
	    this.write(packets);
	  } else {
	    throw new Error('Transport not open');
	  }
	};
	
	/**
	 * Called upon open
	 *
	 * @api private
	 */
	
	Transport.prototype.onOpen = function () {
	  this.readyState = 'open';
	  this.writable = true;
	  this.emit('open');
	};
	
	/**
	 * Called with data.
	 *
	 * @param {String} data
	 * @api private
	 */
	
	Transport.prototype.onData = function(data){
	  var packet = parser.decodePacket(data, this.socket.binaryType);
	  this.onPacket(packet);
	};
	
	/**
	 * Called with a decoded packet.
	 */
	
	Transport.prototype.onPacket = function (packet) {
	  this.emit('packet', packet);
	};
	
	/**
	 * Called upon close.
	 *
	 * @api private
	 */
	
	Transport.prototype.onClose = function () {
	  this.readyState = 'closed';
	  this.emit('close');
	};


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Module dependencies.
	 */
	
	var keys = __webpack_require__(27);
	var hasBinary = __webpack_require__(28);
	var sliceBuffer = __webpack_require__(29);
	var base64encoder = __webpack_require__(30);
	var after = __webpack_require__(31);
	var utf8 = __webpack_require__(32);
	
	/**
	 * Check if we are running an android browser. That requires us to use
	 * ArrayBuffer with polling transports...
	 *
	 * http://ghinda.net/jpeg-blob-ajax-android/
	 */
	
	var isAndroid = navigator.userAgent.match(/Android/i);
	
	/**
	 * Check if we are running in PhantomJS.
	 * Uploading a Blob with PhantomJS does not work correctly, as reported here:
	 * https://github.com/ariya/phantomjs/issues/11395
	 * @type boolean
	 */
	var isPhantomJS = /PhantomJS/i.test(navigator.userAgent);
	
	/**
	 * When true, avoids using Blobs to encode payloads.
	 * @type boolean
	 */
	var dontSendBlobs = isAndroid || isPhantomJS;
	
	/**
	 * Current protocol version.
	 */
	
	exports.protocol = 3;
	
	/**
	 * Packet types.
	 */
	
	var packets = exports.packets = {
	    open:     0    // non-ws
	  , close:    1    // non-ws
	  , ping:     2
	  , pong:     3
	  , message:  4
	  , upgrade:  5
	  , noop:     6
	};
	
	var packetslist = keys(packets);
	
	/**
	 * Premade error packet.
	 */
	
	var err = { type: 'error', data: 'parser error' };
	
	/**
	 * Create a blob api even for blob builder when vendor prefixes exist
	 */
	
	var Blob = __webpack_require__(33);
	
	/**
	 * Encodes a packet.
	 *
	 *     <packet type id> [ <data> ]
	 *
	 * Example:
	 *
	 *     5hello world
	 *     3
	 *     4
	 *
	 * Binary is encoded in an identical principle
	 *
	 * @api private
	 */
	
	exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) {
	  if ('function' == typeof supportsBinary) {
	    callback = supportsBinary;
	    supportsBinary = false;
	  }
	
	  if ('function' == typeof utf8encode) {
	    callback = utf8encode;
	    utf8encode = null;
	  }
	
	  var data = (packet.data === undefined)
	    ? undefined
	    : packet.data.buffer || packet.data;
	
	  if (global.ArrayBuffer && data instanceof ArrayBuffer) {
	    return encodeArrayBuffer(packet, supportsBinary, callback);
	  } else if (Blob && data instanceof global.Blob) {
	    return encodeBlob(packet, supportsBinary, callback);
	  }
	
	  // might be an object with { base64: true, data: dataAsBase64String }
	  if (data && data.base64) {
	    return encodeBase64Object(packet, callback);
	  }
	
	  // Sending data as a utf-8 string
	  var encoded = packets[packet.type];
	
	  // data fragment is optional
	  if (undefined !== packet.data) {
	    encoded += utf8encode ? utf8.encode(String(packet.data)) : String(packet.data);
	  }
	
	  return callback('' + encoded);
	
	};
	
	function encodeBase64Object(packet, callback) {
	  // packet data is an object { base64: true, data: dataAsBase64String }
	  var message = 'b' + exports.packets[packet.type] + packet.data.data;
	  return callback(message);
	}
	
	/**
	 * Encode packet helpers for binary types
	 */
	
	function encodeArrayBuffer(packet, supportsBinary, callback) {
	  if (!supportsBinary) {
	    return exports.encodeBase64Packet(packet, callback);
	  }
	
	  var data = packet.data;
	  var contentArray = new Uint8Array(data);
	  var resultBuffer = new Uint8Array(1 + data.byteLength);
	
	  resultBuffer[0] = packets[packet.type];
	  for (var i = 0; i < contentArray.length; i++) {
	    resultBuffer[i+1] = contentArray[i];
	  }
	
	  return callback(resultBuffer.buffer);
	}
	
	function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
	  if (!supportsBinary) {
	    return exports.encodeBase64Packet(packet, callback);
	  }
	
	  var fr = new FileReader();
	  fr.onload = function() {
	    packet.data = fr.result;
	    exports.encodePacket(packet, supportsBinary, true, callback);
	  };
	  return fr.readAsArrayBuffer(packet.data);
	}
	
	function encodeBlob(packet, supportsBinary, callback) {
	  if (!supportsBinary) {
	    return exports.encodeBase64Packet(packet, callback);
	  }
	
	  if (dontSendBlobs) {
	    return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
	  }
	
	  var length = new Uint8Array(1);
	  length[0] = packets[packet.type];
	  var blob = new Blob([length.buffer, packet.data]);
	
	  return callback(blob);
	}
	
	/**
	 * Encodes a packet with binary data in a base64 string
	 *
	 * @param {Object} packet, has `type` and `data`
	 * @return {String} base64 encoded message
	 */
	
	exports.encodeBase64Packet = function(packet, callback) {
	  var message = 'b' + exports.packets[packet.type];
	  if (Blob && packet.data instanceof global.Blob) {
	    var fr = new FileReader();
	    fr.onload = function() {
	      var b64 = fr.result.split(',')[1];
	      callback(message + b64);
	    };
	    return fr.readAsDataURL(packet.data);
	  }
	
	  var b64data;
	  try {
	    b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
	  } catch (e) {
	    // iPhone Safari doesn't let you apply with typed arrays
	    var typed = new Uint8Array(packet.data);
	    var basic = new Array(typed.length);
	    for (var i = 0; i < typed.length; i++) {
	      basic[i] = typed[i];
	    }
	    b64data = String.fromCharCode.apply(null, basic);
	  }
	  message += global.btoa(b64data);
	  return callback(message);
	};
	
	/**
	 * Decodes a packet. Changes format to Blob if requested.
	 *
	 * @return {Object} with `type` and `data` (if any)
	 * @api private
	 */
	
	exports.decodePacket = function (data, binaryType, utf8decode) {
	  // String data
	  if (typeof data == 'string' || data === undefined) {
	    if (data.charAt(0) == 'b') {
	      return exports.decodeBase64Packet(data.substr(1), binaryType);
	    }
	
	    if (utf8decode) {
	      try {
	        data = utf8.decode(data);
	      } catch (e) {
	        return err;
	      }
	    }
	    var type = data.charAt(0);
	
	    if (Number(type) != type || !packetslist[type]) {
	      return err;
	    }
	
	    if (data.length > 1) {
	      return { type: packetslist[type], data: data.substring(1) };
	    } else {
	      return { type: packetslist[type] };
	    }
	  }
	
	  var asArray = new Uint8Array(data);
	  var type = asArray[0];
	  var rest = sliceBuffer(data, 1);
	  if (Blob && binaryType === 'blob') {
	    rest = new Blob([rest]);
	  }
	  return { type: packetslist[type], data: rest };
	};
	
	/**
	 * Decodes a packet encoded in a base64 string
	 *
	 * @param {String} base64 encoded message
	 * @return {Object} with `type` and `data` (if any)
	 */
	
	exports.decodeBase64Packet = function(msg, binaryType) {
	  var type = packetslist[msg.charAt(0)];
	  if (!global.ArrayBuffer) {
	    return { type: type, data: { base64: true, data: msg.substr(1) } };
	  }
	
	  var data = base64encoder.decode(msg.substr(1));
	
	  if (binaryType === 'blob' && Blob) {
	    data = new Blob([data]);
	  }
	
	  return { type: type, data: data };
	};
	
	/**
	 * Encodes multiple messages (payload).
	 *
	 *     <length>:data
	 *
	 * Example:
	 *
	 *     11:hello world2:hi
	 *
	 * If any contents are binary, they will be encoded as base64 strings. Base64
	 * encoded strings are marked with a b before the length specifier
	 *
	 * @param {Array} packets
	 * @api private
	 */
	
	exports.encodePayload = function (packets, supportsBinary, callback) {
	  if (typeof supportsBinary == 'function') {
	    callback = supportsBinary;
	    supportsBinary = null;
	  }
	
	  var isBinary = hasBinary(packets);
	
	  if (supportsBinary && isBinary) {
	    if (Blob && !dontSendBlobs) {
	      return exports.encodePayloadAsBlob(packets, callback);
	    }
	
	    return exports.encodePayloadAsArrayBuffer(packets, callback);
	  }
	
	  if (!packets.length) {
	    return callback('0:');
	  }
	
	  function setLengthHeader(message) {
	    return message.length + ':' + message;
	  }
	
	  function encodeOne(packet, doneCallback) {
	    exports.encodePacket(packet, !isBinary ? false : supportsBinary, true, function(message) {
	      doneCallback(null, setLengthHeader(message));
	    });
	  }
	
	  map(packets, encodeOne, function(err, results) {
	    return callback(results.join(''));
	  });
	};
	
	/**
	 * Async array map using after
	 */
	
	function map(ary, each, done) {
	  var result = new Array(ary.length);
	  var next = after(ary.length, done);
	
	  var eachWithIndex = function(i, el, cb) {
	    each(el, function(error, msg) {
	      result[i] = msg;
	      cb(error, result);
	    });
	  };
	
	  for (var i = 0; i < ary.length; i++) {
	    eachWithIndex(i, ary[i], next);
	  }
	}
	
	/*
	 * Decodes data when a payload is maybe expected. Possible binary contents are
	 * decoded from their base64 representation
	 *
	 * @param {String} data, callback method
	 * @api public
	 */
	
	exports.decodePayload = function (data, binaryType, callback) {
	  if (typeof data != 'string') {
	    return exports.decodePayloadAsBinary(data, binaryType, callback);
	  }
	
	  if (typeof binaryType === 'function') {
	    callback = binaryType;
	    binaryType = null;
	  }
	
	  var packet;
	  if (data == '') {
	    // parser error - ignoring payload
	    return callback(err, 0, 1);
	  }
	
	  var length = ''
	    , n, msg;
	
	  for (var i = 0, l = data.length; i < l; i++) {
	    var chr = data.charAt(i);
	
	    if (':' != chr) {
	      length += chr;
	    } else {
	      if ('' == length || (length != (n = Number(length)))) {
	        // parser error - ignoring payload
	        return callback(err, 0, 1);
	      }
	
	      msg = data.substr(i + 1, n);
	
	      if (length != msg.length) {
	        // parser error - ignoring payload
	        return callback(err, 0, 1);
	      }
	
	      if (msg.length) {
	        packet = exports.decodePacket(msg, binaryType, true);
	
	        if (err.type == packet.type && err.data == packet.data) {
	          // parser error in individual packet - ignoring payload
	          return callback(err, 0, 1);
	        }
	
	        var ret = callback(packet, i + n, l);
	        if (false === ret) return;
	      }
	
	      // advance cursor
	      i += n;
	      length = '';
	    }
	  }
	
	  if (length != '') {
	    // parser error - ignoring payload
	    return callback(err, 0, 1);
	  }
	
	};
	
	/**
	 * Encodes multiple messages (payload) as binary.
	 *
	 * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
	 * 255><data>
	 *
	 * Example:
	 * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
	 *
	 * @param {Array} packets
	 * @return {ArrayBuffer} encoded payload
	 * @api private
	 */
	
	exports.encodePayloadAsArrayBuffer = function(packets, callback) {
	  if (!packets.length) {
	    return callback(new ArrayBuffer(0));
	  }
	
	  function encodeOne(packet, doneCallback) {
	    exports.encodePacket(packet, true, true, function(data) {
	      return doneCallback(null, data);
	    });
	  }
	
	  map(packets, encodeOne, function(err, encodedPackets) {
	    var totalLength = encodedPackets.reduce(function(acc, p) {
	      var len;
	      if (typeof p === 'string'){
	        len = p.length;
	      } else {
	        len = p.byteLength;
	      }
	      return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
	    }, 0);
	
	    var resultArray = new Uint8Array(totalLength);
	
	    var bufferIndex = 0;
	    encodedPackets.forEach(function(p) {
	      var isString = typeof p === 'string';
	      var ab = p;
	      if (isString) {
	        var view = new Uint8Array(p.length);
	        for (var i = 0; i < p.length; i++) {
	          view[i] = p.charCodeAt(i);
	        }
	        ab = view.buffer;
	      }
	
	      if (isString) { // not true binary
	        resultArray[bufferIndex++] = 0;
	      } else { // true binary
	        resultArray[bufferIndex++] = 1;
	      }
	
	      var lenStr = ab.byteLength.toString();
	      for (var i = 0; i < lenStr.length; i++) {
	        resultArray[bufferIndex++] = parseInt(lenStr[i]);
	      }
	      resultArray[bufferIndex++] = 255;
	
	      var view = new Uint8Array(ab);
	      for (var i = 0; i < view.length; i++) {
	        resultArray[bufferIndex++] = view[i];
	      }
	    });
	
	    return callback(resultArray.buffer);
	  });
	};
	
	/**
	 * Encode as Blob
	 */
	
	exports.encodePayloadAsBlob = function(packets, callback) {
	  function encodeOne(packet, doneCallback) {
	    exports.encodePacket(packet, true, true, function(encoded) {
	      var binaryIdentifier = new Uint8Array(1);
	      binaryIdentifier[0] = 1;
	      if (typeof encoded === 'string') {
	        var view = new Uint8Array(encoded.length);
	        for (var i = 0; i < encoded.length; i++) {
	          view[i] = encoded.charCodeAt(i);
	        }
	        encoded = view.buffer;
	        binaryIdentifier[0] = 0;
	      }
	
	      var len = (encoded instanceof ArrayBuffer)
	        ? encoded.byteLength
	        : encoded.size;
	
	      var lenStr = len.toString();
	      var lengthAry = new Uint8Array(lenStr.length + 1);
	      for (var i = 0; i < lenStr.length; i++) {
	        lengthAry[i] = parseInt(lenStr[i]);
	      }
	      lengthAry[lenStr.length] = 255;
	
	      if (Blob) {
	        var blob = new Blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
	        doneCallback(null, blob);
	      }
	    });
	  }
	
	  map(packets, encodeOne, function(err, results) {
	    return callback(new Blob(results));
	  });
	};
	
	/*
	 * Decodes data when a payload is maybe expected. Strings are decoded by
	 * interpreting each byte as a key code for entries marked to start with 0. See
	 * description of encodePayloadAsBinary
	 *
	 * @param {ArrayBuffer} data, callback method
	 * @api public
	 */
	
	exports.decodePayloadAsBinary = function (data, binaryType, callback) {
	  if (typeof binaryType === 'function') {
	    callback = binaryType;
	    binaryType = null;
	  }
	
	  var bufferTail = data;
	  var buffers = [];
	
	  var numberTooLong = false;
	  while (bufferTail.byteLength > 0) {
	    var tailArray = new Uint8Array(bufferTail);
	    var isString = tailArray[0] === 0;
	    var msgLength = '';
	
	    for (var i = 1; ; i++) {
	      if (tailArray[i] == 255) break;
	
	      if (msgLength.length > 310) {
	        numberTooLong = true;
	        break;
	      }
	
	      msgLength += tailArray[i];
	    }
	
	    if(numberTooLong) return callback(err, 0, 1);
	
	    bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
	    msgLength = parseInt(msgLength);
	
	    var msg = sliceBuffer(bufferTail, 0, msgLength);
	    if (isString) {
	      try {
	        msg = String.fromCharCode.apply(null, new Uint8Array(msg));
	      } catch (e) {
	        // iPhone Safari doesn't let you apply to typed arrays
	        var typed = new Uint8Array(msg);
	        msg = '';
	        for (var i = 0; i < typed.length; i++) {
	          msg += String.fromCharCode(typed[i]);
	        }
	      }
	    }
	
	    buffers.push(msg);
	    bufferTail = sliceBuffer(bufferTail, msgLength);
	  }
	
	  var total = buffers.length;
	  buffers.forEach(function(buffer, i) {
	    callback(exports.decodePacket(buffer, binaryType, true), i, total);
	  });
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 27 */
/***/ function(module, exports) {

	
	/**
	 * Gets the keys for an object.
	 *
	 * @return {Array} keys
	 * @api private
	 */
	
	module.exports = Object.keys || function keys (obj){
	  var arr = [];
	  var has = Object.prototype.hasOwnProperty;
	
	  for (var i in obj) {
	    if (has.call(obj, i)) {
	      arr.push(i);
	    }
	  }
	  return arr;
	};


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {
	/*
	 * Module requirements.
	 */
	
	var isArray = __webpack_require__(12);
	
	/**
	 * Module exports.
	 */
	
	module.exports = hasBinary;
	
	/**
	 * Checks for binary data.
	 *
	 * Right now only Buffer and ArrayBuffer are supported..
	 *
	 * @param {Object} anything
	 * @api public
	 */
	
	function hasBinary(data) {
	
	  function _hasBinary(obj) {
	    if (!obj) return false;
	
	    if ( (global.Buffer && global.Buffer.isBuffer(obj)) ||
	         (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
	         (global.Blob && obj instanceof Blob) ||
	         (global.File && obj instanceof File)
	        ) {
	      return true;
	    }
	
	    if (isArray(obj)) {
	      for (var i = 0; i < obj.length; i++) {
	          if (_hasBinary(obj[i])) {
	              return true;
	          }
	      }
	    } else if (obj && 'object' == typeof obj) {
	      if (obj.toJSON) {
	        obj = obj.toJSON();
	      }
	
	      for (var key in obj) {
	        if (Object.prototype.hasOwnProperty.call(obj, key) && _hasBinary(obj[key])) {
	          return true;
	        }
	      }
	    }
	
	    return false;
	  }
	
	  return _hasBinary(data);
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 29 */
/***/ function(module, exports) {

	/**
	 * An abstraction for slicing an arraybuffer even when
	 * ArrayBuffer.prototype.slice is not supported
	 *
	 * @api public
	 */
	
	module.exports = function(arraybuffer, start, end) {
	  var bytes = arraybuffer.byteLength;
	  start = start || 0;
	  end = end || bytes;
	
	  if (arraybuffer.slice) { return arraybuffer.slice(start, end); }
	
	  if (start < 0) { start += bytes; }
	  if (end < 0) { end += bytes; }
	  if (end > bytes) { end = bytes; }
	
	  if (start >= bytes || start >= end || bytes === 0) {
	    return new ArrayBuffer(0);
	  }
	
	  var abv = new Uint8Array(arraybuffer);
	  var result = new Uint8Array(end - start);
	  for (var i = start, ii = 0; i < end; i++, ii++) {
	    result[ii] = abv[i];
	  }
	  return result.buffer;
	};


/***/ },
/* 30 */
/***/ function(module, exports) {

	/*
	 * base64-arraybuffer
	 * https://github.com/niklasvh/base64-arraybuffer
	 *
	 * Copyright (c) 2012 Niklas von Hertzen
	 * Licensed under the MIT license.
	 */
	(function(chars){
	  "use strict";
	
	  exports.encode = function(arraybuffer) {
	    var bytes = new Uint8Array(arraybuffer),
	    i, len = bytes.length, base64 = "";
	
	    for (i = 0; i < len; i+=3) {
	      base64 += chars[bytes[i] >> 2];
	      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
	      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
	      base64 += chars[bytes[i + 2] & 63];
	    }
	
	    if ((len % 3) === 2) {
	      base64 = base64.substring(0, base64.length - 1) + "=";
	    } else if (len % 3 === 1) {
	      base64 = base64.substring(0, base64.length - 2) + "==";
	    }
	
	    return base64;
	  };
	
	  exports.decode =  function(base64) {
	    var bufferLength = base64.length * 0.75,
	    len = base64.length, i, p = 0,
	    encoded1, encoded2, encoded3, encoded4;
	
	    if (base64[base64.length - 1] === "=") {
	      bufferLength--;
	      if (base64[base64.length - 2] === "=") {
	        bufferLength--;
	      }
	    }
	
	    var arraybuffer = new ArrayBuffer(bufferLength),
	    bytes = new Uint8Array(arraybuffer);
	
	    for (i = 0; i < len; i+=4) {
	      encoded1 = chars.indexOf(base64[i]);
	      encoded2 = chars.indexOf(base64[i+1]);
	      encoded3 = chars.indexOf(base64[i+2]);
	      encoded4 = chars.indexOf(base64[i+3]);
	
	      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
	      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
	      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
	    }
	
	    return arraybuffer;
	  };
	})("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");


/***/ },
/* 31 */
/***/ function(module, exports) {

	module.exports = after
	
	function after(count, callback, err_cb) {
	    var bail = false
	    err_cb = err_cb || noop
	    proxy.count = count
	
	    return (count === 0) ? callback() : proxy
	
	    function proxy(err, result) {
	        if (proxy.count <= 0) {
	            throw new Error('after called too many times')
	        }
	        --proxy.count
	
	        // after first error, rest are passed to err_cb
	        if (err) {
	            bail = true
	            callback(err)
	            // future error callbacks will go to error handler
	            callback = err_cb
	        } else if (proxy.count === 0 && !bail) {
	            callback(null, result)
	        }
	    }
	}
	
	function noop() {}


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/*! https://mths.be/utf8js v2.0.0 by @mathias */
	;(function(root) {
	
		// Detect free variables `exports`
		var freeExports = typeof exports == 'object' && exports;
	
		// Detect free variable `module`
		var freeModule = typeof module == 'object' && module &&
			module.exports == freeExports && module;
	
		// Detect free variable `global`, from Node.js or Browserified code,
		// and use it as `root`
		var freeGlobal = typeof global == 'object' && global;
		if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
			root = freeGlobal;
		}
	
		/*--------------------------------------------------------------------------*/
	
		var stringFromCharCode = String.fromCharCode;
	
		// Taken from https://mths.be/punycode
		function ucs2decode(string) {
			var output = [];
			var counter = 0;
			var length = string.length;
			var value;
			var extra;
			while (counter < length) {
				value = string.charCodeAt(counter++);
				if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
					// high surrogate, and there is a next character
					extra = string.charCodeAt(counter++);
					if ((extra & 0xFC00) == 0xDC00) { // low surrogate
						output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
					} else {
						// unmatched surrogate; only append this code unit, in case the next
						// code unit is the high surrogate of a surrogate pair
						output.push(value);
						counter--;
					}
				} else {
					output.push(value);
				}
			}
			return output;
		}
	
		// Taken from https://mths.be/punycode
		function ucs2encode(array) {
			var length = array.length;
			var index = -1;
			var value;
			var output = '';
			while (++index < length) {
				value = array[index];
				if (value > 0xFFFF) {
					value -= 0x10000;
					output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
					value = 0xDC00 | value & 0x3FF;
				}
				output += stringFromCharCode(value);
			}
			return output;
		}
	
		function checkScalarValue(codePoint) {
			if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
				throw Error(
					'Lone surrogate U+' + codePoint.toString(16).toUpperCase() +
					' is not a scalar value'
				);
			}
		}
		/*--------------------------------------------------------------------------*/
	
		function createByte(codePoint, shift) {
			return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
		}
	
		function encodeCodePoint(codePoint) {
			if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
				return stringFromCharCode(codePoint);
			}
			var symbol = '';
			if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
				symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
			}
			else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
				checkScalarValue(codePoint);
				symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
				symbol += createByte(codePoint, 6);
			}
			else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
				symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
				symbol += createByte(codePoint, 12);
				symbol += createByte(codePoint, 6);
			}
			symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
			return symbol;
		}
	
		function utf8encode(string) {
			var codePoints = ucs2decode(string);
			var length = codePoints.length;
			var index = -1;
			var codePoint;
			var byteString = '';
			while (++index < length) {
				codePoint = codePoints[index];
				byteString += encodeCodePoint(codePoint);
			}
			return byteString;
		}
	
		/*--------------------------------------------------------------------------*/
	
		function readContinuationByte() {
			if (byteIndex >= byteCount) {
				throw Error('Invalid byte index');
			}
	
			var continuationByte = byteArray[byteIndex] & 0xFF;
			byteIndex++;
	
			if ((continuationByte & 0xC0) == 0x80) {
				return continuationByte & 0x3F;
			}
	
			// If we end up here, it’s not a continuation byte
			throw Error('Invalid continuation byte');
		}
	
		function decodeSymbol() {
			var byte1;
			var byte2;
			var byte3;
			var byte4;
			var codePoint;
	
			if (byteIndex > byteCount) {
				throw Error('Invalid byte index');
			}
	
			if (byteIndex == byteCount) {
				return false;
			}
	
			// Read first byte
			byte1 = byteArray[byteIndex] & 0xFF;
			byteIndex++;
	
			// 1-byte sequence (no continuation bytes)
			if ((byte1 & 0x80) == 0) {
				return byte1;
			}
	
			// 2-byte sequence
			if ((byte1 & 0xE0) == 0xC0) {
				var byte2 = readContinuationByte();
				codePoint = ((byte1 & 0x1F) << 6) | byte2;
				if (codePoint >= 0x80) {
					return codePoint;
				} else {
					throw Error('Invalid continuation byte');
				}
			}
	
			// 3-byte sequence (may include unpaired surrogates)
			if ((byte1 & 0xF0) == 0xE0) {
				byte2 = readContinuationByte();
				byte3 = readContinuationByte();
				codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
				if (codePoint >= 0x0800) {
					checkScalarValue(codePoint);
					return codePoint;
				} else {
					throw Error('Invalid continuation byte');
				}
			}
	
			// 4-byte sequence
			if ((byte1 & 0xF8) == 0xF0) {
				byte2 = readContinuationByte();
				byte3 = readContinuationByte();
				byte4 = readContinuationByte();
				codePoint = ((byte1 & 0x0F) << 0x12) | (byte2 << 0x0C) |
					(byte3 << 0x06) | byte4;
				if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
					return codePoint;
				}
			}
	
			throw Error('Invalid UTF-8 detected');
		}
	
		var byteArray;
		var byteCount;
		var byteIndex;
		function utf8decode(byteString) {
			byteArray = ucs2decode(byteString);
			byteCount = byteArray.length;
			byteIndex = 0;
			var codePoints = [];
			var tmp;
			while ((tmp = decodeSymbol()) !== false) {
				codePoints.push(tmp);
			}
			return ucs2encode(codePoints);
		}
	
		/*--------------------------------------------------------------------------*/
	
		var utf8 = {
			'version': '2.0.0',
			'encode': utf8encode,
			'decode': utf8decode
		};
	
		// Some AMD build optimizers, like r.js, check for specific condition patterns
		// like the following:
		if (
			true
		) {
			!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
				return utf8;
			}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		}	else if (freeExports && !freeExports.nodeType) {
			if (freeModule) { // in Node.js or RingoJS v0.8.0+
				freeModule.exports = utf8;
			} else { // in Narwhal or RingoJS v0.7.0-
				var object = {};
				var hasOwnProperty = object.hasOwnProperty;
				for (var key in utf8) {
					hasOwnProperty.call(utf8, key) && (freeExports[key] = utf8[key]);
				}
			}
		} else { // in Rhino or a web browser
			root.utf8 = utf8;
		}
	
	}(this));
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10)(module), (function() { return this; }())))

/***/ },
/* 33 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Create a blob builder even when vendor prefixes exist
	 */
	
	var BlobBuilder = global.BlobBuilder
	  || global.WebKitBlobBuilder
	  || global.MSBlobBuilder
	  || global.MozBlobBuilder;
	
	/**
	 * Check if Blob constructor is supported
	 */
	
	var blobSupported = (function() {
	  try {
	    var a = new Blob(['hi']);
	    return a.size === 2;
	  } catch(e) {
	    return false;
	  }
	})();
	
	/**
	 * Check if Blob constructor supports ArrayBufferViews
	 * Fails in Safari 6, so we need to map to ArrayBuffers there.
	 */
	
	var blobSupportsArrayBufferView = blobSupported && (function() {
	  try {
	    var b = new Blob([new Uint8Array([1,2])]);
	    return b.size === 2;
	  } catch(e) {
	    return false;
	  }
	})();
	
	/**
	 * Check if BlobBuilder is supported
	 */
	
	var blobBuilderSupported = BlobBuilder
	  && BlobBuilder.prototype.append
	  && BlobBuilder.prototype.getBlob;
	
	/**
	 * Helper function that maps ArrayBufferViews to ArrayBuffers
	 * Used by BlobBuilder constructor and old browsers that didn't
	 * support it in the Blob constructor.
	 */
	
	function mapArrayBufferViews(ary) {
	  for (var i = 0; i < ary.length; i++) {
	    var chunk = ary[i];
	    if (chunk.buffer instanceof ArrayBuffer) {
	      var buf = chunk.buffer;
	
	      // if this is a subarray, make a copy so we only
	      // include the subarray region from the underlying buffer
	      if (chunk.byteLength !== buf.byteLength) {
	        var copy = new Uint8Array(chunk.byteLength);
	        copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
	        buf = copy.buffer;
	      }
	
	      ary[i] = buf;
	    }
	  }
	}
	
	function BlobBuilderConstructor(ary, options) {
	  options = options || {};
	
	  var bb = new BlobBuilder();
	  mapArrayBufferViews(ary);
	
	  for (var i = 0; i < ary.length; i++) {
	    bb.append(ary[i]);
	  }
	
	  return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
	};
	
	function BlobConstructor(ary, options) {
	  mapArrayBufferViews(ary);
	  return new Blob(ary, options || {});
	};
	
	module.exports = (function() {
	  if (blobSupported) {
	    return blobSupportsArrayBufferView ? global.Blob : BlobConstructor;
	  } else if (blobBuilderSupported) {
	    return BlobBuilderConstructor;
	  } else {
	    return undefined;
	  }
	})();
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 34 */
/***/ function(module, exports) {

	/**
	 * Compiles a querystring
	 * Returns string representation of the object
	 *
	 * @param {Object}
	 * @api private
	 */
	
	exports.encode = function (obj) {
	  var str = '';
	
	  for (var i in obj) {
	    if (obj.hasOwnProperty(i)) {
	      if (str.length) str += '&';
	      str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
	    }
	  }
	
	  return str;
	};
	
	/**
	 * Parses a simple querystring into an object
	 *
	 * @param {String} qs
	 * @api private
	 */
	
	exports.decode = function(qs){
	  var qry = {};
	  var pairs = qs.split('&');
	  for (var i = 0, l = pairs.length; i < l; i++) {
	    var pair = pairs[i].split('=');
	    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
	  }
	  return qry;
	};


/***/ },
/* 35 */
/***/ function(module, exports) {

	
	module.exports = function(a, b){
	  var fn = function(){};
	  fn.prototype = b.prototype;
	  a.prototype = new fn;
	  a.prototype.constructor = a;
	};

/***/ },
/* 36 */
/***/ function(module, exports) {

	'use strict';
	
	var alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split('')
	  , length = 64
	  , map = {}
	  , seed = 0
	  , i = 0
	  , prev;
	
	/**
	 * Return a string representing the specified number.
	 *
	 * @param {Number} num The number to convert.
	 * @returns {String} The string representation of the number.
	 * @api public
	 */
	function encode(num) {
	  var encoded = '';
	
	  do {
	    encoded = alphabet[num % length] + encoded;
	    num = Math.floor(num / length);
	  } while (num > 0);
	
	  return encoded;
	}
	
	/**
	 * Return the integer value specified by the given string.
	 *
	 * @param {String} str The string to convert.
	 * @returns {Number} The integer value represented by the string.
	 * @api public
	 */
	function decode(str) {
	  var decoded = 0;
	
	  for (i = 0; i < str.length; i++) {
	    decoded = decoded * length + map[str.charAt(i)];
	  }
	
	  return decoded;
	}
	
	/**
	 * Yeast: A tiny growing id generator.
	 *
	 * @returns {String} A unique id.
	 * @api public
	 */
	function yeast() {
	  var now = encode(+new Date());
	
	  if (now !== prev) return seed = 0, prev = now;
	  return now +'.'+ encode(seed++);
	}
	
	//
	// Map each character to its index.
	//
	for (; i < length; i++) map[alphabet[i]] = i;
	
	//
	// Expose the `yeast`, `encode` and `decode` functions.
	//
	yeast.encode = encode;
	yeast.decode = decode;
	module.exports = yeast;


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {
	/**
	 * Module requirements.
	 */
	
	var Polling = __webpack_require__(24);
	var inherit = __webpack_require__(35);
	
	/**
	 * Module exports.
	 */
	
	module.exports = JSONPPolling;
	
	/**
	 * Cached regular expressions.
	 */
	
	var rNewline = /\n/g;
	var rEscapedNewline = /\\n/g;
	
	/**
	 * Global JSONP callbacks.
	 */
	
	var callbacks;
	
	/**
	 * Callbacks count.
	 */
	
	var index = 0;
	
	/**
	 * Noop.
	 */
	
	function empty () { }
	
	/**
	 * JSONP Polling constructor.
	 *
	 * @param {Object} opts.
	 * @api public
	 */
	
	function JSONPPolling (opts) {
	  Polling.call(this, opts);
	
	  this.query = this.query || {};
	
	  // define global callbacks array if not present
	  // we do this here (lazily) to avoid unneeded global pollution
	  if (!callbacks) {
	    // we need to consider multiple engines in the same page
	    if (!global.___eio) global.___eio = [];
	    callbacks = global.___eio;
	  }
	
	  // callback identifier
	  this.index = callbacks.length;
	
	  // add callback to jsonp global
	  var self = this;
	  callbacks.push(function (msg) {
	    self.onData(msg);
	  });
	
	  // append to query string
	  this.query.j = this.index;
	
	  // prevent spurious errors from being emitted when the window is unloaded
	  if (global.document && global.addEventListener) {
	    global.addEventListener('beforeunload', function () {
	      if (self.script) self.script.onerror = empty;
	    }, false);
	  }
	}
	
	/**
	 * Inherits from Polling.
	 */
	
	inherit(JSONPPolling, Polling);
	
	/*
	 * JSONP only supports binary as base64 encoded strings
	 */
	
	JSONPPolling.prototype.supportsBinary = false;
	
	/**
	 * Closes the socket.
	 *
	 * @api private
	 */
	
	JSONPPolling.prototype.doClose = function () {
	  if (this.script) {
	    this.script.parentNode.removeChild(this.script);
	    this.script = null;
	  }
	
	  if (this.form) {
	    this.form.parentNode.removeChild(this.form);
	    this.form = null;
	    this.iframe = null;
	  }
	
	  Polling.prototype.doClose.call(this);
	};
	
	/**
	 * Starts a poll cycle.
	 *
	 * @api private
	 */
	
	JSONPPolling.prototype.doPoll = function () {
	  var self = this;
	  var script = document.createElement('script');
	
	  if (this.script) {
	    this.script.parentNode.removeChild(this.script);
	    this.script = null;
	  }
	
	  script.async = true;
	  script.src = this.uri();
	  script.onerror = function(e){
	    self.onError('jsonp poll error',e);
	  };
	
	  var insertAt = document.getElementsByTagName('script')[0];
	  if (insertAt) {
	    insertAt.parentNode.insertBefore(script, insertAt);
	  }
	  else {
	    (document.head || document.body).appendChild(script);
	  }
	  this.script = script;
	
	  var isUAgecko = 'undefined' != typeof navigator && /gecko/i.test(navigator.userAgent);
	  
	  if (isUAgecko) {
	    setTimeout(function () {
	      var iframe = document.createElement('iframe');
	      document.body.appendChild(iframe);
	      document.body.removeChild(iframe);
	    }, 100);
	  }
	};
	
	/**
	 * Writes with a hidden iframe.
	 *
	 * @param {String} data to send
	 * @param {Function} called upon flush.
	 * @api private
	 */
	
	JSONPPolling.prototype.doWrite = function (data, fn) {
	  var self = this;
	
	  if (!this.form) {
	    var form = document.createElement('form');
	    var area = document.createElement('textarea');
	    var id = this.iframeId = 'eio_iframe_' + this.index;
	    var iframe;
	
	    form.className = 'socketio';
	    form.style.position = 'absolute';
	    form.style.top = '-1000px';
	    form.style.left = '-1000px';
	    form.target = id;
	    form.method = 'POST';
	    form.setAttribute('accept-charset', 'utf-8');
	    area.name = 'd';
	    form.appendChild(area);
	    document.body.appendChild(form);
	
	    this.form = form;
	    this.area = area;
	  }
	
	  this.form.action = this.uri();
	
	  function complete () {
	    initIframe();
	    fn();
	  }
	
	  function initIframe () {
	    if (self.iframe) {
	      try {
	        self.form.removeChild(self.iframe);
	      } catch (e) {
	        self.onError('jsonp polling iframe removal error', e);
	      }
	    }
	
	    try {
	      // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
	      var html = '<iframe src="javascript:0" name="'+ self.iframeId +'">';
	      iframe = document.createElement(html);
	    } catch (e) {
	      iframe = document.createElement('iframe');
	      iframe.name = self.iframeId;
	      iframe.src = 'javascript:0';
	    }
	
	    iframe.id = self.iframeId;
	
	    self.form.appendChild(iframe);
	    self.iframe = iframe;
	  }
	
	  initIframe();
	
	  // escape \n to prevent it from being converted into \r\n by some UAs
	  // double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side
	  data = data.replace(rEscapedNewline, '\\\n');
	  this.area.value = data.replace(rNewline, '\\n');
	
	  try {
	    this.form.submit();
	  } catch(e) {}
	
	  if (this.iframe.attachEvent) {
	    this.iframe.onreadystatechange = function(){
	      if (self.iframe.readyState == 'complete') {
	        complete();
	      }
	    };
	  } else {
	    this.iframe.onload = complete;
	  }
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Module dependencies.
	 */
	
	var Transport = __webpack_require__(25);
	var parser = __webpack_require__(26);
	var parseqs = __webpack_require__(34);
	var inherit = __webpack_require__(35);
	var yeast = __webpack_require__(36);
	var debug = __webpack_require__(5)('engine.io-client:websocket');
	var BrowserWebSocket = global.WebSocket || global.MozWebSocket;
	
	/**
	 * Get either the `WebSocket` or `MozWebSocket` globals
	 * in the browser or try to resolve WebSocket-compatible
	 * interface exposed by `ws` for Node-like environment.
	 */
	
	var WebSocket = BrowserWebSocket;
	if (!WebSocket && typeof window === 'undefined') {
	  try {
	    WebSocket = __webpack_require__(39);
	  } catch (e) { }
	}
	
	/**
	 * Module exports.
	 */
	
	module.exports = WS;
	
	/**
	 * WebSocket transport constructor.
	 *
	 * @api {Object} connection options
	 * @api public
	 */
	
	function WS(opts){
	  var forceBase64 = (opts && opts.forceBase64);
	  if (forceBase64) {
	    this.supportsBinary = false;
	  }
	  this.perMessageDeflate = opts.perMessageDeflate;
	  Transport.call(this, opts);
	}
	
	/**
	 * Inherits from Transport.
	 */
	
	inherit(WS, Transport);
	
	/**
	 * Transport name.
	 *
	 * @api public
	 */
	
	WS.prototype.name = 'websocket';
	
	/*
	 * WebSockets support binary
	 */
	
	WS.prototype.supportsBinary = true;
	
	/**
	 * Opens socket.
	 *
	 * @api private
	 */
	
	WS.prototype.doOpen = function(){
	  if (!this.check()) {
	    // let probe timeout
	    return;
	  }
	
	  var self = this;
	  var uri = this.uri();
	  var protocols = void(0);
	  var opts = {
	    agent: this.agent,
	    perMessageDeflate: this.perMessageDeflate
	  };
	
	  // SSL options for Node.js client
	  opts.pfx = this.pfx;
	  opts.key = this.key;
	  opts.passphrase = this.passphrase;
	  opts.cert = this.cert;
	  opts.ca = this.ca;
	  opts.ciphers = this.ciphers;
	  opts.rejectUnauthorized = this.rejectUnauthorized;
	  if (this.extraHeaders) {
	    opts.headers = this.extraHeaders;
	  }
	
	  this.ws = BrowserWebSocket ? new WebSocket(uri) : new WebSocket(uri, protocols, opts);
	
	  if (this.ws.binaryType === undefined) {
	    this.supportsBinary = false;
	  }
	
	  if (this.ws.supports && this.ws.supports.binary) {
	    this.supportsBinary = true;
	    this.ws.binaryType = 'buffer';
	  } else {
	    this.ws.binaryType = 'arraybuffer';
	  }
	
	  this.addEventListeners();
	};
	
	/**
	 * Adds event listeners to the socket
	 *
	 * @api private
	 */
	
	WS.prototype.addEventListeners = function(){
	  var self = this;
	
	  this.ws.onopen = function(){
	    self.onOpen();
	  };
	  this.ws.onclose = function(){
	    self.onClose();
	  };
	  this.ws.onmessage = function(ev){
	    self.onData(ev.data);
	  };
	  this.ws.onerror = function(e){
	    self.onError('websocket error', e);
	  };
	};
	
	/**
	 * Override `onData` to use a timer on iOS.
	 * See: https://gist.github.com/mloughran/2052006
	 *
	 * @api private
	 */
	
	if ('undefined' != typeof navigator
	  && /iPad|iPhone|iPod/i.test(navigator.userAgent)) {
	  WS.prototype.onData = function(data){
	    var self = this;
	    setTimeout(function(){
	      Transport.prototype.onData.call(self, data);
	    }, 0);
	  };
	}
	
	/**
	 * Writes data to socket.
	 *
	 * @param {Array} array of packets.
	 * @api private
	 */
	
	WS.prototype.write = function(packets){
	  var self = this;
	  this.writable = false;
	
	  // encodePacket efficient as it uses WS framing
	  // no need for encodePayload
	  var total = packets.length;
	  for (var i = 0, l = total; i < l; i++) {
	    (function(packet) {
	      parser.encodePacket(packet, self.supportsBinary, function(data) {
	        if (!BrowserWebSocket) {
	          // always create a new object (GH-437)
	          var opts = {};
	          if (packet.options) {
	            opts.compress = packet.options.compress;
	          }
	
	          if (self.perMessageDeflate) {
	            var len = 'string' == typeof data ? global.Buffer.byteLength(data) : data.length;
	            if (len < self.perMessageDeflate.threshold) {
	              opts.compress = false;
	            }
	          }
	        }
	
	        //Sometimes the websocket has already been closed but the browser didn't
	        //have a chance of informing us about it yet, in that case send will
	        //throw an error
	        try {
	          if (BrowserWebSocket) {
	            // TypeError is thrown when passing the second argument on Safari
	            self.ws.send(data);
	          } else {
	            self.ws.send(data, opts);
	          }
	        } catch (e){
	          debug('websocket closed before onclose event');
	        }
	
	        --total || done();
	      });
	    })(packets[i]);
	  }
	
	  function done(){
	    self.emit('flush');
	
	    // fake drain
	    // defer to next tick to allow Socket to clear writeBuffer
	    setTimeout(function(){
	      self.writable = true;
	      self.emit('drain');
	    }, 0);
	  }
	};
	
	/**
	 * Called upon close
	 *
	 * @api private
	 */
	
	WS.prototype.onClose = function(){
	  Transport.prototype.onClose.call(this);
	};
	
	/**
	 * Closes socket.
	 *
	 * @api private
	 */
	
	WS.prototype.doClose = function(){
	  if (typeof this.ws !== 'undefined') {
	    this.ws.close();
	  }
	};
	
	/**
	 * Generates uri for connection.
	 *
	 * @api private
	 */
	
	WS.prototype.uri = function(){
	  var query = this.query || {};
	  var schema = this.secure ? 'wss' : 'ws';
	  var port = '';
	
	  // avoid port if default for schema
	  if (this.port && (('wss' == schema && this.port != 443)
	    || ('ws' == schema && this.port != 80))) {
	    port = ':' + this.port;
	  }
	
	  // append timestamp to URI
	  if (this.timestampRequests) {
	    query[this.timestampParam] = yeast();
	  }
	
	  // communicate binary support capabilities
	  if (!this.supportsBinary) {
	    query.b64 = 1;
	  }
	
	  query = parseqs.encode(query);
	
	  // prepend ? to query
	  if (query.length) {
	    query = '?' + query;
	  }
	
	  var ipv6 = this.hostname.indexOf(':') !== -1;
	  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
	};
	
	/**
	 * Feature detection for WebSocket.
	 *
	 * @return {Boolean} whether this transport is available.
	 * @api public
	 */
	
	WS.prototype.check = function(){
	  return !!WebSocket && !('__initialize' in WebSocket && this.name === WS.prototype.name);
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 39 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 40 */
/***/ function(module, exports) {

	
	var indexOf = [].indexOf;
	
	module.exports = function(arr, obj){
	  if (indexOf) return arr.indexOf(obj);
	  for (var i = 0; i < arr.length; ++i) {
	    if (arr[i] === obj) return i;
	  }
	  return -1;
	};

/***/ },
/* 41 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * JSON parse.
	 *
	 * @see Based on jQuery#parseJSON (MIT) and JSON2
	 * @api private
	 */
	
	var rvalidchars = /^[\],:{}\s]*$/;
	var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
	var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
	var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
	var rtrimLeft = /^\s+/;
	var rtrimRight = /\s+$/;
	
	module.exports = function parsejson(data) {
	  if ('string' != typeof data || !data) {
	    return null;
	  }
	
	  data = data.replace(rtrimLeft, '').replace(rtrimRight, '');
	
	  // Attempt to parse using the native JSON parser first
	  if (global.JSON && JSON.parse) {
	    return JSON.parse(data);
	  }
	
	  if (rvalidchars.test(data.replace(rvalidescape, '@')
	      .replace(rvalidtokens, ']')
	      .replace(rvalidbraces, ''))) {
	    return (new Function('return ' + data))();
	  }
	};
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Module dependencies.
	 */
	
	var parser = __webpack_require__(8);
	var Emitter = __webpack_require__(43);
	var toArray = __webpack_require__(44);
	var on = __webpack_require__(45);
	var bind = __webpack_require__(46);
	var debug = __webpack_require__(5)('socket.io-client:socket');
	var hasBin = __webpack_require__(47);
	
	/**
	 * Module exports.
	 */
	
	module.exports = exports = Socket;
	
	/**
	 * Internal events (blacklisted).
	 * These events can't be emitted by the user.
	 *
	 * @api private
	 */
	
	var events = {
	  connect: 1,
	  connect_error: 1,
	  connect_timeout: 1,
	  connecting: 1,
	  disconnect: 1,
	  error: 1,
	  reconnect: 1,
	  reconnect_attempt: 1,
	  reconnect_failed: 1,
	  reconnect_error: 1,
	  reconnecting: 1,
	  ping: 1,
	  pong: 1
	};
	
	/**
	 * Shortcut to `Emitter#emit`.
	 */
	
	var emit = Emitter.prototype.emit;
	
	/**
	 * `Socket` constructor.
	 *
	 * @api public
	 */
	
	function Socket(io, nsp){
	  this.io = io;
	  this.nsp = nsp;
	  this.json = this; // compat
	  this.ids = 0;
	  this.acks = {};
	  this.receiveBuffer = [];
	  this.sendBuffer = [];
	  this.connected = false;
	  this.disconnected = true;
	  if (this.io.autoConnect) this.open();
	}
	
	/**
	 * Mix in `Emitter`.
	 */
	
	Emitter(Socket.prototype);
	
	/**
	 * Subscribe to open, close and packet events
	 *
	 * @api private
	 */
	
	Socket.prototype.subEvents = function() {
	  if (this.subs) return;
	
	  var io = this.io;
	  this.subs = [
	    on(io, 'open', bind(this, 'onopen')),
	    on(io, 'packet', bind(this, 'onpacket')),
	    on(io, 'close', bind(this, 'onclose'))
	  ];
	};
	
	/**
	 * "Opens" the socket.
	 *
	 * @api public
	 */
	
	Socket.prototype.open =
	Socket.prototype.connect = function(){
	  if (this.connected) return this;
	
	  this.subEvents();
	  this.io.open(); // ensure open
	  if ('open' == this.io.readyState) this.onopen();
	  this.emit('connecting');
	  return this;
	};
	
	/**
	 * Sends a `message` event.
	 *
	 * @return {Socket} self
	 * @api public
	 */
	
	Socket.prototype.send = function(){
	  var args = toArray(arguments);
	  args.unshift('message');
	  this.emit.apply(this, args);
	  return this;
	};
	
	/**
	 * Override `emit`.
	 * If the event is in `events`, it's emitted normally.
	 *
	 * @param {String} event name
	 * @return {Socket} self
	 * @api public
	 */
	
	Socket.prototype.emit = function(ev){
	  if (events.hasOwnProperty(ev)) {
	    emit.apply(this, arguments);
	    return this;
	  }
	
	  var args = toArray(arguments);
	  var parserType = parser.EVENT; // default
	  if (hasBin(args)) { parserType = parser.BINARY_EVENT; } // binary
	  var packet = { type: parserType, data: args };
	
	  packet.options = {};
	  packet.options.compress = !this.flags || false !== this.flags.compress;
	
	  // event ack callback
	  if ('function' == typeof args[args.length - 1]) {
	    debug('emitting packet with ack id %d', this.ids);
	    this.acks[this.ids] = args.pop();
	    packet.id = this.ids++;
	  }
	
	  if (this.connected) {
	    this.packet(packet);
	  } else {
	    this.sendBuffer.push(packet);
	  }
	
	  delete this.flags;
	
	  return this;
	};
	
	/**
	 * Sends a packet.
	 *
	 * @param {Object} packet
	 * @api private
	 */
	
	Socket.prototype.packet = function(packet){
	  packet.nsp = this.nsp;
	  this.io.packet(packet);
	};
	
	/**
	 * Called upon engine `open`.
	 *
	 * @api private
	 */
	
	Socket.prototype.onopen = function(){
	  debug('transport is open - connecting');
	
	  // write connect packet if necessary
	  if ('/' != this.nsp) {
	    this.packet({ type: parser.CONNECT });
	  }
	};
	
	/**
	 * Called upon engine `close`.
	 *
	 * @param {String} reason
	 * @api private
	 */
	
	Socket.prototype.onclose = function(reason){
	  debug('close (%s)', reason);
	  this.connected = false;
	  this.disconnected = true;
	  delete this.id;
	  this.emit('disconnect', reason);
	};
	
	/**
	 * Called with socket packet.
	 *
	 * @param {Object} packet
	 * @api private
	 */
	
	Socket.prototype.onpacket = function(packet){
	  if (packet.nsp != this.nsp) return;
	
	  switch (packet.type) {
	    case parser.CONNECT:
	      this.onconnect();
	      break;
	
	    case parser.EVENT:
	      this.onevent(packet);
	      break;
	
	    case parser.BINARY_EVENT:
	      this.onevent(packet);
	      break;
	
	    case parser.ACK:
	      this.onack(packet);
	      break;
	
	    case parser.BINARY_ACK:
	      this.onack(packet);
	      break;
	
	    case parser.DISCONNECT:
	      this.ondisconnect();
	      break;
	
	    case parser.ERROR:
	      this.emit('error', packet.data);
	      break;
	  }
	};
	
	/**
	 * Called upon a server event.
	 *
	 * @param {Object} packet
	 * @api private
	 */
	
	Socket.prototype.onevent = function(packet){
	  var args = packet.data || [];
	  debug('emitting event %j', args);
	
	  if (null != packet.id) {
	    debug('attaching ack callback to event');
	    args.push(this.ack(packet.id));
	  }
	
	  if (this.connected) {
	    emit.apply(this, args);
	  } else {
	    this.receiveBuffer.push(args);
	  }
	};
	
	/**
	 * Produces an ack callback to emit with an event.
	 *
	 * @api private
	 */
	
	Socket.prototype.ack = function(id){
	  var self = this;
	  var sent = false;
	  return function(){
	    // prevent double callbacks
	    if (sent) return;
	    sent = true;
	    var args = toArray(arguments);
	    debug('sending ack %j', args);
	
	    var type = hasBin(args) ? parser.BINARY_ACK : parser.ACK;
	    self.packet({
	      type: type,
	      id: id,
	      data: args
	    });
	  };
	};
	
	/**
	 * Called upon a server acknowlegement.
	 *
	 * @param {Object} packet
	 * @api private
	 */
	
	Socket.prototype.onack = function(packet){
	  var ack = this.acks[packet.id];
	  if ('function' == typeof ack) {
	    debug('calling ack %s with %j', packet.id, packet.data);
	    ack.apply(this, packet.data);
	    delete this.acks[packet.id];
	  } else {
	    debug('bad ack %s', packet.id);
	  }
	};
	
	/**
	 * Called upon server connect.
	 *
	 * @api private
	 */
	
	Socket.prototype.onconnect = function(){
	  this.connected = true;
	  this.disconnected = false;
	  this.emit('connect');
	  this.emitBuffered();
	};
	
	/**
	 * Emit buffered events (received and emitted).
	 *
	 * @api private
	 */
	
	Socket.prototype.emitBuffered = function(){
	  var i;
	  for (i = 0; i < this.receiveBuffer.length; i++) {
	    emit.apply(this, this.receiveBuffer[i]);
	  }
	  this.receiveBuffer = [];
	
	  for (i = 0; i < this.sendBuffer.length; i++) {
	    this.packet(this.sendBuffer[i]);
	  }
	  this.sendBuffer = [];
	};
	
	/**
	 * Called upon server disconnect.
	 *
	 * @api private
	 */
	
	Socket.prototype.ondisconnect = function(){
	  debug('server disconnect (%s)', this.nsp);
	  this.destroy();
	  this.onclose('io server disconnect');
	};
	
	/**
	 * Called upon forced client/server side disconnections,
	 * this method ensures the manager stops tracking us and
	 * that reconnections don't get triggered for this.
	 *
	 * @api private.
	 */
	
	Socket.prototype.destroy = function(){
	  if (this.subs) {
	    // clean subscriptions to avoid reconnections
	    for (var i = 0; i < this.subs.length; i++) {
	      this.subs[i].destroy();
	    }
	    this.subs = null;
	  }
	
	  this.io.destroy(this);
	};
	
	/**
	 * Disconnects the socket manually.
	 *
	 * @return {Socket} self
	 * @api public
	 */
	
	Socket.prototype.close =
	Socket.prototype.disconnect = function(){
	  if (this.connected) {
	    debug('performing disconnect (%s)', this.nsp);
	    this.packet({ type: parser.DISCONNECT });
	  }
	
	  // remove socket from pool
	  this.destroy();
	
	  if (this.connected) {
	    // fire events
	    this.onclose('io client disconnect');
	  }
	  return this;
	};
	
	/**
	 * Sets the compress flag.
	 *
	 * @param {Boolean} if `true`, compresses the sending data
	 * @return {Socket} self
	 * @api public
	 */
	
	Socket.prototype.compress = function(compress){
	  this.flags = this.flags || {};
	  this.flags.compress = compress;
	  return this;
	};


/***/ },
/* 43 */
/***/ function(module, exports) {

	
	/**
	 * Expose `Emitter`.
	 */
	
	module.exports = Emitter;
	
	/**
	 * Initialize a new `Emitter`.
	 *
	 * @api public
	 */
	
	function Emitter(obj) {
	  if (obj) return mixin(obj);
	};
	
	/**
	 * Mixin the emitter properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */
	
	function mixin(obj) {
	  for (var key in Emitter.prototype) {
	    obj[key] = Emitter.prototype[key];
	  }
	  return obj;
	}
	
	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.on =
	Emitter.prototype.addEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
	    .push(fn);
	  return this;
	};
	
	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.once = function(event, fn){
	  function on() {
	    this.off(event, on);
	    fn.apply(this, arguments);
	  }
	
	  on.fn = fn;
	  this.on(event, on);
	  return this;
	};
	
	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.off =
	Emitter.prototype.removeListener =
	Emitter.prototype.removeAllListeners =
	Emitter.prototype.removeEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	
	  // all
	  if (0 == arguments.length) {
	    this._callbacks = {};
	    return this;
	  }
	
	  // specific event
	  var callbacks = this._callbacks['$' + event];
	  if (!callbacks) return this;
	
	  // remove all handlers
	  if (1 == arguments.length) {
	    delete this._callbacks['$' + event];
	    return this;
	  }
	
	  // remove specific handler
	  var cb;
	  for (var i = 0; i < callbacks.length; i++) {
	    cb = callbacks[i];
	    if (cb === fn || cb.fn === fn) {
	      callbacks.splice(i, 1);
	      break;
	    }
	  }
	  return this;
	};
	
	/**
	 * Emit `event` with the given args.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 */
	
	Emitter.prototype.emit = function(event){
	  this._callbacks = this._callbacks || {};
	  var args = [].slice.call(arguments, 1)
	    , callbacks = this._callbacks['$' + event];
	
	  if (callbacks) {
	    callbacks = callbacks.slice(0);
	    for (var i = 0, len = callbacks.length; i < len; ++i) {
	      callbacks[i].apply(this, args);
	    }
	  }
	
	  return this;
	};
	
	/**
	 * Return array of callbacks for `event`.
	 *
	 * @param {String} event
	 * @return {Array}
	 * @api public
	 */
	
	Emitter.prototype.listeners = function(event){
	  this._callbacks = this._callbacks || {};
	  return this._callbacks['$' + event] || [];
	};
	
	/**
	 * Check if this emitter has `event` handlers.
	 *
	 * @param {String} event
	 * @return {Boolean}
	 * @api public
	 */
	
	Emitter.prototype.hasListeners = function(event){
	  return !! this.listeners(event).length;
	};


/***/ },
/* 44 */
/***/ function(module, exports) {

	module.exports = toArray
	
	function toArray(list, index) {
	    var array = []
	
	    index = index || 0
	
	    for (var i = index || 0; i < list.length; i++) {
	        array[i - index] = list[i]
	    }
	
	    return array
	}


/***/ },
/* 45 */
/***/ function(module, exports) {

	
	/**
	 * Module exports.
	 */
	
	module.exports = on;
	
	/**
	 * Helper for subscriptions.
	 *
	 * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
	 * @param {String} event name
	 * @param {Function} callback
	 * @api public
	 */
	
	function on(obj, ev, fn) {
	  obj.on(ev, fn);
	  return {
	    destroy: function(){
	      obj.removeListener(ev, fn);
	    }
	  };
	}


/***/ },
/* 46 */
/***/ function(module, exports) {

	/**
	 * Slice reference.
	 */
	
	var slice = [].slice;
	
	/**
	 * Bind `obj` to `fn`.
	 *
	 * @param {Object} obj
	 * @param {Function|String} fn or string
	 * @return {Function}
	 * @api public
	 */
	
	module.exports = function(obj, fn){
	  if ('string' == typeof fn) fn = obj[fn];
	  if ('function' != typeof fn) throw new Error('bind() requires a function');
	  var args = slice.call(arguments, 2);
	  return function(){
	    return fn.apply(obj, args.concat(slice.call(arguments)));
	  }
	};


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {
	/*
	 * Module requirements.
	 */
	
	var isArray = __webpack_require__(12);
	
	/**
	 * Module exports.
	 */
	
	module.exports = hasBinary;
	
	/**
	 * Checks for binary data.
	 *
	 * Right now only Buffer and ArrayBuffer are supported..
	 *
	 * @param {Object} anything
	 * @api public
	 */
	
	function hasBinary(data) {
	
	  function _hasBinary(obj) {
	    if (!obj) return false;
	
	    if ( (global.Buffer && global.Buffer.isBuffer && global.Buffer.isBuffer(obj)) ||
	         (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
	         (global.Blob && obj instanceof Blob) ||
	         (global.File && obj instanceof File)
	        ) {
	      return true;
	    }
	
	    if (isArray(obj)) {
	      for (var i = 0; i < obj.length; i++) {
	          if (_hasBinary(obj[i])) {
	              return true;
	          }
	      }
	    } else if (obj && 'object' == typeof obj) {
	      // see: https://github.com/Automattic/has-binary/pull/4
	      if (obj.toJSON && 'function' == typeof obj.toJSON) {
	        obj = obj.toJSON();
	      }
	
	      for (var key in obj) {
	        if (Object.prototype.hasOwnProperty.call(obj, key) && _hasBinary(obj[key])) {
	          return true;
	        }
	      }
	    }
	
	    return false;
	  }
	
	  return _hasBinary(data);
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 48 */
/***/ function(module, exports) {

	
	/**
	 * Expose `Backoff`.
	 */
	
	module.exports = Backoff;
	
	/**
	 * Initialize backoff timer with `opts`.
	 *
	 * - `min` initial timeout in milliseconds [100]
	 * - `max` max timeout [10000]
	 * - `jitter` [0]
	 * - `factor` [2]
	 *
	 * @param {Object} opts
	 * @api public
	 */
	
	function Backoff(opts) {
	  opts = opts || {};
	  this.ms = opts.min || 100;
	  this.max = opts.max || 10000;
	  this.factor = opts.factor || 2;
	  this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
	  this.attempts = 0;
	}
	
	/**
	 * Return the backoff duration.
	 *
	 * @return {Number}
	 * @api public
	 */
	
	Backoff.prototype.duration = function(){
	  var ms = this.ms * Math.pow(this.factor, this.attempts++);
	  if (this.jitter) {
	    var rand =  Math.random();
	    var deviation = Math.floor(rand * this.jitter * ms);
	    ms = (Math.floor(rand * 10) & 1) == 0  ? ms - deviation : ms + deviation;
	  }
	  return Math.min(ms, this.max) | 0;
	};
	
	/**
	 * Reset the number of attempts.
	 *
	 * @api public
	 */
	
	Backoff.prototype.reset = function(){
	  this.attempts = 0;
	};
	
	/**
	 * Set the minimum duration
	 *
	 * @api public
	 */
	
	Backoff.prototype.setMin = function(min){
	  this.ms = min;
	};
	
	/**
	 * Set the maximum duration
	 *
	 * @api public
	 */
	
	Backoff.prototype.setMax = function(max){
	  this.max = max;
	};
	
	/**
	 * Set the jitter
	 *
	 * @api public
	 */
	
	Backoff.prototype.setJitter = function(jitter){
	  this.jitter = jitter;
	};
	


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module) {/*!
	 * Knockout JavaScript library v3.4.0
	 * (c) Steven Sanderson - http://knockoutjs.com/
	 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
	 */
	
	(function(){
	var DEBUG=true;
	(function(undefined){
	    // (0, eval)('this') is a robust way of getting a reference to the global object
	    // For details, see http://stackoverflow.com/questions/14119988/return-this-0-evalthis/14120023#14120023
	    var window = this || (0, eval)('this'),
	        document = window['document'],
	        navigator = window['navigator'],
	        jQueryInstance = window["jQuery"],
	        JSON = window["JSON"];
	(function(factory) {
	    // Support three module loading scenarios
	    if ("function" === 'function' && __webpack_require__(50)['amd']) {
	        // [1] AMD anonymous module
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports, __webpack_require__], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (true) {
	        // [2] CommonJS/Node.js
	        factory(module['exports'] || exports);  // module.exports is for Node.js
	    } else {
	        // [3] No module loader (plain <script> tag) - put directly in global namespace
	        factory(window['ko'] = {});
	    }
	}(function(koExports, amdRequire){
	// Internally, all KO objects are attached to koExports (even the non-exported ones whose names will be minified by the closure compiler).
	// In the future, the following "ko" variable may be made distinct from "koExports" so that private objects are not externally reachable.
	var ko = typeof koExports !== 'undefined' ? koExports : {};
	// Google Closure Compiler helpers (used only to make the minified file smaller)
	ko.exportSymbol = function(koPath, object) {
	    var tokens = koPath.split(".");
	
	    // In the future, "ko" may become distinct from "koExports" (so that non-exported objects are not reachable)
	    // At that point, "target" would be set to: (typeof koExports !== "undefined" ? koExports : ko)
	    var target = ko;
	
	    for (var i = 0; i < tokens.length - 1; i++)
	        target = target[tokens[i]];
	    target[tokens[tokens.length - 1]] = object;
	};
	ko.exportProperty = function(owner, publicName, object) {
	    owner[publicName] = object;
	};
	ko.version = "3.4.0";
	
	ko.exportSymbol('version', ko.version);
	// For any options that may affect various areas of Knockout and aren't directly associated with data binding.
	ko.options = {
	    'deferUpdates': false,
	    'useOnlyNativeEvents': false
	};
	
	//ko.exportSymbol('options', ko.options);   // 'options' isn't minified
	ko.utils = (function () {
	    function objectForEach(obj, action) {
	        for (var prop in obj) {
	            if (obj.hasOwnProperty(prop)) {
	                action(prop, obj[prop]);
	            }
	        }
	    }
	
	    function extend(target, source) {
	        if (source) {
	            for(var prop in source) {
	                if(source.hasOwnProperty(prop)) {
	                    target[prop] = source[prop];
	                }
	            }
	        }
	        return target;
	    }
	
	    function setPrototypeOf(obj, proto) {
	        obj.__proto__ = proto;
	        return obj;
	    }
	
	    var canSetPrototype = ({ __proto__: [] } instanceof Array);
	    var canUseSymbols = !DEBUG && typeof Symbol === 'function';
	
	    // Represent the known event types in a compact way, then at runtime transform it into a hash with event name as key (for fast lookup)
	    var knownEvents = {}, knownEventTypesByEventName = {};
	    var keyEventTypeName = (navigator && /Firefox\/2/i.test(navigator.userAgent)) ? 'KeyboardEvent' : 'UIEvents';
	    knownEvents[keyEventTypeName] = ['keyup', 'keydown', 'keypress'];
	    knownEvents['MouseEvents'] = ['click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave'];
	    objectForEach(knownEvents, function(eventType, knownEventsForType) {
	        if (knownEventsForType.length) {
	            for (var i = 0, j = knownEventsForType.length; i < j; i++)
	                knownEventTypesByEventName[knownEventsForType[i]] = eventType;
	        }
	    });
	    var eventsThatMustBeRegisteredUsingAttachEvent = { 'propertychange': true }; // Workaround for an IE9 issue - https://github.com/SteveSanderson/knockout/issues/406
	
	    // Detect IE versions for bug workarounds (uses IE conditionals, not UA string, for robustness)
	    // Note that, since IE 10 does not support conditional comments, the following logic only detects IE < 10.
	    // Currently this is by design, since IE 10+ behaves correctly when treated as a standard browser.
	    // If there is a future need to detect specific versions of IE10+, we will amend this.
	    var ieVersion = document && (function() {
	        var version = 3, div = document.createElement('div'), iElems = div.getElementsByTagName('i');
	
	        // Keep constructing conditional HTML blocks until we hit one that resolves to an empty fragment
	        while (
	            div.innerHTML = '<!--[if gt IE ' + (++version) + ']><i></i><![endif]-->',
	            iElems[0]
	        ) {}
	        return version > 4 ? version : undefined;
	    }());
	    var isIe6 = ieVersion === 6,
	        isIe7 = ieVersion === 7;
	
	    function isClickOnCheckableElement(element, eventType) {
	        if ((ko.utils.tagNameLower(element) !== "input") || !element.type) return false;
	        if (eventType.toLowerCase() != "click") return false;
	        var inputType = element.type;
	        return (inputType == "checkbox") || (inputType == "radio");
	    }
	
	    // For details on the pattern for changing node classes
	    // see: https://github.com/knockout/knockout/issues/1597
	    var cssClassNameRegex = /\S+/g;
	
	    function toggleDomNodeCssClass(node, classNames, shouldHaveClass) {
	        var addOrRemoveFn;
	        if (classNames) {
	            if (typeof node.classList === 'object') {
	                addOrRemoveFn = node.classList[shouldHaveClass ? 'add' : 'remove'];
	                ko.utils.arrayForEach(classNames.match(cssClassNameRegex), function(className) {
	                    addOrRemoveFn.call(node.classList, className);
	                });
	            } else if (typeof node.className['baseVal'] === 'string') {
	                // SVG tag .classNames is an SVGAnimatedString instance
	                toggleObjectClassPropertyString(node.className, 'baseVal', classNames, shouldHaveClass);
	            } else {
	                // node.className ought to be a string.
	                toggleObjectClassPropertyString(node, 'className', classNames, shouldHaveClass);
	            }
	        }
	    }
	
	    function toggleObjectClassPropertyString(obj, prop, classNames, shouldHaveClass) {
	        // obj/prop is either a node/'className' or a SVGAnimatedString/'baseVal'.
	        var currentClassNames = obj[prop].match(cssClassNameRegex) || [];
	        ko.utils.arrayForEach(classNames.match(cssClassNameRegex), function(className) {
	            ko.utils.addOrRemoveItem(currentClassNames, className, shouldHaveClass);
	        });
	        obj[prop] = currentClassNames.join(" ");
	    }
	
	    return {
	        fieldsIncludedWithJsonPost: ['authenticity_token', /^__RequestVerificationToken(_.*)?$/],
	
	        arrayForEach: function (array, action) {
	            for (var i = 0, j = array.length; i < j; i++)
	                action(array[i], i);
	        },
	
	        arrayIndexOf: function (array, item) {
	            if (typeof Array.prototype.indexOf == "function")
	                return Array.prototype.indexOf.call(array, item);
	            for (var i = 0, j = array.length; i < j; i++)
	                if (array[i] === item)
	                    return i;
	            return -1;
	        },
	
	        arrayFirst: function (array, predicate, predicateOwner) {
	            for (var i = 0, j = array.length; i < j; i++)
	                if (predicate.call(predicateOwner, array[i], i))
	                    return array[i];
	            return null;
	        },
	
	        arrayRemoveItem: function (array, itemToRemove) {
	            var index = ko.utils.arrayIndexOf(array, itemToRemove);
	            if (index > 0) {
	                array.splice(index, 1);
	            }
	            else if (index === 0) {
	                array.shift();
	            }
	        },
	
	        arrayGetDistinctValues: function (array) {
	            array = array || [];
	            var result = [];
	            for (var i = 0, j = array.length; i < j; i++) {
	                if (ko.utils.arrayIndexOf(result, array[i]) < 0)
	                    result.push(array[i]);
	            }
	            return result;
	        },
	
	        arrayMap: function (array, mapping) {
	            array = array || [];
	            var result = [];
	            for (var i = 0, j = array.length; i < j; i++)
	                result.push(mapping(array[i], i));
	            return result;
	        },
	
	        arrayFilter: function (array, predicate) {
	            array = array || [];
	            var result = [];
	            for (var i = 0, j = array.length; i < j; i++)
	                if (predicate(array[i], i))
	                    result.push(array[i]);
	            return result;
	        },
	
	        arrayPushAll: function (array, valuesToPush) {
	            if (valuesToPush instanceof Array)
	                array.push.apply(array, valuesToPush);
	            else
	                for (var i = 0, j = valuesToPush.length; i < j; i++)
	                    array.push(valuesToPush[i]);
	            return array;
	        },
	
	        addOrRemoveItem: function(array, value, included) {
	            var existingEntryIndex = ko.utils.arrayIndexOf(ko.utils.peekObservable(array), value);
	            if (existingEntryIndex < 0) {
	                if (included)
	                    array.push(value);
	            } else {
	                if (!included)
	                    array.splice(existingEntryIndex, 1);
	            }
	        },
	
	        canSetPrototype: canSetPrototype,
	
	        extend: extend,
	
	        setPrototypeOf: setPrototypeOf,
	
	        setPrototypeOfOrExtend: canSetPrototype ? setPrototypeOf : extend,
	
	        objectForEach: objectForEach,
	
	        objectMap: function(source, mapping) {
	            if (!source)
	                return source;
	            var target = {};
	            for (var prop in source) {
	                if (source.hasOwnProperty(prop)) {
	                    target[prop] = mapping(source[prop], prop, source);
	                }
	            }
	            return target;
	        },
	
	        emptyDomNode: function (domNode) {
	            while (domNode.firstChild) {
	                ko.removeNode(domNode.firstChild);
	            }
	        },
	
	        moveCleanedNodesToContainerElement: function(nodes) {
	            // Ensure it's a real array, as we're about to reparent the nodes and
	            // we don't want the underlying collection to change while we're doing that.
	            var nodesArray = ko.utils.makeArray(nodes);
	            var templateDocument = (nodesArray[0] && nodesArray[0].ownerDocument) || document;
	
	            var container = templateDocument.createElement('div');
	            for (var i = 0, j = nodesArray.length; i < j; i++) {
	                container.appendChild(ko.cleanNode(nodesArray[i]));
	            }
	            return container;
	        },
	
	        cloneNodes: function (nodesArray, shouldCleanNodes) {
	            for (var i = 0, j = nodesArray.length, newNodesArray = []; i < j; i++) {
	                var clonedNode = nodesArray[i].cloneNode(true);
	                newNodesArray.push(shouldCleanNodes ? ko.cleanNode(clonedNode) : clonedNode);
	            }
	            return newNodesArray;
	        },
	
	        setDomNodeChildren: function (domNode, childNodes) {
	            ko.utils.emptyDomNode(domNode);
	            if (childNodes) {
	                for (var i = 0, j = childNodes.length; i < j; i++)
	                    domNode.appendChild(childNodes[i]);
	            }
	        },
	
	        replaceDomNodes: function (nodeToReplaceOrNodeArray, newNodesArray) {
	            var nodesToReplaceArray = nodeToReplaceOrNodeArray.nodeType ? [nodeToReplaceOrNodeArray] : nodeToReplaceOrNodeArray;
	            if (nodesToReplaceArray.length > 0) {
	                var insertionPoint = nodesToReplaceArray[0];
	                var parent = insertionPoint.parentNode;
	                for (var i = 0, j = newNodesArray.length; i < j; i++)
	                    parent.insertBefore(newNodesArray[i], insertionPoint);
	                for (var i = 0, j = nodesToReplaceArray.length; i < j; i++) {
	                    ko.removeNode(nodesToReplaceArray[i]);
	                }
	            }
	        },
	
	        fixUpContinuousNodeArray: function(continuousNodeArray, parentNode) {
	            // Before acting on a set of nodes that were previously outputted by a template function, we have to reconcile
	            // them against what is in the DOM right now. It may be that some of the nodes have already been removed, or that
	            // new nodes might have been inserted in the middle, for example by a binding. Also, there may previously have been
	            // leading comment nodes (created by rewritten string-based templates) that have since been removed during binding.
	            // So, this function translates the old "map" output array into its best guess of the set of current DOM nodes.
	            //
	            // Rules:
	            //   [A] Any leading nodes that have been removed should be ignored
	            //       These most likely correspond to memoization nodes that were already removed during binding
	            //       See https://github.com/knockout/knockout/pull/440
	            //   [B] Any trailing nodes that have been remove should be ignored
	            //       This prevents the code here from adding unrelated nodes to the array while processing rule [C]
	            //       See https://github.com/knockout/knockout/pull/1903
	            //   [C] We want to output a continuous series of nodes. So, ignore any nodes that have already been removed,
	            //       and include any nodes that have been inserted among the previous collection
	
	            if (continuousNodeArray.length) {
	                // The parent node can be a virtual element; so get the real parent node
	                parentNode = (parentNode.nodeType === 8 && parentNode.parentNode) || parentNode;
	
	                // Rule [A]
	                while (continuousNodeArray.length && continuousNodeArray[0].parentNode !== parentNode)
	                    continuousNodeArray.splice(0, 1);
	
	                // Rule [B]
	                while (continuousNodeArray.length > 1 && continuousNodeArray[continuousNodeArray.length - 1].parentNode !== parentNode)
	                    continuousNodeArray.length--;
	
	                // Rule [C]
	                if (continuousNodeArray.length > 1) {
	                    var current = continuousNodeArray[0], last = continuousNodeArray[continuousNodeArray.length - 1];
	                    // Replace with the actual new continuous node set
	                    continuousNodeArray.length = 0;
	                    while (current !== last) {
	                        continuousNodeArray.push(current);
	                        current = current.nextSibling;
	                    }
	                    continuousNodeArray.push(last);
	                }
	            }
	            return continuousNodeArray;
	        },
	
	        setOptionNodeSelectionState: function (optionNode, isSelected) {
	            // IE6 sometimes throws "unknown error" if you try to write to .selected directly, whereas Firefox struggles with setAttribute. Pick one based on browser.
	            if (ieVersion < 7)
	                optionNode.setAttribute("selected", isSelected);
	            else
	                optionNode.selected = isSelected;
	        },
	
	        stringTrim: function (string) {
	            return string === null || string === undefined ? '' :
	                string.trim ?
	                    string.trim() :
	                    string.toString().replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
	        },
	
	        stringStartsWith: function (string, startsWith) {
	            string = string || "";
	            if (startsWith.length > string.length)
	                return false;
	            return string.substring(0, startsWith.length) === startsWith;
	        },
	
	        domNodeIsContainedBy: function (node, containedByNode) {
	            if (node === containedByNode)
	                return true;
	            if (node.nodeType === 11)
	                return false; // Fixes issue #1162 - can't use node.contains for document fragments on IE8
	            if (containedByNode.contains)
	                return containedByNode.contains(node.nodeType === 3 ? node.parentNode : node);
	            if (containedByNode.compareDocumentPosition)
	                return (containedByNode.compareDocumentPosition(node) & 16) == 16;
	            while (node && node != containedByNode) {
	                node = node.parentNode;
	            }
	            return !!node;
	        },
	
	        domNodeIsAttachedToDocument: function (node) {
	            return ko.utils.domNodeIsContainedBy(node, node.ownerDocument.documentElement);
	        },
	
	        anyDomNodeIsAttachedToDocument: function(nodes) {
	            return !!ko.utils.arrayFirst(nodes, ko.utils.domNodeIsAttachedToDocument);
	        },
	
	        tagNameLower: function(element) {
	            // For HTML elements, tagName will always be upper case; for XHTML elements, it'll be lower case.
	            // Possible future optimization: If we know it's an element from an XHTML document (not HTML),
	            // we don't need to do the .toLowerCase() as it will always be lower case anyway.
	            return element && element.tagName && element.tagName.toLowerCase();
	        },
	
	        catchFunctionErrors: function (delegate) {
	            return ko['onError'] ? function () {
	                try {
	                    return delegate.apply(this, arguments);
	                } catch (e) {
	                    ko['onError'] && ko['onError'](e);
	                    throw e;
	                }
	            } : delegate;
	        },
	
	        setTimeout: function (handler, timeout) {
	            return setTimeout(ko.utils.catchFunctionErrors(handler), timeout);
	        },
	
	        deferError: function (error) {
	            setTimeout(function () {
	                ko['onError'] && ko['onError'](error);
	                throw error;
	            }, 0);
	        },
	
	        registerEventHandler: function (element, eventType, handler) {
	            var wrappedHandler = ko.utils.catchFunctionErrors(handler);
	
	            var mustUseAttachEvent = ieVersion && eventsThatMustBeRegisteredUsingAttachEvent[eventType];
	            if (!ko.options['useOnlyNativeEvents'] && !mustUseAttachEvent && jQueryInstance) {
	                jQueryInstance(element)['bind'](eventType, wrappedHandler);
	            } else if (!mustUseAttachEvent && typeof element.addEventListener == "function")
	                element.addEventListener(eventType, wrappedHandler, false);
	            else if (typeof element.attachEvent != "undefined") {
	                var attachEventHandler = function (event) { wrappedHandler.call(element, event); },
	                    attachEventName = "on" + eventType;
	                element.attachEvent(attachEventName, attachEventHandler);
	
	                // IE does not dispose attachEvent handlers automatically (unlike with addEventListener)
	                // so to avoid leaks, we have to remove them manually. See bug #856
	                ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
	                    element.detachEvent(attachEventName, attachEventHandler);
	                });
	            } else
	                throw new Error("Browser doesn't support addEventListener or attachEvent");
	        },
	
	        triggerEvent: function (element, eventType) {
	            if (!(element && element.nodeType))
	                throw new Error("element must be a DOM node when calling triggerEvent");
	
	            // For click events on checkboxes and radio buttons, jQuery toggles the element checked state *after* the
	            // event handler runs instead of *before*. (This was fixed in 1.9 for checkboxes but not for radio buttons.)
	            // IE doesn't change the checked state when you trigger the click event using "fireEvent".
	            // In both cases, we'll use the click method instead.
	            var useClickWorkaround = isClickOnCheckableElement(element, eventType);
	
	            if (!ko.options['useOnlyNativeEvents'] && jQueryInstance && !useClickWorkaround) {
	                jQueryInstance(element)['trigger'](eventType);
	            } else if (typeof document.createEvent == "function") {
	                if (typeof element.dispatchEvent == "function") {
	                    var eventCategory = knownEventTypesByEventName[eventType] || "HTMLEvents";
	                    var event = document.createEvent(eventCategory);
	                    event.initEvent(eventType, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, element);
	                    element.dispatchEvent(event);
	                }
	                else
	                    throw new Error("The supplied element doesn't support dispatchEvent");
	            } else if (useClickWorkaround && element.click) {
	                element.click();
	            } else if (typeof element.fireEvent != "undefined") {
	                element.fireEvent("on" + eventType);
	            } else {
	                throw new Error("Browser doesn't support triggering events");
	            }
	        },
	
	        unwrapObservable: function (value) {
	            return ko.isObservable(value) ? value() : value;
	        },
	
	        peekObservable: function (value) {
	            return ko.isObservable(value) ? value.peek() : value;
	        },
	
	        toggleDomNodeCssClass: toggleDomNodeCssClass,
	
	        setTextContent: function(element, textContent) {
	            var value = ko.utils.unwrapObservable(textContent);
	            if ((value === null) || (value === undefined))
	                value = "";
	
	            // We need there to be exactly one child: a text node.
	            // If there are no children, more than one, or if it's not a text node,
	            // we'll clear everything and create a single text node.
	            var innerTextNode = ko.virtualElements.firstChild(element);
	            if (!innerTextNode || innerTextNode.nodeType != 3 || ko.virtualElements.nextSibling(innerTextNode)) {
	                ko.virtualElements.setDomNodeChildren(element, [element.ownerDocument.createTextNode(value)]);
	            } else {
	                innerTextNode.data = value;
	            }
	
	            ko.utils.forceRefresh(element);
	        },
	
	        setElementName: function(element, name) {
	            element.name = name;
	
	            // Workaround IE 6/7 issue
	            // - https://github.com/SteveSanderson/knockout/issues/197
	            // - http://www.matts411.com/post/setting_the_name_attribute_in_ie_dom/
	            if (ieVersion <= 7) {
	                try {
	                    element.mergeAttributes(document.createElement("<input name='" + element.name + "'/>"), false);
	                }
	                catch(e) {} // For IE9 with doc mode "IE9 Standards" and browser mode "IE9 Compatibility View"
	            }
	        },
	
	        forceRefresh: function(node) {
	            // Workaround for an IE9 rendering bug - https://github.com/SteveSanderson/knockout/issues/209
	            if (ieVersion >= 9) {
	                // For text nodes and comment nodes (most likely virtual elements), we will have to refresh the container
	                var elem = node.nodeType == 1 ? node : node.parentNode;
	                if (elem.style)
	                    elem.style.zoom = elem.style.zoom;
	            }
	        },
	
	        ensureSelectElementIsRenderedCorrectly: function(selectElement) {
	            // Workaround for IE9 rendering bug - it doesn't reliably display all the text in dynamically-added select boxes unless you force it to re-render by updating the width.
	            // (See https://github.com/SteveSanderson/knockout/issues/312, http://stackoverflow.com/questions/5908494/select-only-shows-first-char-of-selected-option)
	            // Also fixes IE7 and IE8 bug that causes selects to be zero width if enclosed by 'if' or 'with'. (See issue #839)
	            if (ieVersion) {
	                var originalWidth = selectElement.style.width;
	                selectElement.style.width = 0;
	                selectElement.style.width = originalWidth;
	            }
	        },
	
	        range: function (min, max) {
	            min = ko.utils.unwrapObservable(min);
	            max = ko.utils.unwrapObservable(max);
	            var result = [];
	            for (var i = min; i <= max; i++)
	                result.push(i);
	            return result;
	        },
	
	        makeArray: function(arrayLikeObject) {
	            var result = [];
	            for (var i = 0, j = arrayLikeObject.length; i < j; i++) {
	                result.push(arrayLikeObject[i]);
	            };
	            return result;
	        },
	
	        createSymbolOrString: function(identifier) {
	            return canUseSymbols ? Symbol(identifier) : identifier;
	        },
	
	        isIe6 : isIe6,
	        isIe7 : isIe7,
	        ieVersion : ieVersion,
	
	        getFormFields: function(form, fieldName) {
	            var fields = ko.utils.makeArray(form.getElementsByTagName("input")).concat(ko.utils.makeArray(form.getElementsByTagName("textarea")));
	            var isMatchingField = (typeof fieldName == 'string')
	                ? function(field) { return field.name === fieldName }
	                : function(field) { return fieldName.test(field.name) }; // Treat fieldName as regex or object containing predicate
	            var matches = [];
	            for (var i = fields.length - 1; i >= 0; i--) {
	                if (isMatchingField(fields[i]))
	                    matches.push(fields[i]);
	            };
	            return matches;
	        },
	
	        parseJson: function (jsonString) {
	            if (typeof jsonString == "string") {
	                jsonString = ko.utils.stringTrim(jsonString);
	                if (jsonString) {
	                    if (JSON && JSON.parse) // Use native parsing where available
	                        return JSON.parse(jsonString);
	                    return (new Function("return " + jsonString))(); // Fallback on less safe parsing for older browsers
	                }
	            }
	            return null;
	        },
	
	        stringifyJson: function (data, replacer, space) {   // replacer and space are optional
	            if (!JSON || !JSON.stringify)
	                throw new Error("Cannot find JSON.stringify(). Some browsers (e.g., IE < 8) don't support it natively, but you can overcome this by adding a script reference to json2.js, downloadable from http://www.json.org/json2.js");
	            return JSON.stringify(ko.utils.unwrapObservable(data), replacer, space);
	        },
	
	        postJson: function (urlOrForm, data, options) {
	            options = options || {};
	            var params = options['params'] || {};
	            var includeFields = options['includeFields'] || this.fieldsIncludedWithJsonPost;
	            var url = urlOrForm;
	
	            // If we were given a form, use its 'action' URL and pick out any requested field values
	            if((typeof urlOrForm == 'object') && (ko.utils.tagNameLower(urlOrForm) === "form")) {
	                var originalForm = urlOrForm;
	                url = originalForm.action;
	                for (var i = includeFields.length - 1; i >= 0; i--) {
	                    var fields = ko.utils.getFormFields(originalForm, includeFields[i]);
	                    for (var j = fields.length - 1; j >= 0; j--)
	                        params[fields[j].name] = fields[j].value;
	                }
	            }
	
	            data = ko.utils.unwrapObservable(data);
	            var form = document.createElement("form");
	            form.style.display = "none";
	            form.action = url;
	            form.method = "post";
	            for (var key in data) {
	                // Since 'data' this is a model object, we include all properties including those inherited from its prototype
	                var input = document.createElement("input");
	                input.type = "hidden";
	                input.name = key;
	                input.value = ko.utils.stringifyJson(ko.utils.unwrapObservable(data[key]));
	                form.appendChild(input);
	            }
	            objectForEach(params, function(key, value) {
	                var input = document.createElement("input");
	                input.type = "hidden";
	                input.name = key;
	                input.value = value;
	                form.appendChild(input);
	            });
	            document.body.appendChild(form);
	            options['submitter'] ? options['submitter'](form) : form.submit();
	            setTimeout(function () { form.parentNode.removeChild(form); }, 0);
	        }
	    }
	}());
	
	ko.exportSymbol('utils', ko.utils);
	ko.exportSymbol('utils.arrayForEach', ko.utils.arrayForEach);
	ko.exportSymbol('utils.arrayFirst', ko.utils.arrayFirst);
	ko.exportSymbol('utils.arrayFilter', ko.utils.arrayFilter);
	ko.exportSymbol('utils.arrayGetDistinctValues', ko.utils.arrayGetDistinctValues);
	ko.exportSymbol('utils.arrayIndexOf', ko.utils.arrayIndexOf);
	ko.exportSymbol('utils.arrayMap', ko.utils.arrayMap);
	ko.exportSymbol('utils.arrayPushAll', ko.utils.arrayPushAll);
	ko.exportSymbol('utils.arrayRemoveItem', ko.utils.arrayRemoveItem);
	ko.exportSymbol('utils.extend', ko.utils.extend);
	ko.exportSymbol('utils.fieldsIncludedWithJsonPost', ko.utils.fieldsIncludedWithJsonPost);
	ko.exportSymbol('utils.getFormFields', ko.utils.getFormFields);
	ko.exportSymbol('utils.peekObservable', ko.utils.peekObservable);
	ko.exportSymbol('utils.postJson', ko.utils.postJson);
	ko.exportSymbol('utils.parseJson', ko.utils.parseJson);
	ko.exportSymbol('utils.registerEventHandler', ko.utils.registerEventHandler);
	ko.exportSymbol('utils.stringifyJson', ko.utils.stringifyJson);
	ko.exportSymbol('utils.range', ko.utils.range);
	ko.exportSymbol('utils.toggleDomNodeCssClass', ko.utils.toggleDomNodeCssClass);
	ko.exportSymbol('utils.triggerEvent', ko.utils.triggerEvent);
	ko.exportSymbol('utils.unwrapObservable', ko.utils.unwrapObservable);
	ko.exportSymbol('utils.objectForEach', ko.utils.objectForEach);
	ko.exportSymbol('utils.addOrRemoveItem', ko.utils.addOrRemoveItem);
	ko.exportSymbol('utils.setTextContent', ko.utils.setTextContent);
	ko.exportSymbol('unwrap', ko.utils.unwrapObservable); // Convenient shorthand, because this is used so commonly
	
	if (!Function.prototype['bind']) {
	    // Function.prototype.bind is a standard part of ECMAScript 5th Edition (December 2009, http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-262.pdf)
	    // In case the browser doesn't implement it natively, provide a JavaScript implementation. This implementation is based on the one in prototype.js
	    Function.prototype['bind'] = function (object) {
	        var originalFunction = this;
	        if (arguments.length === 1) {
	            return function () {
	                return originalFunction.apply(object, arguments);
	            };
	        } else {
	            var partialArgs = Array.prototype.slice.call(arguments, 1);
	            return function () {
	                var args = partialArgs.slice(0);
	                args.push.apply(args, arguments);
	                return originalFunction.apply(object, args);
	            };
	        }
	    };
	}
	
	ko.utils.domData = new (function () {
	    var uniqueId = 0;
	    var dataStoreKeyExpandoPropertyName = "__ko__" + (new Date).getTime();
	    var dataStore = {};
	
	    function getAll(node, createIfNotFound) {
	        var dataStoreKey = node[dataStoreKeyExpandoPropertyName];
	        var hasExistingDataStore = dataStoreKey && (dataStoreKey !== "null") && dataStore[dataStoreKey];
	        if (!hasExistingDataStore) {
	            if (!createIfNotFound)
	                return undefined;
	            dataStoreKey = node[dataStoreKeyExpandoPropertyName] = "ko" + uniqueId++;
	            dataStore[dataStoreKey] = {};
	        }
	        return dataStore[dataStoreKey];
	    }
	
	    return {
	        get: function (node, key) {
	            var allDataForNode = getAll(node, false);
	            return allDataForNode === undefined ? undefined : allDataForNode[key];
	        },
	        set: function (node, key, value) {
	            if (value === undefined) {
	                // Make sure we don't actually create a new domData key if we are actually deleting a value
	                if (getAll(node, false) === undefined)
	                    return;
	            }
	            var allDataForNode = getAll(node, true);
	            allDataForNode[key] = value;
	        },
	        clear: function (node) {
	            var dataStoreKey = node[dataStoreKeyExpandoPropertyName];
	            if (dataStoreKey) {
	                delete dataStore[dataStoreKey];
	                node[dataStoreKeyExpandoPropertyName] = null;
	                return true; // Exposing "did clean" flag purely so specs can infer whether things have been cleaned up as intended
	            }
	            return false;
	        },
	
	        nextKey: function () {
	            return (uniqueId++) + dataStoreKeyExpandoPropertyName;
	        }
	    };
	})();
	
	ko.exportSymbol('utils.domData', ko.utils.domData);
	ko.exportSymbol('utils.domData.clear', ko.utils.domData.clear); // Exporting only so specs can clear up after themselves fully
	
	ko.utils.domNodeDisposal = new (function () {
	    var domDataKey = ko.utils.domData.nextKey();
	    var cleanableNodeTypes = { 1: true, 8: true, 9: true };       // Element, Comment, Document
	    var cleanableNodeTypesWithDescendants = { 1: true, 9: true }; // Element, Document
	
	    function getDisposeCallbacksCollection(node, createIfNotFound) {
	        var allDisposeCallbacks = ko.utils.domData.get(node, domDataKey);
	        if ((allDisposeCallbacks === undefined) && createIfNotFound) {
	            allDisposeCallbacks = [];
	            ko.utils.domData.set(node, domDataKey, allDisposeCallbacks);
	        }
	        return allDisposeCallbacks;
	    }
	    function destroyCallbacksCollection(node) {
	        ko.utils.domData.set(node, domDataKey, undefined);
	    }
	
	    function cleanSingleNode(node) {
	        // Run all the dispose callbacks
	        var callbacks = getDisposeCallbacksCollection(node, false);
	        if (callbacks) {
	            callbacks = callbacks.slice(0); // Clone, as the array may be modified during iteration (typically, callbacks will remove themselves)
	            for (var i = 0; i < callbacks.length; i++)
	                callbacks[i](node);
	        }
	
	        // Erase the DOM data
	        ko.utils.domData.clear(node);
	
	        // Perform cleanup needed by external libraries (currently only jQuery, but can be extended)
	        ko.utils.domNodeDisposal["cleanExternalData"](node);
	
	        // Clear any immediate-child comment nodes, as these wouldn't have been found by
	        // node.getElementsByTagName("*") in cleanNode() (comment nodes aren't elements)
	        if (cleanableNodeTypesWithDescendants[node.nodeType])
	            cleanImmediateCommentTypeChildren(node);
	    }
	
	    function cleanImmediateCommentTypeChildren(nodeWithChildren) {
	        var child, nextChild = nodeWithChildren.firstChild;
	        while (child = nextChild) {
	            nextChild = child.nextSibling;
	            if (child.nodeType === 8)
	                cleanSingleNode(child);
	        }
	    }
	
	    return {
	        addDisposeCallback : function(node, callback) {
	            if (typeof callback != "function")
	                throw new Error("Callback must be a function");
	            getDisposeCallbacksCollection(node, true).push(callback);
	        },
	
	        removeDisposeCallback : function(node, callback) {
	            var callbacksCollection = getDisposeCallbacksCollection(node, false);
	            if (callbacksCollection) {
	                ko.utils.arrayRemoveItem(callbacksCollection, callback);
	                if (callbacksCollection.length == 0)
	                    destroyCallbacksCollection(node);
	            }
	        },
	
	        cleanNode : function(node) {
	            // First clean this node, where applicable
	            if (cleanableNodeTypes[node.nodeType]) {
	                cleanSingleNode(node);
	
	                // ... then its descendants, where applicable
	                if (cleanableNodeTypesWithDescendants[node.nodeType]) {
	                    // Clone the descendants list in case it changes during iteration
	                    var descendants = [];
	                    ko.utils.arrayPushAll(descendants, node.getElementsByTagName("*"));
	                    for (var i = 0, j = descendants.length; i < j; i++)
	                        cleanSingleNode(descendants[i]);
	                }
	            }
	            return node;
	        },
	
	        removeNode : function(node) {
	            ko.cleanNode(node);
	            if (node.parentNode)
	                node.parentNode.removeChild(node);
	        },
	
	        "cleanExternalData" : function (node) {
	            // Special support for jQuery here because it's so commonly used.
	            // Many jQuery plugins (including jquery.tmpl) store data using jQuery's equivalent of domData
	            // so notify it to tear down any resources associated with the node & descendants here.
	            if (jQueryInstance && (typeof jQueryInstance['cleanData'] == "function"))
	                jQueryInstance['cleanData']([node]);
	        }
	    };
	})();
	ko.cleanNode = ko.utils.domNodeDisposal.cleanNode; // Shorthand name for convenience
	ko.removeNode = ko.utils.domNodeDisposal.removeNode; // Shorthand name for convenience
	ko.exportSymbol('cleanNode', ko.cleanNode);
	ko.exportSymbol('removeNode', ko.removeNode);
	ko.exportSymbol('utils.domNodeDisposal', ko.utils.domNodeDisposal);
	ko.exportSymbol('utils.domNodeDisposal.addDisposeCallback', ko.utils.domNodeDisposal.addDisposeCallback);
	ko.exportSymbol('utils.domNodeDisposal.removeDisposeCallback', ko.utils.domNodeDisposal.removeDisposeCallback);
	(function () {
	    var none = [0, "", ""],
	        table = [1, "<table>", "</table>"],
	        tbody = [2, "<table><tbody>", "</tbody></table>"],
	        tr = [3, "<table><tbody><tr>", "</tr></tbody></table>"],
	        select = [1, "<select multiple='multiple'>", "</select>"],
	        lookup = {
	            'thead': table,
	            'tbody': table,
	            'tfoot': table,
	            'tr': tbody,
	            'td': tr,
	            'th': tr,
	            'option': select,
	            'optgroup': select
	        },
	
	        // This is needed for old IE if you're *not* using either jQuery or innerShiv. Doesn't affect other cases.
	        mayRequireCreateElementHack = ko.utils.ieVersion <= 8;
	
	    function getWrap(tags) {
	        var m = tags.match(/^<([a-z]+)[ >]/);
	        return (m && lookup[m[1]]) || none;
	    }
	
	    function simpleHtmlParse(html, documentContext) {
	        documentContext || (documentContext = document);
	        var windowContext = documentContext['parentWindow'] || documentContext['defaultView'] || window;
	
	        // Based on jQuery's "clean" function, but only accounting for table-related elements.
	        // If you have referenced jQuery, this won't be used anyway - KO will use jQuery's "clean" function directly
	
	        // Note that there's still an issue in IE < 9 whereby it will discard comment nodes that are the first child of
	        // a descendant node. For example: "<div><!-- mycomment -->abc</div>" will get parsed as "<div>abc</div>"
	        // This won't affect anyone who has referenced jQuery, and there's always the workaround of inserting a dummy node
	        // (possibly a text node) in front of the comment. So, KO does not attempt to workaround this IE issue automatically at present.
	
	        // Trim whitespace, otherwise indexOf won't work as expected
	        var tags = ko.utils.stringTrim(html).toLowerCase(), div = documentContext.createElement("div"),
	            wrap = getWrap(tags),
	            depth = wrap[0];
	
	        // Go to html and back, then peel off extra wrappers
	        // Note that we always prefix with some dummy text, because otherwise, IE<9 will strip out leading comment nodes in descendants. Total madness.
	        var markup = "ignored<div>" + wrap[1] + html + wrap[2] + "</div>";
	        if (typeof windowContext['innerShiv'] == "function") {
	            // Note that innerShiv is deprecated in favour of html5shiv. We should consider adding
	            // support for html5shiv (except if no explicit support is needed, e.g., if html5shiv
	            // somehow shims the native APIs so it just works anyway)
	            div.appendChild(windowContext['innerShiv'](markup));
	        } else {
	            if (mayRequireCreateElementHack) {
	                // The document.createElement('my-element') trick to enable custom elements in IE6-8
	                // only works if we assign innerHTML on an element associated with that document.
	                documentContext.appendChild(div);
	            }
	
	            div.innerHTML = markup;
	
	            if (mayRequireCreateElementHack) {
	                div.parentNode.removeChild(div);
	            }
	        }
	
	        // Move to the right depth
	        while (depth--)
	            div = div.lastChild;
	
	        return ko.utils.makeArray(div.lastChild.childNodes);
	    }
	
	    function jQueryHtmlParse(html, documentContext) {
	        // jQuery's "parseHTML" function was introduced in jQuery 1.8.0 and is a documented public API.
	        if (jQueryInstance['parseHTML']) {
	            return jQueryInstance['parseHTML'](html, documentContext) || []; // Ensure we always return an array and never null
	        } else {
	            // For jQuery < 1.8.0, we fall back on the undocumented internal "clean" function.
	            var elems = jQueryInstance['clean']([html], documentContext);
	
	            // As of jQuery 1.7.1, jQuery parses the HTML by appending it to some dummy parent nodes held in an in-memory document fragment.
	            // Unfortunately, it never clears the dummy parent nodes from the document fragment, so it leaks memory over time.
	            // Fix this by finding the top-most dummy parent element, and detaching it from its owner fragment.
	            if (elems && elems[0]) {
	                // Find the top-most parent element that's a direct child of a document fragment
	                var elem = elems[0];
	                while (elem.parentNode && elem.parentNode.nodeType !== 11 /* i.e., DocumentFragment */)
	                    elem = elem.parentNode;
	                // ... then detach it
	                if (elem.parentNode)
	                    elem.parentNode.removeChild(elem);
	            }
	
	            return elems;
	        }
	    }
	
	    ko.utils.parseHtmlFragment = function(html, documentContext) {
	        return jQueryInstance ?
	            jQueryHtmlParse(html, documentContext) :   // As below, benefit from jQuery's optimisations where possible
	            simpleHtmlParse(html, documentContext);  // ... otherwise, this simple logic will do in most common cases.
	    };
	
	    ko.utils.setHtml = function(node, html) {
	        ko.utils.emptyDomNode(node);
	
	        // There's no legitimate reason to display a stringified observable without unwrapping it, so we'll unwrap it
	        html = ko.utils.unwrapObservable(html);
	
	        if ((html !== null) && (html !== undefined)) {
	            if (typeof html != 'string')
	                html = html.toString();
	
	            // jQuery contains a lot of sophisticated code to parse arbitrary HTML fragments,
	            // for example <tr> elements which are not normally allowed to exist on their own.
	            // If you've referenced jQuery we'll use that rather than duplicating its code.
	            if (jQueryInstance) {
	                jQueryInstance(node)['html'](html);
	            } else {
	                // ... otherwise, use KO's own parsing logic.
	                var parsedNodes = ko.utils.parseHtmlFragment(html, node.ownerDocument);
	                for (var i = 0; i < parsedNodes.length; i++)
	                    node.appendChild(parsedNodes[i]);
	            }
	        }
	    };
	})();
	
	ko.exportSymbol('utils.parseHtmlFragment', ko.utils.parseHtmlFragment);
	ko.exportSymbol('utils.setHtml', ko.utils.setHtml);
	
	ko.memoization = (function () {
	    var memos = {};
	
	    function randomMax8HexChars() {
	        return (((1 + Math.random()) * 0x100000000) | 0).toString(16).substring(1);
	    }
	    function generateRandomId() {
	        return randomMax8HexChars() + randomMax8HexChars();
	    }
	    function findMemoNodes(rootNode, appendToArray) {
	        if (!rootNode)
	            return;
	        if (rootNode.nodeType == 8) {
	            var memoId = ko.memoization.parseMemoText(rootNode.nodeValue);
	            if (memoId != null)
	                appendToArray.push({ domNode: rootNode, memoId: memoId });
	        } else if (rootNode.nodeType == 1) {
	            for (var i = 0, childNodes = rootNode.childNodes, j = childNodes.length; i < j; i++)
	                findMemoNodes(childNodes[i], appendToArray);
	        }
	    }
	
	    return {
	        memoize: function (callback) {
	            if (typeof callback != "function")
	                throw new Error("You can only pass a function to ko.memoization.memoize()");
	            var memoId = generateRandomId();
	            memos[memoId] = callback;
	            return "<!--[ko_memo:" + memoId + "]-->";
	        },
	
	        unmemoize: function (memoId, callbackParams) {
	            var callback = memos[memoId];
	            if (callback === undefined)
	                throw new Error("Couldn't find any memo with ID " + memoId + ". Perhaps it's already been unmemoized.");
	            try {
	                callback.apply(null, callbackParams || []);
	                return true;
	            }
	            finally { delete memos[memoId]; }
	        },
	
	        unmemoizeDomNodeAndDescendants: function (domNode, extraCallbackParamsArray) {
	            var memos = [];
	            findMemoNodes(domNode, memos);
	            for (var i = 0, j = memos.length; i < j; i++) {
	                var node = memos[i].domNode;
	                var combinedParams = [node];
	                if (extraCallbackParamsArray)
	                    ko.utils.arrayPushAll(combinedParams, extraCallbackParamsArray);
	                ko.memoization.unmemoize(memos[i].memoId, combinedParams);
	                node.nodeValue = ""; // Neuter this node so we don't try to unmemoize it again
	                if (node.parentNode)
	                    node.parentNode.removeChild(node); // If possible, erase it totally (not always possible - someone else might just hold a reference to it then call unmemoizeDomNodeAndDescendants again)
	            }
	        },
	
	        parseMemoText: function (memoText) {
	            var match = memoText.match(/^\[ko_memo\:(.*?)\]$/);
	            return match ? match[1] : null;
	        }
	    };
	})();
	
	ko.exportSymbol('memoization', ko.memoization);
	ko.exportSymbol('memoization.memoize', ko.memoization.memoize);
	ko.exportSymbol('memoization.unmemoize', ko.memoization.unmemoize);
	ko.exportSymbol('memoization.parseMemoText', ko.memoization.parseMemoText);
	ko.exportSymbol('memoization.unmemoizeDomNodeAndDescendants', ko.memoization.unmemoizeDomNodeAndDescendants);
	ko.tasks = (function () {
	    var scheduler,
	        taskQueue = [],
	        taskQueueLength = 0,
	        nextHandle = 1,
	        nextIndexToProcess = 0;
	
	    if (window['MutationObserver']) {
	        // Chrome 27+, Firefox 14+, IE 11+, Opera 15+, Safari 6.1+
	        // From https://github.com/petkaantonov/bluebird * Copyright (c) 2014 Petka Antonov * License: MIT
	        scheduler = (function (callback) {
	            var div = document.createElement("div");
	            new MutationObserver(callback).observe(div, {attributes: true});
	            return function () { div.classList.toggle("foo"); };
	        })(scheduledProcess);
	    } else if (document && "onreadystatechange" in document.createElement("script")) {
	        // IE 6-10
	        // From https://github.com/YuzuJS/setImmediate * Copyright (c) 2012 Barnesandnoble.com, llc, Donavon West, and Domenic Denicola * License: MIT
	        scheduler = function (callback) {
	            var script = document.createElement("script");
	            script.onreadystatechange = function () {
	                script.onreadystatechange = null;
	                document.documentElement.removeChild(script);
	                script = null;
	                callback();
	            };
	            document.documentElement.appendChild(script);
	        };
	    } else {
	        scheduler = function (callback) {
	            setTimeout(callback, 0);
	        };
	    }
	
	    function processTasks() {
	        if (taskQueueLength) {
	            // Each mark represents the end of a logical group of tasks and the number of these groups is
	            // limited to prevent unchecked recursion.
	            var mark = taskQueueLength, countMarks = 0;
	
	            // nextIndexToProcess keeps track of where we are in the queue; processTasks can be called recursively without issue
	            for (var task; nextIndexToProcess < taskQueueLength; ) {
	                if (task = taskQueue[nextIndexToProcess++]) {
	                    if (nextIndexToProcess > mark) {
	                        if (++countMarks >= 5000) {
	                            nextIndexToProcess = taskQueueLength;   // skip all tasks remaining in the queue since any of them could be causing the recursion
	                            ko.utils.deferError(Error("'Too much recursion' after processing " + countMarks + " task groups."));
	                            break;
	                        }
	                        mark = taskQueueLength;
	                    }
	                    try {
	                        task();
	                    } catch (ex) {
	                        ko.utils.deferError(ex);
	                    }
	                }
	            }
	        }
	    }
	
	    function scheduledProcess() {
	        processTasks();
	
	        // Reset the queue
	        nextIndexToProcess = taskQueueLength = taskQueue.length = 0;
	    }
	
	    function scheduleTaskProcessing() {
	        ko.tasks['scheduler'](scheduledProcess);
	    }
	
	    var tasks = {
	        'scheduler': scheduler,     // Allow overriding the scheduler
	
	        schedule: function (func) {
	            if (!taskQueueLength) {
	                scheduleTaskProcessing();
	            }
	
	            taskQueue[taskQueueLength++] = func;
	            return nextHandle++;
	        },
	
	        cancel: function (handle) {
	            var index = handle - (nextHandle - taskQueueLength);
	            if (index >= nextIndexToProcess && index < taskQueueLength) {
	                taskQueue[index] = null;
	            }
	        },
	
	        // For testing only: reset the queue and return the previous queue length
	        'resetForTesting': function () {
	            var length = taskQueueLength - nextIndexToProcess;
	            nextIndexToProcess = taskQueueLength = taskQueue.length = 0;
	            return length;
	        },
	
	        runEarly: processTasks
	    };
	
	    return tasks;
	})();
	
	ko.exportSymbol('tasks', ko.tasks);
	ko.exportSymbol('tasks.schedule', ko.tasks.schedule);
	//ko.exportSymbol('tasks.cancel', ko.tasks.cancel);  "cancel" isn't minified
	ko.exportSymbol('tasks.runEarly', ko.tasks.runEarly);
	ko.extenders = {
	    'throttle': function(target, timeout) {
	        // Throttling means two things:
	
	        // (1) For dependent observables, we throttle *evaluations* so that, no matter how fast its dependencies
	        //     notify updates, the target doesn't re-evaluate (and hence doesn't notify) faster than a certain rate
	        target['throttleEvaluation'] = timeout;
	
	        // (2) For writable targets (observables, or writable dependent observables), we throttle *writes*
	        //     so the target cannot change value synchronously or faster than a certain rate
	        var writeTimeoutInstance = null;
	        return ko.dependentObservable({
	            'read': target,
	            'write': function(value) {
	                clearTimeout(writeTimeoutInstance);
	                writeTimeoutInstance = ko.utils.setTimeout(function() {
	                    target(value);
	                }, timeout);
	            }
	        });
	    },
	
	    'rateLimit': function(target, options) {
	        var timeout, method, limitFunction;
	
	        if (typeof options == 'number') {
	            timeout = options;
	        } else {
	            timeout = options['timeout'];
	            method = options['method'];
	        }
	
	        // rateLimit supersedes deferred updates
	        target._deferUpdates = false;
	
	        limitFunction = method == 'notifyWhenChangesStop' ?  debounce : throttle;
	        target.limit(function(callback) {
	            return limitFunction(callback, timeout);
	        });
	    },
	
	    'deferred': function(target, options) {
	        if (options !== true) {
	            throw new Error('The \'deferred\' extender only accepts the value \'true\', because it is not supported to turn deferral off once enabled.')
	        }
	
	        if (!target._deferUpdates) {
	            target._deferUpdates = true;
	            target.limit(function (callback) {
	                var handle;
	                return function () {
	                    ko.tasks.cancel(handle);
	                    handle = ko.tasks.schedule(callback);
	                    target['notifySubscribers'](undefined, 'dirty');
	                };
	            });
	        }
	    },
	
	    'notify': function(target, notifyWhen) {
	        target["equalityComparer"] = notifyWhen == "always" ?
	            null :  // null equalityComparer means to always notify
	            valuesArePrimitiveAndEqual;
	    }
	};
	
	var primitiveTypes = { 'undefined':1, 'boolean':1, 'number':1, 'string':1 };
	function valuesArePrimitiveAndEqual(a, b) {
	    var oldValueIsPrimitive = (a === null) || (typeof(a) in primitiveTypes);
	    return oldValueIsPrimitive ? (a === b) : false;
	}
	
	function throttle(callback, timeout) {
	    var timeoutInstance;
	    return function () {
	        if (!timeoutInstance) {
	            timeoutInstance = ko.utils.setTimeout(function () {
	                timeoutInstance = undefined;
	                callback();
	            }, timeout);
	        }
	    };
	}
	
	function debounce(callback, timeout) {
	    var timeoutInstance;
	    return function () {
	        clearTimeout(timeoutInstance);
	        timeoutInstance = ko.utils.setTimeout(callback, timeout);
	    };
	}
	
	function applyExtenders(requestedExtenders) {
	    var target = this;
	    if (requestedExtenders) {
	        ko.utils.objectForEach(requestedExtenders, function(key, value) {
	            var extenderHandler = ko.extenders[key];
	            if (typeof extenderHandler == 'function') {
	                target = extenderHandler(target, value) || target;
	            }
	        });
	    }
	    return target;
	}
	
	ko.exportSymbol('extenders', ko.extenders);
	
	ko.subscription = function (target, callback, disposeCallback) {
	    this._target = target;
	    this.callback = callback;
	    this.disposeCallback = disposeCallback;
	    this.isDisposed = false;
	    ko.exportProperty(this, 'dispose', this.dispose);
	};
	ko.subscription.prototype.dispose = function () {
	    this.isDisposed = true;
	    this.disposeCallback();
	};
	
	ko.subscribable = function () {
	    ko.utils.setPrototypeOfOrExtend(this, ko_subscribable_fn);
	    ko_subscribable_fn.init(this);
	}
	
	var defaultEvent = "change";
	
	// Moved out of "limit" to avoid the extra closure
	function limitNotifySubscribers(value, event) {
	    if (!event || event === defaultEvent) {
	        this._limitChange(value);
	    } else if (event === 'beforeChange') {
	        this._limitBeforeChange(value);
	    } else {
	        this._origNotifySubscribers(value, event);
	    }
	}
	
	var ko_subscribable_fn = {
	    init: function(instance) {
	        instance._subscriptions = {};
	        instance._versionNumber = 1;
	    },
	
	    subscribe: function (callback, callbackTarget, event) {
	        var self = this;
	
	        event = event || defaultEvent;
	        var boundCallback = callbackTarget ? callback.bind(callbackTarget) : callback;
	
	        var subscription = new ko.subscription(self, boundCallback, function () {
	            ko.utils.arrayRemoveItem(self._subscriptions[event], subscription);
	            if (self.afterSubscriptionRemove)
	                self.afterSubscriptionRemove(event);
	        });
	
	        if (self.beforeSubscriptionAdd)
	            self.beforeSubscriptionAdd(event);
	
	        if (!self._subscriptions[event])
	            self._subscriptions[event] = [];
	        self._subscriptions[event].push(subscription);
	
	        return subscription;
	    },
	
	    "notifySubscribers": function (valueToNotify, event) {
	        event = event || defaultEvent;
	        if (event === defaultEvent) {
	            this.updateVersion();
	        }
	        if (this.hasSubscriptionsForEvent(event)) {
	            try {
	                ko.dependencyDetection.begin(); // Begin suppressing dependency detection (by setting the top frame to undefined)
	                for (var a = this._subscriptions[event].slice(0), i = 0, subscription; subscription = a[i]; ++i) {
	                    // In case a subscription was disposed during the arrayForEach cycle, check
	                    // for isDisposed on each subscription before invoking its callback
	                    if (!subscription.isDisposed)
	                        subscription.callback(valueToNotify);
	                }
	            } finally {
	                ko.dependencyDetection.end(); // End suppressing dependency detection
	            }
	        }
	    },
	
	    getVersion: function () {
	        return this._versionNumber;
	    },
	
	    hasChanged: function (versionToCheck) {
	        return this.getVersion() !== versionToCheck;
	    },
	
	    updateVersion: function () {
	        ++this._versionNumber;
	    },
	
	    limit: function(limitFunction) {
	        var self = this, selfIsObservable = ko.isObservable(self),
	            ignoreBeforeChange, previousValue, pendingValue, beforeChange = 'beforeChange';
	
	        if (!self._origNotifySubscribers) {
	            self._origNotifySubscribers = self["notifySubscribers"];
	            self["notifySubscribers"] = limitNotifySubscribers;
	        }
	
	        var finish = limitFunction(function() {
	            self._notificationIsPending = false;
	
	            // If an observable provided a reference to itself, access it to get the latest value.
	            // This allows computed observables to delay calculating their value until needed.
	            if (selfIsObservable && pendingValue === self) {
	                pendingValue = self();
	            }
	            ignoreBeforeChange = false;
	            if (self.isDifferent(previousValue, pendingValue)) {
	                self._origNotifySubscribers(previousValue = pendingValue);
	            }
	        });
	
	        self._limitChange = function(value) {
	            self._notificationIsPending = ignoreBeforeChange = true;
	            pendingValue = value;
	            finish();
	        };
	        self._limitBeforeChange = function(value) {
	            if (!ignoreBeforeChange) {
	                previousValue = value;
	                self._origNotifySubscribers(value, beforeChange);
	            }
	        };
	    },
	
	    hasSubscriptionsForEvent: function(event) {
	        return this._subscriptions[event] && this._subscriptions[event].length;
	    },
	
	    getSubscriptionsCount: function (event) {
	        if (event) {
	            return this._subscriptions[event] && this._subscriptions[event].length || 0;
	        } else {
	            var total = 0;
	            ko.utils.objectForEach(this._subscriptions, function(eventName, subscriptions) {
	                if (eventName !== 'dirty')
	                    total += subscriptions.length;
	            });
	            return total;
	        }
	    },
	
	    isDifferent: function(oldValue, newValue) {
	        return !this['equalityComparer'] || !this['equalityComparer'](oldValue, newValue);
	    },
	
	    extend: applyExtenders
	};
	
	ko.exportProperty(ko_subscribable_fn, 'subscribe', ko_subscribable_fn.subscribe);
	ko.exportProperty(ko_subscribable_fn, 'extend', ko_subscribable_fn.extend);
	ko.exportProperty(ko_subscribable_fn, 'getSubscriptionsCount', ko_subscribable_fn.getSubscriptionsCount);
	
	// For browsers that support proto assignment, we overwrite the prototype of each
	// observable instance. Since observables are functions, we need Function.prototype
	// to still be in the prototype chain.
	if (ko.utils.canSetPrototype) {
	    ko.utils.setPrototypeOf(ko_subscribable_fn, Function.prototype);
	}
	
	ko.subscribable['fn'] = ko_subscribable_fn;
	
	
	ko.isSubscribable = function (instance) {
	    return instance != null && typeof instance.subscribe == "function" && typeof instance["notifySubscribers"] == "function";
	};
	
	ko.exportSymbol('subscribable', ko.subscribable);
	ko.exportSymbol('isSubscribable', ko.isSubscribable);
	
	ko.computedContext = ko.dependencyDetection = (function () {
	    var outerFrames = [],
	        currentFrame,
	        lastId = 0;
	
	    // Return a unique ID that can be assigned to an observable for dependency tracking.
	    // Theoretically, you could eventually overflow the number storage size, resulting
	    // in duplicate IDs. But in JavaScript, the largest exact integral value is 2^53
	    // or 9,007,199,254,740,992. If you created 1,000,000 IDs per second, it would
	    // take over 285 years to reach that number.
	    // Reference http://blog.vjeux.com/2010/javascript/javascript-max_int-number-limits.html
	    function getId() {
	        return ++lastId;
	    }
	
	    function begin(options) {
	        outerFrames.push(currentFrame);
	        currentFrame = options;
	    }
	
	    function end() {
	        currentFrame = outerFrames.pop();
	    }
	
	    return {
	        begin: begin,
	
	        end: end,
	
	        registerDependency: function (subscribable) {
	            if (currentFrame) {
	                if (!ko.isSubscribable(subscribable))
	                    throw new Error("Only subscribable things can act as dependencies");
	                currentFrame.callback.call(currentFrame.callbackTarget, subscribable, subscribable._id || (subscribable._id = getId()));
	            }
	        },
	
	        ignore: function (callback, callbackTarget, callbackArgs) {
	            try {
	                begin();
	                return callback.apply(callbackTarget, callbackArgs || []);
	            } finally {
	                end();
	            }
	        },
	
	        getDependenciesCount: function () {
	            if (currentFrame)
	                return currentFrame.computed.getDependenciesCount();
	        },
	
	        isInitial: function() {
	            if (currentFrame)
	                return currentFrame.isInitial;
	        }
	    };
	})();
	
	ko.exportSymbol('computedContext', ko.computedContext);
	ko.exportSymbol('computedContext.getDependenciesCount', ko.computedContext.getDependenciesCount);
	ko.exportSymbol('computedContext.isInitial', ko.computedContext.isInitial);
	
	ko.exportSymbol('ignoreDependencies', ko.ignoreDependencies = ko.dependencyDetection.ignore);
	var observableLatestValue = ko.utils.createSymbolOrString('_latestValue');
	
	ko.observable = function (initialValue) {
	    function observable() {
	        if (arguments.length > 0) {
	            // Write
	
	            // Ignore writes if the value hasn't changed
	            if (observable.isDifferent(observable[observableLatestValue], arguments[0])) {
	                observable.valueWillMutate();
	                observable[observableLatestValue] = arguments[0];
	                observable.valueHasMutated();
	            }
	            return this; // Permits chained assignments
	        }
	        else {
	            // Read
	            ko.dependencyDetection.registerDependency(observable); // The caller only needs to be notified of changes if they did a "read" operation
	            return observable[observableLatestValue];
	        }
	    }
	
	    observable[observableLatestValue] = initialValue;
	
	    // Inherit from 'subscribable'
	    if (!ko.utils.canSetPrototype) {
	        // 'subscribable' won't be on the prototype chain unless we put it there directly
	        ko.utils.extend(observable, ko.subscribable['fn']);
	    }
	    ko.subscribable['fn'].init(observable);
	
	    // Inherit from 'observable'
	    ko.utils.setPrototypeOfOrExtend(observable, observableFn);
	
	    if (ko.options['deferUpdates']) {
	        ko.extenders['deferred'](observable, true);
	    }
	
	    return observable;
	}
	
	// Define prototype for observables
	var observableFn = {
	    'equalityComparer': valuesArePrimitiveAndEqual,
	    peek: function() { return this[observableLatestValue]; },
	    valueHasMutated: function () { this['notifySubscribers'](this[observableLatestValue]); },
	    valueWillMutate: function () { this['notifySubscribers'](this[observableLatestValue], 'beforeChange'); }
	};
	
	// Note that for browsers that don't support proto assignment, the
	// inheritance chain is created manually in the ko.observable constructor
	if (ko.utils.canSetPrototype) {
	    ko.utils.setPrototypeOf(observableFn, ko.subscribable['fn']);
	}
	
	var protoProperty = ko.observable.protoProperty = '__ko_proto__';
	observableFn[protoProperty] = ko.observable;
	
	ko.hasPrototype = function(instance, prototype) {
	    if ((instance === null) || (instance === undefined) || (instance[protoProperty] === undefined)) return false;
	    if (instance[protoProperty] === prototype) return true;
	    return ko.hasPrototype(instance[protoProperty], prototype); // Walk the prototype chain
	};
	
	ko.isObservable = function (instance) {
	    return ko.hasPrototype(instance, ko.observable);
	}
	ko.isWriteableObservable = function (instance) {
	    // Observable
	    if ((typeof instance == 'function') && instance[protoProperty] === ko.observable)
	        return true;
	    // Writeable dependent observable
	    if ((typeof instance == 'function') && (instance[protoProperty] === ko.dependentObservable) && (instance.hasWriteFunction))
	        return true;
	    // Anything else
	    return false;
	}
	
	ko.exportSymbol('observable', ko.observable);
	ko.exportSymbol('isObservable', ko.isObservable);
	ko.exportSymbol('isWriteableObservable', ko.isWriteableObservable);
	ko.exportSymbol('isWritableObservable', ko.isWriteableObservable);
	ko.exportSymbol('observable.fn', observableFn);
	ko.exportProperty(observableFn, 'peek', observableFn.peek);
	ko.exportProperty(observableFn, 'valueHasMutated', observableFn.valueHasMutated);
	ko.exportProperty(observableFn, 'valueWillMutate', observableFn.valueWillMutate);
	ko.observableArray = function (initialValues) {
	    initialValues = initialValues || [];
	
	    if (typeof initialValues != 'object' || !('length' in initialValues))
	        throw new Error("The argument passed when initializing an observable array must be an array, or null, or undefined.");
	
	    var result = ko.observable(initialValues);
	    ko.utils.setPrototypeOfOrExtend(result, ko.observableArray['fn']);
	    return result.extend({'trackArrayChanges':true});
	};
	
	ko.observableArray['fn'] = {
	    'remove': function (valueOrPredicate) {
	        var underlyingArray = this.peek();
	        var removedValues = [];
	        var predicate = typeof valueOrPredicate == "function" && !ko.isObservable(valueOrPredicate) ? valueOrPredicate : function (value) { return value === valueOrPredicate; };
	        for (var i = 0; i < underlyingArray.length; i++) {
	            var value = underlyingArray[i];
	            if (predicate(value)) {
	                if (removedValues.length === 0) {
	                    this.valueWillMutate();
	                }
	                removedValues.push(value);
	                underlyingArray.splice(i, 1);
	                i--;
	            }
	        }
	        if (removedValues.length) {
	            this.valueHasMutated();
	        }
	        return removedValues;
	    },
	
	    'removeAll': function (arrayOfValues) {
	        // If you passed zero args, we remove everything
	        if (arrayOfValues === undefined) {
	            var underlyingArray = this.peek();
	            var allValues = underlyingArray.slice(0);
	            this.valueWillMutate();
	            underlyingArray.splice(0, underlyingArray.length);
	            this.valueHasMutated();
	            return allValues;
	        }
	        // If you passed an arg, we interpret it as an array of entries to remove
	        if (!arrayOfValues)
	            return [];
	        return this['remove'](function (value) {
	            return ko.utils.arrayIndexOf(arrayOfValues, value) >= 0;
	        });
	    },
	
	    'destroy': function (valueOrPredicate) {
	        var underlyingArray = this.peek();
	        var predicate = typeof valueOrPredicate == "function" && !ko.isObservable(valueOrPredicate) ? valueOrPredicate : function (value) { return value === valueOrPredicate; };
	        this.valueWillMutate();
	        for (var i = underlyingArray.length - 1; i >= 0; i--) {
	            var value = underlyingArray[i];
	            if (predicate(value))
	                underlyingArray[i]["_destroy"] = true;
	        }
	        this.valueHasMutated();
	    },
	
	    'destroyAll': function (arrayOfValues) {
	        // If you passed zero args, we destroy everything
	        if (arrayOfValues === undefined)
	            return this['destroy'](function() { return true });
	
	        // If you passed an arg, we interpret it as an array of entries to destroy
	        if (!arrayOfValues)
	            return [];
	        return this['destroy'](function (value) {
	            return ko.utils.arrayIndexOf(arrayOfValues, value) >= 0;
	        });
	    },
	
	    'indexOf': function (item) {
	        var underlyingArray = this();
	        return ko.utils.arrayIndexOf(underlyingArray, item);
	    },
	
	    'replace': function(oldItem, newItem) {
	        var index = this['indexOf'](oldItem);
	        if (index >= 0) {
	            this.valueWillMutate();
	            this.peek()[index] = newItem;
	            this.valueHasMutated();
	        }
	    }
	};
	
	// Note that for browsers that don't support proto assignment, the
	// inheritance chain is created manually in the ko.observableArray constructor
	if (ko.utils.canSetPrototype) {
	    ko.utils.setPrototypeOf(ko.observableArray['fn'], ko.observable['fn']);
	}
	
	// Populate ko.observableArray.fn with read/write functions from native arrays
	// Important: Do not add any additional functions here that may reasonably be used to *read* data from the array
	// because we'll eval them without causing subscriptions, so ko.computed output could end up getting stale
	ko.utils.arrayForEach(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function (methodName) {
	    ko.observableArray['fn'][methodName] = function () {
	        // Use "peek" to avoid creating a subscription in any computed that we're executing in the context of
	        // (for consistency with mutating regular observables)
	        var underlyingArray = this.peek();
	        this.valueWillMutate();
	        this.cacheDiffForKnownOperation(underlyingArray, methodName, arguments);
	        var methodCallResult = underlyingArray[methodName].apply(underlyingArray, arguments);
	        this.valueHasMutated();
	        // The native sort and reverse methods return a reference to the array, but it makes more sense to return the observable array instead.
	        return methodCallResult === underlyingArray ? this : methodCallResult;
	    };
	});
	
	// Populate ko.observableArray.fn with read-only functions from native arrays
	ko.utils.arrayForEach(["slice"], function (methodName) {
	    ko.observableArray['fn'][methodName] = function () {
	        var underlyingArray = this();
	        return underlyingArray[methodName].apply(underlyingArray, arguments);
	    };
	});
	
	ko.exportSymbol('observableArray', ko.observableArray);
	var arrayChangeEventName = 'arrayChange';
	ko.extenders['trackArrayChanges'] = function(target, options) {
	    // Use the provided options--each call to trackArrayChanges overwrites the previously set options
	    target.compareArrayOptions = {};
	    if (options && typeof options == "object") {
	        ko.utils.extend(target.compareArrayOptions, options);
	    }
	    target.compareArrayOptions['sparse'] = true;
	
	    // Only modify the target observable once
	    if (target.cacheDiffForKnownOperation) {
	        return;
	    }
	    var trackingChanges = false,
	        cachedDiff = null,
	        arrayChangeSubscription,
	        pendingNotifications = 0,
	        underlyingBeforeSubscriptionAddFunction = target.beforeSubscriptionAdd,
	        underlyingAfterSubscriptionRemoveFunction = target.afterSubscriptionRemove;
	
	    // Watch "subscribe" calls, and for array change events, ensure change tracking is enabled
	    target.beforeSubscriptionAdd = function (event) {
	        if (underlyingBeforeSubscriptionAddFunction)
	            underlyingBeforeSubscriptionAddFunction.call(target, event);
	        if (event === arrayChangeEventName) {
	            trackChanges();
	        }
	    };
	    // Watch "dispose" calls, and for array change events, ensure change tracking is disabled when all are disposed
	    target.afterSubscriptionRemove = function (event) {
	        if (underlyingAfterSubscriptionRemoveFunction)
	            underlyingAfterSubscriptionRemoveFunction.call(target, event);
	        if (event === arrayChangeEventName && !target.hasSubscriptionsForEvent(arrayChangeEventName)) {
	            arrayChangeSubscription.dispose();
	            trackingChanges = false;
	        }
	    };
	
	    function trackChanges() {
	        // Calling 'trackChanges' multiple times is the same as calling it once
	        if (trackingChanges) {
	            return;
	        }
	
	        trackingChanges = true;
	
	        // Intercept "notifySubscribers" to track how many times it was called.
	        var underlyingNotifySubscribersFunction = target['notifySubscribers'];
	        target['notifySubscribers'] = function(valueToNotify, event) {
	            if (!event || event === defaultEvent) {
	                ++pendingNotifications;
	            }
	            return underlyingNotifySubscribersFunction.apply(this, arguments);
	        };
	
	        // Each time the array changes value, capture a clone so that on the next
	        // change it's possible to produce a diff
	        var previousContents = [].concat(target.peek() || []);
	        cachedDiff = null;
	        arrayChangeSubscription = target.subscribe(function(currentContents) {
	            // Make a copy of the current contents and ensure it's an array
	            currentContents = [].concat(currentContents || []);
	
	            // Compute the diff and issue notifications, but only if someone is listening
	            if (target.hasSubscriptionsForEvent(arrayChangeEventName)) {
	                var changes = getChanges(previousContents, currentContents);
	            }
	
	            // Eliminate references to the old, removed items, so they can be GCed
	            previousContents = currentContents;
	            cachedDiff = null;
	            pendingNotifications = 0;
	
	            if (changes && changes.length) {
	                target['notifySubscribers'](changes, arrayChangeEventName);
	            }
	        });
	    }
	
	    function getChanges(previousContents, currentContents) {
	        // We try to re-use cached diffs.
	        // The scenarios where pendingNotifications > 1 are when using rate-limiting or the Deferred Updates
	        // plugin, which without this check would not be compatible with arrayChange notifications. Normally,
	        // notifications are issued immediately so we wouldn't be queueing up more than one.
	        if (!cachedDiff || pendingNotifications > 1) {
	            cachedDiff = ko.utils.compareArrays(previousContents, currentContents, target.compareArrayOptions);
	        }
	
	        return cachedDiff;
	    }
	
	    target.cacheDiffForKnownOperation = function(rawArray, operationName, args) {
	        // Only run if we're currently tracking changes for this observable array
	        // and there aren't any pending deferred notifications.
	        if (!trackingChanges || pendingNotifications) {
	            return;
	        }
	        var diff = [],
	            arrayLength = rawArray.length,
	            argsLength = args.length,
	            offset = 0;
	
	        function pushDiff(status, value, index) {
	            return diff[diff.length] = { 'status': status, 'value': value, 'index': index };
	        }
	        switch (operationName) {
	            case 'push':
	                offset = arrayLength;
	            case 'unshift':
	                for (var index = 0; index < argsLength; index++) {
	                    pushDiff('added', args[index], offset + index);
	                }
	                break;
	
	            case 'pop':
	                offset = arrayLength - 1;
	            case 'shift':
	                if (arrayLength) {
	                    pushDiff('deleted', rawArray[offset], offset);
	                }
	                break;
	
	            case 'splice':
	                // Negative start index means 'from end of array'. After that we clamp to [0...arrayLength].
	                // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
	                var startIndex = Math.min(Math.max(0, args[0] < 0 ? arrayLength + args[0] : args[0]), arrayLength),
	                    endDeleteIndex = argsLength === 1 ? arrayLength : Math.min(startIndex + (args[1] || 0), arrayLength),
	                    endAddIndex = startIndex + argsLength - 2,
	                    endIndex = Math.max(endDeleteIndex, endAddIndex),
	                    additions = [], deletions = [];
	                for (var index = startIndex, argsIndex = 2; index < endIndex; ++index, ++argsIndex) {
	                    if (index < endDeleteIndex)
	                        deletions.push(pushDiff('deleted', rawArray[index], index));
	                    if (index < endAddIndex)
	                        additions.push(pushDiff('added', args[argsIndex], index));
	                }
	                ko.utils.findMovesInArrayComparison(deletions, additions);
	                break;
	
	            default:
	                return;
	        }
	        cachedDiff = diff;
	    };
	};
	var computedState = ko.utils.createSymbolOrString('_state');
	
	ko.computed = ko.dependentObservable = function (evaluatorFunctionOrOptions, evaluatorFunctionTarget, options) {
	    if (typeof evaluatorFunctionOrOptions === "object") {
	        // Single-parameter syntax - everything is on this "options" param
	        options = evaluatorFunctionOrOptions;
	    } else {
	        // Multi-parameter syntax - construct the options according to the params passed
	        options = options || {};
	        if (evaluatorFunctionOrOptions) {
	            options["read"] = evaluatorFunctionOrOptions;
	        }
	    }
	    if (typeof options["read"] != "function")
	        throw Error("Pass a function that returns the value of the ko.computed");
	
	    var writeFunction = options["write"];
	    var state = {
	        latestValue: undefined,
	        isStale: true,
	        isBeingEvaluated: false,
	        suppressDisposalUntilDisposeWhenReturnsFalse: false,
	        isDisposed: false,
	        pure: false,
	        isSleeping: false,
	        readFunction: options["read"],
	        evaluatorFunctionTarget: evaluatorFunctionTarget || options["owner"],
	        disposeWhenNodeIsRemoved: options["disposeWhenNodeIsRemoved"] || options.disposeWhenNodeIsRemoved || null,
	        disposeWhen: options["disposeWhen"] || options.disposeWhen,
	        domNodeDisposalCallback: null,
	        dependencyTracking: {},
	        dependenciesCount: 0,
	        evaluationTimeoutInstance: null
	    };
	
	    function computedObservable() {
	        if (arguments.length > 0) {
	            if (typeof writeFunction === "function") {
	                // Writing a value
	                writeFunction.apply(state.evaluatorFunctionTarget, arguments);
	            } else {
	                throw new Error("Cannot write a value to a ko.computed unless you specify a 'write' option. If you wish to read the current value, don't pass any parameters.");
	            }
	            return this; // Permits chained assignments
	        } else {
	            // Reading the value
	            ko.dependencyDetection.registerDependency(computedObservable);
	            if (state.isStale || (state.isSleeping && computedObservable.haveDependenciesChanged())) {
	                computedObservable.evaluateImmediate();
	            }
	            return state.latestValue;
	        }
	    }
	
	    computedObservable[computedState] = state;
	    computedObservable.hasWriteFunction = typeof writeFunction === "function";
	
	    // Inherit from 'subscribable'
	    if (!ko.utils.canSetPrototype) {
	        // 'subscribable' won't be on the prototype chain unless we put it there directly
	        ko.utils.extend(computedObservable, ko.subscribable['fn']);
	    }
	    ko.subscribable['fn'].init(computedObservable);
	
	    // Inherit from 'computed'
	    ko.utils.setPrototypeOfOrExtend(computedObservable, computedFn);
	
	    if (options['pure']) {
	        state.pure = true;
	        state.isSleeping = true;     // Starts off sleeping; will awake on the first subscription
	        ko.utils.extend(computedObservable, pureComputedOverrides);
	    } else if (options['deferEvaluation']) {
	        ko.utils.extend(computedObservable, deferEvaluationOverrides);
	    }
	
	    if (ko.options['deferUpdates']) {
	        ko.extenders['deferred'](computedObservable, true);
	    }
	
	    if (DEBUG) {
	        // #1731 - Aid debugging by exposing the computed's options
	        computedObservable["_options"] = options;
	    }
	
	    if (state.disposeWhenNodeIsRemoved) {
	        // Since this computed is associated with a DOM node, and we don't want to dispose the computed
	        // until the DOM node is *removed* from the document (as opposed to never having been in the document),
	        // we'll prevent disposal until "disposeWhen" first returns false.
	        state.suppressDisposalUntilDisposeWhenReturnsFalse = true;
	
	        // disposeWhenNodeIsRemoved: true can be used to opt into the "only dispose after first false result"
	        // behaviour even if there's no specific node to watch. In that case, clear the option so we don't try
	        // to watch for a non-node's disposal. This technique is intended for KO's internal use only and shouldn't
	        // be documented or used by application code, as it's likely to change in a future version of KO.
	        if (!state.disposeWhenNodeIsRemoved.nodeType) {
	            state.disposeWhenNodeIsRemoved = null;
	        }
	    }
	
	    // Evaluate, unless sleeping or deferEvaluation is true
	    if (!state.isSleeping && !options['deferEvaluation']) {
	        computedObservable.evaluateImmediate();
	    }
	
	    // Attach a DOM node disposal callback so that the computed will be proactively disposed as soon as the node is
	    // removed using ko.removeNode. But skip if isActive is false (there will never be any dependencies to dispose).
	    if (state.disposeWhenNodeIsRemoved && computedObservable.isActive()) {
	        ko.utils.domNodeDisposal.addDisposeCallback(state.disposeWhenNodeIsRemoved, state.domNodeDisposalCallback = function () {
	            computedObservable.dispose();
	        });
	    }
	
	    return computedObservable;
	};
	
	// Utility function that disposes a given dependencyTracking entry
	function computedDisposeDependencyCallback(id, entryToDispose) {
	    if (entryToDispose !== null && entryToDispose.dispose) {
	        entryToDispose.dispose();
	    }
	}
	
	// This function gets called each time a dependency is detected while evaluating a computed.
	// It's factored out as a shared function to avoid creating unnecessary function instances during evaluation.
	function computedBeginDependencyDetectionCallback(subscribable, id) {
	    var computedObservable = this.computedObservable,
	        state = computedObservable[computedState];
	    if (!state.isDisposed) {
	        if (this.disposalCount && this.disposalCandidates[id]) {
	            // Don't want to dispose this subscription, as it's still being used
	            computedObservable.addDependencyTracking(id, subscribable, this.disposalCandidates[id]);
	            this.disposalCandidates[id] = null; // No need to actually delete the property - disposalCandidates is a transient object anyway
	            --this.disposalCount;
	        } else if (!state.dependencyTracking[id]) {
	            // Brand new subscription - add it
	            computedObservable.addDependencyTracking(id, subscribable, state.isSleeping ? { _target: subscribable } : computedObservable.subscribeToDependency(subscribable));
	        }
	    }
	}
	
	var computedFn = {
	    "equalityComparer": valuesArePrimitiveAndEqual,
	    getDependenciesCount: function () {
	        return this[computedState].dependenciesCount;
	    },
	    addDependencyTracking: function (id, target, trackingObj) {
	        if (this[computedState].pure && target === this) {
	            throw Error("A 'pure' computed must not be called recursively");
	        }
	
	        this[computedState].dependencyTracking[id] = trackingObj;
	        trackingObj._order = this[computedState].dependenciesCount++;
	        trackingObj._version = target.getVersion();
	    },
	    haveDependenciesChanged: function () {
	        var id, dependency, dependencyTracking = this[computedState].dependencyTracking;
	        for (id in dependencyTracking) {
	            if (dependencyTracking.hasOwnProperty(id)) {
	                dependency = dependencyTracking[id];
	                if (dependency._target.hasChanged(dependency._version)) {
	                    return true;
	                }
	            }
	        }
	    },
	    markDirty: function () {
	        // Process "dirty" events if we can handle delayed notifications
	        if (this._evalDelayed && !this[computedState].isBeingEvaluated) {
	            this._evalDelayed();
	        }
	    },
	    isActive: function () {
	        return this[computedState].isStale || this[computedState].dependenciesCount > 0;
	    },
	    respondToChange: function () {
	        // Ignore "change" events if we've already scheduled a delayed notification
	        if (!this._notificationIsPending) {
	            this.evaluatePossiblyAsync();
	        }
	    },
	    subscribeToDependency: function (target) {
	        if (target._deferUpdates && !this[computedState].disposeWhenNodeIsRemoved) {
	            var dirtySub = target.subscribe(this.markDirty, this, 'dirty'),
	                changeSub = target.subscribe(this.respondToChange, this);
	            return {
	                _target: target,
	                dispose: function () {
	                    dirtySub.dispose();
	                    changeSub.dispose();
	                }
	            };
	        } else {
	            return target.subscribe(this.evaluatePossiblyAsync, this);
	        }
	    },
	    evaluatePossiblyAsync: function () {
	        var computedObservable = this,
	            throttleEvaluationTimeout = computedObservable['throttleEvaluation'];
	        if (throttleEvaluationTimeout && throttleEvaluationTimeout >= 0) {
	            clearTimeout(this[computedState].evaluationTimeoutInstance);
	            this[computedState].evaluationTimeoutInstance = ko.utils.setTimeout(function () {
	                computedObservable.evaluateImmediate(true /*notifyChange*/);
	            }, throttleEvaluationTimeout);
	        } else if (computedObservable._evalDelayed) {
	            computedObservable._evalDelayed();
	        } else {
	            computedObservable.evaluateImmediate(true /*notifyChange*/);
	        }
	    },
	    evaluateImmediate: function (notifyChange) {
	        var computedObservable = this,
	            state = computedObservable[computedState],
	            disposeWhen = state.disposeWhen;
	
	        if (state.isBeingEvaluated) {
	            // If the evaluation of a ko.computed causes side effects, it's possible that it will trigger its own re-evaluation.
	            // This is not desirable (it's hard for a developer to realise a chain of dependencies might cause this, and they almost
	            // certainly didn't intend infinite re-evaluations). So, for predictability, we simply prevent ko.computeds from causing
	            // their own re-evaluation. Further discussion at https://github.com/SteveSanderson/knockout/pull/387
	            return;
	        }
	
	        // Do not evaluate (and possibly capture new dependencies) if disposed
	        if (state.isDisposed) {
	            return;
	        }
	
	        if (state.disposeWhenNodeIsRemoved && !ko.utils.domNodeIsAttachedToDocument(state.disposeWhenNodeIsRemoved) || disposeWhen && disposeWhen()) {
	            // See comment above about suppressDisposalUntilDisposeWhenReturnsFalse
	            if (!state.suppressDisposalUntilDisposeWhenReturnsFalse) {
	                computedObservable.dispose();
	                return;
	            }
	        } else {
	            // It just did return false, so we can stop suppressing now
	            state.suppressDisposalUntilDisposeWhenReturnsFalse = false;
	        }
	
	        state.isBeingEvaluated = true;
	        try {
	            this.evaluateImmediate_CallReadWithDependencyDetection(notifyChange);
	        } finally {
	            state.isBeingEvaluated = false;
	        }
	
	        if (!state.dependenciesCount) {
	            computedObservable.dispose();
	        }
	    },
	    evaluateImmediate_CallReadWithDependencyDetection: function (notifyChange) {
	        // This function is really just part of the evaluateImmediate logic. You would never call it from anywhere else.
	        // Factoring it out into a separate function means it can be independent of the try/catch block in evaluateImmediate,
	        // which contributes to saving about 40% off the CPU overhead of computed evaluation (on V8 at least).
	
	        var computedObservable = this,
	            state = computedObservable[computedState];
	
	        // Initially, we assume that none of the subscriptions are still being used (i.e., all are candidates for disposal).
	        // Then, during evaluation, we cross off any that are in fact still being used.
	        var isInitial = state.pure ? undefined : !state.dependenciesCount,   // If we're evaluating when there are no previous dependencies, it must be the first time
	            dependencyDetectionContext = {
	                computedObservable: computedObservable,
	                disposalCandidates: state.dependencyTracking,
	                disposalCount: state.dependenciesCount
	            };
	
	        ko.dependencyDetection.begin({
	            callbackTarget: dependencyDetectionContext,
	            callback: computedBeginDependencyDetectionCallback,
	            computed: computedObservable,
	            isInitial: isInitial
	        });
	
	        state.dependencyTracking = {};
	        state.dependenciesCount = 0;
	
	        var newValue = this.evaluateImmediate_CallReadThenEndDependencyDetection(state, dependencyDetectionContext);
	
	        if (computedObservable.isDifferent(state.latestValue, newValue)) {
	            if (!state.isSleeping) {
	                computedObservable["notifySubscribers"](state.latestValue, "beforeChange");
	            }
	
	            state.latestValue = newValue;
	
	            if (state.isSleeping) {
	                computedObservable.updateVersion();
	            } else if (notifyChange) {
	                computedObservable["notifySubscribers"](state.latestValue);
	            }
	        }
	
	        if (isInitial) {
	            computedObservable["notifySubscribers"](state.latestValue, "awake");
	        }
	    },
	    evaluateImmediate_CallReadThenEndDependencyDetection: function (state, dependencyDetectionContext) {
	        // This function is really part of the evaluateImmediate_CallReadWithDependencyDetection logic.
	        // You'd never call it from anywhere else. Factoring it out means that evaluateImmediate_CallReadWithDependencyDetection
	        // can be independent of try/finally blocks, which contributes to saving about 40% off the CPU
	        // overhead of computed evaluation (on V8 at least).
	
	        try {
	            var readFunction = state.readFunction;
	            return state.evaluatorFunctionTarget ? readFunction.call(state.evaluatorFunctionTarget) : readFunction();
	        } finally {
	            ko.dependencyDetection.end();
	
	            // For each subscription no longer being used, remove it from the active subscriptions list and dispose it
	            if (dependencyDetectionContext.disposalCount && !state.isSleeping) {
	                ko.utils.objectForEach(dependencyDetectionContext.disposalCandidates, computedDisposeDependencyCallback);
	            }
	
	            state.isStale = false;
	        }
	    },
	    peek: function () {
	        // Peek won't re-evaluate, except while the computed is sleeping or to get the initial value when "deferEvaluation" is set.
	        var state = this[computedState];
	        if ((state.isStale && !state.dependenciesCount) || (state.isSleeping && this.haveDependenciesChanged())) {
	            this.evaluateImmediate();
	        }
	        return state.latestValue;
	    },
	    limit: function (limitFunction) {
	        // Override the limit function with one that delays evaluation as well
	        ko.subscribable['fn'].limit.call(this, limitFunction);
	        this._evalDelayed = function () {
	            this._limitBeforeChange(this[computedState].latestValue);
	
	            this[computedState].isStale = true; // Mark as dirty
	
	            // Pass the observable to the "limit" code, which will access it when
	            // it's time to do the notification.
	            this._limitChange(this);
	        }
	    },
	    dispose: function () {
	        var state = this[computedState];
	        if (!state.isSleeping && state.dependencyTracking) {
	            ko.utils.objectForEach(state.dependencyTracking, function (id, dependency) {
	                if (dependency.dispose)
	                    dependency.dispose();
	            });
	        }
	        if (state.disposeWhenNodeIsRemoved && state.domNodeDisposalCallback) {
	            ko.utils.domNodeDisposal.removeDisposeCallback(state.disposeWhenNodeIsRemoved, state.domNodeDisposalCallback);
	        }
	        state.dependencyTracking = null;
	        state.dependenciesCount = 0;
	        state.isDisposed = true;
	        state.isStale = false;
	        state.isSleeping = false;
	        state.disposeWhenNodeIsRemoved = null;
	    }
	};
	
	var pureComputedOverrides = {
	    beforeSubscriptionAdd: function (event) {
	        // If asleep, wake up the computed by subscribing to any dependencies.
	        var computedObservable = this,
	            state = computedObservable[computedState];
	        if (!state.isDisposed && state.isSleeping && event == 'change') {
	            state.isSleeping = false;
	            if (state.isStale || computedObservable.haveDependenciesChanged()) {
	                state.dependencyTracking = null;
	                state.dependenciesCount = 0;
	                state.isStale = true;
	                computedObservable.evaluateImmediate();
	            } else {
	                // First put the dependencies in order
	                var dependeciesOrder = [];
	                ko.utils.objectForEach(state.dependencyTracking, function (id, dependency) {
	                    dependeciesOrder[dependency._order] = id;
	                });
	                // Next, subscribe to each one
	                ko.utils.arrayForEach(dependeciesOrder, function (id, order) {
	                    var dependency = state.dependencyTracking[id],
	                        subscription = computedObservable.subscribeToDependency(dependency._target);
	                    subscription._order = order;
	                    subscription._version = dependency._version;
	                    state.dependencyTracking[id] = subscription;
	                });
	            }
	            if (!state.isDisposed) {     // test since evaluating could trigger disposal
	                computedObservable["notifySubscribers"](state.latestValue, "awake");
	            }
	        }
	    },
	    afterSubscriptionRemove: function (event) {
	        var state = this[computedState];
	        if (!state.isDisposed && event == 'change' && !this.hasSubscriptionsForEvent('change')) {
	            ko.utils.objectForEach(state.dependencyTracking, function (id, dependency) {
	                if (dependency.dispose) {
	                    state.dependencyTracking[id] = {
	                        _target: dependency._target,
	                        _order: dependency._order,
	                        _version: dependency._version
	                    };
	                    dependency.dispose();
	                }
	            });
	            state.isSleeping = true;
	            this["notifySubscribers"](undefined, "asleep");
	        }
	    },
	    getVersion: function () {
	        // Because a pure computed is not automatically updated while it is sleeping, we can't
	        // simply return the version number. Instead, we check if any of the dependencies have
	        // changed and conditionally re-evaluate the computed observable.
	        var state = this[computedState];
	        if (state.isSleeping && (state.isStale || this.haveDependenciesChanged())) {
	            this.evaluateImmediate();
	        }
	        return ko.subscribable['fn'].getVersion.call(this);
	    }
	};
	
	var deferEvaluationOverrides = {
	    beforeSubscriptionAdd: function (event) {
	        // This will force a computed with deferEvaluation to evaluate when the first subscription is registered.
	        if (event == 'change' || event == 'beforeChange') {
	            this.peek();
	        }
	    }
	};
	
	// Note that for browsers that don't support proto assignment, the
	// inheritance chain is created manually in the ko.computed constructor
	if (ko.utils.canSetPrototype) {
	    ko.utils.setPrototypeOf(computedFn, ko.subscribable['fn']);
	}
	
	// Set the proto chain values for ko.hasPrototype
	var protoProp = ko.observable.protoProperty; // == "__ko_proto__"
	ko.computed[protoProp] = ko.observable;
	computedFn[protoProp] = ko.computed;
	
	ko.isComputed = function (instance) {
	    return ko.hasPrototype(instance, ko.computed);
	};
	
	ko.isPureComputed = function (instance) {
	    return ko.hasPrototype(instance, ko.computed)
	        && instance[computedState] && instance[computedState].pure;
	};
	
	ko.exportSymbol('computed', ko.computed);
	ko.exportSymbol('dependentObservable', ko.computed);    // export ko.dependentObservable for backwards compatibility (1.x)
	ko.exportSymbol('isComputed', ko.isComputed);
	ko.exportSymbol('isPureComputed', ko.isPureComputed);
	ko.exportSymbol('computed.fn', computedFn);
	ko.exportProperty(computedFn, 'peek', computedFn.peek);
	ko.exportProperty(computedFn, 'dispose', computedFn.dispose);
	ko.exportProperty(computedFn, 'isActive', computedFn.isActive);
	ko.exportProperty(computedFn, 'getDependenciesCount', computedFn.getDependenciesCount);
	
	ko.pureComputed = function (evaluatorFunctionOrOptions, evaluatorFunctionTarget) {
	    if (typeof evaluatorFunctionOrOptions === 'function') {
	        return ko.computed(evaluatorFunctionOrOptions, evaluatorFunctionTarget, {'pure':true});
	    } else {
	        evaluatorFunctionOrOptions = ko.utils.extend({}, evaluatorFunctionOrOptions);   // make a copy of the parameter object
	        evaluatorFunctionOrOptions['pure'] = true;
	        return ko.computed(evaluatorFunctionOrOptions, evaluatorFunctionTarget);
	    }
	}
	ko.exportSymbol('pureComputed', ko.pureComputed);
	
	(function() {
	    var maxNestedObservableDepth = 10; // Escape the (unlikely) pathalogical case where an observable's current value is itself (or similar reference cycle)
	
	    ko.toJS = function(rootObject) {
	        if (arguments.length == 0)
	            throw new Error("When calling ko.toJS, pass the object you want to convert.");
	
	        // We just unwrap everything at every level in the object graph
	        return mapJsObjectGraph(rootObject, function(valueToMap) {
	            // Loop because an observable's value might in turn be another observable wrapper
	            for (var i = 0; ko.isObservable(valueToMap) && (i < maxNestedObservableDepth); i++)
	                valueToMap = valueToMap();
	            return valueToMap;
	        });
	    };
	
	    ko.toJSON = function(rootObject, replacer, space) {     // replacer and space are optional
	        var plainJavaScriptObject = ko.toJS(rootObject);
	        return ko.utils.stringifyJson(plainJavaScriptObject, replacer, space);
	    };
	
	    function mapJsObjectGraph(rootObject, mapInputCallback, visitedObjects) {
	        visitedObjects = visitedObjects || new objectLookup();
	
	        rootObject = mapInputCallback(rootObject);
	        var canHaveProperties = (typeof rootObject == "object") && (rootObject !== null) && (rootObject !== undefined) && (!(rootObject instanceof RegExp)) && (!(rootObject instanceof Date)) && (!(rootObject instanceof String)) && (!(rootObject instanceof Number)) && (!(rootObject instanceof Boolean));
	        if (!canHaveProperties)
	            return rootObject;
	
	        var outputProperties = rootObject instanceof Array ? [] : {};
	        visitedObjects.save(rootObject, outputProperties);
	
	        visitPropertiesOrArrayEntries(rootObject, function(indexer) {
	            var propertyValue = mapInputCallback(rootObject[indexer]);
	
	            switch (typeof propertyValue) {
	                case "boolean":
	                case "number":
	                case "string":
	                case "function":
	                    outputProperties[indexer] = propertyValue;
	                    break;
	                case "object":
	                case "undefined":
	                    var previouslyMappedValue = visitedObjects.get(propertyValue);
	                    outputProperties[indexer] = (previouslyMappedValue !== undefined)
	                        ? previouslyMappedValue
	                        : mapJsObjectGraph(propertyValue, mapInputCallback, visitedObjects);
	                    break;
	            }
	        });
	
	        return outputProperties;
	    }
	
	    function visitPropertiesOrArrayEntries(rootObject, visitorCallback) {
	        if (rootObject instanceof Array) {
	            for (var i = 0; i < rootObject.length; i++)
	                visitorCallback(i);
	
	            // For arrays, also respect toJSON property for custom mappings (fixes #278)
	            if (typeof rootObject['toJSON'] == 'function')
	                visitorCallback('toJSON');
	        } else {
	            for (var propertyName in rootObject) {
	                visitorCallback(propertyName);
	            }
	        }
	    };
	
	    function objectLookup() {
	        this.keys = [];
	        this.values = [];
	    };
	
	    objectLookup.prototype = {
	        constructor: objectLookup,
	        save: function(key, value) {
	            var existingIndex = ko.utils.arrayIndexOf(this.keys, key);
	            if (existingIndex >= 0)
	                this.values[existingIndex] = value;
	            else {
	                this.keys.push(key);
	                this.values.push(value);
	            }
	        },
	        get: function(key) {
	            var existingIndex = ko.utils.arrayIndexOf(this.keys, key);
	            return (existingIndex >= 0) ? this.values[existingIndex] : undefined;
	        }
	    };
	})();
	
	ko.exportSymbol('toJS', ko.toJS);
	ko.exportSymbol('toJSON', ko.toJSON);
	(function () {
	    var hasDomDataExpandoProperty = '__ko__hasDomDataOptionValue__';
	
	    // Normally, SELECT elements and their OPTIONs can only take value of type 'string' (because the values
	    // are stored on DOM attributes). ko.selectExtensions provides a way for SELECTs/OPTIONs to have values
	    // that are arbitrary objects. This is very convenient when implementing things like cascading dropdowns.
	    ko.selectExtensions = {
	        readValue : function(element) {
	            switch (ko.utils.tagNameLower(element)) {
	                case 'option':
	                    if (element[hasDomDataExpandoProperty] === true)
	                        return ko.utils.domData.get(element, ko.bindingHandlers.options.optionValueDomDataKey);
	                    return ko.utils.ieVersion <= 7
	                        ? (element.getAttributeNode('value') && element.getAttributeNode('value').specified ? element.value : element.text)
	                        : element.value;
	                case 'select':
	                    return element.selectedIndex >= 0 ? ko.selectExtensions.readValue(element.options[element.selectedIndex]) : undefined;
	                default:
	                    return element.value;
	            }
	        },
	
	        writeValue: function(element, value, allowUnset) {
	            switch (ko.utils.tagNameLower(element)) {
	                case 'option':
	                    switch(typeof value) {
	                        case "string":
	                            ko.utils.domData.set(element, ko.bindingHandlers.options.optionValueDomDataKey, undefined);
	                            if (hasDomDataExpandoProperty in element) { // IE <= 8 throws errors if you delete non-existent properties from a DOM node
	                                delete element[hasDomDataExpandoProperty];
	                            }
	                            element.value = value;
	                            break;
	                        default:
	                            // Store arbitrary object using DomData
	                            ko.utils.domData.set(element, ko.bindingHandlers.options.optionValueDomDataKey, value);
	                            element[hasDomDataExpandoProperty] = true;
	
	                            // Special treatment of numbers is just for backward compatibility. KO 1.2.1 wrote numerical values to element.value.
	                            element.value = typeof value === "number" ? value : "";
	                            break;
	                    }
	                    break;
	                case 'select':
	                    if (value === "" || value === null)       // A blank string or null value will select the caption
	                        value = undefined;
	                    var selection = -1;
	                    for (var i = 0, n = element.options.length, optionValue; i < n; ++i) {
	                        optionValue = ko.selectExtensions.readValue(element.options[i]);
	                        // Include special check to handle selecting a caption with a blank string value
	                        if (optionValue == value || (optionValue == "" && value === undefined)) {
	                            selection = i;
	                            break;
	                        }
	                    }
	                    if (allowUnset || selection >= 0 || (value === undefined && element.size > 1)) {
	                        element.selectedIndex = selection;
	                    }
	                    break;
	                default:
	                    if ((value === null) || (value === undefined))
	                        value = "";
	                    element.value = value;
	                    break;
	            }
	        }
	    };
	})();
	
	ko.exportSymbol('selectExtensions', ko.selectExtensions);
	ko.exportSymbol('selectExtensions.readValue', ko.selectExtensions.readValue);
	ko.exportSymbol('selectExtensions.writeValue', ko.selectExtensions.writeValue);
	ko.expressionRewriting = (function () {
	    var javaScriptReservedWords = ["true", "false", "null", "undefined"];
	
	    // Matches something that can be assigned to--either an isolated identifier or something ending with a property accessor
	    // This is designed to be simple and avoid false negatives, but could produce false positives (e.g., a+b.c).
	    // This also will not properly handle nested brackets (e.g., obj1[obj2['prop']]; see #911).
	    var javaScriptAssignmentTarget = /^(?:[$_a-z][$\w]*|(.+)(\.\s*[$_a-z][$\w]*|\[.+\]))$/i;
	
	    function getWriteableValue(expression) {
	        if (ko.utils.arrayIndexOf(javaScriptReservedWords, expression) >= 0)
	            return false;
	        var match = expression.match(javaScriptAssignmentTarget);
	        return match === null ? false : match[1] ? ('Object(' + match[1] + ')' + match[2]) : expression;
	    }
	
	    // The following regular expressions will be used to split an object-literal string into tokens
	
	        // These two match strings, either with double quotes or single quotes
	    var stringDouble = '"(?:[^"\\\\]|\\\\.)*"',
	        stringSingle = "'(?:[^'\\\\]|\\\\.)*'",
	        // Matches a regular expression (text enclosed by slashes), but will also match sets of divisions
	        // as a regular expression (this is handled by the parsing loop below).
	        stringRegexp = '/(?:[^/\\\\]|\\\\.)*/\w*',
	        // These characters have special meaning to the parser and must not appear in the middle of a
	        // token, except as part of a string.
	        specials = ',"\'{}()/:[\\]',
	        // Match text (at least two characters) that does not contain any of the above special characters,
	        // although some of the special characters are allowed to start it (all but the colon and comma).
	        // The text can contain spaces, but leading or trailing spaces are skipped.
	        everyThingElse = '[^\\s:,/][^' + specials + ']*[^\\s' + specials + ']',
	        // Match any non-space character not matched already. This will match colons and commas, since they're
	        // not matched by "everyThingElse", but will also match any other single character that wasn't already
	        // matched (for example: in "a: 1, b: 2", each of the non-space characters will be matched by oneNotSpace).
	        oneNotSpace = '[^\\s]',
	
	        // Create the actual regular expression by or-ing the above strings. The order is important.
	        bindingToken = RegExp(stringDouble + '|' + stringSingle + '|' + stringRegexp + '|' + everyThingElse + '|' + oneNotSpace, 'g'),
	
	        // Match end of previous token to determine whether a slash is a division or regex.
	        divisionLookBehind = /[\])"'A-Za-z0-9_$]+$/,
	        keywordRegexLookBehind = {'in':1,'return':1,'typeof':1};
	
	    function parseObjectLiteral(objectLiteralString) {
	        // Trim leading and trailing spaces from the string
	        var str = ko.utils.stringTrim(objectLiteralString);
	
	        // Trim braces '{' surrounding the whole object literal
	        if (str.charCodeAt(0) === 123) str = str.slice(1, -1);
	
	        // Split into tokens
	        var result = [], toks = str.match(bindingToken), key, values = [], depth = 0;
	
	        if (toks) {
	            // Append a comma so that we don't need a separate code block to deal with the last item
	            toks.push(',');
	
	            for (var i = 0, tok; tok = toks[i]; ++i) {
	                var c = tok.charCodeAt(0);
	                // A comma signals the end of a key/value pair if depth is zero
	                if (c === 44) { // ","
	                    if (depth <= 0) {
	                        result.push((key && values.length) ? {key: key, value: values.join('')} : {'unknown': key || values.join('')});
	                        key = depth = 0;
	                        values = [];
	                        continue;
	                    }
	                // Simply skip the colon that separates the name and value
	                } else if (c === 58) { // ":"
	                    if (!depth && !key && values.length === 1) {
	                        key = values.pop();
	                        continue;
	                    }
	                // A set of slashes is initially matched as a regular expression, but could be division
	                } else if (c === 47 && i && tok.length > 1) {  // "/"
	                    // Look at the end of the previous token to determine if the slash is actually division
	                    var match = toks[i-1].match(divisionLookBehind);
	                    if (match && !keywordRegexLookBehind[match[0]]) {
	                        // The slash is actually a division punctuator; re-parse the remainder of the string (not including the slash)
	                        str = str.substr(str.indexOf(tok) + 1);
	                        toks = str.match(bindingToken);
	                        toks.push(',');
	                        i = -1;
	                        // Continue with just the slash
	                        tok = '/';
	                    }
	                // Increment depth for parentheses, braces, and brackets so that interior commas are ignored
	                } else if (c === 40 || c === 123 || c === 91) { // '(', '{', '['
	                    ++depth;
	                } else if (c === 41 || c === 125 || c === 93) { // ')', '}', ']'
	                    --depth;
	                // The key will be the first token; if it's a string, trim the quotes
	                } else if (!key && !values.length && (c === 34 || c === 39)) { // '"', "'"
	                    tok = tok.slice(1, -1);
	                }
	                values.push(tok);
	            }
	        }
	        return result;
	    }
	
	    // Two-way bindings include a write function that allow the handler to update the value even if it's not an observable.
	    var twoWayBindings = {};
	
	    function preProcessBindings(bindingsStringOrKeyValueArray, bindingOptions) {
	        bindingOptions = bindingOptions || {};
	
	        function processKeyValue(key, val) {
	            var writableVal;
	            function callPreprocessHook(obj) {
	                return (obj && obj['preprocess']) ? (val = obj['preprocess'](val, key, processKeyValue)) : true;
	            }
	            if (!bindingParams) {
	                if (!callPreprocessHook(ko['getBindingHandler'](key)))
	                    return;
	
	                if (twoWayBindings[key] && (writableVal = getWriteableValue(val))) {
	                    // For two-way bindings, provide a write method in case the value
	                    // isn't a writable observable.
	                    propertyAccessorResultStrings.push("'" + key + "':function(_z){" + writableVal + "=_z}");
	                }
	            }
	            // Values are wrapped in a function so that each value can be accessed independently
	            if (makeValueAccessors) {
	                val = 'function(){return ' + val + ' }';
	            }
	            resultStrings.push("'" + key + "':" + val);
	        }
	
	        var resultStrings = [],
	            propertyAccessorResultStrings = [],
	            makeValueAccessors = bindingOptions['valueAccessors'],
	            bindingParams = bindingOptions['bindingParams'],
	            keyValueArray = typeof bindingsStringOrKeyValueArray === "string" ?
	                parseObjectLiteral(bindingsStringOrKeyValueArray) : bindingsStringOrKeyValueArray;
	
	        ko.utils.arrayForEach(keyValueArray, function(keyValue) {
	            processKeyValue(keyValue.key || keyValue['unknown'], keyValue.value);
	        });
	
	        if (propertyAccessorResultStrings.length)
	            processKeyValue('_ko_property_writers', "{" + propertyAccessorResultStrings.join(",") + " }");
	
	        return resultStrings.join(",");
	    }
	
	    return {
	        bindingRewriteValidators: [],
	
	        twoWayBindings: twoWayBindings,
	
	        parseObjectLiteral: parseObjectLiteral,
	
	        preProcessBindings: preProcessBindings,
	
	        keyValueArrayContainsKey: function(keyValueArray, key) {
	            for (var i = 0; i < keyValueArray.length; i++)
	                if (keyValueArray[i]['key'] == key)
	                    return true;
	            return false;
	        },
	
	        // Internal, private KO utility for updating model properties from within bindings
	        // property:            If the property being updated is (or might be) an observable, pass it here
	        //                      If it turns out to be a writable observable, it will be written to directly
	        // allBindings:         An object with a get method to retrieve bindings in the current execution context.
	        //                      This will be searched for a '_ko_property_writers' property in case you're writing to a non-observable
	        // key:                 The key identifying the property to be written. Example: for { hasFocus: myValue }, write to 'myValue' by specifying the key 'hasFocus'
	        // value:               The value to be written
	        // checkIfDifferent:    If true, and if the property being written is a writable observable, the value will only be written if
	        //                      it is !== existing value on that writable observable
	        writeValueToProperty: function(property, allBindings, key, value, checkIfDifferent) {
	            if (!property || !ko.isObservable(property)) {
	                var propWriters = allBindings.get('_ko_property_writers');
	                if (propWriters && propWriters[key])
	                    propWriters[key](value);
	            } else if (ko.isWriteableObservable(property) && (!checkIfDifferent || property.peek() !== value)) {
	                property(value);
	            }
	        }
	    };
	})();
	
	ko.exportSymbol('expressionRewriting', ko.expressionRewriting);
	ko.exportSymbol('expressionRewriting.bindingRewriteValidators', ko.expressionRewriting.bindingRewriteValidators);
	ko.exportSymbol('expressionRewriting.parseObjectLiteral', ko.expressionRewriting.parseObjectLiteral);
	ko.exportSymbol('expressionRewriting.preProcessBindings', ko.expressionRewriting.preProcessBindings);
	
	// Making bindings explicitly declare themselves as "two way" isn't ideal in the long term (it would be better if
	// all bindings could use an official 'property writer' API without needing to declare that they might). However,
	// since this is not, and has never been, a public API (_ko_property_writers was never documented), it's acceptable
	// as an internal implementation detail in the short term.
	// For those developers who rely on _ko_property_writers in their custom bindings, we expose _twoWayBindings as an
	// undocumented feature that makes it relatively easy to upgrade to KO 3.0. However, this is still not an official
	// public API, and we reserve the right to remove it at any time if we create a real public property writers API.
	ko.exportSymbol('expressionRewriting._twoWayBindings', ko.expressionRewriting.twoWayBindings);
	
	// For backward compatibility, define the following aliases. (Previously, these function names were misleading because
	// they referred to JSON specifically, even though they actually work with arbitrary JavaScript object literal expressions.)
	ko.exportSymbol('jsonExpressionRewriting', ko.expressionRewriting);
	ko.exportSymbol('jsonExpressionRewriting.insertPropertyAccessorsIntoJson', ko.expressionRewriting.preProcessBindings);
	(function() {
	    // "Virtual elements" is an abstraction on top of the usual DOM API which understands the notion that comment nodes
	    // may be used to represent hierarchy (in addition to the DOM's natural hierarchy).
	    // If you call the DOM-manipulating functions on ko.virtualElements, you will be able to read and write the state
	    // of that virtual hierarchy
	    //
	    // The point of all this is to support containerless templates (e.g., <!-- ko foreach:someCollection -->blah<!-- /ko -->)
	    // without having to scatter special cases all over the binding and templating code.
	
	    // IE 9 cannot reliably read the "nodeValue" property of a comment node (see https://github.com/SteveSanderson/knockout/issues/186)
	    // but it does give them a nonstandard alternative property called "text" that it can read reliably. Other browsers don't have that property.
	    // So, use node.text where available, and node.nodeValue elsewhere
	    var commentNodesHaveTextProperty = document && document.createComment("test").text === "<!--test-->";
	
	    var startCommentRegex = commentNodesHaveTextProperty ? /^<!--\s*ko(?:\s+([\s\S]+))?\s*-->$/ : /^\s*ko(?:\s+([\s\S]+))?\s*$/;
	    var endCommentRegex =   commentNodesHaveTextProperty ? /^<!--\s*\/ko\s*-->$/ : /^\s*\/ko\s*$/;
	    var htmlTagsWithOptionallyClosingChildren = { 'ul': true, 'ol': true };
	
	    function isStartComment(node) {
	        return (node.nodeType == 8) && startCommentRegex.test(commentNodesHaveTextProperty ? node.text : node.nodeValue);
	    }
	
	    function isEndComment(node) {
	        return (node.nodeType == 8) && endCommentRegex.test(commentNodesHaveTextProperty ? node.text : node.nodeValue);
	    }
	
	    function getVirtualChildren(startComment, allowUnbalanced) {
	        var currentNode = startComment;
	        var depth = 1;
	        var children = [];
	        while (currentNode = currentNode.nextSibling) {
	            if (isEndComment(currentNode)) {
	                depth--;
	                if (depth === 0)
	                    return children;
	            }
	
	            children.push(currentNode);
	
	            if (isStartComment(currentNode))
	                depth++;
	        }
	        if (!allowUnbalanced)
	            throw new Error("Cannot find closing comment tag to match: " + startComment.nodeValue);
	        return null;
	    }
	
	    function getMatchingEndComment(startComment, allowUnbalanced) {
	        var allVirtualChildren = getVirtualChildren(startComment, allowUnbalanced);
	        if (allVirtualChildren) {
	            if (allVirtualChildren.length > 0)
	                return allVirtualChildren[allVirtualChildren.length - 1].nextSibling;
	            return startComment.nextSibling;
	        } else
	            return null; // Must have no matching end comment, and allowUnbalanced is true
	    }
	
	    function getUnbalancedChildTags(node) {
	        // e.g., from <div>OK</div><!-- ko blah --><span>Another</span>, returns: <!-- ko blah --><span>Another</span>
	        //       from <div>OK</div><!-- /ko --><!-- /ko -->,             returns: <!-- /ko --><!-- /ko -->
	        var childNode = node.firstChild, captureRemaining = null;
	        if (childNode) {
	            do {
	                if (captureRemaining)                   // We already hit an unbalanced node and are now just scooping up all subsequent nodes
	                    captureRemaining.push(childNode);
	                else if (isStartComment(childNode)) {
	                    var matchingEndComment = getMatchingEndComment(childNode, /* allowUnbalanced: */ true);
	                    if (matchingEndComment)             // It's a balanced tag, so skip immediately to the end of this virtual set
	                        childNode = matchingEndComment;
	                    else
	                        captureRemaining = [childNode]; // It's unbalanced, so start capturing from this point
	                } else if (isEndComment(childNode)) {
	                    captureRemaining = [childNode];     // It's unbalanced (if it wasn't, we'd have skipped over it already), so start capturing
	                }
	            } while (childNode = childNode.nextSibling);
	        }
	        return captureRemaining;
	    }
	
	    ko.virtualElements = {
	        allowedBindings: {},
	
	        childNodes: function(node) {
	            return isStartComment(node) ? getVirtualChildren(node) : node.childNodes;
	        },
	
	        emptyNode: function(node) {
	            if (!isStartComment(node))
	                ko.utils.emptyDomNode(node);
	            else {
	                var virtualChildren = ko.virtualElements.childNodes(node);
	                for (var i = 0, j = virtualChildren.length; i < j; i++)
	                    ko.removeNode(virtualChildren[i]);
	            }
	        },
	
	        setDomNodeChildren: function(node, childNodes) {
	            if (!isStartComment(node))
	                ko.utils.setDomNodeChildren(node, childNodes);
	            else {
	                ko.virtualElements.emptyNode(node);
	                var endCommentNode = node.nextSibling; // Must be the next sibling, as we just emptied the children
	                for (var i = 0, j = childNodes.length; i < j; i++)
	                    endCommentNode.parentNode.insertBefore(childNodes[i], endCommentNode);
	            }
	        },
	
	        prepend: function(containerNode, nodeToPrepend) {
	            if (!isStartComment(containerNode)) {
	                if (containerNode.firstChild)
	                    containerNode.insertBefore(nodeToPrepend, containerNode.firstChild);
	                else
	                    containerNode.appendChild(nodeToPrepend);
	            } else {
	                // Start comments must always have a parent and at least one following sibling (the end comment)
	                containerNode.parentNode.insertBefore(nodeToPrepend, containerNode.nextSibling);
	            }
	        },
	
	        insertAfter: function(containerNode, nodeToInsert, insertAfterNode) {
	            if (!insertAfterNode) {
	                ko.virtualElements.prepend(containerNode, nodeToInsert);
	            } else if (!isStartComment(containerNode)) {
	                // Insert after insertion point
	                if (insertAfterNode.nextSibling)
	                    containerNode.insertBefore(nodeToInsert, insertAfterNode.nextSibling);
	                else
	                    containerNode.appendChild(nodeToInsert);
	            } else {
	                // Children of start comments must always have a parent and at least one following sibling (the end comment)
	                containerNode.parentNode.insertBefore(nodeToInsert, insertAfterNode.nextSibling);
	            }
	        },
	
	        firstChild: function(node) {
	            if (!isStartComment(node))
	                return node.firstChild;
	            if (!node.nextSibling || isEndComment(node.nextSibling))
	                return null;
	            return node.nextSibling;
	        },
	
	        nextSibling: function(node) {
	            if (isStartComment(node))
	                node = getMatchingEndComment(node);
	            if (node.nextSibling && isEndComment(node.nextSibling))
	                return null;
	            return node.nextSibling;
	        },
	
	        hasBindingValue: isStartComment,
	
	        virtualNodeBindingValue: function(node) {
	            var regexMatch = (commentNodesHaveTextProperty ? node.text : node.nodeValue).match(startCommentRegex);
	            return regexMatch ? regexMatch[1] : null;
	        },
	
	        normaliseVirtualElementDomStructure: function(elementVerified) {
	            // Workaround for https://github.com/SteveSanderson/knockout/issues/155
	            // (IE <= 8 or IE 9 quirks mode parses your HTML weirdly, treating closing </li> tags as if they don't exist, thereby moving comment nodes
	            // that are direct descendants of <ul> into the preceding <li>)
	            if (!htmlTagsWithOptionallyClosingChildren[ko.utils.tagNameLower(elementVerified)])
	                return;
	
	            // Scan immediate children to see if they contain unbalanced comment tags. If they do, those comment tags
	            // must be intended to appear *after* that child, so move them there.
	            var childNode = elementVerified.firstChild;
	            if (childNode) {
	                do {
	                    if (childNode.nodeType === 1) {
	                        var unbalancedTags = getUnbalancedChildTags(childNode);
	                        if (unbalancedTags) {
	                            // Fix up the DOM by moving the unbalanced tags to where they most likely were intended to be placed - *after* the child
	                            var nodeToInsertBefore = childNode.nextSibling;
	                            for (var i = 0; i < unbalancedTags.length; i++) {
	                                if (nodeToInsertBefore)
	                                    elementVerified.insertBefore(unbalancedTags[i], nodeToInsertBefore);
	                                else
	                                    elementVerified.appendChild(unbalancedTags[i]);
	                            }
	                        }
	                    }
	                } while (childNode = childNode.nextSibling);
	            }
	        }
	    };
	})();
	ko.exportSymbol('virtualElements', ko.virtualElements);
	ko.exportSymbol('virtualElements.allowedBindings', ko.virtualElements.allowedBindings);
	ko.exportSymbol('virtualElements.emptyNode', ko.virtualElements.emptyNode);
	//ko.exportSymbol('virtualElements.firstChild', ko.virtualElements.firstChild);     // firstChild is not minified
	ko.exportSymbol('virtualElements.insertAfter', ko.virtualElements.insertAfter);
	//ko.exportSymbol('virtualElements.nextSibling', ko.virtualElements.nextSibling);   // nextSibling is not minified
	ko.exportSymbol('virtualElements.prepend', ko.virtualElements.prepend);
	ko.exportSymbol('virtualElements.setDomNodeChildren', ko.virtualElements.setDomNodeChildren);
	(function() {
	    var defaultBindingAttributeName = "data-bind";
	
	    ko.bindingProvider = function() {
	        this.bindingCache = {};
	    };
	
	    ko.utils.extend(ko.bindingProvider.prototype, {
	        'nodeHasBindings': function(node) {
	            switch (node.nodeType) {
	                case 1: // Element
	                    return node.getAttribute(defaultBindingAttributeName) != null
	                        || ko.components['getComponentNameForNode'](node);
	                case 8: // Comment node
	                    return ko.virtualElements.hasBindingValue(node);
	                default: return false;
	            }
	        },
	
	        'getBindings': function(node, bindingContext) {
	            var bindingsString = this['getBindingsString'](node, bindingContext),
	                parsedBindings = bindingsString ? this['parseBindingsString'](bindingsString, bindingContext, node) : null;
	            return ko.components.addBindingsForCustomElement(parsedBindings, node, bindingContext, /* valueAccessors */ false);
	        },
	
	        'getBindingAccessors': function(node, bindingContext) {
	            var bindingsString = this['getBindingsString'](node, bindingContext),
	                parsedBindings = bindingsString ? this['parseBindingsString'](bindingsString, bindingContext, node, { 'valueAccessors': true }) : null;
	            return ko.components.addBindingsForCustomElement(parsedBindings, node, bindingContext, /* valueAccessors */ true);
	        },
	
	        // The following function is only used internally by this default provider.
	        // It's not part of the interface definition for a general binding provider.
	        'getBindingsString': function(node, bindingContext) {
	            switch (node.nodeType) {
	                case 1: return node.getAttribute(defaultBindingAttributeName);   // Element
	                case 8: return ko.virtualElements.virtualNodeBindingValue(node); // Comment node
	                default: return null;
	            }
	        },
	
	        // The following function is only used internally by this default provider.
	        // It's not part of the interface definition for a general binding provider.
	        'parseBindingsString': function(bindingsString, bindingContext, node, options) {
	            try {
	                var bindingFunction = createBindingsStringEvaluatorViaCache(bindingsString, this.bindingCache, options);
	                return bindingFunction(bindingContext, node);
	            } catch (ex) {
	                ex.message = "Unable to parse bindings.\nBindings value: " + bindingsString + "\nMessage: " + ex.message;
	                throw ex;
	            }
	        }
	    });
	
	    ko.bindingProvider['instance'] = new ko.bindingProvider();
	
	    function createBindingsStringEvaluatorViaCache(bindingsString, cache, options) {
	        var cacheKey = bindingsString + (options && options['valueAccessors'] || '');
	        return cache[cacheKey]
	            || (cache[cacheKey] = createBindingsStringEvaluator(bindingsString, options));
	    }
	
	    function createBindingsStringEvaluator(bindingsString, options) {
	        // Build the source for a function that evaluates "expression"
	        // For each scope variable, add an extra level of "with" nesting
	        // Example result: with(sc1) { with(sc0) { return (expression) } }
	        var rewrittenBindings = ko.expressionRewriting.preProcessBindings(bindingsString, options),
	            functionBody = "with($context){with($data||{}){return{" + rewrittenBindings + "}}}";
	        return new Function("$context", "$element", functionBody);
	    }
	})();
	
	ko.exportSymbol('bindingProvider', ko.bindingProvider);
	(function () {
	    ko.bindingHandlers = {};
	
	    // The following element types will not be recursed into during binding.
	    var bindingDoesNotRecurseIntoElementTypes = {
	        // Don't want bindings that operate on text nodes to mutate <script> and <textarea> contents,
	        // because it's unexpected and a potential XSS issue.
	        // Also bindings should not operate on <template> elements since this breaks in Internet Explorer
	        // and because such elements' contents are always intended to be bound in a different context
	        // from where they appear in the document.
	        'script': true,
	        'textarea': true,
	        'template': true
	    };
	
	    // Use an overridable method for retrieving binding handlers so that a plugins may support dynamically created handlers
	    ko['getBindingHandler'] = function(bindingKey) {
	        return ko.bindingHandlers[bindingKey];
	    };
	
	    // The ko.bindingContext constructor is only called directly to create the root context. For child
	    // contexts, use bindingContext.createChildContext or bindingContext.extend.
	    ko.bindingContext = function(dataItemOrAccessor, parentContext, dataItemAlias, extendCallback) {
	
	        // The binding context object includes static properties for the current, parent, and root view models.
	        // If a view model is actually stored in an observable, the corresponding binding context object, and
	        // any child contexts, must be updated when the view model is changed.
	        function updateContext() {
	            // Most of the time, the context will directly get a view model object, but if a function is given,
	            // we call the function to retrieve the view model. If the function accesses any observables or returns
	            // an observable, the dependency is tracked, and those observables can later cause the binding
	            // context to be updated.
	            var dataItemOrObservable = isFunc ? dataItemOrAccessor() : dataItemOrAccessor,
	                dataItem = ko.utils.unwrapObservable(dataItemOrObservable);
	
	            if (parentContext) {
	                // When a "parent" context is given, register a dependency on the parent context. Thus whenever the
	                // parent context is updated, this context will also be updated.
	                if (parentContext._subscribable)
	                    parentContext._subscribable();
	
	                // Copy $root and any custom properties from the parent context
	                ko.utils.extend(self, parentContext);
	
	                // Because the above copy overwrites our own properties, we need to reset them.
	                // During the first execution, "subscribable" isn't set, so don't bother doing the update then.
	                if (subscribable) {
	                    self._subscribable = subscribable;
	                }
	            } else {
	                self['$parents'] = [];
	                self['$root'] = dataItem;
	
	                // Export 'ko' in the binding context so it will be available in bindings and templates
	                // even if 'ko' isn't exported as a global, such as when using an AMD loader.
	                // See https://github.com/SteveSanderson/knockout/issues/490
	                self['ko'] = ko;
	            }
	            self['$rawData'] = dataItemOrObservable;
	            self['$data'] = dataItem;
	            if (dataItemAlias)
	                self[dataItemAlias] = dataItem;
	
	            // The extendCallback function is provided when creating a child context or extending a context.
	            // It handles the specific actions needed to finish setting up the binding context. Actions in this
	            // function could also add dependencies to this binding context.
	            if (extendCallback)
	                extendCallback(self, parentContext, dataItem);
	
	            return self['$data'];
	        }
	        function disposeWhen() {
	            return nodes && !ko.utils.anyDomNodeIsAttachedToDocument(nodes);
	        }
	
	        var self = this,
	            isFunc = typeof(dataItemOrAccessor) == "function" && !ko.isObservable(dataItemOrAccessor),
	            nodes,
	            subscribable = ko.dependentObservable(updateContext, null, { disposeWhen: disposeWhen, disposeWhenNodeIsRemoved: true });
	
	        // At this point, the binding context has been initialized, and the "subscribable" computed observable is
	        // subscribed to any observables that were accessed in the process. If there is nothing to track, the
	        // computed will be inactive, and we can safely throw it away. If it's active, the computed is stored in
	        // the context object.
	        if (subscribable.isActive()) {
	            self._subscribable = subscribable;
	
	            // Always notify because even if the model ($data) hasn't changed, other context properties might have changed
	            subscribable['equalityComparer'] = null;
	
	            // We need to be able to dispose of this computed observable when it's no longer needed. This would be
	            // easy if we had a single node to watch, but binding contexts can be used by many different nodes, and
	            // we cannot assume that those nodes have any relation to each other. So instead we track any node that
	            // the context is attached to, and dispose the computed when all of those nodes have been cleaned.
	
	            // Add properties to *subscribable* instead of *self* because any properties added to *self* may be overwritten on updates
	            nodes = [];
	            subscribable._addNode = function(node) {
	                nodes.push(node);
	                ko.utils.domNodeDisposal.addDisposeCallback(node, function(node) {
	                    ko.utils.arrayRemoveItem(nodes, node);
	                    if (!nodes.length) {
	                        subscribable.dispose();
	                        self._subscribable = subscribable = undefined;
	                    }
	                });
	            };
	        }
	    }
	
	    // Extend the binding context hierarchy with a new view model object. If the parent context is watching
	    // any observables, the new child context will automatically get a dependency on the parent context.
	    // But this does not mean that the $data value of the child context will also get updated. If the child
	    // view model also depends on the parent view model, you must provide a function that returns the correct
	    // view model on each update.
	    ko.bindingContext.prototype['createChildContext'] = function (dataItemOrAccessor, dataItemAlias, extendCallback) {
	        return new ko.bindingContext(dataItemOrAccessor, this, dataItemAlias, function(self, parentContext) {
	            // Extend the context hierarchy by setting the appropriate pointers
	            self['$parentContext'] = parentContext;
	            self['$parent'] = parentContext['$data'];
	            self['$parents'] = (parentContext['$parents'] || []).slice(0);
	            self['$parents'].unshift(self['$parent']);
	            if (extendCallback)
	                extendCallback(self);
	        });
	    };
	
	    // Extend the binding context with new custom properties. This doesn't change the context hierarchy.
	    // Similarly to "child" contexts, provide a function here to make sure that the correct values are set
	    // when an observable view model is updated.
	    ko.bindingContext.prototype['extend'] = function(properties) {
	        // If the parent context references an observable view model, "_subscribable" will always be the
	        // latest view model object. If not, "_subscribable" isn't set, and we can use the static "$data" value.
	        return new ko.bindingContext(this._subscribable || this['$data'], this, null, function(self, parentContext) {
	            // This "child" context doesn't directly track a parent observable view model,
	            // so we need to manually set the $rawData value to match the parent.
	            self['$rawData'] = parentContext['$rawData'];
	            ko.utils.extend(self, typeof(properties) == "function" ? properties() : properties);
	        });
	    };
	
	    // Returns the valueAccesor function for a binding value
	    function makeValueAccessor(value) {
	        return function() {
	            return value;
	        };
	    }
	
	    // Returns the value of a valueAccessor function
	    function evaluateValueAccessor(valueAccessor) {
	        return valueAccessor();
	    }
	
	    // Given a function that returns bindings, create and return a new object that contains
	    // binding value-accessors functions. Each accessor function calls the original function
	    // so that it always gets the latest value and all dependencies are captured. This is used
	    // by ko.applyBindingsToNode and getBindingsAndMakeAccessors.
	    function makeAccessorsFromFunction(callback) {
	        return ko.utils.objectMap(ko.dependencyDetection.ignore(callback), function(value, key) {
	            return function() {
	                return callback()[key];
	            };
	        });
	    }
	
	    // Given a bindings function or object, create and return a new object that contains
	    // binding value-accessors functions. This is used by ko.applyBindingsToNode.
	    function makeBindingAccessors(bindings, context, node) {
	        if (typeof bindings === 'function') {
	            return makeAccessorsFromFunction(bindings.bind(null, context, node));
	        } else {
	            return ko.utils.objectMap(bindings, makeValueAccessor);
	        }
	    }
	
	    // This function is used if the binding provider doesn't include a getBindingAccessors function.
	    // It must be called with 'this' set to the provider instance.
	    function getBindingsAndMakeAccessors(node, context) {
	        return makeAccessorsFromFunction(this['getBindings'].bind(this, node, context));
	    }
	
	    function validateThatBindingIsAllowedForVirtualElements(bindingName) {
	        var validator = ko.virtualElements.allowedBindings[bindingName];
	        if (!validator)
	            throw new Error("The binding '" + bindingName + "' cannot be used with virtual elements")
	    }
	
	    function applyBindingsToDescendantsInternal (bindingContext, elementOrVirtualElement, bindingContextsMayDifferFromDomParentElement) {
	        var currentChild,
	            nextInQueue = ko.virtualElements.firstChild(elementOrVirtualElement),
	            provider = ko.bindingProvider['instance'],
	            preprocessNode = provider['preprocessNode'];
	
	        // Preprocessing allows a binding provider to mutate a node before bindings are applied to it. For example it's
	        // possible to insert new siblings after it, and/or replace the node with a different one. This can be used to
	        // implement custom binding syntaxes, such as {{ value }} for string interpolation, or custom element types that
	        // trigger insertion of <template> contents at that point in the document.
	        if (preprocessNode) {
	            while (currentChild = nextInQueue) {
	                nextInQueue = ko.virtualElements.nextSibling(currentChild);
	                preprocessNode.call(provider, currentChild);
	            }
	            // Reset nextInQueue for the next loop
	            nextInQueue = ko.virtualElements.firstChild(elementOrVirtualElement);
	        }
	
	        while (currentChild = nextInQueue) {
	            // Keep a record of the next child *before* applying bindings, in case the binding removes the current child from its position
	            nextInQueue = ko.virtualElements.nextSibling(currentChild);
	            applyBindingsToNodeAndDescendantsInternal(bindingContext, currentChild, bindingContextsMayDifferFromDomParentElement);
	        }
	    }
	
	    function applyBindingsToNodeAndDescendantsInternal (bindingContext, nodeVerified, bindingContextMayDifferFromDomParentElement) {
	        var shouldBindDescendants = true;
	
	        // Perf optimisation: Apply bindings only if...
	        // (1) We need to store the binding context on this node (because it may differ from the DOM parent node's binding context)
	        //     Note that we can't store binding contexts on non-elements (e.g., text nodes), as IE doesn't allow expando properties for those
	        // (2) It might have bindings (e.g., it has a data-bind attribute, or it's a marker for a containerless template)
	        var isElement = (nodeVerified.nodeType === 1);
	        if (isElement) // Workaround IE <= 8 HTML parsing weirdness
	            ko.virtualElements.normaliseVirtualElementDomStructure(nodeVerified);
	
	        var shouldApplyBindings = (isElement && bindingContextMayDifferFromDomParentElement)             // Case (1)
	                               || ko.bindingProvider['instance']['nodeHasBindings'](nodeVerified);       // Case (2)
	        if (shouldApplyBindings)
	            shouldBindDescendants = applyBindingsToNodeInternal(nodeVerified, null, bindingContext, bindingContextMayDifferFromDomParentElement)['shouldBindDescendants'];
	
	        if (shouldBindDescendants && !bindingDoesNotRecurseIntoElementTypes[ko.utils.tagNameLower(nodeVerified)]) {
	            // We're recursing automatically into (real or virtual) child nodes without changing binding contexts. So,
	            //  * For children of a *real* element, the binding context is certainly the same as on their DOM .parentNode,
	            //    hence bindingContextsMayDifferFromDomParentElement is false
	            //  * For children of a *virtual* element, we can't be sure. Evaluating .parentNode on those children may
	            //    skip over any number of intermediate virtual elements, any of which might define a custom binding context,
	            //    hence bindingContextsMayDifferFromDomParentElement is true
	            applyBindingsToDescendantsInternal(bindingContext, nodeVerified, /* bindingContextsMayDifferFromDomParentElement: */ !isElement);
	        }
	    }
	
	    var boundElementDomDataKey = ko.utils.domData.nextKey();
	
	
	    function topologicalSortBindings(bindings) {
	        // Depth-first sort
	        var result = [],                // The list of key/handler pairs that we will return
	            bindingsConsidered = {},    // A temporary record of which bindings are already in 'result'
	            cyclicDependencyStack = []; // Keeps track of a depth-search so that, if there's a cycle, we know which bindings caused it
	        ko.utils.objectForEach(bindings, function pushBinding(bindingKey) {
	            if (!bindingsConsidered[bindingKey]) {
	                var binding = ko['getBindingHandler'](bindingKey);
	                if (binding) {
	                    // First add dependencies (if any) of the current binding
	                    if (binding['after']) {
	                        cyclicDependencyStack.push(bindingKey);
	                        ko.utils.arrayForEach(binding['after'], function(bindingDependencyKey) {
	                            if (bindings[bindingDependencyKey]) {
	                                if (ko.utils.arrayIndexOf(cyclicDependencyStack, bindingDependencyKey) !== -1) {
	                                    throw Error("Cannot combine the following bindings, because they have a cyclic dependency: " + cyclicDependencyStack.join(", "));
	                                } else {
	                                    pushBinding(bindingDependencyKey);
	                                }
	                            }
	                        });
	                        cyclicDependencyStack.length--;
	                    }
	                    // Next add the current binding
	                    result.push({ key: bindingKey, handler: binding });
	                }
	                bindingsConsidered[bindingKey] = true;
	            }
	        });
	
	        return result;
	    }
	
	    function applyBindingsToNodeInternal(node, sourceBindings, bindingContext, bindingContextMayDifferFromDomParentElement) {
	        // Prevent multiple applyBindings calls for the same node, except when a binding value is specified
	        var alreadyBound = ko.utils.domData.get(node, boundElementDomDataKey);
	        if (!sourceBindings) {
	            if (alreadyBound) {
	                throw Error("You cannot apply bindings multiple times to the same element.");
	            }
	            ko.utils.domData.set(node, boundElementDomDataKey, true);
	        }
	
	        // Optimization: Don't store the binding context on this node if it's definitely the same as on node.parentNode, because
	        // we can easily recover it just by scanning up the node's ancestors in the DOM
	        // (note: here, parent node means "real DOM parent" not "virtual parent", as there's no O(1) way to find the virtual parent)
	        if (!alreadyBound && bindingContextMayDifferFromDomParentElement)
	            ko.storedBindingContextForNode(node, bindingContext);
	
	        // Use bindings if given, otherwise fall back on asking the bindings provider to give us some bindings
	        var bindings;
	        if (sourceBindings && typeof sourceBindings !== 'function') {
	            bindings = sourceBindings;
	        } else {
	            var provider = ko.bindingProvider['instance'],
	                getBindings = provider['getBindingAccessors'] || getBindingsAndMakeAccessors;
	
	            // Get the binding from the provider within a computed observable so that we can update the bindings whenever
	            // the binding context is updated or if the binding provider accesses observables.
	            var bindingsUpdater = ko.dependentObservable(
	                function() {
	                    bindings = sourceBindings ? sourceBindings(bindingContext, node) : getBindings.call(provider, node, bindingContext);
	                    // Register a dependency on the binding context to support observable view models.
	                    if (bindings && bindingContext._subscribable)
	                        bindingContext._subscribable();
	                    return bindings;
	                },
	                null, { disposeWhenNodeIsRemoved: node }
	            );
	
	            if (!bindings || !bindingsUpdater.isActive())
	                bindingsUpdater = null;
	        }
	
	        var bindingHandlerThatControlsDescendantBindings;
	        if (bindings) {
	            // Return the value accessor for a given binding. When bindings are static (won't be updated because of a binding
	            // context update), just return the value accessor from the binding. Otherwise, return a function that always gets
	            // the latest binding value and registers a dependency on the binding updater.
	            var getValueAccessor = bindingsUpdater
	                ? function(bindingKey) {
	                    return function() {
	                        return evaluateValueAccessor(bindingsUpdater()[bindingKey]);
	                    };
	                } : function(bindingKey) {
	                    return bindings[bindingKey];
	                };
	
	            // Use of allBindings as a function is maintained for backwards compatibility, but its use is deprecated
	            function allBindings() {
	                return ko.utils.objectMap(bindingsUpdater ? bindingsUpdater() : bindings, evaluateValueAccessor);
	            }
	            // The following is the 3.x allBindings API
	            allBindings['get'] = function(key) {
	                return bindings[key] && evaluateValueAccessor(getValueAccessor(key));
	            };
	            allBindings['has'] = function(key) {
	                return key in bindings;
	            };
	
	            // First put the bindings into the right order
	            var orderedBindings = topologicalSortBindings(bindings);
	
	            // Go through the sorted bindings, calling init and update for each
	            ko.utils.arrayForEach(orderedBindings, function(bindingKeyAndHandler) {
	                // Note that topologicalSortBindings has already filtered out any nonexistent binding handlers,
	                // so bindingKeyAndHandler.handler will always be nonnull.
	                var handlerInitFn = bindingKeyAndHandler.handler["init"],
	                    handlerUpdateFn = bindingKeyAndHandler.handler["update"],
	                    bindingKey = bindingKeyAndHandler.key;
	
	                if (node.nodeType === 8) {
	                    validateThatBindingIsAllowedForVirtualElements(bindingKey);
	                }
	
	                try {
	                    // Run init, ignoring any dependencies
	                    if (typeof handlerInitFn == "function") {
	                        ko.dependencyDetection.ignore(function() {
	                            var initResult = handlerInitFn(node, getValueAccessor(bindingKey), allBindings, bindingContext['$data'], bindingContext);
	
	                            // If this binding handler claims to control descendant bindings, make a note of this
	                            if (initResult && initResult['controlsDescendantBindings']) {
	                                if (bindingHandlerThatControlsDescendantBindings !== undefined)
	                                    throw new Error("Multiple bindings (" + bindingHandlerThatControlsDescendantBindings + " and " + bindingKey + ") are trying to control descendant bindings of the same element. You cannot use these bindings together on the same element.");
	                                bindingHandlerThatControlsDescendantBindings = bindingKey;
	                            }
	                        });
	                    }
	
	                    // Run update in its own computed wrapper
	                    if (typeof handlerUpdateFn == "function") {
	                        ko.dependentObservable(
	                            function() {
	                                handlerUpdateFn(node, getValueAccessor(bindingKey), allBindings, bindingContext['$data'], bindingContext);
	                            },
	                            null,
	                            { disposeWhenNodeIsRemoved: node }
	                        );
	                    }
	                } catch (ex) {
	                    ex.message = "Unable to process binding \"" + bindingKey + ": " + bindings[bindingKey] + "\"\nMessage: " + ex.message;
	                    throw ex;
	                }
	            });
	        }
	
	        return {
	            'shouldBindDescendants': bindingHandlerThatControlsDescendantBindings === undefined
	        };
	    };
	
	    var storedBindingContextDomDataKey = ko.utils.domData.nextKey();
	    ko.storedBindingContextForNode = function (node, bindingContext) {
	        if (arguments.length == 2) {
	            ko.utils.domData.set(node, storedBindingContextDomDataKey, bindingContext);
	            if (bindingContext._subscribable)
	                bindingContext._subscribable._addNode(node);
	        } else {
	            return ko.utils.domData.get(node, storedBindingContextDomDataKey);
	        }
	    }
	
	    function getBindingContext(viewModelOrBindingContext) {
	        return viewModelOrBindingContext && (viewModelOrBindingContext instanceof ko.bindingContext)
	            ? viewModelOrBindingContext
	            : new ko.bindingContext(viewModelOrBindingContext);
	    }
	
	    ko.applyBindingAccessorsToNode = function (node, bindings, viewModelOrBindingContext) {
	        if (node.nodeType === 1) // If it's an element, workaround IE <= 8 HTML parsing weirdness
	            ko.virtualElements.normaliseVirtualElementDomStructure(node);
	        return applyBindingsToNodeInternal(node, bindings, getBindingContext(viewModelOrBindingContext), true);
	    };
	
	    ko.applyBindingsToNode = function (node, bindings, viewModelOrBindingContext) {
	        var context = getBindingContext(viewModelOrBindingContext);
	        return ko.applyBindingAccessorsToNode(node, makeBindingAccessors(bindings, context, node), context);
	    };
	
	    ko.applyBindingsToDescendants = function(viewModelOrBindingContext, rootNode) {
	        if (rootNode.nodeType === 1 || rootNode.nodeType === 8)
	            applyBindingsToDescendantsInternal(getBindingContext(viewModelOrBindingContext), rootNode, true);
	    };
	
	    ko.applyBindings = function (viewModelOrBindingContext, rootNode) {
	        // If jQuery is loaded after Knockout, we won't initially have access to it. So save it here.
	        if (!jQueryInstance && window['jQuery']) {
	            jQueryInstance = window['jQuery'];
	        }
	
	        if (rootNode && (rootNode.nodeType !== 1) && (rootNode.nodeType !== 8))
	            throw new Error("ko.applyBindings: first parameter should be your view model; second parameter should be a DOM node");
	        rootNode = rootNode || window.document.body; // Make "rootNode" parameter optional
	
	        applyBindingsToNodeAndDescendantsInternal(getBindingContext(viewModelOrBindingContext), rootNode, true);
	    };
	
	    // Retrieving binding context from arbitrary nodes
	    ko.contextFor = function(node) {
	        // We can only do something meaningful for elements and comment nodes (in particular, not text nodes, as IE can't store domdata for them)
	        switch (node.nodeType) {
	            case 1:
	            case 8:
	                var context = ko.storedBindingContextForNode(node);
	                if (context) return context;
	                if (node.parentNode) return ko.contextFor(node.parentNode);
	                break;
	        }
	        return undefined;
	    };
	    ko.dataFor = function(node) {
	        var context = ko.contextFor(node);
	        return context ? context['$data'] : undefined;
	    };
	
	    ko.exportSymbol('bindingHandlers', ko.bindingHandlers);
	    ko.exportSymbol('applyBindings', ko.applyBindings);
	    ko.exportSymbol('applyBindingsToDescendants', ko.applyBindingsToDescendants);
	    ko.exportSymbol('applyBindingAccessorsToNode', ko.applyBindingAccessorsToNode);
	    ko.exportSymbol('applyBindingsToNode', ko.applyBindingsToNode);
	    ko.exportSymbol('contextFor', ko.contextFor);
	    ko.exportSymbol('dataFor', ko.dataFor);
	})();
	(function(undefined) {
	    var loadingSubscribablesCache = {}, // Tracks component loads that are currently in flight
	        loadedDefinitionsCache = {};    // Tracks component loads that have already completed
	
	    ko.components = {
	        get: function(componentName, callback) {
	            var cachedDefinition = getObjectOwnProperty(loadedDefinitionsCache, componentName);
	            if (cachedDefinition) {
	                // It's already loaded and cached. Reuse the same definition object.
	                // Note that for API consistency, even cache hits complete asynchronously by default.
	                // You can bypass this by putting synchronous:true on your component config.
	                if (cachedDefinition.isSynchronousComponent) {
	                    ko.dependencyDetection.ignore(function() { // See comment in loaderRegistryBehaviors.js for reasoning
	                        callback(cachedDefinition.definition);
	                    });
	                } else {
	                    ko.tasks.schedule(function() { callback(cachedDefinition.definition); });
	                }
	            } else {
	                // Join the loading process that is already underway, or start a new one.
	                loadComponentAndNotify(componentName, callback);
	            }
	        },
	
	        clearCachedDefinition: function(componentName) {
	            delete loadedDefinitionsCache[componentName];
	        },
	
	        _getFirstResultFromLoaders: getFirstResultFromLoaders
	    };
	
	    function getObjectOwnProperty(obj, propName) {
	        return obj.hasOwnProperty(propName) ? obj[propName] : undefined;
	    }
	
	    function loadComponentAndNotify(componentName, callback) {
	        var subscribable = getObjectOwnProperty(loadingSubscribablesCache, componentName),
	            completedAsync;
	        if (!subscribable) {
	            // It's not started loading yet. Start loading, and when it's done, move it to loadedDefinitionsCache.
	            subscribable = loadingSubscribablesCache[componentName] = new ko.subscribable();
	            subscribable.subscribe(callback);
	
	            beginLoadingComponent(componentName, function(definition, config) {
	                var isSynchronousComponent = !!(config && config['synchronous']);
	                loadedDefinitionsCache[componentName] = { definition: definition, isSynchronousComponent: isSynchronousComponent };
	                delete loadingSubscribablesCache[componentName];
	
	                // For API consistency, all loads complete asynchronously. However we want to avoid
	                // adding an extra task schedule if it's unnecessary (i.e., the completion is already
	                // async).
	                //
	                // You can bypass the 'always asynchronous' feature by putting the synchronous:true
	                // flag on your component configuration when you register it.
	                if (completedAsync || isSynchronousComponent) {
	                    // Note that notifySubscribers ignores any dependencies read within the callback.
	                    // See comment in loaderRegistryBehaviors.js for reasoning
	                    subscribable['notifySubscribers'](definition);
	                } else {
	                    ko.tasks.schedule(function() {
	                        subscribable['notifySubscribers'](definition);
	                    });
	                }
	            });
	            completedAsync = true;
	        } else {
	            subscribable.subscribe(callback);
	        }
	    }
	
	    function beginLoadingComponent(componentName, callback) {
	        getFirstResultFromLoaders('getConfig', [componentName], function(config) {
	            if (config) {
	                // We have a config, so now load its definition
	                getFirstResultFromLoaders('loadComponent', [componentName, config], function(definition) {
	                    callback(definition, config);
	                });
	            } else {
	                // The component has no config - it's unknown to all the loaders.
	                // Note that this is not an error (e.g., a module loading error) - that would abort the
	                // process and this callback would not run. For this callback to run, all loaders must
	                // have confirmed they don't know about this component.
	                callback(null, null);
	            }
	        });
	    }
	
	    function getFirstResultFromLoaders(methodName, argsExceptCallback, callback, candidateLoaders) {
	        // On the first call in the stack, start with the full set of loaders
	        if (!candidateLoaders) {
	            candidateLoaders = ko.components['loaders'].slice(0); // Use a copy, because we'll be mutating this array
	        }
	
	        // Try the next candidate
	        var currentCandidateLoader = candidateLoaders.shift();
	        if (currentCandidateLoader) {
	            var methodInstance = currentCandidateLoader[methodName];
	            if (methodInstance) {
	                var wasAborted = false,
	                    synchronousReturnValue = methodInstance.apply(currentCandidateLoader, argsExceptCallback.concat(function(result) {
	                        if (wasAborted) {
	                            callback(null);
	                        } else if (result !== null) {
	                            // This candidate returned a value. Use it.
	                            callback(result);
	                        } else {
	                            // Try the next candidate
	                            getFirstResultFromLoaders(methodName, argsExceptCallback, callback, candidateLoaders);
	                        }
	                    }));
	
	                // Currently, loaders may not return anything synchronously. This leaves open the possibility
	                // that we'll extend the API to support synchronous return values in the future. It won't be
	                // a breaking change, because currently no loader is allowed to return anything except undefined.
	                if (synchronousReturnValue !== undefined) {
	                    wasAborted = true;
	
	                    // Method to suppress exceptions will remain undocumented. This is only to keep
	                    // KO's specs running tidily, since we can observe the loading got aborted without
	                    // having exceptions cluttering up the console too.
	                    if (!currentCandidateLoader['suppressLoaderExceptions']) {
	                        throw new Error('Component loaders must supply values by invoking the callback, not by returning values synchronously.');
	                    }
	                }
	            } else {
	                // This candidate doesn't have the relevant handler. Synchronously move on to the next one.
	                getFirstResultFromLoaders(methodName, argsExceptCallback, callback, candidateLoaders);
	            }
	        } else {
	            // No candidates returned a value
	            callback(null);
	        }
	    }
	
	    // Reference the loaders via string name so it's possible for developers
	    // to replace the whole array by assigning to ko.components.loaders
	    ko.components['loaders'] = [];
	
	    ko.exportSymbol('components', ko.components);
	    ko.exportSymbol('components.get', ko.components.get);
	    ko.exportSymbol('components.clearCachedDefinition', ko.components.clearCachedDefinition);
	})();
	(function(undefined) {
	
	    // The default loader is responsible for two things:
	    // 1. Maintaining the default in-memory registry of component configuration objects
	    //    (i.e., the thing you're writing to when you call ko.components.register(someName, ...))
	    // 2. Answering requests for components by fetching configuration objects
	    //    from that default in-memory registry and resolving them into standard
	    //    component definition objects (of the form { createViewModel: ..., template: ... })
	    // Custom loaders may override either of these facilities, i.e.,
	    // 1. To supply configuration objects from some other source (e.g., conventions)
	    // 2. Or, to resolve configuration objects by loading viewmodels/templates via arbitrary logic.
	
	    var defaultConfigRegistry = {};
	
	    ko.components.register = function(componentName, config) {
	        if (!config) {
	            throw new Error('Invalid configuration for ' + componentName);
	        }
	
	        if (ko.components.isRegistered(componentName)) {
	            throw new Error('Component ' + componentName + ' is already registered');
	        }
	
	        defaultConfigRegistry[componentName] = config;
	    };
	
	    ko.components.isRegistered = function(componentName) {
	        return defaultConfigRegistry.hasOwnProperty(componentName);
	    };
	
	    ko.components.unregister = function(componentName) {
	        delete defaultConfigRegistry[componentName];
	        ko.components.clearCachedDefinition(componentName);
	    };
	
	    ko.components.defaultLoader = {
	        'getConfig': function(componentName, callback) {
	            var result = defaultConfigRegistry.hasOwnProperty(componentName)
	                ? defaultConfigRegistry[componentName]
	                : null;
	            callback(result);
	        },
	
	        'loadComponent': function(componentName, config, callback) {
	            var errorCallback = makeErrorCallback(componentName);
	            possiblyGetConfigFromAmd(errorCallback, config, function(loadedConfig) {
	                resolveConfig(componentName, errorCallback, loadedConfig, callback);
	            });
	        },
	
	        'loadTemplate': function(componentName, templateConfig, callback) {
	            resolveTemplate(makeErrorCallback(componentName), templateConfig, callback);
	        },
	
	        'loadViewModel': function(componentName, viewModelConfig, callback) {
	            resolveViewModel(makeErrorCallback(componentName), viewModelConfig, callback);
	        }
	    };
	
	    var createViewModelKey = 'createViewModel';
	
	    // Takes a config object of the form { template: ..., viewModel: ... }, and asynchronously convert it
	    // into the standard component definition format:
	    //    { template: <ArrayOfDomNodes>, createViewModel: function(params, componentInfo) { ... } }.
	    // Since both template and viewModel may need to be resolved asynchronously, both tasks are performed
	    // in parallel, and the results joined when both are ready. We don't depend on any promises infrastructure,
	    // so this is implemented manually below.
	    function resolveConfig(componentName, errorCallback, config, callback) {
	        var result = {},
	            makeCallBackWhenZero = 2,
	            tryIssueCallback = function() {
	                if (--makeCallBackWhenZero === 0) {
	                    callback(result);
	                }
	            },
	            templateConfig = config['template'],
	            viewModelConfig = config['viewModel'];
	
	        if (templateConfig) {
	            possiblyGetConfigFromAmd(errorCallback, templateConfig, function(loadedConfig) {
	                ko.components._getFirstResultFromLoaders('loadTemplate', [componentName, loadedConfig], function(resolvedTemplate) {
	                    result['template'] = resolvedTemplate;
	                    tryIssueCallback();
	                });
	            });
	        } else {
	            tryIssueCallback();
	        }
	
	        if (viewModelConfig) {
	            possiblyGetConfigFromAmd(errorCallback, viewModelConfig, function(loadedConfig) {
	                ko.components._getFirstResultFromLoaders('loadViewModel', [componentName, loadedConfig], function(resolvedViewModel) {
	                    result[createViewModelKey] = resolvedViewModel;
	                    tryIssueCallback();
	                });
	            });
	        } else {
	            tryIssueCallback();
	        }
	    }
	
	    function resolveTemplate(errorCallback, templateConfig, callback) {
	        if (typeof templateConfig === 'string') {
	            // Markup - parse it
	            callback(ko.utils.parseHtmlFragment(templateConfig));
	        } else if (templateConfig instanceof Array) {
	            // Assume already an array of DOM nodes - pass through unchanged
	            callback(templateConfig);
	        } else if (isDocumentFragment(templateConfig)) {
	            // Document fragment - use its child nodes
	            callback(ko.utils.makeArray(templateConfig.childNodes));
	        } else if (templateConfig['element']) {
	            var element = templateConfig['element'];
	            if (isDomElement(element)) {
	                // Element instance - copy its child nodes
	                callback(cloneNodesFromTemplateSourceElement(element));
	            } else if (typeof element === 'string') {
	                // Element ID - find it, then copy its child nodes
	                var elemInstance = document.getElementById(element);
	                if (elemInstance) {
	                    callback(cloneNodesFromTemplateSourceElement(elemInstance));
	                } else {
	                    errorCallback('Cannot find element with ID ' + element);
	                }
	            } else {
	                errorCallback('Unknown element type: ' + element);
	            }
	        } else {
	            errorCallback('Unknown template value: ' + templateConfig);
	        }
	    }
	
	    function resolveViewModel(errorCallback, viewModelConfig, callback) {
	        if (typeof viewModelConfig === 'function') {
	            // Constructor - convert to standard factory function format
	            // By design, this does *not* supply componentInfo to the constructor, as the intent is that
	            // componentInfo contains non-viewmodel data (e.g., the component's element) that should only
	            // be used in factory functions, not viewmodel constructors.
	            callback(function (params /*, componentInfo */) {
	                return new viewModelConfig(params);
	            });
	        } else if (typeof viewModelConfig[createViewModelKey] === 'function') {
	            // Already a factory function - use it as-is
	            callback(viewModelConfig[createViewModelKey]);
	        } else if ('instance' in viewModelConfig) {
	            // Fixed object instance - promote to createViewModel format for API consistency
	            var fixedInstance = viewModelConfig['instance'];
	            callback(function (params, componentInfo) {
	                return fixedInstance;
	            });
	        } else if ('viewModel' in viewModelConfig) {
	            // Resolved AMD module whose value is of the form { viewModel: ... }
	            resolveViewModel(errorCallback, viewModelConfig['viewModel'], callback);
	        } else {
	            errorCallback('Unknown viewModel value: ' + viewModelConfig);
	        }
	    }
	
	    function cloneNodesFromTemplateSourceElement(elemInstance) {
	        switch (ko.utils.tagNameLower(elemInstance)) {
	            case 'script':
	                return ko.utils.parseHtmlFragment(elemInstance.text);
	            case 'textarea':
	                return ko.utils.parseHtmlFragment(elemInstance.value);
	            case 'template':
	                // For browsers with proper <template> element support (i.e., where the .content property
	                // gives a document fragment), use that document fragment.
	                if (isDocumentFragment(elemInstance.content)) {
	                    return ko.utils.cloneNodes(elemInstance.content.childNodes);
	                }
	        }
	
	        // Regular elements such as <div>, and <template> elements on old browsers that don't really
	        // understand <template> and just treat it as a regular container
	        return ko.utils.cloneNodes(elemInstance.childNodes);
	    }
	
	    function isDomElement(obj) {
	        if (window['HTMLElement']) {
	            return obj instanceof HTMLElement;
	        } else {
	            return obj && obj.tagName && obj.nodeType === 1;
	        }
	    }
	
	    function isDocumentFragment(obj) {
	        if (window['DocumentFragment']) {
	            return obj instanceof DocumentFragment;
	        } else {
	            return obj && obj.nodeType === 11;
	        }
	    }
	
	    function possiblyGetConfigFromAmd(errorCallback, config, callback) {
	        if (typeof config['require'] === 'string') {
	            // The config is the value of an AMD module
	            if (amdRequire || window['require']) {
	                (amdRequire || window['require'])([config['require']], callback);
	            } else {
	                errorCallback('Uses require, but no AMD loader is present');
	            }
	        } else {
	            callback(config);
	        }
	    }
	
	    function makeErrorCallback(componentName) {
	        return function (message) {
	            throw new Error('Component \'' + componentName + '\': ' + message);
	        };
	    }
	
	    ko.exportSymbol('components.register', ko.components.register);
	    ko.exportSymbol('components.isRegistered', ko.components.isRegistered);
	    ko.exportSymbol('components.unregister', ko.components.unregister);
	
	    // Expose the default loader so that developers can directly ask it for configuration
	    // or to resolve configuration
	    ko.exportSymbol('components.defaultLoader', ko.components.defaultLoader);
	
	    // By default, the default loader is the only registered component loader
	    ko.components['loaders'].push(ko.components.defaultLoader);
	
	    // Privately expose the underlying config registry for use in old-IE shim
	    ko.components._allRegisteredComponents = defaultConfigRegistry;
	})();
	(function (undefined) {
	    // Overridable API for determining which component name applies to a given node. By overriding this,
	    // you can for example map specific tagNames to components that are not preregistered.
	    ko.components['getComponentNameForNode'] = function(node) {
	        var tagNameLower = ko.utils.tagNameLower(node);
	        if (ko.components.isRegistered(tagNameLower)) {
	            // Try to determine that this node can be considered a *custom* element; see https://github.com/knockout/knockout/issues/1603
	            if (tagNameLower.indexOf('-') != -1 || ('' + node) == "[object HTMLUnknownElement]" || (ko.utils.ieVersion <= 8 && node.tagName === tagNameLower)) {
	                return tagNameLower;
	            }
	        }
	    };
	
	    ko.components.addBindingsForCustomElement = function(allBindings, node, bindingContext, valueAccessors) {
	        // Determine if it's really a custom element matching a component
	        if (node.nodeType === 1) {
	            var componentName = ko.components['getComponentNameForNode'](node);
	            if (componentName) {
	                // It does represent a component, so add a component binding for it
	                allBindings = allBindings || {};
	
	                if (allBindings['component']) {
	                    // Avoid silently overwriting some other 'component' binding that may already be on the element
	                    throw new Error('Cannot use the "component" binding on a custom element matching a component');
	                }
	
	                var componentBindingValue = { 'name': componentName, 'params': getComponentParamsFromCustomElement(node, bindingContext) };
	
	                allBindings['component'] = valueAccessors
	                    ? function() { return componentBindingValue; }
	                    : componentBindingValue;
	            }
	        }
	
	        return allBindings;
	    }
	
	    var nativeBindingProviderInstance = new ko.bindingProvider();
	
	    function getComponentParamsFromCustomElement(elem, bindingContext) {
	        var paramsAttribute = elem.getAttribute('params');
	
	        if (paramsAttribute) {
	            var params = nativeBindingProviderInstance['parseBindingsString'](paramsAttribute, bindingContext, elem, { 'valueAccessors': true, 'bindingParams': true }),
	                rawParamComputedValues = ko.utils.objectMap(params, function(paramValue, paramName) {
	                    return ko.computed(paramValue, null, { disposeWhenNodeIsRemoved: elem });
	                }),
	                result = ko.utils.objectMap(rawParamComputedValues, function(paramValueComputed, paramName) {
	                    var paramValue = paramValueComputed.peek();
	                    // Does the evaluation of the parameter value unwrap any observables?
	                    if (!paramValueComputed.isActive()) {
	                        // No it doesn't, so there's no need for any computed wrapper. Just pass through the supplied value directly.
	                        // Example: "someVal: firstName, age: 123" (whether or not firstName is an observable/computed)
	                        return paramValue;
	                    } else {
	                        // Yes it does. Supply a computed property that unwraps both the outer (binding expression)
	                        // level of observability, and any inner (resulting model value) level of observability.
	                        // This means the component doesn't have to worry about multiple unwrapping. If the value is a
	                        // writable observable, the computed will also be writable and pass the value on to the observable.
	                        return ko.computed({
	                            'read': function() {
	                                return ko.utils.unwrapObservable(paramValueComputed());
	                            },
	                            'write': ko.isWriteableObservable(paramValue) && function(value) {
	                                paramValueComputed()(value);
	                            },
	                            disposeWhenNodeIsRemoved: elem
	                        });
	                    }
	                });
	
	            // Give access to the raw computeds, as long as that wouldn't overwrite any custom param also called '$raw'
	            // This is in case the developer wants to react to outer (binding) observability separately from inner
	            // (model value) observability, or in case the model value observable has subobservables.
	            if (!result.hasOwnProperty('$raw')) {
	                result['$raw'] = rawParamComputedValues;
	            }
	
	            return result;
	        } else {
	            // For consistency, absence of a "params" attribute is treated the same as the presence of
	            // any empty one. Otherwise component viewmodels need special code to check whether or not
	            // 'params' or 'params.$raw' is null/undefined before reading subproperties, which is annoying.
	            return { '$raw': {} };
	        }
	    }
	
	    // --------------------------------------------------------------------------------
	    // Compatibility code for older (pre-HTML5) IE browsers
	
	    if (ko.utils.ieVersion < 9) {
	        // Whenever you preregister a component, enable it as a custom element in the current document
	        ko.components['register'] = (function(originalFunction) {
	            return function(componentName) {
	                document.createElement(componentName); // Allows IE<9 to parse markup containing the custom element
	                return originalFunction.apply(this, arguments);
	            }
	        })(ko.components['register']);
	
	        // Whenever you create a document fragment, enable all preregistered component names as custom elements
	        // This is needed to make innerShiv/jQuery HTML parsing correctly handle the custom elements
	        document.createDocumentFragment = (function(originalFunction) {
	            return function() {
	                var newDocFrag = originalFunction(),
	                    allComponents = ko.components._allRegisteredComponents;
	                for (var componentName in allComponents) {
	                    if (allComponents.hasOwnProperty(componentName)) {
	                        newDocFrag.createElement(componentName);
	                    }
	                }
	                return newDocFrag;
	            };
	        })(document.createDocumentFragment);
	    }
	})();(function(undefined) {
	
	    var componentLoadingOperationUniqueId = 0;
	
	    ko.bindingHandlers['component'] = {
	        'init': function(element, valueAccessor, ignored1, ignored2, bindingContext) {
	            var currentViewModel,
	                currentLoadingOperationId,
	                disposeAssociatedComponentViewModel = function () {
	                    var currentViewModelDispose = currentViewModel && currentViewModel['dispose'];
	                    if (typeof currentViewModelDispose === 'function') {
	                        currentViewModelDispose.call(currentViewModel);
	                    }
	                    currentViewModel = null;
	                    // Any in-flight loading operation is no longer relevant, so make sure we ignore its completion
	                    currentLoadingOperationId = null;
	                },
	                originalChildNodes = ko.utils.makeArray(ko.virtualElements.childNodes(element));
	
	            ko.utils.domNodeDisposal.addDisposeCallback(element, disposeAssociatedComponentViewModel);
	
	            ko.computed(function () {
	                var value = ko.utils.unwrapObservable(valueAccessor()),
	                    componentName, componentParams;
	
	                if (typeof value === 'string') {
	                    componentName = value;
	                } else {
	                    componentName = ko.utils.unwrapObservable(value['name']);
	                    componentParams = ko.utils.unwrapObservable(value['params']);
	                }
	
	                if (!componentName) {
	                    throw new Error('No component name specified');
	                }
	
	                var loadingOperationId = currentLoadingOperationId = ++componentLoadingOperationUniqueId;
	                ko.components.get(componentName, function(componentDefinition) {
	                    // If this is not the current load operation for this element, ignore it.
	                    if (currentLoadingOperationId !== loadingOperationId) {
	                        return;
	                    }
	
	                    // Clean up previous state
	                    disposeAssociatedComponentViewModel();
	
	                    // Instantiate and bind new component. Implicitly this cleans any old DOM nodes.
	                    if (!componentDefinition) {
	                        throw new Error('Unknown component \'' + componentName + '\'');
	                    }
	                    cloneTemplateIntoElement(componentName, componentDefinition, element);
	                    var componentViewModel = createViewModel(componentDefinition, element, originalChildNodes, componentParams),
	                        childBindingContext = bindingContext['createChildContext'](componentViewModel, /* dataItemAlias */ undefined, function(ctx) {
	                            ctx['$component'] = componentViewModel;
	                            ctx['$componentTemplateNodes'] = originalChildNodes;
	                        });
	                    currentViewModel = componentViewModel;
	                    ko.applyBindingsToDescendants(childBindingContext, element);
	                });
	            }, null, { disposeWhenNodeIsRemoved: element });
	
	            return { 'controlsDescendantBindings': true };
	        }
	    };
	
	    ko.virtualElements.allowedBindings['component'] = true;
	
	    function cloneTemplateIntoElement(componentName, componentDefinition, element) {
	        var template = componentDefinition['template'];
	        if (!template) {
	            throw new Error('Component \'' + componentName + '\' has no template');
	        }
	
	        var clonedNodesArray = ko.utils.cloneNodes(template);
	        ko.virtualElements.setDomNodeChildren(element, clonedNodesArray);
	    }
	
	    function createViewModel(componentDefinition, element, originalChildNodes, componentParams) {
	        var componentViewModelFactory = componentDefinition['createViewModel'];
	        return componentViewModelFactory
	            ? componentViewModelFactory.call(componentDefinition, componentParams, { 'element': element, 'templateNodes': originalChildNodes })
	            : componentParams; // Template-only component
	    }
	
	})();
	var attrHtmlToJavascriptMap = { 'class': 'className', 'for': 'htmlFor' };
	ko.bindingHandlers['attr'] = {
	    'update': function(element, valueAccessor, allBindings) {
	        var value = ko.utils.unwrapObservable(valueAccessor()) || {};
	        ko.utils.objectForEach(value, function(attrName, attrValue) {
	            attrValue = ko.utils.unwrapObservable(attrValue);
	
	            // To cover cases like "attr: { checked:someProp }", we want to remove the attribute entirely
	            // when someProp is a "no value"-like value (strictly null, false, or undefined)
	            // (because the absence of the "checked" attr is how to mark an element as not checked, etc.)
	            var toRemove = (attrValue === false) || (attrValue === null) || (attrValue === undefined);
	            if (toRemove)
	                element.removeAttribute(attrName);
	
	            // In IE <= 7 and IE8 Quirks Mode, you have to use the Javascript property name instead of the
	            // HTML attribute name for certain attributes. IE8 Standards Mode supports the correct behavior,
	            // but instead of figuring out the mode, we'll just set the attribute through the Javascript
	            // property for IE <= 8.
	            if (ko.utils.ieVersion <= 8 && attrName in attrHtmlToJavascriptMap) {
	                attrName = attrHtmlToJavascriptMap[attrName];
	                if (toRemove)
	                    element.removeAttribute(attrName);
	                else
	                    element[attrName] = attrValue;
	            } else if (!toRemove) {
	                element.setAttribute(attrName, attrValue.toString());
	            }
	
	            // Treat "name" specially - although you can think of it as an attribute, it also needs
	            // special handling on older versions of IE (https://github.com/SteveSanderson/knockout/pull/333)
	            // Deliberately being case-sensitive here because XHTML would regard "Name" as a different thing
	            // entirely, and there's no strong reason to allow for such casing in HTML.
	            if (attrName === "name") {
	                ko.utils.setElementName(element, toRemove ? "" : attrValue.toString());
	            }
	        });
	    }
	};
	(function() {
	
	ko.bindingHandlers['checked'] = {
	    'after': ['value', 'attr'],
	    'init': function (element, valueAccessor, allBindings) {
	        var checkedValue = ko.pureComputed(function() {
	            // Treat "value" like "checkedValue" when it is included with "checked" binding
	            if (allBindings['has']('checkedValue')) {
	                return ko.utils.unwrapObservable(allBindings.get('checkedValue'));
	            } else if (allBindings['has']('value')) {
	                return ko.utils.unwrapObservable(allBindings.get('value'));
	            }
	
	            return element.value;
	        });
	
	        function updateModel() {
	            // This updates the model value from the view value.
	            // It runs in response to DOM events (click) and changes in checkedValue.
	            var isChecked = element.checked,
	                elemValue = useCheckedValue ? checkedValue() : isChecked;
	
	            // When we're first setting up this computed, don't change any model state.
	            if (ko.computedContext.isInitial()) {
	                return;
	            }
	
	            // We can ignore unchecked radio buttons, because some other radio
	            // button will be getting checked, and that one can take care of updating state.
	            if (isRadio && !isChecked) {
	                return;
	            }
	
	            var modelValue = ko.dependencyDetection.ignore(valueAccessor);
	            if (valueIsArray) {
	                var writableValue = rawValueIsNonArrayObservable ? modelValue.peek() : modelValue;
	                if (oldElemValue !== elemValue) {
	                    // When we're responding to the checkedValue changing, and the element is
	                    // currently checked, replace the old elem value with the new elem value
	                    // in the model array.
	                    if (isChecked) {
	                        ko.utils.addOrRemoveItem(writableValue, elemValue, true);
	                        ko.utils.addOrRemoveItem(writableValue, oldElemValue, false);
	                    }
	
	                    oldElemValue = elemValue;
	                } else {
	                    // When we're responding to the user having checked/unchecked a checkbox,
	                    // add/remove the element value to the model array.
	                    ko.utils.addOrRemoveItem(writableValue, elemValue, isChecked);
	                }
	                if (rawValueIsNonArrayObservable && ko.isWriteableObservable(modelValue)) {
	                    modelValue(writableValue);
	                }
	            } else {
	                ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'checked', elemValue, true);
	            }
	        };
	
	        function updateView() {
	            // This updates the view value from the model value.
	            // It runs in response to changes in the bound (checked) value.
	            var modelValue = ko.utils.unwrapObservable(valueAccessor());
	
	            if (valueIsArray) {
	                // When a checkbox is bound to an array, being checked represents its value being present in that array
	                element.checked = ko.utils.arrayIndexOf(modelValue, checkedValue()) >= 0;
	            } else if (isCheckbox) {
	                // When a checkbox is bound to any other value (not an array), being checked represents the value being trueish
	                element.checked = modelValue;
	            } else {
	                // For radio buttons, being checked means that the radio button's value corresponds to the model value
	                element.checked = (checkedValue() === modelValue);
	            }
	        };
	
	        var isCheckbox = element.type == "checkbox",
	            isRadio = element.type == "radio";
	
	        // Only bind to check boxes and radio buttons
	        if (!isCheckbox && !isRadio) {
	            return;
	        }
	
	        var rawValue = valueAccessor(),
	            valueIsArray = isCheckbox && (ko.utils.unwrapObservable(rawValue) instanceof Array),
	            rawValueIsNonArrayObservable = !(valueIsArray && rawValue.push && rawValue.splice),
	            oldElemValue = valueIsArray ? checkedValue() : undefined,
	            useCheckedValue = isRadio || valueIsArray;
	
	        // IE 6 won't allow radio buttons to be selected unless they have a name
	        if (isRadio && !element.name)
	            ko.bindingHandlers['uniqueName']['init'](element, function() { return true });
	
	        // Set up two computeds to update the binding:
	
	        // The first responds to changes in the checkedValue value and to element clicks
	        ko.computed(updateModel, null, { disposeWhenNodeIsRemoved: element });
	        ko.utils.registerEventHandler(element, "click", updateModel);
	
	        // The second responds to changes in the model value (the one associated with the checked binding)
	        ko.computed(updateView, null, { disposeWhenNodeIsRemoved: element });
	
	        rawValue = undefined;
	    }
	};
	ko.expressionRewriting.twoWayBindings['checked'] = true;
	
	ko.bindingHandlers['checkedValue'] = {
	    'update': function (element, valueAccessor) {
	        element.value = ko.utils.unwrapObservable(valueAccessor());
	    }
	};
	
	})();var classesWrittenByBindingKey = '__ko__cssValue';
	ko.bindingHandlers['css'] = {
	    'update': function (element, valueAccessor) {
	        var value = ko.utils.unwrapObservable(valueAccessor());
	        if (value !== null && typeof value == "object") {
	            ko.utils.objectForEach(value, function(className, shouldHaveClass) {
	                shouldHaveClass = ko.utils.unwrapObservable(shouldHaveClass);
	                ko.utils.toggleDomNodeCssClass(element, className, shouldHaveClass);
	            });
	        } else {
	            value = ko.utils.stringTrim(String(value || '')); // Make sure we don't try to store or set a non-string value
	            ko.utils.toggleDomNodeCssClass(element, element[classesWrittenByBindingKey], false);
	            element[classesWrittenByBindingKey] = value;
	            ko.utils.toggleDomNodeCssClass(element, value, true);
	        }
	    }
	};
	ko.bindingHandlers['enable'] = {
	    'update': function (element, valueAccessor) {
	        var value = ko.utils.unwrapObservable(valueAccessor());
	        if (value && element.disabled)
	            element.removeAttribute("disabled");
	        else if ((!value) && (!element.disabled))
	            element.disabled = true;
	    }
	};
	
	ko.bindingHandlers['disable'] = {
	    'update': function (element, valueAccessor) {
	        ko.bindingHandlers['enable']['update'](element, function() { return !ko.utils.unwrapObservable(valueAccessor()) });
	    }
	};
	// For certain common events (currently just 'click'), allow a simplified data-binding syntax
	// e.g. click:handler instead of the usual full-length event:{click:handler}
	function makeEventHandlerShortcut(eventName) {
	    ko.bindingHandlers[eventName] = {
	        'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	            var newValueAccessor = function () {
	                var result = {};
	                result[eventName] = valueAccessor();
	                return result;
	            };
	            return ko.bindingHandlers['event']['init'].call(this, element, newValueAccessor, allBindings, viewModel, bindingContext);
	        }
	    }
	}
	
	ko.bindingHandlers['event'] = {
	    'init' : function (element, valueAccessor, allBindings, viewModel, bindingContext) {
	        var eventsToHandle = valueAccessor() || {};
	        ko.utils.objectForEach(eventsToHandle, function(eventName) {
	            if (typeof eventName == "string") {
	                ko.utils.registerEventHandler(element, eventName, function (event) {
	                    var handlerReturnValue;
	                    var handlerFunction = valueAccessor()[eventName];
	                    if (!handlerFunction)
	                        return;
	
	                    try {
	                        // Take all the event args, and prefix with the viewmodel
	                        var argsForHandler = ko.utils.makeArray(arguments);
	                        viewModel = bindingContext['$data'];
	                        argsForHandler.unshift(viewModel);
	                        handlerReturnValue = handlerFunction.apply(viewModel, argsForHandler);
	                    } finally {
	                        if (handlerReturnValue !== true) { // Normally we want to prevent default action. Developer can override this be explicitly returning true.
	                            if (event.preventDefault)
	                                event.preventDefault();
	                            else
	                                event.returnValue = false;
	                        }
	                    }
	
	                    var bubble = allBindings.get(eventName + 'Bubble') !== false;
	                    if (!bubble) {
	                        event.cancelBubble = true;
	                        if (event.stopPropagation)
	                            event.stopPropagation();
	                    }
	                });
	            }
	        });
	    }
	};
	// "foreach: someExpression" is equivalent to "template: { foreach: someExpression }"
	// "foreach: { data: someExpression, afterAdd: myfn }" is equivalent to "template: { foreach: someExpression, afterAdd: myfn }"
	ko.bindingHandlers['foreach'] = {
	    makeTemplateValueAccessor: function(valueAccessor) {
	        return function() {
	            var modelValue = valueAccessor(),
	                unwrappedValue = ko.utils.peekObservable(modelValue);    // Unwrap without setting a dependency here
	
	            // If unwrappedValue is the array, pass in the wrapped value on its own
	            // The value will be unwrapped and tracked within the template binding
	            // (See https://github.com/SteveSanderson/knockout/issues/523)
	            if ((!unwrappedValue) || typeof unwrappedValue.length == "number")
	                return { 'foreach': modelValue, 'templateEngine': ko.nativeTemplateEngine.instance };
	
	            // If unwrappedValue.data is the array, preserve all relevant options and unwrap again value so we get updates
	            ko.utils.unwrapObservable(modelValue);
	            return {
	                'foreach': unwrappedValue['data'],
	                'as': unwrappedValue['as'],
	                'includeDestroyed': unwrappedValue['includeDestroyed'],
	                'afterAdd': unwrappedValue['afterAdd'],
	                'beforeRemove': unwrappedValue['beforeRemove'],
	                'afterRender': unwrappedValue['afterRender'],
	                'beforeMove': unwrappedValue['beforeMove'],
	                'afterMove': unwrappedValue['afterMove'],
	                'templateEngine': ko.nativeTemplateEngine.instance
	            };
	        };
	    },
	    'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	        return ko.bindingHandlers['template']['init'](element, ko.bindingHandlers['foreach'].makeTemplateValueAccessor(valueAccessor));
	    },
	    'update': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	        return ko.bindingHandlers['template']['update'](element, ko.bindingHandlers['foreach'].makeTemplateValueAccessor(valueAccessor), allBindings, viewModel, bindingContext);
	    }
	};
	ko.expressionRewriting.bindingRewriteValidators['foreach'] = false; // Can't rewrite control flow bindings
	ko.virtualElements.allowedBindings['foreach'] = true;
	var hasfocusUpdatingProperty = '__ko_hasfocusUpdating';
	var hasfocusLastValue = '__ko_hasfocusLastValue';
	ko.bindingHandlers['hasfocus'] = {
	    'init': function(element, valueAccessor, allBindings) {
	        var handleElementFocusChange = function(isFocused) {
	            // Where possible, ignore which event was raised and determine focus state using activeElement,
	            // as this avoids phantom focus/blur events raised when changing tabs in modern browsers.
	            // However, not all KO-targeted browsers (Firefox 2) support activeElement. For those browsers,
	            // prevent a loss of focus when changing tabs/windows by setting a flag that prevents hasfocus
	            // from calling 'blur()' on the element when it loses focus.
	            // Discussion at https://github.com/SteveSanderson/knockout/pull/352
	            element[hasfocusUpdatingProperty] = true;
	            var ownerDoc = element.ownerDocument;
	            if ("activeElement" in ownerDoc) {
	                var active;
	                try {
	                    active = ownerDoc.activeElement;
	                } catch(e) {
	                    // IE9 throws if you access activeElement during page load (see issue #703)
	                    active = ownerDoc.body;
	                }
	                isFocused = (active === element);
	            }
	            var modelValue = valueAccessor();
	            ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'hasfocus', isFocused, true);
	
	            //cache the latest value, so we can avoid unnecessarily calling focus/blur in the update function
	            element[hasfocusLastValue] = isFocused;
	            element[hasfocusUpdatingProperty] = false;
	        };
	        var handleElementFocusIn = handleElementFocusChange.bind(null, true);
	        var handleElementFocusOut = handleElementFocusChange.bind(null, false);
	
	        ko.utils.registerEventHandler(element, "focus", handleElementFocusIn);
	        ko.utils.registerEventHandler(element, "focusin", handleElementFocusIn); // For IE
	        ko.utils.registerEventHandler(element, "blur",  handleElementFocusOut);
	        ko.utils.registerEventHandler(element, "focusout",  handleElementFocusOut); // For IE
	    },
	    'update': function(element, valueAccessor) {
	        var value = !!ko.utils.unwrapObservable(valueAccessor());
	
	        if (!element[hasfocusUpdatingProperty] && element[hasfocusLastValue] !== value) {
	            value ? element.focus() : element.blur();
	
	            // In IE, the blur method doesn't always cause the element to lose focus (for example, if the window is not in focus).
	            // Setting focus to the body element does seem to be reliable in IE, but should only be used if we know that the current
	            // element was focused already.
	            if (!value && element[hasfocusLastValue]) {
	                element.ownerDocument.body.focus();
	            }
	
	            // For IE, which doesn't reliably fire "focus" or "blur" events synchronously
	            ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, value ? "focusin" : "focusout"]);
	        }
	    }
	};
	ko.expressionRewriting.twoWayBindings['hasfocus'] = true;
	
	ko.bindingHandlers['hasFocus'] = ko.bindingHandlers['hasfocus']; // Make "hasFocus" an alias
	ko.expressionRewriting.twoWayBindings['hasFocus'] = true;
	ko.bindingHandlers['html'] = {
	    'init': function() {
	        // Prevent binding on the dynamically-injected HTML (as developers are unlikely to expect that, and it has security implications)
	        return { 'controlsDescendantBindings': true };
	    },
	    'update': function (element, valueAccessor) {
	        // setHtml will unwrap the value if needed
	        ko.utils.setHtml(element, valueAccessor());
	    }
	};
	// Makes a binding like with or if
	function makeWithIfBinding(bindingKey, isWith, isNot, makeContextCallback) {
	    ko.bindingHandlers[bindingKey] = {
	        'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	            var didDisplayOnLastUpdate,
	                savedNodes;
	            ko.computed(function() {
	                var dataValue = ko.utils.unwrapObservable(valueAccessor()),
	                    shouldDisplay = !isNot !== !dataValue, // equivalent to isNot ? !dataValue : !!dataValue
	                    isFirstRender = !savedNodes,
	                    needsRefresh = isFirstRender || isWith || (shouldDisplay !== didDisplayOnLastUpdate);
	
	                if (needsRefresh) {
	                    // Save a copy of the inner nodes on the initial update, but only if we have dependencies.
	                    if (isFirstRender && ko.computedContext.getDependenciesCount()) {
	                        savedNodes = ko.utils.cloneNodes(ko.virtualElements.childNodes(element), true /* shouldCleanNodes */);
	                    }
	
	                    if (shouldDisplay) {
	                        if (!isFirstRender) {
	                            ko.virtualElements.setDomNodeChildren(element, ko.utils.cloneNodes(savedNodes));
	                        }
	                        ko.applyBindingsToDescendants(makeContextCallback ? makeContextCallback(bindingContext, dataValue) : bindingContext, element);
	                    } else {
	                        ko.virtualElements.emptyNode(element);
	                    }
	
	                    didDisplayOnLastUpdate = shouldDisplay;
	                }
	            }, null, { disposeWhenNodeIsRemoved: element });
	            return { 'controlsDescendantBindings': true };
	        }
	    };
	    ko.expressionRewriting.bindingRewriteValidators[bindingKey] = false; // Can't rewrite control flow bindings
	    ko.virtualElements.allowedBindings[bindingKey] = true;
	}
	
	// Construct the actual binding handlers
	makeWithIfBinding('if');
	makeWithIfBinding('ifnot', false /* isWith */, true /* isNot */);
	makeWithIfBinding('with', true /* isWith */, false /* isNot */,
	    function(bindingContext, dataValue) {
	        return bindingContext['createChildContext'](dataValue);
	    }
	);
	var captionPlaceholder = {};
	ko.bindingHandlers['options'] = {
	    'init': function(element) {
	        if (ko.utils.tagNameLower(element) !== "select")
	            throw new Error("options binding applies only to SELECT elements");
	
	        // Remove all existing <option>s.
	        while (element.length > 0) {
	            element.remove(0);
	        }
	
	        // Ensures that the binding processor doesn't try to bind the options
	        return { 'controlsDescendantBindings': true };
	    },
	    'update': function (element, valueAccessor, allBindings) {
	        function selectedOptions() {
	            return ko.utils.arrayFilter(element.options, function (node) { return node.selected; });
	        }
	
	        var selectWasPreviouslyEmpty = element.length == 0,
	            multiple = element.multiple,
	            previousScrollTop = (!selectWasPreviouslyEmpty && multiple) ? element.scrollTop : null,
	            unwrappedArray = ko.utils.unwrapObservable(valueAccessor()),
	            valueAllowUnset = allBindings.get('valueAllowUnset') && allBindings['has']('value'),
	            includeDestroyed = allBindings.get('optionsIncludeDestroyed'),
	            arrayToDomNodeChildrenOptions = {},
	            captionValue,
	            filteredArray,
	            previousSelectedValues = [];
	
	        if (!valueAllowUnset) {
	            if (multiple) {
	                previousSelectedValues = ko.utils.arrayMap(selectedOptions(), ko.selectExtensions.readValue);
	            } else if (element.selectedIndex >= 0) {
	                previousSelectedValues.push(ko.selectExtensions.readValue(element.options[element.selectedIndex]));
	            }
	        }
	
	        if (unwrappedArray) {
	            if (typeof unwrappedArray.length == "undefined") // Coerce single value into array
	                unwrappedArray = [unwrappedArray];
	
	            // Filter out any entries marked as destroyed
	            filteredArray = ko.utils.arrayFilter(unwrappedArray, function(item) {
	                return includeDestroyed || item === undefined || item === null || !ko.utils.unwrapObservable(item['_destroy']);
	            });
	
	            // If caption is included, add it to the array
	            if (allBindings['has']('optionsCaption')) {
	                captionValue = ko.utils.unwrapObservable(allBindings.get('optionsCaption'));
	                // If caption value is null or undefined, don't show a caption
	                if (captionValue !== null && captionValue !== undefined) {
	                    filteredArray.unshift(captionPlaceholder);
	                }
	            }
	        } else {
	            // If a falsy value is provided (e.g. null), we'll simply empty the select element
	        }
	
	        function applyToObject(object, predicate, defaultValue) {
	            var predicateType = typeof predicate;
	            if (predicateType == "function")    // Given a function; run it against the data value
	                return predicate(object);
	            else if (predicateType == "string") // Given a string; treat it as a property name on the data value
	                return object[predicate];
	            else                                // Given no optionsText arg; use the data value itself
	                return defaultValue;
	        }
	
	        // The following functions can run at two different times:
	        // The first is when the whole array is being updated directly from this binding handler.
	        // The second is when an observable value for a specific array entry is updated.
	        // oldOptions will be empty in the first case, but will be filled with the previously generated option in the second.
	        var itemUpdate = false;
	        function optionForArrayItem(arrayEntry, index, oldOptions) {
	            if (oldOptions.length) {
	                previousSelectedValues = !valueAllowUnset && oldOptions[0].selected ? [ ko.selectExtensions.readValue(oldOptions[0]) ] : [];
	                itemUpdate = true;
	            }
	            var option = element.ownerDocument.createElement("option");
	            if (arrayEntry === captionPlaceholder) {
	                ko.utils.setTextContent(option, allBindings.get('optionsCaption'));
	                ko.selectExtensions.writeValue(option, undefined);
	            } else {
	                // Apply a value to the option element
	                var optionValue = applyToObject(arrayEntry, allBindings.get('optionsValue'), arrayEntry);
	                ko.selectExtensions.writeValue(option, ko.utils.unwrapObservable(optionValue));
	
	                // Apply some text to the option element
	                var optionText = applyToObject(arrayEntry, allBindings.get('optionsText'), optionValue);
	                ko.utils.setTextContent(option, optionText);
	            }
	            return [option];
	        }
	
	        // By using a beforeRemove callback, we delay the removal until after new items are added. This fixes a selection
	        // problem in IE<=8 and Firefox. See https://github.com/knockout/knockout/issues/1208
	        arrayToDomNodeChildrenOptions['beforeRemove'] =
	            function (option) {
	                element.removeChild(option);
	            };
	
	        function setSelectionCallback(arrayEntry, newOptions) {
	            if (itemUpdate && valueAllowUnset) {
	                // The model value is authoritative, so make sure its value is the one selected
	                // There is no need to use dependencyDetection.ignore since setDomNodeChildrenFromArrayMapping does so already.
	                ko.selectExtensions.writeValue(element, ko.utils.unwrapObservable(allBindings.get('value')), true /* allowUnset */);
	            } else if (previousSelectedValues.length) {
	                // IE6 doesn't like us to assign selection to OPTION nodes before they're added to the document.
	                // That's why we first added them without selection. Now it's time to set the selection.
	                var isSelected = ko.utils.arrayIndexOf(previousSelectedValues, ko.selectExtensions.readValue(newOptions[0])) >= 0;
	                ko.utils.setOptionNodeSelectionState(newOptions[0], isSelected);
	
	                // If this option was changed from being selected during a single-item update, notify the change
	                if (itemUpdate && !isSelected) {
	                    ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, "change"]);
	                }
	            }
	        }
	
	        var callback = setSelectionCallback;
	        if (allBindings['has']('optionsAfterRender') && typeof allBindings.get('optionsAfterRender') == "function") {
	            callback = function(arrayEntry, newOptions) {
	                setSelectionCallback(arrayEntry, newOptions);
	                ko.dependencyDetection.ignore(allBindings.get('optionsAfterRender'), null, [newOptions[0], arrayEntry !== captionPlaceholder ? arrayEntry : undefined]);
	            }
	        }
	
	        ko.utils.setDomNodeChildrenFromArrayMapping(element, filteredArray, optionForArrayItem, arrayToDomNodeChildrenOptions, callback);
	
	        ko.dependencyDetection.ignore(function () {
	            if (valueAllowUnset) {
	                // The model value is authoritative, so make sure its value is the one selected
	                ko.selectExtensions.writeValue(element, ko.utils.unwrapObservable(allBindings.get('value')), true /* allowUnset */);
	            } else {
	                // Determine if the selection has changed as a result of updating the options list
	                var selectionChanged;
	                if (multiple) {
	                    // For a multiple-select box, compare the new selection count to the previous one
	                    // But if nothing was selected before, the selection can't have changed
	                    selectionChanged = previousSelectedValues.length && selectedOptions().length < previousSelectedValues.length;
	                } else {
	                    // For a single-select box, compare the current value to the previous value
	                    // But if nothing was selected before or nothing is selected now, just look for a change in selection
	                    selectionChanged = (previousSelectedValues.length && element.selectedIndex >= 0)
	                        ? (ko.selectExtensions.readValue(element.options[element.selectedIndex]) !== previousSelectedValues[0])
	                        : (previousSelectedValues.length || element.selectedIndex >= 0);
	                }
	
	                // Ensure consistency between model value and selected option.
	                // If the dropdown was changed so that selection is no longer the same,
	                // notify the value or selectedOptions binding.
	                if (selectionChanged) {
	                    ko.utils.triggerEvent(element, "change");
	                }
	            }
	        });
	
	        // Workaround for IE bug
	        ko.utils.ensureSelectElementIsRenderedCorrectly(element);
	
	        if (previousScrollTop && Math.abs(previousScrollTop - element.scrollTop) > 20)
	            element.scrollTop = previousScrollTop;
	    }
	};
	ko.bindingHandlers['options'].optionValueDomDataKey = ko.utils.domData.nextKey();
	ko.bindingHandlers['selectedOptions'] = {
	    'after': ['options', 'foreach'],
	    'init': function (element, valueAccessor, allBindings) {
	        ko.utils.registerEventHandler(element, "change", function () {
	            var value = valueAccessor(), valueToWrite = [];
	            ko.utils.arrayForEach(element.getElementsByTagName("option"), function(node) {
	                if (node.selected)
	                    valueToWrite.push(ko.selectExtensions.readValue(node));
	            });
	            ko.expressionRewriting.writeValueToProperty(value, allBindings, 'selectedOptions', valueToWrite);
	        });
	    },
	    'update': function (element, valueAccessor) {
	        if (ko.utils.tagNameLower(element) != "select")
	            throw new Error("values binding applies only to SELECT elements");
	
	        var newValue = ko.utils.unwrapObservable(valueAccessor()),
	            previousScrollTop = element.scrollTop;
	
	        if (newValue && typeof newValue.length == "number") {
	            ko.utils.arrayForEach(element.getElementsByTagName("option"), function(node) {
	                var isSelected = ko.utils.arrayIndexOf(newValue, ko.selectExtensions.readValue(node)) >= 0;
	                if (node.selected != isSelected) {      // This check prevents flashing of the select element in IE
	                    ko.utils.setOptionNodeSelectionState(node, isSelected);
	                }
	            });
	        }
	
	        element.scrollTop = previousScrollTop;
	    }
	};
	ko.expressionRewriting.twoWayBindings['selectedOptions'] = true;
	ko.bindingHandlers['style'] = {
	    'update': function (element, valueAccessor) {
	        var value = ko.utils.unwrapObservable(valueAccessor() || {});
	        ko.utils.objectForEach(value, function(styleName, styleValue) {
	            styleValue = ko.utils.unwrapObservable(styleValue);
	
	            if (styleValue === null || styleValue === undefined || styleValue === false) {
	                // Empty string removes the value, whereas null/undefined have no effect
	                styleValue = "";
	            }
	
	            element.style[styleName] = styleValue;
	        });
	    }
	};
	ko.bindingHandlers['submit'] = {
	    'init': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
	        if (typeof valueAccessor() != "function")
	            throw new Error("The value for a submit binding must be a function");
	        ko.utils.registerEventHandler(element, "submit", function (event) {
	            var handlerReturnValue;
	            var value = valueAccessor();
	            try { handlerReturnValue = value.call(bindingContext['$data'], element); }
	            finally {
	                if (handlerReturnValue !== true) { // Normally we want to prevent default action. Developer can override this be explicitly returning true.
	                    if (event.preventDefault)
	                        event.preventDefault();
	                    else
	                        event.returnValue = false;
	                }
	            }
	        });
	    }
	};
	ko.bindingHandlers['text'] = {
	    'init': function() {
	        // Prevent binding on the dynamically-injected text node (as developers are unlikely to expect that, and it has security implications).
	        // It should also make things faster, as we no longer have to consider whether the text node might be bindable.
	        return { 'controlsDescendantBindings': true };
	    },
	    'update': function (element, valueAccessor) {
	        ko.utils.setTextContent(element, valueAccessor());
	    }
	};
	ko.virtualElements.allowedBindings['text'] = true;
	(function () {
	
	if (window && window.navigator) {
	    var parseVersion = function (matches) {
	        if (matches) {
	            return parseFloat(matches[1]);
	        }
	    };
	
	    // Detect various browser versions because some old versions don't fully support the 'input' event
	    var operaVersion = window.opera && window.opera.version && parseInt(window.opera.version()),
	        userAgent = window.navigator.userAgent,
	        safariVersion = parseVersion(userAgent.match(/^(?:(?!chrome).)*version\/([^ ]*) safari/i)),
	        firefoxVersion = parseVersion(userAgent.match(/Firefox\/([^ ]*)/));
	}
	
	// IE 8 and 9 have bugs that prevent the normal events from firing when the value changes.
	// But it does fire the 'selectionchange' event on many of those, presumably because the
	// cursor is moving and that counts as the selection changing. The 'selectionchange' event is
	// fired at the document level only and doesn't directly indicate which element changed. We
	// set up just one event handler for the document and use 'activeElement' to determine which
	// element was changed.
	if (ko.utils.ieVersion < 10) {
	    var selectionChangeRegisteredName = ko.utils.domData.nextKey(),
	        selectionChangeHandlerName = ko.utils.domData.nextKey();
	    var selectionChangeHandler = function(event) {
	        var target = this.activeElement,
	            handler = target && ko.utils.domData.get(target, selectionChangeHandlerName);
	        if (handler) {
	            handler(event);
	        }
	    };
	    var registerForSelectionChangeEvent = function (element, handler) {
	        var ownerDoc = element.ownerDocument;
	        if (!ko.utils.domData.get(ownerDoc, selectionChangeRegisteredName)) {
	            ko.utils.domData.set(ownerDoc, selectionChangeRegisteredName, true);
	            ko.utils.registerEventHandler(ownerDoc, 'selectionchange', selectionChangeHandler);
	        }
	        ko.utils.domData.set(element, selectionChangeHandlerName, handler);
	    };
	}
	
	ko.bindingHandlers['textInput'] = {
	    'init': function (element, valueAccessor, allBindings) {
	
	        var previousElementValue = element.value,
	            timeoutHandle,
	            elementValueBeforeEvent;
	
	        var updateModel = function (event) {
	            clearTimeout(timeoutHandle);
	            elementValueBeforeEvent = timeoutHandle = undefined;
	
	            var elementValue = element.value;
	            if (previousElementValue !== elementValue) {
	                // Provide a way for tests to know exactly which event was processed
	                if (DEBUG && event) element['_ko_textInputProcessedEvent'] = event.type;
	                previousElementValue = elementValue;
	                ko.expressionRewriting.writeValueToProperty(valueAccessor(), allBindings, 'textInput', elementValue);
	            }
	        };
	
	        var deferUpdateModel = function (event) {
	            if (!timeoutHandle) {
	                // The elementValueBeforeEvent variable is set *only* during the brief gap between an
	                // event firing and the updateModel function running. This allows us to ignore model
	                // updates that are from the previous state of the element, usually due to techniques
	                // such as rateLimit. Such updates, if not ignored, can cause keystrokes to be lost.
	                elementValueBeforeEvent = element.value;
	                var handler = DEBUG ? updateModel.bind(element, {type: event.type}) : updateModel;
	                timeoutHandle = ko.utils.setTimeout(handler, 4);
	            }
	        };
	
	        // IE9 will mess up the DOM if you handle events synchronously which results in DOM changes (such as other bindings);
	        // so we'll make sure all updates are asynchronous
	        var ieUpdateModel = ko.utils.ieVersion == 9 ? deferUpdateModel : updateModel;
	
	        var updateView = function () {
	            var modelValue = ko.utils.unwrapObservable(valueAccessor());
	
	            if (modelValue === null || modelValue === undefined) {
	                modelValue = '';
	            }
	
	            if (elementValueBeforeEvent !== undefined && modelValue === elementValueBeforeEvent) {
	                ko.utils.setTimeout(updateView, 4);
	                return;
	            }
	
	            // Update the element only if the element and model are different. On some browsers, updating the value
	            // will move the cursor to the end of the input, which would be bad while the user is typing.
	            if (element.value !== modelValue) {
	                previousElementValue = modelValue;  // Make sure we ignore events (propertychange) that result from updating the value
	                element.value = modelValue;
	            }
	        };
	
	        var onEvent = function (event, handler) {
	            ko.utils.registerEventHandler(element, event, handler);
	        };
	
	        if (DEBUG && ko.bindingHandlers['textInput']['_forceUpdateOn']) {
	            // Provide a way for tests to specify exactly which events are bound
	            ko.utils.arrayForEach(ko.bindingHandlers['textInput']['_forceUpdateOn'], function(eventName) {
	                if (eventName.slice(0,5) == 'after') {
	                    onEvent(eventName.slice(5), deferUpdateModel);
	                } else {
	                    onEvent(eventName, updateModel);
	                }
	            });
	        } else {
	            if (ko.utils.ieVersion < 10) {
	                // Internet Explorer <= 8 doesn't support the 'input' event, but does include 'propertychange' that fires whenever
	                // any property of an element changes. Unlike 'input', it also fires if a property is changed from JavaScript code,
	                // but that's an acceptable compromise for this binding. IE 9 does support 'input', but since it doesn't fire it
	                // when using autocomplete, we'll use 'propertychange' for it also.
	                onEvent('propertychange', function(event) {
	                    if (event.propertyName === 'value') {
	                        ieUpdateModel(event);
	                    }
	                });
	
	                if (ko.utils.ieVersion == 8) {
	                    // IE 8 has a bug where it fails to fire 'propertychange' on the first update following a value change from
	                    // JavaScript code. It also doesn't fire if you clear the entire value. To fix this, we bind to the following
	                    // events too.
	                    onEvent('keyup', updateModel);      // A single keystoke
	                    onEvent('keydown', updateModel);    // The first character when a key is held down
	                }
	                if (ko.utils.ieVersion >= 8) {
	                    // Internet Explorer 9 doesn't fire the 'input' event when deleting text, including using
	                    // the backspace, delete, or ctrl-x keys, clicking the 'x' to clear the input, dragging text
	                    // out of the field, and cutting or deleting text using the context menu. 'selectionchange'
	                    // can detect all of those except dragging text out of the field, for which we use 'dragend'.
	                    // These are also needed in IE8 because of the bug described above.
	                    registerForSelectionChangeEvent(element, ieUpdateModel);  // 'selectionchange' covers cut, paste, drop, delete, etc.
	                    onEvent('dragend', deferUpdateModel);
	                }
	            } else {
	                // All other supported browsers support the 'input' event, which fires whenever the content of the element is changed
	                // through the user interface.
	                onEvent('input', updateModel);
	
	                if (safariVersion < 5 && ko.utils.tagNameLower(element) === "textarea") {
	                    // Safari <5 doesn't fire the 'input' event for <textarea> elements (it does fire 'textInput'
	                    // but only when typing). So we'll just catch as much as we can with keydown, cut, and paste.
	                    onEvent('keydown', deferUpdateModel);
	                    onEvent('paste', deferUpdateModel);
	                    onEvent('cut', deferUpdateModel);
	                } else if (operaVersion < 11) {
	                    // Opera 10 doesn't always fire the 'input' event for cut, paste, undo & drop operations.
	                    // We can try to catch some of those using 'keydown'.
	                    onEvent('keydown', deferUpdateModel);
	                } else if (firefoxVersion < 4.0) {
	                    // Firefox <= 3.6 doesn't fire the 'input' event when text is filled in through autocomplete
	                    onEvent('DOMAutoComplete', updateModel);
	
	                    // Firefox <=3.5 doesn't fire the 'input' event when text is dropped into the input.
	                    onEvent('dragdrop', updateModel);       // <3.5
	                    onEvent('drop', updateModel);           // 3.5
	                }
	            }
	        }
	
	        // Bind to the change event so that we can catch programmatic updates of the value that fire this event.
	        onEvent('change', updateModel);
	
	        ko.computed(updateView, null, { disposeWhenNodeIsRemoved: element });
	    }
	};
	ko.expressionRewriting.twoWayBindings['textInput'] = true;
	
	// textinput is an alias for textInput
	ko.bindingHandlers['textinput'] = {
	    // preprocess is the only way to set up a full alias
	    'preprocess': function (value, name, addBinding) {
	        addBinding('textInput', value);
	    }
	};
	
	})();ko.bindingHandlers['uniqueName'] = {
	    'init': function (element, valueAccessor) {
	        if (valueAccessor()) {
	            var name = "ko_unique_" + (++ko.bindingHandlers['uniqueName'].currentIndex);
	            ko.utils.setElementName(element, name);
	        }
	    }
	};
	ko.bindingHandlers['uniqueName'].currentIndex = 0;
	ko.bindingHandlers['value'] = {
	    'after': ['options', 'foreach'],
	    'init': function (element, valueAccessor, allBindings) {
	        // If the value binding is placed on a radio/checkbox, then just pass through to checkedValue and quit
	        if (element.tagName.toLowerCase() == "input" && (element.type == "checkbox" || element.type == "radio")) {
	            ko.applyBindingAccessorsToNode(element, { 'checkedValue': valueAccessor });
	            return;
	        }
	
	        // Always catch "change" event; possibly other events too if asked
	        var eventsToCatch = ["change"];
	        var requestedEventsToCatch = allBindings.get("valueUpdate");
	        var propertyChangedFired = false;
	        var elementValueBeforeEvent = null;
	
	        if (requestedEventsToCatch) {
	            if (typeof requestedEventsToCatch == "string") // Allow both individual event names, and arrays of event names
	                requestedEventsToCatch = [requestedEventsToCatch];
	            ko.utils.arrayPushAll(eventsToCatch, requestedEventsToCatch);
	            eventsToCatch = ko.utils.arrayGetDistinctValues(eventsToCatch);
	        }
	
	        var valueUpdateHandler = function() {
	            elementValueBeforeEvent = null;
	            propertyChangedFired = false;
	            var modelValue = valueAccessor();
	            var elementValue = ko.selectExtensions.readValue(element);
	            ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'value', elementValue);
	        }
	
	        // Workaround for https://github.com/SteveSanderson/knockout/issues/122
	        // IE doesn't fire "change" events on textboxes if the user selects a value from its autocomplete list
	        var ieAutoCompleteHackNeeded = ko.utils.ieVersion && element.tagName.toLowerCase() == "input" && element.type == "text"
	                                       && element.autocomplete != "off" && (!element.form || element.form.autocomplete != "off");
	        if (ieAutoCompleteHackNeeded && ko.utils.arrayIndexOf(eventsToCatch, "propertychange") == -1) {
	            ko.utils.registerEventHandler(element, "propertychange", function () { propertyChangedFired = true });
	            ko.utils.registerEventHandler(element, "focus", function () { propertyChangedFired = false });
	            ko.utils.registerEventHandler(element, "blur", function() {
	                if (propertyChangedFired) {
	                    valueUpdateHandler();
	                }
	            });
	        }
	
	        ko.utils.arrayForEach(eventsToCatch, function(eventName) {
	            // The syntax "after<eventname>" means "run the handler asynchronously after the event"
	            // This is useful, for example, to catch "keydown" events after the browser has updated the control
	            // (otherwise, ko.selectExtensions.readValue(this) will receive the control's value *before* the key event)
	            var handler = valueUpdateHandler;
	            if (ko.utils.stringStartsWith(eventName, "after")) {
	                handler = function() {
	                    // The elementValueBeforeEvent variable is non-null *only* during the brief gap between
	                    // a keyX event firing and the valueUpdateHandler running, which is scheduled to happen
	                    // at the earliest asynchronous opportunity. We store this temporary information so that
	                    // if, between keyX and valueUpdateHandler, the underlying model value changes separately,
	                    // we can overwrite that model value change with the value the user just typed. Otherwise,
	                    // techniques like rateLimit can trigger model changes at critical moments that will
	                    // override the user's inputs, causing keystrokes to be lost.
	                    elementValueBeforeEvent = ko.selectExtensions.readValue(element);
	                    ko.utils.setTimeout(valueUpdateHandler, 0);
	                };
	                eventName = eventName.substring("after".length);
	            }
	            ko.utils.registerEventHandler(element, eventName, handler);
	        });
	
	        var updateFromModel = function () {
	            var newValue = ko.utils.unwrapObservable(valueAccessor());
	            var elementValue = ko.selectExtensions.readValue(element);
	
	            if (elementValueBeforeEvent !== null && newValue === elementValueBeforeEvent) {
	                ko.utils.setTimeout(updateFromModel, 0);
	                return;
	            }
	
	            var valueHasChanged = (newValue !== elementValue);
	
	            if (valueHasChanged) {
	                if (ko.utils.tagNameLower(element) === "select") {
	                    var allowUnset = allBindings.get('valueAllowUnset');
	                    var applyValueAction = function () {
	                        ko.selectExtensions.writeValue(element, newValue, allowUnset);
	                    };
	                    applyValueAction();
	
	                    if (!allowUnset && newValue !== ko.selectExtensions.readValue(element)) {
	                        // If you try to set a model value that can't be represented in an already-populated dropdown, reject that change,
	                        // because you're not allowed to have a model value that disagrees with a visible UI selection.
	                        ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, "change"]);
	                    } else {
	                        // Workaround for IE6 bug: It won't reliably apply values to SELECT nodes during the same execution thread
	                        // right after you've changed the set of OPTION nodes on it. So for that node type, we'll schedule a second thread
	                        // to apply the value as well.
	                        ko.utils.setTimeout(applyValueAction, 0);
	                    }
	                } else {
	                    ko.selectExtensions.writeValue(element, newValue);
	                }
	            }
	        };
	
	        ko.computed(updateFromModel, null, { disposeWhenNodeIsRemoved: element });
	    },
	    'update': function() {} // Keep for backwards compatibility with code that may have wrapped value binding
	};
	ko.expressionRewriting.twoWayBindings['value'] = true;
	ko.bindingHandlers['visible'] = {
	    'update': function (element, valueAccessor) {
	        var value = ko.utils.unwrapObservable(valueAccessor());
	        var isCurrentlyVisible = !(element.style.display == "none");
	        if (value && !isCurrentlyVisible)
	            element.style.display = "";
	        else if ((!value) && isCurrentlyVisible)
	            element.style.display = "none";
	    }
	};
	// 'click' is just a shorthand for the usual full-length event:{click:handler}
	makeEventHandlerShortcut('click');
	// If you want to make a custom template engine,
	//
	// [1] Inherit from this class (like ko.nativeTemplateEngine does)
	// [2] Override 'renderTemplateSource', supplying a function with this signature:
	//
	//        function (templateSource, bindingContext, options) {
	//            // - templateSource.text() is the text of the template you should render
	//            // - bindingContext.$data is the data you should pass into the template
	//            //   - you might also want to make bindingContext.$parent, bindingContext.$parents,
	//            //     and bindingContext.$root available in the template too
	//            // - options gives you access to any other properties set on "data-bind: { template: options }"
	//            // - templateDocument is the document object of the template
	//            //
	//            // Return value: an array of DOM nodes
	//        }
	//
	// [3] Override 'createJavaScriptEvaluatorBlock', supplying a function with this signature:
	//
	//        function (script) {
	//            // Return value: Whatever syntax means "Evaluate the JavaScript statement 'script' and output the result"
	//            //               For example, the jquery.tmpl template engine converts 'someScript' to '${ someScript }'
	//        }
	//
	//     This is only necessary if you want to allow data-bind attributes to reference arbitrary template variables.
	//     If you don't want to allow that, you can set the property 'allowTemplateRewriting' to false (like ko.nativeTemplateEngine does)
	//     and then you don't need to override 'createJavaScriptEvaluatorBlock'.
	
	ko.templateEngine = function () { };
	
	ko.templateEngine.prototype['renderTemplateSource'] = function (templateSource, bindingContext, options, templateDocument) {
	    throw new Error("Override renderTemplateSource");
	};
	
	ko.templateEngine.prototype['createJavaScriptEvaluatorBlock'] = function (script) {
	    throw new Error("Override createJavaScriptEvaluatorBlock");
	};
	
	ko.templateEngine.prototype['makeTemplateSource'] = function(template, templateDocument) {
	    // Named template
	    if (typeof template == "string") {
	        templateDocument = templateDocument || document;
	        var elem = templateDocument.getElementById(template);
	        if (!elem)
	            throw new Error("Cannot find template with ID " + template);
	        return new ko.templateSources.domElement(elem);
	    } else if ((template.nodeType == 1) || (template.nodeType == 8)) {
	        // Anonymous template
	        return new ko.templateSources.anonymousTemplate(template);
	    } else
	        throw new Error("Unknown template type: " + template);
	};
	
	ko.templateEngine.prototype['renderTemplate'] = function (template, bindingContext, options, templateDocument) {
	    var templateSource = this['makeTemplateSource'](template, templateDocument);
	    return this['renderTemplateSource'](templateSource, bindingContext, options, templateDocument);
	};
	
	ko.templateEngine.prototype['isTemplateRewritten'] = function (template, templateDocument) {
	    // Skip rewriting if requested
	    if (this['allowTemplateRewriting'] === false)
	        return true;
	    return this['makeTemplateSource'](template, templateDocument)['data']("isRewritten");
	};
	
	ko.templateEngine.prototype['rewriteTemplate'] = function (template, rewriterCallback, templateDocument) {
	    var templateSource = this['makeTemplateSource'](template, templateDocument);
	    var rewritten = rewriterCallback(templateSource['text']());
	    templateSource['text'](rewritten);
	    templateSource['data']("isRewritten", true);
	};
	
	ko.exportSymbol('templateEngine', ko.templateEngine);
	
	ko.templateRewriting = (function () {
	    var memoizeDataBindingAttributeSyntaxRegex = /(<([a-z]+\d*)(?:\s+(?!data-bind\s*=\s*)[a-z0-9\-]+(?:=(?:\"[^\"]*\"|\'[^\']*\'|[^>]*))?)*\s+)data-bind\s*=\s*(["'])([\s\S]*?)\3/gi;
	    var memoizeVirtualContainerBindingSyntaxRegex = /<!--\s*ko\b\s*([\s\S]*?)\s*-->/g;
	
	    function validateDataBindValuesForRewriting(keyValueArray) {
	        var allValidators = ko.expressionRewriting.bindingRewriteValidators;
	        for (var i = 0; i < keyValueArray.length; i++) {
	            var key = keyValueArray[i]['key'];
	            if (allValidators.hasOwnProperty(key)) {
	                var validator = allValidators[key];
	
	                if (typeof validator === "function") {
	                    var possibleErrorMessage = validator(keyValueArray[i]['value']);
	                    if (possibleErrorMessage)
	                        throw new Error(possibleErrorMessage);
	                } else if (!validator) {
	                    throw new Error("This template engine does not support the '" + key + "' binding within its templates");
	                }
	            }
	        }
	    }
	
	    function constructMemoizedTagReplacement(dataBindAttributeValue, tagToRetain, nodeName, templateEngine) {
	        var dataBindKeyValueArray = ko.expressionRewriting.parseObjectLiteral(dataBindAttributeValue);
	        validateDataBindValuesForRewriting(dataBindKeyValueArray);
	        var rewrittenDataBindAttributeValue = ko.expressionRewriting.preProcessBindings(dataBindKeyValueArray, {'valueAccessors':true});
	
	        // For no obvious reason, Opera fails to evaluate rewrittenDataBindAttributeValue unless it's wrapped in an additional
	        // anonymous function, even though Opera's built-in debugger can evaluate it anyway. No other browser requires this
	        // extra indirection.
	        var applyBindingsToNextSiblingScript =
	            "ko.__tr_ambtns(function($context,$element){return(function(){return{ " + rewrittenDataBindAttributeValue + " } })()},'" + nodeName.toLowerCase() + "')";
	        return templateEngine['createJavaScriptEvaluatorBlock'](applyBindingsToNextSiblingScript) + tagToRetain;
	    }
	
	    return {
	        ensureTemplateIsRewritten: function (template, templateEngine, templateDocument) {
	            if (!templateEngine['isTemplateRewritten'](template, templateDocument))
	                templateEngine['rewriteTemplate'](template, function (htmlString) {
	                    return ko.templateRewriting.memoizeBindingAttributeSyntax(htmlString, templateEngine);
	                }, templateDocument);
	        },
	
	        memoizeBindingAttributeSyntax: function (htmlString, templateEngine) {
	            return htmlString.replace(memoizeDataBindingAttributeSyntaxRegex, function () {
	                return constructMemoizedTagReplacement(/* dataBindAttributeValue: */ arguments[4], /* tagToRetain: */ arguments[1], /* nodeName: */ arguments[2], templateEngine);
	            }).replace(memoizeVirtualContainerBindingSyntaxRegex, function() {
	                return constructMemoizedTagReplacement(/* dataBindAttributeValue: */ arguments[1], /* tagToRetain: */ "<!-- ko -->", /* nodeName: */ "#comment", templateEngine);
	            });
	        },
	
	        applyMemoizedBindingsToNextSibling: function (bindings, nodeName) {
	            return ko.memoization.memoize(function (domNode, bindingContext) {
	                var nodeToBind = domNode.nextSibling;
	                if (nodeToBind && nodeToBind.nodeName.toLowerCase() === nodeName) {
	                    ko.applyBindingAccessorsToNode(nodeToBind, bindings, bindingContext);
	                }
	            });
	        }
	    }
	})();
	
	
	// Exported only because it has to be referenced by string lookup from within rewritten template
	ko.exportSymbol('__tr_ambtns', ko.templateRewriting.applyMemoizedBindingsToNextSibling);
	(function() {
	    // A template source represents a read/write way of accessing a template. This is to eliminate the need for template loading/saving
	    // logic to be duplicated in every template engine (and means they can all work with anonymous templates, etc.)
	    //
	    // Two are provided by default:
	    //  1. ko.templateSources.domElement       - reads/writes the text content of an arbitrary DOM element
	    //  2. ko.templateSources.anonymousElement - uses ko.utils.domData to read/write text *associated* with the DOM element, but
	    //                                           without reading/writing the actual element text content, since it will be overwritten
	    //                                           with the rendered template output.
	    // You can implement your own template source if you want to fetch/store templates somewhere other than in DOM elements.
	    // Template sources need to have the following functions:
	    //   text() 			- returns the template text from your storage location
	    //   text(value)		- writes the supplied template text to your storage location
	    //   data(key)			- reads values stored using data(key, value) - see below
	    //   data(key, value)	- associates "value" with this template and the key "key". Is used to store information like "isRewritten".
	    //
	    // Optionally, template sources can also have the following functions:
	    //   nodes()            - returns a DOM element containing the nodes of this template, where available
	    //   nodes(value)       - writes the given DOM element to your storage location
	    // If a DOM element is available for a given template source, template engines are encouraged to use it in preference over text()
	    // for improved speed. However, all templateSources must supply text() even if they don't supply nodes().
	    //
	    // Once you've implemented a templateSource, make your template engine use it by subclassing whatever template engine you were
	    // using and overriding "makeTemplateSource" to return an instance of your custom template source.
	
	    ko.templateSources = {};
	
	    // ---- ko.templateSources.domElement -----
	
	    // template types
	    var templateScript = 1,
	        templateTextArea = 2,
	        templateTemplate = 3,
	        templateElement = 4;
	
	    ko.templateSources.domElement = function(element) {
	        this.domElement = element;
	
	        if (element) {
	            var tagNameLower = ko.utils.tagNameLower(element);
	            this.templateType =
	                tagNameLower === "script" ? templateScript :
	                tagNameLower === "textarea" ? templateTextArea :
	                    // For browsers with proper <template> element support, where the .content property gives a document fragment
	                tagNameLower == "template" && element.content && element.content.nodeType === 11 ? templateTemplate :
	                templateElement;
	        }
	    }
	
	    ko.templateSources.domElement.prototype['text'] = function(/* valueToWrite */) {
	        var elemContentsProperty = this.templateType === templateScript ? "text"
	                                 : this.templateType === templateTextArea ? "value"
	                                 : "innerHTML";
	
	        if (arguments.length == 0) {
	            return this.domElement[elemContentsProperty];
	        } else {
	            var valueToWrite = arguments[0];
	            if (elemContentsProperty === "innerHTML")
	                ko.utils.setHtml(this.domElement, valueToWrite);
	            else
	                this.domElement[elemContentsProperty] = valueToWrite;
	        }
	    };
	
	    var dataDomDataPrefix = ko.utils.domData.nextKey() + "_";
	    ko.templateSources.domElement.prototype['data'] = function(key /*, valueToWrite */) {
	        if (arguments.length === 1) {
	            return ko.utils.domData.get(this.domElement, dataDomDataPrefix + key);
	        } else {
	            ko.utils.domData.set(this.domElement, dataDomDataPrefix + key, arguments[1]);
	        }
	    };
	
	    var templatesDomDataKey = ko.utils.domData.nextKey();
	    function getTemplateDomData(element) {
	        return ko.utils.domData.get(element, templatesDomDataKey) || {};
	    }
	    function setTemplateDomData(element, data) {
	        ko.utils.domData.set(element, templatesDomDataKey, data);
	    }
	
	    ko.templateSources.domElement.prototype['nodes'] = function(/* valueToWrite */) {
	        var element = this.domElement;
	        if (arguments.length == 0) {
	            var templateData = getTemplateDomData(element),
	                containerData = templateData.containerData;
	            return containerData || (
	                this.templateType === templateTemplate ? element.content :
	                this.templateType === templateElement ? element :
	                undefined);
	        } else {
	            var valueToWrite = arguments[0];
	            setTemplateDomData(element, {containerData: valueToWrite});
	        }
	    };
	
	    // ---- ko.templateSources.anonymousTemplate -----
	    // Anonymous templates are normally saved/retrieved as DOM nodes through "nodes".
	    // For compatibility, you can also read "text"; it will be serialized from the nodes on demand.
	    // Writing to "text" is still supported, but then the template data will not be available as DOM nodes.
	
	    ko.templateSources.anonymousTemplate = function(element) {
	        this.domElement = element;
	    }
	    ko.templateSources.anonymousTemplate.prototype = new ko.templateSources.domElement();
	    ko.templateSources.anonymousTemplate.prototype.constructor = ko.templateSources.anonymousTemplate;
	    ko.templateSources.anonymousTemplate.prototype['text'] = function(/* valueToWrite */) {
	        if (arguments.length == 0) {
	            var templateData = getTemplateDomData(this.domElement);
	            if (templateData.textData === undefined && templateData.containerData)
	                templateData.textData = templateData.containerData.innerHTML;
	            return templateData.textData;
	        } else {
	            var valueToWrite = arguments[0];
	            setTemplateDomData(this.domElement, {textData: valueToWrite});
	        }
	    };
	
	    ko.exportSymbol('templateSources', ko.templateSources);
	    ko.exportSymbol('templateSources.domElement', ko.templateSources.domElement);
	    ko.exportSymbol('templateSources.anonymousTemplate', ko.templateSources.anonymousTemplate);
	})();
	(function () {
	    var _templateEngine;
	    ko.setTemplateEngine = function (templateEngine) {
	        if ((templateEngine != undefined) && !(templateEngine instanceof ko.templateEngine))
	            throw new Error("templateEngine must inherit from ko.templateEngine");
	        _templateEngine = templateEngine;
	    }
	
	    function invokeForEachNodeInContinuousRange(firstNode, lastNode, action) {
	        var node, nextInQueue = firstNode, firstOutOfRangeNode = ko.virtualElements.nextSibling(lastNode);
	        while (nextInQueue && ((node = nextInQueue) !== firstOutOfRangeNode)) {
	            nextInQueue = ko.virtualElements.nextSibling(node);
	            action(node, nextInQueue);
	        }
	    }
	
	    function activateBindingsOnContinuousNodeArray(continuousNodeArray, bindingContext) {
	        // To be used on any nodes that have been rendered by a template and have been inserted into some parent element
	        // Walks through continuousNodeArray (which *must* be continuous, i.e., an uninterrupted sequence of sibling nodes, because
	        // the algorithm for walking them relies on this), and for each top-level item in the virtual-element sense,
	        // (1) Does a regular "applyBindings" to associate bindingContext with this node and to activate any non-memoized bindings
	        // (2) Unmemoizes any memos in the DOM subtree (e.g., to activate bindings that had been memoized during template rewriting)
	
	        if (continuousNodeArray.length) {
	            var firstNode = continuousNodeArray[0],
	                lastNode = continuousNodeArray[continuousNodeArray.length - 1],
	                parentNode = firstNode.parentNode,
	                provider = ko.bindingProvider['instance'],
	                preprocessNode = provider['preprocessNode'];
	
	            if (preprocessNode) {
	                invokeForEachNodeInContinuousRange(firstNode, lastNode, function(node, nextNodeInRange) {
	                    var nodePreviousSibling = node.previousSibling;
	                    var newNodes = preprocessNode.call(provider, node);
	                    if (newNodes) {
	                        if (node === firstNode)
	                            firstNode = newNodes[0] || nextNodeInRange;
	                        if (node === lastNode)
	                            lastNode = newNodes[newNodes.length - 1] || nodePreviousSibling;
	                    }
	                });
	
	                // Because preprocessNode can change the nodes, including the first and last nodes, update continuousNodeArray to match.
	                // We need the full set, including inner nodes, because the unmemoize step might remove the first node (and so the real
	                // first node needs to be in the array).
	                continuousNodeArray.length = 0;
	                if (!firstNode) { // preprocessNode might have removed all the nodes, in which case there's nothing left to do
	                    return;
	                }
	                if (firstNode === lastNode) {
	                    continuousNodeArray.push(firstNode);
	                } else {
	                    continuousNodeArray.push(firstNode, lastNode);
	                    ko.utils.fixUpContinuousNodeArray(continuousNodeArray, parentNode);
	                }
	            }
	
	            // Need to applyBindings *before* unmemoziation, because unmemoization might introduce extra nodes (that we don't want to re-bind)
	            // whereas a regular applyBindings won't introduce new memoized nodes
	            invokeForEachNodeInContinuousRange(firstNode, lastNode, function(node) {
	                if (node.nodeType === 1 || node.nodeType === 8)
	                    ko.applyBindings(bindingContext, node);
	            });
	            invokeForEachNodeInContinuousRange(firstNode, lastNode, function(node) {
	                if (node.nodeType === 1 || node.nodeType === 8)
	                    ko.memoization.unmemoizeDomNodeAndDescendants(node, [bindingContext]);
	            });
	
	            // Make sure any changes done by applyBindings or unmemoize are reflected in the array
	            ko.utils.fixUpContinuousNodeArray(continuousNodeArray, parentNode);
	        }
	    }
	
	    function getFirstNodeFromPossibleArray(nodeOrNodeArray) {
	        return nodeOrNodeArray.nodeType ? nodeOrNodeArray
	                                        : nodeOrNodeArray.length > 0 ? nodeOrNodeArray[0]
	                                        : null;
	    }
	
	    function executeTemplate(targetNodeOrNodeArray, renderMode, template, bindingContext, options) {
	        options = options || {};
	        var firstTargetNode = targetNodeOrNodeArray && getFirstNodeFromPossibleArray(targetNodeOrNodeArray);
	        var templateDocument = (firstTargetNode || template || {}).ownerDocument;
	        var templateEngineToUse = (options['templateEngine'] || _templateEngine);
	        ko.templateRewriting.ensureTemplateIsRewritten(template, templateEngineToUse, templateDocument);
	        var renderedNodesArray = templateEngineToUse['renderTemplate'](template, bindingContext, options, templateDocument);
	
	        // Loosely check result is an array of DOM nodes
	        if ((typeof renderedNodesArray.length != "number") || (renderedNodesArray.length > 0 && typeof renderedNodesArray[0].nodeType != "number"))
	            throw new Error("Template engine must return an array of DOM nodes");
	
	        var haveAddedNodesToParent = false;
	        switch (renderMode) {
	            case "replaceChildren":
	                ko.virtualElements.setDomNodeChildren(targetNodeOrNodeArray, renderedNodesArray);
	                haveAddedNodesToParent = true;
	                break;
	            case "replaceNode":
	                ko.utils.replaceDomNodes(targetNodeOrNodeArray, renderedNodesArray);
	                haveAddedNodesToParent = true;
	                break;
	            case "ignoreTargetNode": break;
	            default:
	                throw new Error("Unknown renderMode: " + renderMode);
	        }
	
	        if (haveAddedNodesToParent) {
	            activateBindingsOnContinuousNodeArray(renderedNodesArray, bindingContext);
	            if (options['afterRender'])
	                ko.dependencyDetection.ignore(options['afterRender'], null, [renderedNodesArray, bindingContext['$data']]);
	        }
	
	        return renderedNodesArray;
	    }
	
	    function resolveTemplateName(template, data, context) {
	        // The template can be specified as:
	        if (ko.isObservable(template)) {
	            // 1. An observable, with string value
	            return template();
	        } else if (typeof template === 'function') {
	            // 2. A function of (data, context) returning a string
	            return template(data, context);
	        } else {
	            // 3. A string
	            return template;
	        }
	    }
	
	    ko.renderTemplate = function (template, dataOrBindingContext, options, targetNodeOrNodeArray, renderMode) {
	        options = options || {};
	        if ((options['templateEngine'] || _templateEngine) == undefined)
	            throw new Error("Set a template engine before calling renderTemplate");
	        renderMode = renderMode || "replaceChildren";
	
	        if (targetNodeOrNodeArray) {
	            var firstTargetNode = getFirstNodeFromPossibleArray(targetNodeOrNodeArray);
	
	            var whenToDispose = function () { return (!firstTargetNode) || !ko.utils.domNodeIsAttachedToDocument(firstTargetNode); }; // Passive disposal (on next evaluation)
	            var activelyDisposeWhenNodeIsRemoved = (firstTargetNode && renderMode == "replaceNode") ? firstTargetNode.parentNode : firstTargetNode;
	
	            return ko.dependentObservable( // So the DOM is automatically updated when any dependency changes
	                function () {
	                    // Ensure we've got a proper binding context to work with
	                    var bindingContext = (dataOrBindingContext && (dataOrBindingContext instanceof ko.bindingContext))
	                        ? dataOrBindingContext
	                        : new ko.bindingContext(ko.utils.unwrapObservable(dataOrBindingContext));
	
	                    var templateName = resolveTemplateName(template, bindingContext['$data'], bindingContext),
	                        renderedNodesArray = executeTemplate(targetNodeOrNodeArray, renderMode, templateName, bindingContext, options);
	
	                    if (renderMode == "replaceNode") {
	                        targetNodeOrNodeArray = renderedNodesArray;
	                        firstTargetNode = getFirstNodeFromPossibleArray(targetNodeOrNodeArray);
	                    }
	                },
	                null,
	                { disposeWhen: whenToDispose, disposeWhenNodeIsRemoved: activelyDisposeWhenNodeIsRemoved }
	            );
	        } else {
	            // We don't yet have a DOM node to evaluate, so use a memo and render the template later when there is a DOM node
	            return ko.memoization.memoize(function (domNode) {
	                ko.renderTemplate(template, dataOrBindingContext, options, domNode, "replaceNode");
	            });
	        }
	    };
	
	    ko.renderTemplateForEach = function (template, arrayOrObservableArray, options, targetNode, parentBindingContext) {
	        // Since setDomNodeChildrenFromArrayMapping always calls executeTemplateForArrayItem and then
	        // activateBindingsCallback for added items, we can store the binding context in the former to use in the latter.
	        var arrayItemContext;
	
	        // This will be called by setDomNodeChildrenFromArrayMapping to get the nodes to add to targetNode
	        var executeTemplateForArrayItem = function (arrayValue, index) {
	            // Support selecting template as a function of the data being rendered
	            arrayItemContext = parentBindingContext['createChildContext'](arrayValue, options['as'], function(context) {
	                context['$index'] = index;
	            });
	
	            var templateName = resolveTemplateName(template, arrayValue, arrayItemContext);
	            return executeTemplate(null, "ignoreTargetNode", templateName, arrayItemContext, options);
	        }
	
	        // This will be called whenever setDomNodeChildrenFromArrayMapping has added nodes to targetNode
	        var activateBindingsCallback = function(arrayValue, addedNodesArray, index) {
	            activateBindingsOnContinuousNodeArray(addedNodesArray, arrayItemContext);
	            if (options['afterRender'])
	                options['afterRender'](addedNodesArray, arrayValue);
	
	            // release the "cache" variable, so that it can be collected by
	            // the GC when its value isn't used from within the bindings anymore.
	            arrayItemContext = null;
	        };
	
	        return ko.dependentObservable(function () {
	            var unwrappedArray = ko.utils.unwrapObservable(arrayOrObservableArray) || [];
	            if (typeof unwrappedArray.length == "undefined") // Coerce single value into array
	                unwrappedArray = [unwrappedArray];
	
	            // Filter out any entries marked as destroyed
	            var filteredArray = ko.utils.arrayFilter(unwrappedArray, function(item) {
	                return options['includeDestroyed'] || item === undefined || item === null || !ko.utils.unwrapObservable(item['_destroy']);
	            });
	
	            // Call setDomNodeChildrenFromArrayMapping, ignoring any observables unwrapped within (most likely from a callback function).
	            // If the array items are observables, though, they will be unwrapped in executeTemplateForArrayItem and managed within setDomNodeChildrenFromArrayMapping.
	            ko.dependencyDetection.ignore(ko.utils.setDomNodeChildrenFromArrayMapping, null, [targetNode, filteredArray, executeTemplateForArrayItem, options, activateBindingsCallback]);
	
	        }, null, { disposeWhenNodeIsRemoved: targetNode });
	    };
	
	    var templateComputedDomDataKey = ko.utils.domData.nextKey();
	    function disposeOldComputedAndStoreNewOne(element, newComputed) {
	        var oldComputed = ko.utils.domData.get(element, templateComputedDomDataKey);
	        if (oldComputed && (typeof(oldComputed.dispose) == 'function'))
	            oldComputed.dispose();
	        ko.utils.domData.set(element, templateComputedDomDataKey, (newComputed && newComputed.isActive()) ? newComputed : undefined);
	    }
	
	    ko.bindingHandlers['template'] = {
	        'init': function(element, valueAccessor) {
	            // Support anonymous templates
	            var bindingValue = ko.utils.unwrapObservable(valueAccessor());
	            if (typeof bindingValue == "string" || bindingValue['name']) {
	                // It's a named template - clear the element
	                ko.virtualElements.emptyNode(element);
	            } else if ('nodes' in bindingValue) {
	                // We've been given an array of DOM nodes. Save them as the template source.
	                // There is no known use case for the node array being an observable array (if the output
	                // varies, put that behavior *into* your template - that's what templates are for), and
	                // the implementation would be a mess, so assert that it's not observable.
	                var nodes = bindingValue['nodes'] || [];
	                if (ko.isObservable(nodes)) {
	                    throw new Error('The "nodes" option must be a plain, non-observable array.');
	                }
	                var container = ko.utils.moveCleanedNodesToContainerElement(nodes); // This also removes the nodes from their current parent
	                new ko.templateSources.anonymousTemplate(element)['nodes'](container);
	            } else {
	                // It's an anonymous template - store the element contents, then clear the element
	                var templateNodes = ko.virtualElements.childNodes(element),
	                    container = ko.utils.moveCleanedNodesToContainerElement(templateNodes); // This also removes the nodes from their current parent
	                new ko.templateSources.anonymousTemplate(element)['nodes'](container);
	            }
	            return { 'controlsDescendantBindings': true };
	        },
	        'update': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
	            var value = valueAccessor(),
	                dataValue,
	                options = ko.utils.unwrapObservable(value),
	                shouldDisplay = true,
	                templateComputed = null,
	                templateName;
	
	            if (typeof options == "string") {
	                templateName = value;
	                options = {};
	            } else {
	                templateName = options['name'];
	
	                // Support "if"/"ifnot" conditions
	                if ('if' in options)
	                    shouldDisplay = ko.utils.unwrapObservable(options['if']);
	                if (shouldDisplay && 'ifnot' in options)
	                    shouldDisplay = !ko.utils.unwrapObservable(options['ifnot']);
	
	                dataValue = ko.utils.unwrapObservable(options['data']);
	            }
	
	            if ('foreach' in options) {
	                // Render once for each data point (treating data set as empty if shouldDisplay==false)
	                var dataArray = (shouldDisplay && options['foreach']) || [];
	                templateComputed = ko.renderTemplateForEach(templateName || element, dataArray, options, element, bindingContext);
	            } else if (!shouldDisplay) {
	                ko.virtualElements.emptyNode(element);
	            } else {
	                // Render once for this single data point (or use the viewModel if no data was provided)
	                var innerBindingContext = ('data' in options) ?
	                    bindingContext['createChildContext'](dataValue, options['as']) :  // Given an explitit 'data' value, we create a child binding context for it
	                    bindingContext;                                                        // Given no explicit 'data' value, we retain the same binding context
	                templateComputed = ko.renderTemplate(templateName || element, innerBindingContext, options, element);
	            }
	
	            // It only makes sense to have a single template computed per element (otherwise which one should have its output displayed?)
	            disposeOldComputedAndStoreNewOne(element, templateComputed);
	        }
	    };
	
	    // Anonymous templates can't be rewritten. Give a nice error message if you try to do it.
	    ko.expressionRewriting.bindingRewriteValidators['template'] = function(bindingValue) {
	        var parsedBindingValue = ko.expressionRewriting.parseObjectLiteral(bindingValue);
	
	        if ((parsedBindingValue.length == 1) && parsedBindingValue[0]['unknown'])
	            return null; // It looks like a string literal, not an object literal, so treat it as a named template (which is allowed for rewriting)
	
	        if (ko.expressionRewriting.keyValueArrayContainsKey(parsedBindingValue, "name"))
	            return null; // Named templates can be rewritten, so return "no error"
	        return "This template engine does not support anonymous templates nested within its templates";
	    };
	
	    ko.virtualElements.allowedBindings['template'] = true;
	})();
	
	ko.exportSymbol('setTemplateEngine', ko.setTemplateEngine);
	ko.exportSymbol('renderTemplate', ko.renderTemplate);
	// Go through the items that have been added and deleted and try to find matches between them.
	ko.utils.findMovesInArrayComparison = function (left, right, limitFailedCompares) {
	    if (left.length && right.length) {
	        var failedCompares, l, r, leftItem, rightItem;
	        for (failedCompares = l = 0; (!limitFailedCompares || failedCompares < limitFailedCompares) && (leftItem = left[l]); ++l) {
	            for (r = 0; rightItem = right[r]; ++r) {
	                if (leftItem['value'] === rightItem['value']) {
	                    leftItem['moved'] = rightItem['index'];
	                    rightItem['moved'] = leftItem['index'];
	                    right.splice(r, 1);         // This item is marked as moved; so remove it from right list
	                    failedCompares = r = 0;     // Reset failed compares count because we're checking for consecutive failures
	                    break;
	                }
	            }
	            failedCompares += r;
	        }
	    }
	};
	
	ko.utils.compareArrays = (function () {
	    var statusNotInOld = 'added', statusNotInNew = 'deleted';
	
	    // Simple calculation based on Levenshtein distance.
	    function compareArrays(oldArray, newArray, options) {
	        // For backward compatibility, if the third arg is actually a bool, interpret
	        // it as the old parameter 'dontLimitMoves'. Newer code should use { dontLimitMoves: true }.
	        options = (typeof options === 'boolean') ? { 'dontLimitMoves': options } : (options || {});
	        oldArray = oldArray || [];
	        newArray = newArray || [];
	
	        if (oldArray.length < newArray.length)
	            return compareSmallArrayToBigArray(oldArray, newArray, statusNotInOld, statusNotInNew, options);
	        else
	            return compareSmallArrayToBigArray(newArray, oldArray, statusNotInNew, statusNotInOld, options);
	    }
	
	    function compareSmallArrayToBigArray(smlArray, bigArray, statusNotInSml, statusNotInBig, options) {
	        var myMin = Math.min,
	            myMax = Math.max,
	            editDistanceMatrix = [],
	            smlIndex, smlIndexMax = smlArray.length,
	            bigIndex, bigIndexMax = bigArray.length,
	            compareRange = (bigIndexMax - smlIndexMax) || 1,
	            maxDistance = smlIndexMax + bigIndexMax + 1,
	            thisRow, lastRow,
	            bigIndexMaxForRow, bigIndexMinForRow;
	
	        for (smlIndex = 0; smlIndex <= smlIndexMax; smlIndex++) {
	            lastRow = thisRow;
	            editDistanceMatrix.push(thisRow = []);
	            bigIndexMaxForRow = myMin(bigIndexMax, smlIndex + compareRange);
	            bigIndexMinForRow = myMax(0, smlIndex - 1);
	            for (bigIndex = bigIndexMinForRow; bigIndex <= bigIndexMaxForRow; bigIndex++) {
	                if (!bigIndex)
	                    thisRow[bigIndex] = smlIndex + 1;
	                else if (!smlIndex)  // Top row - transform empty array into new array via additions
	                    thisRow[bigIndex] = bigIndex + 1;
	                else if (smlArray[smlIndex - 1] === bigArray[bigIndex - 1])
	                    thisRow[bigIndex] = lastRow[bigIndex - 1];                  // copy value (no edit)
	                else {
	                    var northDistance = lastRow[bigIndex] || maxDistance;       // not in big (deletion)
	                    var westDistance = thisRow[bigIndex - 1] || maxDistance;    // not in small (addition)
	                    thisRow[bigIndex] = myMin(northDistance, westDistance) + 1;
	                }
	            }
	        }
	
	        var editScript = [], meMinusOne, notInSml = [], notInBig = [];
	        for (smlIndex = smlIndexMax, bigIndex = bigIndexMax; smlIndex || bigIndex;) {
	            meMinusOne = editDistanceMatrix[smlIndex][bigIndex] - 1;
	            if (bigIndex && meMinusOne === editDistanceMatrix[smlIndex][bigIndex-1]) {
	                notInSml.push(editScript[editScript.length] = {     // added
	                    'status': statusNotInSml,
	                    'value': bigArray[--bigIndex],
	                    'index': bigIndex });
	            } else if (smlIndex && meMinusOne === editDistanceMatrix[smlIndex - 1][bigIndex]) {
	                notInBig.push(editScript[editScript.length] = {     // deleted
	                    'status': statusNotInBig,
	                    'value': smlArray[--smlIndex],
	                    'index': smlIndex });
	            } else {
	                --bigIndex;
	                --smlIndex;
	                if (!options['sparse']) {
	                    editScript.push({
	                        'status': "retained",
	                        'value': bigArray[bigIndex] });
	                }
	            }
	        }
	
	        // Set a limit on the number of consecutive non-matching comparisons; having it a multiple of
	        // smlIndexMax keeps the time complexity of this algorithm linear.
	        ko.utils.findMovesInArrayComparison(notInBig, notInSml, !options['dontLimitMoves'] && smlIndexMax * 10);
	
	        return editScript.reverse();
	    }
	
	    return compareArrays;
	})();
	
	ko.exportSymbol('utils.compareArrays', ko.utils.compareArrays);
	(function () {
	    // Objective:
	    // * Given an input array, a container DOM node, and a function from array elements to arrays of DOM nodes,
	    //   map the array elements to arrays of DOM nodes, concatenate together all these arrays, and use them to populate the container DOM node
	    // * Next time we're given the same combination of things (with the array possibly having mutated), update the container DOM node
	    //   so that its children is again the concatenation of the mappings of the array elements, but don't re-map any array elements that we
	    //   previously mapped - retain those nodes, and just insert/delete other ones
	
	    // "callbackAfterAddingNodes" will be invoked after any "mapping"-generated nodes are inserted into the container node
	    // You can use this, for example, to activate bindings on those nodes.
	
	    function mapNodeAndRefreshWhenChanged(containerNode, mapping, valueToMap, callbackAfterAddingNodes, index) {
	        // Map this array value inside a dependentObservable so we re-map when any dependency changes
	        var mappedNodes = [];
	        var dependentObservable = ko.dependentObservable(function() {
	            var newMappedNodes = mapping(valueToMap, index, ko.utils.fixUpContinuousNodeArray(mappedNodes, containerNode)) || [];
	
	            // On subsequent evaluations, just replace the previously-inserted DOM nodes
	            if (mappedNodes.length > 0) {
	                ko.utils.replaceDomNodes(mappedNodes, newMappedNodes);
	                if (callbackAfterAddingNodes)
	                    ko.dependencyDetection.ignore(callbackAfterAddingNodes, null, [valueToMap, newMappedNodes, index]);
	            }
	
	            // Replace the contents of the mappedNodes array, thereby updating the record
	            // of which nodes would be deleted if valueToMap was itself later removed
	            mappedNodes.length = 0;
	            ko.utils.arrayPushAll(mappedNodes, newMappedNodes);
	        }, null, { disposeWhenNodeIsRemoved: containerNode, disposeWhen: function() { return !ko.utils.anyDomNodeIsAttachedToDocument(mappedNodes); } });
	        return { mappedNodes : mappedNodes, dependentObservable : (dependentObservable.isActive() ? dependentObservable : undefined) };
	    }
	
	    var lastMappingResultDomDataKey = ko.utils.domData.nextKey(),
	        deletedItemDummyValue = ko.utils.domData.nextKey();
	
	    ko.utils.setDomNodeChildrenFromArrayMapping = function (domNode, array, mapping, options, callbackAfterAddingNodes) {
	        // Compare the provided array against the previous one
	        array = array || [];
	        options = options || {};
	        var isFirstExecution = ko.utils.domData.get(domNode, lastMappingResultDomDataKey) === undefined;
	        var lastMappingResult = ko.utils.domData.get(domNode, lastMappingResultDomDataKey) || [];
	        var lastArray = ko.utils.arrayMap(lastMappingResult, function (x) { return x.arrayEntry; });
	        var editScript = ko.utils.compareArrays(lastArray, array, options['dontLimitMoves']);
	
	        // Build the new mapping result
	        var newMappingResult = [];
	        var lastMappingResultIndex = 0;
	        var newMappingResultIndex = 0;
	
	        var nodesToDelete = [];
	        var itemsToProcess = [];
	        var itemsForBeforeRemoveCallbacks = [];
	        var itemsForMoveCallbacks = [];
	        var itemsForAfterAddCallbacks = [];
	        var mapData;
	
	        function itemMovedOrRetained(editScriptIndex, oldPosition) {
	            mapData = lastMappingResult[oldPosition];
	            if (newMappingResultIndex !== oldPosition)
	                itemsForMoveCallbacks[editScriptIndex] = mapData;
	            // Since updating the index might change the nodes, do so before calling fixUpContinuousNodeArray
	            mapData.indexObservable(newMappingResultIndex++);
	            ko.utils.fixUpContinuousNodeArray(mapData.mappedNodes, domNode);
	            newMappingResult.push(mapData);
	            itemsToProcess.push(mapData);
	        }
	
	        function callCallback(callback, items) {
	            if (callback) {
	                for (var i = 0, n = items.length; i < n; i++) {
	                    if (items[i]) {
	                        ko.utils.arrayForEach(items[i].mappedNodes, function(node) {
	                            callback(node, i, items[i].arrayEntry);
	                        });
	                    }
	                }
	            }
	        }
	
	        for (var i = 0, editScriptItem, movedIndex; editScriptItem = editScript[i]; i++) {
	            movedIndex = editScriptItem['moved'];
	            switch (editScriptItem['status']) {
	                case "deleted":
	                    if (movedIndex === undefined) {
	                        mapData = lastMappingResult[lastMappingResultIndex];
	
	                        // Stop tracking changes to the mapping for these nodes
	                        if (mapData.dependentObservable) {
	                            mapData.dependentObservable.dispose();
	                            mapData.dependentObservable = undefined;
	                        }
	
	                        // Queue these nodes for later removal
	                        if (ko.utils.fixUpContinuousNodeArray(mapData.mappedNodes, domNode).length) {
	                            if (options['beforeRemove']) {
	                                newMappingResult.push(mapData);
	                                itemsToProcess.push(mapData);
	                                if (mapData.arrayEntry === deletedItemDummyValue) {
	                                    mapData = null;
	                                } else {
	                                    itemsForBeforeRemoveCallbacks[i] = mapData;
	                                }
	                            }
	                            if (mapData) {
	                                nodesToDelete.push.apply(nodesToDelete, mapData.mappedNodes);
	                            }
	                        }
	                    }
	                    lastMappingResultIndex++;
	                    break;
	
	                case "retained":
	                    itemMovedOrRetained(i, lastMappingResultIndex++);
	                    break;
	
	                case "added":
	                    if (movedIndex !== undefined) {
	                        itemMovedOrRetained(i, movedIndex);
	                    } else {
	                        mapData = { arrayEntry: editScriptItem['value'], indexObservable: ko.observable(newMappingResultIndex++) };
	                        newMappingResult.push(mapData);
	                        itemsToProcess.push(mapData);
	                        if (!isFirstExecution)
	                            itemsForAfterAddCallbacks[i] = mapData;
	                    }
	                    break;
	            }
	        }
	
	        // Store a copy of the array items we just considered so we can difference it next time
	        ko.utils.domData.set(domNode, lastMappingResultDomDataKey, newMappingResult);
	
	        // Call beforeMove first before any changes have been made to the DOM
	        callCallback(options['beforeMove'], itemsForMoveCallbacks);
	
	        // Next remove nodes for deleted items (or just clean if there's a beforeRemove callback)
	        ko.utils.arrayForEach(nodesToDelete, options['beforeRemove'] ? ko.cleanNode : ko.removeNode);
	
	        // Next add/reorder the remaining items (will include deleted items if there's a beforeRemove callback)
	        for (var i = 0, nextNode = ko.virtualElements.firstChild(domNode), lastNode, node; mapData = itemsToProcess[i]; i++) {
	            // Get nodes for newly added items
	            if (!mapData.mappedNodes)
	                ko.utils.extend(mapData, mapNodeAndRefreshWhenChanged(domNode, mapping, mapData.arrayEntry, callbackAfterAddingNodes, mapData.indexObservable));
	
	            // Put nodes in the right place if they aren't there already
	            for (var j = 0; node = mapData.mappedNodes[j]; nextNode = node.nextSibling, lastNode = node, j++) {
	                if (node !== nextNode)
	                    ko.virtualElements.insertAfter(domNode, node, lastNode);
	            }
	
	            // Run the callbacks for newly added nodes (for example, to apply bindings, etc.)
	            if (!mapData.initialized && callbackAfterAddingNodes) {
	                callbackAfterAddingNodes(mapData.arrayEntry, mapData.mappedNodes, mapData.indexObservable);
	                mapData.initialized = true;
	            }
	        }
	
	        // If there's a beforeRemove callback, call it after reordering.
	        // Note that we assume that the beforeRemove callback will usually be used to remove the nodes using
	        // some sort of animation, which is why we first reorder the nodes that will be removed. If the
	        // callback instead removes the nodes right away, it would be more efficient to skip reordering them.
	        // Perhaps we'll make that change in the future if this scenario becomes more common.
	        callCallback(options['beforeRemove'], itemsForBeforeRemoveCallbacks);
	
	        // Replace the stored values of deleted items with a dummy value. This provides two benefits: it marks this item
	        // as already "removed" so we won't call beforeRemove for it again, and it ensures that the item won't match up
	        // with an actual item in the array and appear as "retained" or "moved".
	        for (i = 0; i < itemsForBeforeRemoveCallbacks.length; ++i) {
	            if (itemsForBeforeRemoveCallbacks[i]) {
	                itemsForBeforeRemoveCallbacks[i].arrayEntry = deletedItemDummyValue;
	            }
	        }
	
	        // Finally call afterMove and afterAdd callbacks
	        callCallback(options['afterMove'], itemsForMoveCallbacks);
	        callCallback(options['afterAdd'], itemsForAfterAddCallbacks);
	    }
	})();
	
	ko.exportSymbol('utils.setDomNodeChildrenFromArrayMapping', ko.utils.setDomNodeChildrenFromArrayMapping);
	ko.nativeTemplateEngine = function () {
	    this['allowTemplateRewriting'] = false;
	}
	
	ko.nativeTemplateEngine.prototype = new ko.templateEngine();
	ko.nativeTemplateEngine.prototype.constructor = ko.nativeTemplateEngine;
	ko.nativeTemplateEngine.prototype['renderTemplateSource'] = function (templateSource, bindingContext, options, templateDocument) {
	    var useNodesIfAvailable = !(ko.utils.ieVersion < 9), // IE<9 cloneNode doesn't work properly
	        templateNodesFunc = useNodesIfAvailable ? templateSource['nodes'] : null,
	        templateNodes = templateNodesFunc ? templateSource['nodes']() : null;
	
	    if (templateNodes) {
	        return ko.utils.makeArray(templateNodes.cloneNode(true).childNodes);
	    } else {
	        var templateText = templateSource['text']();
	        return ko.utils.parseHtmlFragment(templateText, templateDocument);
	    }
	};
	
	ko.nativeTemplateEngine.instance = new ko.nativeTemplateEngine();
	ko.setTemplateEngine(ko.nativeTemplateEngine.instance);
	
	ko.exportSymbol('nativeTemplateEngine', ko.nativeTemplateEngine);
	(function() {
	    ko.jqueryTmplTemplateEngine = function () {
	        // Detect which version of jquery-tmpl you're using. Unfortunately jquery-tmpl
	        // doesn't expose a version number, so we have to infer it.
	        // Note that as of Knockout 1.3, we only support jQuery.tmpl 1.0.0pre and later,
	        // which KO internally refers to as version "2", so older versions are no longer detected.
	        var jQueryTmplVersion = this.jQueryTmplVersion = (function() {
	            if (!jQueryInstance || !(jQueryInstance['tmpl']))
	                return 0;
	            // Since it exposes no official version number, we use our own numbering system. To be updated as jquery-tmpl evolves.
	            try {
	                if (jQueryInstance['tmpl']['tag']['tmpl']['open'].toString().indexOf('__') >= 0) {
	                    // Since 1.0.0pre, custom tags should append markup to an array called "__"
	                    return 2; // Final version of jquery.tmpl
	                }
	            } catch(ex) { /* Apparently not the version we were looking for */ }
	
	            return 1; // Any older version that we don't support
	        })();
	
	        function ensureHasReferencedJQueryTemplates() {
	            if (jQueryTmplVersion < 2)
	                throw new Error("Your version of jQuery.tmpl is too old. Please upgrade to jQuery.tmpl 1.0.0pre or later.");
	        }
	
	        function executeTemplate(compiledTemplate, data, jQueryTemplateOptions) {
	            return jQueryInstance['tmpl'](compiledTemplate, data, jQueryTemplateOptions);
	        }
	
	        this['renderTemplateSource'] = function(templateSource, bindingContext, options, templateDocument) {
	            templateDocument = templateDocument || document;
	            options = options || {};
	            ensureHasReferencedJQueryTemplates();
	
	            // Ensure we have stored a precompiled version of this template (don't want to reparse on every render)
	            var precompiled = templateSource['data']('precompiled');
	            if (!precompiled) {
	                var templateText = templateSource['text']() || "";
	                // Wrap in "with($whatever.koBindingContext) { ... }"
	                templateText = "{{ko_with $item.koBindingContext}}" + templateText + "{{/ko_with}}";
	
	                precompiled = jQueryInstance['template'](null, templateText);
	                templateSource['data']('precompiled', precompiled);
	            }
	
	            var data = [bindingContext['$data']]; // Prewrap the data in an array to stop jquery.tmpl from trying to unwrap any arrays
	            var jQueryTemplateOptions = jQueryInstance['extend']({ 'koBindingContext': bindingContext }, options['templateOptions']);
	
	            var resultNodes = executeTemplate(precompiled, data, jQueryTemplateOptions);
	            resultNodes['appendTo'](templateDocument.createElement("div")); // Using "appendTo" forces jQuery/jQuery.tmpl to perform necessary cleanup work
	
	            jQueryInstance['fragments'] = {}; // Clear jQuery's fragment cache to avoid a memory leak after a large number of template renders
	            return resultNodes;
	        };
	
	        this['createJavaScriptEvaluatorBlock'] = function(script) {
	            return "{{ko_code ((function() { return " + script + " })()) }}";
	        };
	
	        this['addTemplate'] = function(templateName, templateMarkup) {
	            document.write("<script type='text/html' id='" + templateName + "'>" + templateMarkup + "<" + "/script>");
	        };
	
	        if (jQueryTmplVersion > 0) {
	            jQueryInstance['tmpl']['tag']['ko_code'] = {
	                open: "__.push($1 || '');"
	            };
	            jQueryInstance['tmpl']['tag']['ko_with'] = {
	                open: "with($1) {",
	                close: "} "
	            };
	        }
	    };
	
	    ko.jqueryTmplTemplateEngine.prototype = new ko.templateEngine();
	    ko.jqueryTmplTemplateEngine.prototype.constructor = ko.jqueryTmplTemplateEngine;
	
	    // Use this one by default *only if jquery.tmpl is referenced*
	    var jqueryTmplTemplateEngineInstance = new ko.jqueryTmplTemplateEngine();
	    if (jqueryTmplTemplateEngineInstance.jQueryTmplVersion > 0)
	        ko.setTemplateEngine(jqueryTmplTemplateEngineInstance);
	
	    ko.exportSymbol('jqueryTmplTemplateEngine', ko.jqueryTmplTemplateEngine);
	})();
	}));
	}());
	})();
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10)(module)))

/***/ },
/* 50 */
/***/ function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	var d3 = __webpack_require__(52);
	
	var board = function(elementSelector) {
	    var marginTop = 30,
	        marginLeft = 30,
	        size = 13,
	        boardSize = 700,
	        margin = 40;
	
	    var scale = d3.scale.linear()
	        .domain([0, size - 1])
	        .range([margin, boardSize - margin]);
	
	    // creates an array
	    // of the board's number of cells.
	    var items = [];
	    for (var i = 0; i < size; i++) {
	        items.push(i);
	    }
	
	    var circles;
	
	    /**
	     * Creates the initial board
	     */
	    function create(positions, playcallback) {
	        var div = d3.select(elementSelector)
	            .append("div")
	            .style("width", boardSize + "px")
	            .style("height", boardSize + "px");
	
	        var svg = div.append("svg")
	            .attr("width", boardSize + "px")
	            .attr("height", boardSize + "px")
	
	        // baord
	        svg.append("rect")
	            .style("fill", "tan")
	            .attr("rx", "10px")
	            .attr("x", "0px")
	            .attr("y", "0px")
	            .attr("width", boardSize + "px")
	            .attr("height", boardSize + "px")
	
	        svg.append("g")
	            .selectAll("line")
	            .data(items)
	            .enter()
	            .append("line")
	            .attr("class", "xline")
	            .attr("x1", function(d) { return scale(d) + "px" })
	            .attr("y1", function(d) { return scale(0) + "px" })
	            .attr("x2", function(d) { return scale(d) + "px" })
	            .attr("y2", function(d) { return scale(size - 1) + "px" })
	            .attr("style", "stroke:rgb(0,0,0);stroke-width:1")
	
	        svg.append("g")
	            .selectAll("line")
	            .data(items)
	            .enter()
	            .append("line")
	            .attr("x1", function(d) { return scale(0) + "px" })
	            .attr("y1", function(d) { return scale(d) + "px" })
	            .attr("x2", function(d) { return scale(size - 1) + "px" })
	            .attr("y2", function(d) { return scale(d) + "px" })
	            .attr("style", "stroke:rgb(0,0,0);stroke-width:1")
	
	        var circles = svg.append("g");
	        circles.selectAll("circle")
	            .data(positions)
	            .enter()
	            .append("circle")
	            .attr("cx", function(d) { return scale(d[0]) })
	            .attr("cy", function(d) { return scale(d[1]) })
	            .attr("r", 20)
	            .attr("fill", function(d) { return d[2] === 0 ? "white" : "black" });
	
	        var hoverGroup = svg.append("g");
	
	        var updateHoverPosition = function(position) {
	            var hovercircles = hoverGroup.selectAll("circle")
	                .data(position);
	
	            hovercircles.enter()
	                .append("circle")
	                .attr("cx", function(d) { return scale(d[0]) })
	                .attr("cy", function(d) { return scale(d[1]) })
	                .attr("r", 20)
	                .attr("fill", function(d) { return d[2] === 0 ? "white" : "black" });
	
	            hovercircles
	                .attr("cx", function(d) { return scale(d[0]) })
	                .attr("cy", function(d) { return scale(d[1]) })
	                .attr("r", 20)
	                .attr("fill", function(d) { return d[2] === 0 ? "white" : "black" });
	            hovercircles.exit().remove();
	        }
	
	        document.querySelector(elementSelector)
	            .querySelector("svg")
	            .addEventListener("mousemove", function() {
	                var xpos = Math.round((arguments[0].offsetX - margin) * (size - 1) / (boardSize - 2 * margin))
	                var ypos = Math.round((arguments[0].offsetY - margin) * (size - 1) / (boardSize - 2 * margin))
	
	
	                // if position is within the grid
	                if (xpos >= 0 && xpos < size && ypos >= 0 && ypos < size) {
	                    updateHoverPosition([[xpos, ypos, 1]])
	                }
	                else {
	                    updateHoverPosition([]);
	                }
	            });
	
	        document.querySelector(elementSelector)
	            .querySelector("svg")
	            .addEventListener("click", function() {
	                //console.info(arguments)
	                var xpos = Math.round((arguments[0].offsetX - margin) * (size - 1) / (boardSize - 2 * margin))
	                var ypos = Math.round((arguments[0].offsetY - margin) * (size - 1) / (boardSize - 2 * margin))
	
	                // if position is within the grid
	                if (xpos >= 0 && xpos < size && ypos >= 0 && ypos < size) {
	                    playcallback([xpos,ypos]);
	                }
	            });
	    }
	
	    /**
	     * Updates positions
	     */
	    function update(positions) {
	        circles.selectAll("circle")
	            .data(positions)
	            .enter()
	            .append("circle")
	            .attr("cx", function(d) { return scale(d[0]) })
	            .attr("cy", function(d) { return scale(d[1]) })
	            .attr("r", 20)
	            .attr("fill", function(d) { return d[2] === 0 ? "white" : "black" });
	    }
	
	    return {
	        create: create,
	        update: update
	    }
	}
	
	module.exports.board = board

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;!function() {
	  var d3 = {
	    version: "3.5.16"
	  };
	  var d3_arraySlice = [].slice, d3_array = function(list) {
	    return d3_arraySlice.call(list);
	  };
	  var d3_document = this.document;
	  function d3_documentElement(node) {
	    return node && (node.ownerDocument || node.document || node).documentElement;
	  }
	  function d3_window(node) {
	    return node && (node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView);
	  }
	  if (d3_document) {
	    try {
	      d3_array(d3_document.documentElement.childNodes)[0].nodeType;
	    } catch (e) {
	      d3_array = function(list) {
	        var i = list.length, array = new Array(i);
	        while (i--) array[i] = list[i];
	        return array;
	      };
	    }
	  }
	  if (!Date.now) Date.now = function() {
	    return +new Date();
	  };
	  if (d3_document) {
	    try {
	      d3_document.createElement("DIV").style.setProperty("opacity", 0, "");
	    } catch (error) {
	      var d3_element_prototype = this.Element.prototype, d3_element_setAttribute = d3_element_prototype.setAttribute, d3_element_setAttributeNS = d3_element_prototype.setAttributeNS, d3_style_prototype = this.CSSStyleDeclaration.prototype, d3_style_setProperty = d3_style_prototype.setProperty;
	      d3_element_prototype.setAttribute = function(name, value) {
	        d3_element_setAttribute.call(this, name, value + "");
	      };
	      d3_element_prototype.setAttributeNS = function(space, local, value) {
	        d3_element_setAttributeNS.call(this, space, local, value + "");
	      };
	      d3_style_prototype.setProperty = function(name, value, priority) {
	        d3_style_setProperty.call(this, name, value + "", priority);
	      };
	    }
	  }
	  d3.ascending = d3_ascending;
	  function d3_ascending(a, b) {
	    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
	  }
	  d3.descending = function(a, b) {
	    return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
	  };
	  d3.min = function(array, f) {
	    var i = -1, n = array.length, a, b;
	    if (arguments.length === 1) {
	      while (++i < n) if ((b = array[i]) != null && b >= b) {
	        a = b;
	        break;
	      }
	      while (++i < n) if ((b = array[i]) != null && a > b) a = b;
	    } else {
	      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b >= b) {
	        a = b;
	        break;
	      }
	      while (++i < n) if ((b = f.call(array, array[i], i)) != null && a > b) a = b;
	    }
	    return a;
	  };
	  d3.max = function(array, f) {
	    var i = -1, n = array.length, a, b;
	    if (arguments.length === 1) {
	      while (++i < n) if ((b = array[i]) != null && b >= b) {
	        a = b;
	        break;
	      }
	      while (++i < n) if ((b = array[i]) != null && b > a) a = b;
	    } else {
	      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b >= b) {
	        a = b;
	        break;
	      }
	      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b > a) a = b;
	    }
	    return a;
	  };
	  d3.extent = function(array, f) {
	    var i = -1, n = array.length, a, b, c;
	    if (arguments.length === 1) {
	      while (++i < n) if ((b = array[i]) != null && b >= b) {
	        a = c = b;
	        break;
	      }
	      while (++i < n) if ((b = array[i]) != null) {
	        if (a > b) a = b;
	        if (c < b) c = b;
	      }
	    } else {
	      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b >= b) {
	        a = c = b;
	        break;
	      }
	      while (++i < n) if ((b = f.call(array, array[i], i)) != null) {
	        if (a > b) a = b;
	        if (c < b) c = b;
	      }
	    }
	    return [ a, c ];
	  };
	  function d3_number(x) {
	    return x === null ? NaN : +x;
	  }
	  function d3_numeric(x) {
	    return !isNaN(x);
	  }
	  d3.sum = function(array, f) {
	    var s = 0, n = array.length, a, i = -1;
	    if (arguments.length === 1) {
	      while (++i < n) if (d3_numeric(a = +array[i])) s += a;
	    } else {
	      while (++i < n) if (d3_numeric(a = +f.call(array, array[i], i))) s += a;
	    }
	    return s;
	  };
	  d3.mean = function(array, f) {
	    var s = 0, n = array.length, a, i = -1, j = n;
	    if (arguments.length === 1) {
	      while (++i < n) if (d3_numeric(a = d3_number(array[i]))) s += a; else --j;
	    } else {
	      while (++i < n) if (d3_numeric(a = d3_number(f.call(array, array[i], i)))) s += a; else --j;
	    }
	    if (j) return s / j;
	  };
	  d3.quantile = function(values, p) {
	    var H = (values.length - 1) * p + 1, h = Math.floor(H), v = +values[h - 1], e = H - h;
	    return e ? v + e * (values[h] - v) : v;
	  };
	  d3.median = function(array, f) {
	    var numbers = [], n = array.length, a, i = -1;
	    if (arguments.length === 1) {
	      while (++i < n) if (d3_numeric(a = d3_number(array[i]))) numbers.push(a);
	    } else {
	      while (++i < n) if (d3_numeric(a = d3_number(f.call(array, array[i], i)))) numbers.push(a);
	    }
	    if (numbers.length) return d3.quantile(numbers.sort(d3_ascending), .5);
	  };
	  d3.variance = function(array, f) {
	    var n = array.length, m = 0, a, d, s = 0, i = -1, j = 0;
	    if (arguments.length === 1) {
	      while (++i < n) {
	        if (d3_numeric(a = d3_number(array[i]))) {
	          d = a - m;
	          m += d / ++j;
	          s += d * (a - m);
	        }
	      }
	    } else {
	      while (++i < n) {
	        if (d3_numeric(a = d3_number(f.call(array, array[i], i)))) {
	          d = a - m;
	          m += d / ++j;
	          s += d * (a - m);
	        }
	      }
	    }
	    if (j > 1) return s / (j - 1);
	  };
	  d3.deviation = function() {
	    var v = d3.variance.apply(this, arguments);
	    return v ? Math.sqrt(v) : v;
	  };
	  function d3_bisector(compare) {
	    return {
	      left: function(a, x, lo, hi) {
	        if (arguments.length < 3) lo = 0;
	        if (arguments.length < 4) hi = a.length;
	        while (lo < hi) {
	          var mid = lo + hi >>> 1;
	          if (compare(a[mid], x) < 0) lo = mid + 1; else hi = mid;
	        }
	        return lo;
	      },
	      right: function(a, x, lo, hi) {
	        if (arguments.length < 3) lo = 0;
	        if (arguments.length < 4) hi = a.length;
	        while (lo < hi) {
	          var mid = lo + hi >>> 1;
	          if (compare(a[mid], x) > 0) hi = mid; else lo = mid + 1;
	        }
	        return lo;
	      }
	    };
	  }
	  var d3_bisect = d3_bisector(d3_ascending);
	  d3.bisectLeft = d3_bisect.left;
	  d3.bisect = d3.bisectRight = d3_bisect.right;
	  d3.bisector = function(f) {
	    return d3_bisector(f.length === 1 ? function(d, x) {
	      return d3_ascending(f(d), x);
	    } : f);
	  };
	  d3.shuffle = function(array, i0, i1) {
	    if ((m = arguments.length) < 3) {
	      i1 = array.length;
	      if (m < 2) i0 = 0;
	    }
	    var m = i1 - i0, t, i;
	    while (m) {
	      i = Math.random() * m-- | 0;
	      t = array[m + i0], array[m + i0] = array[i + i0], array[i + i0] = t;
	    }
	    return array;
	  };
	  d3.permute = function(array, indexes) {
	    var i = indexes.length, permutes = new Array(i);
	    while (i--) permutes[i] = array[indexes[i]];
	    return permutes;
	  };
	  d3.pairs = function(array) {
	    var i = 0, n = array.length - 1, p0, p1 = array[0], pairs = new Array(n < 0 ? 0 : n);
	    while (i < n) pairs[i] = [ p0 = p1, p1 = array[++i] ];
	    return pairs;
	  };
	  d3.transpose = function(matrix) {
	    if (!(n = matrix.length)) return [];
	    for (var i = -1, m = d3.min(matrix, d3_transposeLength), transpose = new Array(m); ++i < m; ) {
	      for (var j = -1, n, row = transpose[i] = new Array(n); ++j < n; ) {
	        row[j] = matrix[j][i];
	      }
	    }
	    return transpose;
	  };
	  function d3_transposeLength(d) {
	    return d.length;
	  }
	  d3.zip = function() {
	    return d3.transpose(arguments);
	  };
	  d3.keys = function(map) {
	    var keys = [];
	    for (var key in map) keys.push(key);
	    return keys;
	  };
	  d3.values = function(map) {
	    var values = [];
	    for (var key in map) values.push(map[key]);
	    return values;
	  };
	  d3.entries = function(map) {
	    var entries = [];
	    for (var key in map) entries.push({
	      key: key,
	      value: map[key]
	    });
	    return entries;
	  };
	  d3.merge = function(arrays) {
	    var n = arrays.length, m, i = -1, j = 0, merged, array;
	    while (++i < n) j += arrays[i].length;
	    merged = new Array(j);
	    while (--n >= 0) {
	      array = arrays[n];
	      m = array.length;
	      while (--m >= 0) {
	        merged[--j] = array[m];
	      }
	    }
	    return merged;
	  };
	  var abs = Math.abs;
	  d3.range = function(start, stop, step) {
	    if (arguments.length < 3) {
	      step = 1;
	      if (arguments.length < 2) {
	        stop = start;
	        start = 0;
	      }
	    }
	    if ((stop - start) / step === Infinity) throw new Error("infinite range");
	    var range = [], k = d3_range_integerScale(abs(step)), i = -1, j;
	    start *= k, stop *= k, step *= k;
	    if (step < 0) while ((j = start + step * ++i) > stop) range.push(j / k); else while ((j = start + step * ++i) < stop) range.push(j / k);
	    return range;
	  };
	  function d3_range_integerScale(x) {
	    var k = 1;
	    while (x * k % 1) k *= 10;
	    return k;
	  }
	  function d3_class(ctor, properties) {
	    for (var key in properties) {
	      Object.defineProperty(ctor.prototype, key, {
	        value: properties[key],
	        enumerable: false
	      });
	    }
	  }
	  d3.map = function(object, f) {
	    var map = new d3_Map();
	    if (object instanceof d3_Map) {
	      object.forEach(function(key, value) {
	        map.set(key, value);
	      });
	    } else if (Array.isArray(object)) {
	      var i = -1, n = object.length, o;
	      if (arguments.length === 1) while (++i < n) map.set(i, object[i]); else while (++i < n) map.set(f.call(object, o = object[i], i), o);
	    } else {
	      for (var key in object) map.set(key, object[key]);
	    }
	    return map;
	  };
	  function d3_Map() {
	    this._ = Object.create(null);
	  }
	  var d3_map_proto = "__proto__", d3_map_zero = "\x00";
	  d3_class(d3_Map, {
	    has: d3_map_has,
	    get: function(key) {
	      return this._[d3_map_escape(key)];
	    },
	    set: function(key, value) {
	      return this._[d3_map_escape(key)] = value;
	    },
	    remove: d3_map_remove,
	    keys: d3_map_keys,
	    values: function() {
	      var values = [];
	      for (var key in this._) values.push(this._[key]);
	      return values;
	    },
	    entries: function() {
	      var entries = [];
	      for (var key in this._) entries.push({
	        key: d3_map_unescape(key),
	        value: this._[key]
	      });
	      return entries;
	    },
	    size: d3_map_size,
	    empty: d3_map_empty,
	    forEach: function(f) {
	      for (var key in this._) f.call(this, d3_map_unescape(key), this._[key]);
	    }
	  });
	  function d3_map_escape(key) {
	    return (key += "") === d3_map_proto || key[0] === d3_map_zero ? d3_map_zero + key : key;
	  }
	  function d3_map_unescape(key) {
	    return (key += "")[0] === d3_map_zero ? key.slice(1) : key;
	  }
	  function d3_map_has(key) {
	    return d3_map_escape(key) in this._;
	  }
	  function d3_map_remove(key) {
	    return (key = d3_map_escape(key)) in this._ && delete this._[key];
	  }
	  function d3_map_keys() {
	    var keys = [];
	    for (var key in this._) keys.push(d3_map_unescape(key));
	    return keys;
	  }
	  function d3_map_size() {
	    var size = 0;
	    for (var key in this._) ++size;
	    return size;
	  }
	  function d3_map_empty() {
	    for (var key in this._) return false;
	    return true;
	  }
	  d3.nest = function() {
	    var nest = {}, keys = [], sortKeys = [], sortValues, rollup;
	    function map(mapType, array, depth) {
	      if (depth >= keys.length) return rollup ? rollup.call(nest, array) : sortValues ? array.sort(sortValues) : array;
	      var i = -1, n = array.length, key = keys[depth++], keyValue, object, setter, valuesByKey = new d3_Map(), values;
	      while (++i < n) {
	        if (values = valuesByKey.get(keyValue = key(object = array[i]))) {
	          values.push(object);
	        } else {
	          valuesByKey.set(keyValue, [ object ]);
	        }
	      }
	      if (mapType) {
	        object = mapType();
	        setter = function(keyValue, values) {
	          object.set(keyValue, map(mapType, values, depth));
	        };
	      } else {
	        object = {};
	        setter = function(keyValue, values) {
	          object[keyValue] = map(mapType, values, depth);
	        };
	      }
	      valuesByKey.forEach(setter);
	      return object;
	    }
	    function entries(map, depth) {
	      if (depth >= keys.length) return map;
	      var array = [], sortKey = sortKeys[depth++];
	      map.forEach(function(key, keyMap) {
	        array.push({
	          key: key,
	          values: entries(keyMap, depth)
	        });
	      });
	      return sortKey ? array.sort(function(a, b) {
	        return sortKey(a.key, b.key);
	      }) : array;
	    }
	    nest.map = function(array, mapType) {
	      return map(mapType, array, 0);
	    };
	    nest.entries = function(array) {
	      return entries(map(d3.map, array, 0), 0);
	    };
	    nest.key = function(d) {
	      keys.push(d);
	      return nest;
	    };
	    nest.sortKeys = function(order) {
	      sortKeys[keys.length - 1] = order;
	      return nest;
	    };
	    nest.sortValues = function(order) {
	      sortValues = order;
	      return nest;
	    };
	    nest.rollup = function(f) {
	      rollup = f;
	      return nest;
	    };
	    return nest;
	  };
	  d3.set = function(array) {
	    var set = new d3_Set();
	    if (array) for (var i = 0, n = array.length; i < n; ++i) set.add(array[i]);
	    return set;
	  };
	  function d3_Set() {
	    this._ = Object.create(null);
	  }
	  d3_class(d3_Set, {
	    has: d3_map_has,
	    add: function(key) {
	      this._[d3_map_escape(key += "")] = true;
	      return key;
	    },
	    remove: d3_map_remove,
	    values: d3_map_keys,
	    size: d3_map_size,
	    empty: d3_map_empty,
	    forEach: function(f) {
	      for (var key in this._) f.call(this, d3_map_unescape(key));
	    }
	  });
	  d3.behavior = {};
	  function d3_identity(d) {
	    return d;
	  }
	  d3.rebind = function(target, source) {
	    var i = 1, n = arguments.length, method;
	    while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
	    return target;
	  };
	  function d3_rebind(target, source, method) {
	    return function() {
	      var value = method.apply(source, arguments);
	      return value === source ? target : value;
	    };
	  }
	  function d3_vendorSymbol(object, name) {
	    if (name in object) return name;
	    name = name.charAt(0).toUpperCase() + name.slice(1);
	    for (var i = 0, n = d3_vendorPrefixes.length; i < n; ++i) {
	      var prefixName = d3_vendorPrefixes[i] + name;
	      if (prefixName in object) return prefixName;
	    }
	  }
	  var d3_vendorPrefixes = [ "webkit", "ms", "moz", "Moz", "o", "O" ];
	  function d3_noop() {}
	  d3.dispatch = function() {
	    var dispatch = new d3_dispatch(), i = -1, n = arguments.length;
	    while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);
	    return dispatch;
	  };
	  function d3_dispatch() {}
	  d3_dispatch.prototype.on = function(type, listener) {
	    var i = type.indexOf("."), name = "";
	    if (i >= 0) {
	      name = type.slice(i + 1);
	      type = type.slice(0, i);
	    }
	    if (type) return arguments.length < 2 ? this[type].on(name) : this[type].on(name, listener);
	    if (arguments.length === 2) {
	      if (listener == null) for (type in this) {
	        if (this.hasOwnProperty(type)) this[type].on(name, null);
	      }
	      return this;
	    }
	  };
	  function d3_dispatch_event(dispatch) {
	    var listeners = [], listenerByName = new d3_Map();
	    function event() {
	      var z = listeners, i = -1, n = z.length, l;
	      while (++i < n) if (l = z[i].on) l.apply(this, arguments);
	      return dispatch;
	    }
	    event.on = function(name, listener) {
	      var l = listenerByName.get(name), i;
	      if (arguments.length < 2) return l && l.on;
	      if (l) {
	        l.on = null;
	        listeners = listeners.slice(0, i = listeners.indexOf(l)).concat(listeners.slice(i + 1));
	        listenerByName.remove(name);
	      }
	      if (listener) listeners.push(listenerByName.set(name, {
	        on: listener
	      }));
	      return dispatch;
	    };
	    return event;
	  }
	  d3.event = null;
	  function d3_eventPreventDefault() {
	    d3.event.preventDefault();
	  }
	  function d3_eventSource() {
	    var e = d3.event, s;
	    while (s = e.sourceEvent) e = s;
	    return e;
	  }
	  function d3_eventDispatch(target) {
	    var dispatch = new d3_dispatch(), i = 0, n = arguments.length;
	    while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);
	    dispatch.of = function(thiz, argumentz) {
	      return function(e1) {
	        try {
	          var e0 = e1.sourceEvent = d3.event;
	          e1.target = target;
	          d3.event = e1;
	          dispatch[e1.type].apply(thiz, argumentz);
	        } finally {
	          d3.event = e0;
	        }
	      };
	    };
	    return dispatch;
	  }
	  d3.requote = function(s) {
	    return s.replace(d3_requote_re, "\\$&");
	  };
	  var d3_requote_re = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;
	  var d3_subclass = {}.__proto__ ? function(object, prototype) {
	    object.__proto__ = prototype;
	  } : function(object, prototype) {
	    for (var property in prototype) object[property] = prototype[property];
	  };
	  function d3_selection(groups) {
	    d3_subclass(groups, d3_selectionPrototype);
	    return groups;
	  }
	  var d3_select = function(s, n) {
	    return n.querySelector(s);
	  }, d3_selectAll = function(s, n) {
	    return n.querySelectorAll(s);
	  }, d3_selectMatches = function(n, s) {
	    var d3_selectMatcher = n.matches || n[d3_vendorSymbol(n, "matchesSelector")];
	    d3_selectMatches = function(n, s) {
	      return d3_selectMatcher.call(n, s);
	    };
	    return d3_selectMatches(n, s);
	  };
	  if (typeof Sizzle === "function") {
	    d3_select = function(s, n) {
	      return Sizzle(s, n)[0] || null;
	    };
	    d3_selectAll = Sizzle;
	    d3_selectMatches = Sizzle.matchesSelector;
	  }
	  d3.selection = function() {
	    return d3.select(d3_document.documentElement);
	  };
	  var d3_selectionPrototype = d3.selection.prototype = [];
	  d3_selectionPrototype.select = function(selector) {
	    var subgroups = [], subgroup, subnode, group, node;
	    selector = d3_selection_selector(selector);
	    for (var j = -1, m = this.length; ++j < m; ) {
	      subgroups.push(subgroup = []);
	      subgroup.parentNode = (group = this[j]).parentNode;
	      for (var i = -1, n = group.length; ++i < n; ) {
	        if (node = group[i]) {
	          subgroup.push(subnode = selector.call(node, node.__data__, i, j));
	          if (subnode && "__data__" in node) subnode.__data__ = node.__data__;
	        } else {
	          subgroup.push(null);
	        }
	      }
	    }
	    return d3_selection(subgroups);
	  };
	  function d3_selection_selector(selector) {
	    return typeof selector === "function" ? selector : function() {
	      return d3_select(selector, this);
	    };
	  }
	  d3_selectionPrototype.selectAll = function(selector) {
	    var subgroups = [], subgroup, node;
	    selector = d3_selection_selectorAll(selector);
	    for (var j = -1, m = this.length; ++j < m; ) {
	      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
	        if (node = group[i]) {
	          subgroups.push(subgroup = d3_array(selector.call(node, node.__data__, i, j)));
	          subgroup.parentNode = node;
	        }
	      }
	    }
	    return d3_selection(subgroups);
	  };
	  function d3_selection_selectorAll(selector) {
	    return typeof selector === "function" ? selector : function() {
	      return d3_selectAll(selector, this);
	    };
	  }
	  var d3_nsXhtml = "http://www.w3.org/1999/xhtml";
	  var d3_nsPrefix = {
	    svg: "http://www.w3.org/2000/svg",
	    xhtml: d3_nsXhtml,
	    xlink: "http://www.w3.org/1999/xlink",
	    xml: "http://www.w3.org/XML/1998/namespace",
	    xmlns: "http://www.w3.org/2000/xmlns/"
	  };
	  d3.ns = {
	    prefix: d3_nsPrefix,
	    qualify: function(name) {
	      var i = name.indexOf(":"), prefix = name;
	      if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
	      return d3_nsPrefix.hasOwnProperty(prefix) ? {
	        space: d3_nsPrefix[prefix],
	        local: name
	      } : name;
	    }
	  };
	  d3_selectionPrototype.attr = function(name, value) {
	    if (arguments.length < 2) {
	      if (typeof name === "string") {
	        var node = this.node();
	        name = d3.ns.qualify(name);
	        return name.local ? node.getAttributeNS(name.space, name.local) : node.getAttribute(name);
	      }
	      for (value in name) this.each(d3_selection_attr(value, name[value]));
	      return this;
	    }
	    return this.each(d3_selection_attr(name, value));
	  };
	  function d3_selection_attr(name, value) {
	    name = d3.ns.qualify(name);
	    function attrNull() {
	      this.removeAttribute(name);
	    }
	    function attrNullNS() {
	      this.removeAttributeNS(name.space, name.local);
	    }
	    function attrConstant() {
	      this.setAttribute(name, value);
	    }
	    function attrConstantNS() {
	      this.setAttributeNS(name.space, name.local, value);
	    }
	    function attrFunction() {
	      var x = value.apply(this, arguments);
	      if (x == null) this.removeAttribute(name); else this.setAttribute(name, x);
	    }
	    function attrFunctionNS() {
	      var x = value.apply(this, arguments);
	      if (x == null) this.removeAttributeNS(name.space, name.local); else this.setAttributeNS(name.space, name.local, x);
	    }
	    return value == null ? name.local ? attrNullNS : attrNull : typeof value === "function" ? name.local ? attrFunctionNS : attrFunction : name.local ? attrConstantNS : attrConstant;
	  }
	  function d3_collapse(s) {
	    return s.trim().replace(/\s+/g, " ");
	  }
	  d3_selectionPrototype.classed = function(name, value) {
	    if (arguments.length < 2) {
	      if (typeof name === "string") {
	        var node = this.node(), n = (name = d3_selection_classes(name)).length, i = -1;
	        if (value = node.classList) {
	          while (++i < n) if (!value.contains(name[i])) return false;
	        } else {
	          value = node.getAttribute("class");
	          while (++i < n) if (!d3_selection_classedRe(name[i]).test(value)) return false;
	        }
	        return true;
	      }
	      for (value in name) this.each(d3_selection_classed(value, name[value]));
	      return this;
	    }
	    return this.each(d3_selection_classed(name, value));
	  };
	  function d3_selection_classedRe(name) {
	    return new RegExp("(?:^|\\s+)" + d3.requote(name) + "(?:\\s+|$)", "g");
	  }
	  function d3_selection_classes(name) {
	    return (name + "").trim().split(/^|\s+/);
	  }
	  function d3_selection_classed(name, value) {
	    name = d3_selection_classes(name).map(d3_selection_classedName);
	    var n = name.length;
	    function classedConstant() {
	      var i = -1;
	      while (++i < n) name[i](this, value);
	    }
	    function classedFunction() {
	      var i = -1, x = value.apply(this, arguments);
	      while (++i < n) name[i](this, x);
	    }
	    return typeof value === "function" ? classedFunction : classedConstant;
	  }
	  function d3_selection_classedName(name) {
	    var re = d3_selection_classedRe(name);
	    return function(node, value) {
	      if (c = node.classList) return value ? c.add(name) : c.remove(name);
	      var c = node.getAttribute("class") || "";
	      if (value) {
	        re.lastIndex = 0;
	        if (!re.test(c)) node.setAttribute("class", d3_collapse(c + " " + name));
	      } else {
	        node.setAttribute("class", d3_collapse(c.replace(re, " ")));
	      }
	    };
	  }
	  d3_selectionPrototype.style = function(name, value, priority) {
	    var n = arguments.length;
	    if (n < 3) {
	      if (typeof name !== "string") {
	        if (n < 2) value = "";
	        for (priority in name) this.each(d3_selection_style(priority, name[priority], value));
	        return this;
	      }
	      if (n < 2) {
	        var node = this.node();
	        return d3_window(node).getComputedStyle(node, null).getPropertyValue(name);
	      }
	      priority = "";
	    }
	    return this.each(d3_selection_style(name, value, priority));
	  };
	  function d3_selection_style(name, value, priority) {
	    function styleNull() {
	      this.style.removeProperty(name);
	    }
	    function styleConstant() {
	      this.style.setProperty(name, value, priority);
	    }
	    function styleFunction() {
	      var x = value.apply(this, arguments);
	      if (x == null) this.style.removeProperty(name); else this.style.setProperty(name, x, priority);
	    }
	    return value == null ? styleNull : typeof value === "function" ? styleFunction : styleConstant;
	  }
	  d3_selectionPrototype.property = function(name, value) {
	    if (arguments.length < 2) {
	      if (typeof name === "string") return this.node()[name];
	      for (value in name) this.each(d3_selection_property(value, name[value]));
	      return this;
	    }
	    return this.each(d3_selection_property(name, value));
	  };
	  function d3_selection_property(name, value) {
	    function propertyNull() {
	      delete this[name];
	    }
	    function propertyConstant() {
	      this[name] = value;
	    }
	    function propertyFunction() {
	      var x = value.apply(this, arguments);
	      if (x == null) delete this[name]; else this[name] = x;
	    }
	    return value == null ? propertyNull : typeof value === "function" ? propertyFunction : propertyConstant;
	  }
	  d3_selectionPrototype.text = function(value) {
	    return arguments.length ? this.each(typeof value === "function" ? function() {
	      var v = value.apply(this, arguments);
	      this.textContent = v == null ? "" : v;
	    } : value == null ? function() {
	      this.textContent = "";
	    } : function() {
	      this.textContent = value;
	    }) : this.node().textContent;
	  };
	  d3_selectionPrototype.html = function(value) {
	    return arguments.length ? this.each(typeof value === "function" ? function() {
	      var v = value.apply(this, arguments);
	      this.innerHTML = v == null ? "" : v;
	    } : value == null ? function() {
	      this.innerHTML = "";
	    } : function() {
	      this.innerHTML = value;
	    }) : this.node().innerHTML;
	  };
	  d3_selectionPrototype.append = function(name) {
	    name = d3_selection_creator(name);
	    return this.select(function() {
	      return this.appendChild(name.apply(this, arguments));
	    });
	  };
	  function d3_selection_creator(name) {
	    function create() {
	      var document = this.ownerDocument, namespace = this.namespaceURI;
	      return namespace === d3_nsXhtml && document.documentElement.namespaceURI === d3_nsXhtml ? document.createElement(name) : document.createElementNS(namespace, name);
	    }
	    function createNS() {
	      return this.ownerDocument.createElementNS(name.space, name.local);
	    }
	    return typeof name === "function" ? name : (name = d3.ns.qualify(name)).local ? createNS : create;
	  }
	  d3_selectionPrototype.insert = function(name, before) {
	    name = d3_selection_creator(name);
	    before = d3_selection_selector(before);
	    return this.select(function() {
	      return this.insertBefore(name.apply(this, arguments), before.apply(this, arguments) || null);
	    });
	  };
	  d3_selectionPrototype.remove = function() {
	    return this.each(d3_selectionRemove);
	  };
	  function d3_selectionRemove() {
	    var parent = this.parentNode;
	    if (parent) parent.removeChild(this);
	  }
	  d3_selectionPrototype.data = function(value, key) {
	    var i = -1, n = this.length, group, node;
	    if (!arguments.length) {
	      value = new Array(n = (group = this[0]).length);
	      while (++i < n) {
	        if (node = group[i]) {
	          value[i] = node.__data__;
	        }
	      }
	      return value;
	    }
	    function bind(group, groupData) {
	      var i, n = group.length, m = groupData.length, n0 = Math.min(n, m), updateNodes = new Array(m), enterNodes = new Array(m), exitNodes = new Array(n), node, nodeData;
	      if (key) {
	        var nodeByKeyValue = new d3_Map(), keyValues = new Array(n), keyValue;
	        for (i = -1; ++i < n; ) {
	          if (node = group[i]) {
	            if (nodeByKeyValue.has(keyValue = key.call(node, node.__data__, i))) {
	              exitNodes[i] = node;
	            } else {
	              nodeByKeyValue.set(keyValue, node);
	            }
	            keyValues[i] = keyValue;
	          }
	        }
	        for (i = -1; ++i < m; ) {
	          if (!(node = nodeByKeyValue.get(keyValue = key.call(groupData, nodeData = groupData[i], i)))) {
	            enterNodes[i] = d3_selection_dataNode(nodeData);
	          } else if (node !== true) {
	            updateNodes[i] = node;
	            node.__data__ = nodeData;
	          }
	          nodeByKeyValue.set(keyValue, true);
	        }
	        for (i = -1; ++i < n; ) {
	          if (i in keyValues && nodeByKeyValue.get(keyValues[i]) !== true) {
	            exitNodes[i] = group[i];
	          }
	        }
	      } else {
	        for (i = -1; ++i < n0; ) {
	          node = group[i];
	          nodeData = groupData[i];
	          if (node) {
	            node.__data__ = nodeData;
	            updateNodes[i] = node;
	          } else {
	            enterNodes[i] = d3_selection_dataNode(nodeData);
	          }
	        }
	        for (;i < m; ++i) {
	          enterNodes[i] = d3_selection_dataNode(groupData[i]);
	        }
	        for (;i < n; ++i) {
	          exitNodes[i] = group[i];
	        }
	      }
	      enterNodes.update = updateNodes;
	      enterNodes.parentNode = updateNodes.parentNode = exitNodes.parentNode = group.parentNode;
	      enter.push(enterNodes);
	      update.push(updateNodes);
	      exit.push(exitNodes);
	    }
	    var enter = d3_selection_enter([]), update = d3_selection([]), exit = d3_selection([]);
	    if (typeof value === "function") {
	      while (++i < n) {
	        bind(group = this[i], value.call(group, group.parentNode.__data__, i));
	      }
	    } else {
	      while (++i < n) {
	        bind(group = this[i], value);
	      }
	    }
	    update.enter = function() {
	      return enter;
	    };
	    update.exit = function() {
	      return exit;
	    };
	    return update;
	  };
	  function d3_selection_dataNode(data) {
	    return {
	      __data__: data
	    };
	  }
	  d3_selectionPrototype.datum = function(value) {
	    return arguments.length ? this.property("__data__", value) : this.property("__data__");
	  };
	  d3_selectionPrototype.filter = function(filter) {
	    var subgroups = [], subgroup, group, node;
	    if (typeof filter !== "function") filter = d3_selection_filter(filter);
	    for (var j = 0, m = this.length; j < m; j++) {
	      subgroups.push(subgroup = []);
	      subgroup.parentNode = (group = this[j]).parentNode;
	      for (var i = 0, n = group.length; i < n; i++) {
	        if ((node = group[i]) && filter.call(node, node.__data__, i, j)) {
	          subgroup.push(node);
	        }
	      }
	    }
	    return d3_selection(subgroups);
	  };
	  function d3_selection_filter(selector) {
	    return function() {
	      return d3_selectMatches(this, selector);
	    };
	  }
	  d3_selectionPrototype.order = function() {
	    for (var j = -1, m = this.length; ++j < m; ) {
	      for (var group = this[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
	        if (node = group[i]) {
	          if (next && next !== node.nextSibling) next.parentNode.insertBefore(node, next);
	          next = node;
	        }
	      }
	    }
	    return this;
	  };
	  d3_selectionPrototype.sort = function(comparator) {
	    comparator = d3_selection_sortComparator.apply(this, arguments);
	    for (var j = -1, m = this.length; ++j < m; ) this[j].sort(comparator);
	    return this.order();
	  };
	  function d3_selection_sortComparator(comparator) {
	    if (!arguments.length) comparator = d3_ascending;
	    return function(a, b) {
	      return a && b ? comparator(a.__data__, b.__data__) : !a - !b;
	    };
	  }
	  d3_selectionPrototype.each = function(callback) {
	    return d3_selection_each(this, function(node, i, j) {
	      callback.call(node, node.__data__, i, j);
	    });
	  };
	  function d3_selection_each(groups, callback) {
	    for (var j = 0, m = groups.length; j < m; j++) {
	      for (var group = groups[j], i = 0, n = group.length, node; i < n; i++) {
	        if (node = group[i]) callback(node, i, j);
	      }
	    }
	    return groups;
	  }
	  d3_selectionPrototype.call = function(callback) {
	    var args = d3_array(arguments);
	    callback.apply(args[0] = this, args);
	    return this;
	  };
	  d3_selectionPrototype.empty = function() {
	    return !this.node();
	  };
	  d3_selectionPrototype.node = function() {
	    for (var j = 0, m = this.length; j < m; j++) {
	      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
	        var node = group[i];
	        if (node) return node;
	      }
	    }
	    return null;
	  };
	  d3_selectionPrototype.size = function() {
	    var n = 0;
	    d3_selection_each(this, function() {
	      ++n;
	    });
	    return n;
	  };
	  function d3_selection_enter(selection) {
	    d3_subclass(selection, d3_selection_enterPrototype);
	    return selection;
	  }
	  var d3_selection_enterPrototype = [];
	  d3.selection.enter = d3_selection_enter;
	  d3.selection.enter.prototype = d3_selection_enterPrototype;
	  d3_selection_enterPrototype.append = d3_selectionPrototype.append;
	  d3_selection_enterPrototype.empty = d3_selectionPrototype.empty;
	  d3_selection_enterPrototype.node = d3_selectionPrototype.node;
	  d3_selection_enterPrototype.call = d3_selectionPrototype.call;
	  d3_selection_enterPrototype.size = d3_selectionPrototype.size;
	  d3_selection_enterPrototype.select = function(selector) {
	    var subgroups = [], subgroup, subnode, upgroup, group, node;
	    for (var j = -1, m = this.length; ++j < m; ) {
	      upgroup = (group = this[j]).update;
	      subgroups.push(subgroup = []);
	      subgroup.parentNode = group.parentNode;
	      for (var i = -1, n = group.length; ++i < n; ) {
	        if (node = group[i]) {
	          subgroup.push(upgroup[i] = subnode = selector.call(group.parentNode, node.__data__, i, j));
	          subnode.__data__ = node.__data__;
	        } else {
	          subgroup.push(null);
	        }
	      }
	    }
	    return d3_selection(subgroups);
	  };
	  d3_selection_enterPrototype.insert = function(name, before) {
	    if (arguments.length < 2) before = d3_selection_enterInsertBefore(this);
	    return d3_selectionPrototype.insert.call(this, name, before);
	  };
	  function d3_selection_enterInsertBefore(enter) {
	    var i0, j0;
	    return function(d, i, j) {
	      var group = enter[j].update, n = group.length, node;
	      if (j != j0) j0 = j, i0 = 0;
	      if (i >= i0) i0 = i + 1;
	      while (!(node = group[i0]) && ++i0 < n) ;
	      return node;
	    };
	  }
	  d3.select = function(node) {
	    var group;
	    if (typeof node === "string") {
	      group = [ d3_select(node, d3_document) ];
	      group.parentNode = d3_document.documentElement;
	    } else {
	      group = [ node ];
	      group.parentNode = d3_documentElement(node);
	    }
	    return d3_selection([ group ]);
	  };
	  d3.selectAll = function(nodes) {
	    var group;
	    if (typeof nodes === "string") {
	      group = d3_array(d3_selectAll(nodes, d3_document));
	      group.parentNode = d3_document.documentElement;
	    } else {
	      group = d3_array(nodes);
	      group.parentNode = null;
	    }
	    return d3_selection([ group ]);
	  };
	  d3_selectionPrototype.on = function(type, listener, capture) {
	    var n = arguments.length;
	    if (n < 3) {
	      if (typeof type !== "string") {
	        if (n < 2) listener = false;
	        for (capture in type) this.each(d3_selection_on(capture, type[capture], listener));
	        return this;
	      }
	      if (n < 2) return (n = this.node()["__on" + type]) && n._;
	      capture = false;
	    }
	    return this.each(d3_selection_on(type, listener, capture));
	  };
	  function d3_selection_on(type, listener, capture) {
	    var name = "__on" + type, i = type.indexOf("."), wrap = d3_selection_onListener;
	    if (i > 0) type = type.slice(0, i);
	    var filter = d3_selection_onFilters.get(type);
	    if (filter) type = filter, wrap = d3_selection_onFilter;
	    function onRemove() {
	      var l = this[name];
	      if (l) {
	        this.removeEventListener(type, l, l.$);
	        delete this[name];
	      }
	    }
	    function onAdd() {
	      var l = wrap(listener, d3_array(arguments));
	      onRemove.call(this);
	      this.addEventListener(type, this[name] = l, l.$ = capture);
	      l._ = listener;
	    }
	    function removeAll() {
	      var re = new RegExp("^__on([^.]+)" + d3.requote(type) + "$"), match;
	      for (var name in this) {
	        if (match = name.match(re)) {
	          var l = this[name];
	          this.removeEventListener(match[1], l, l.$);
	          delete this[name];
	        }
	      }
	    }
	    return i ? listener ? onAdd : onRemove : listener ? d3_noop : removeAll;
	  }
	  var d3_selection_onFilters = d3.map({
	    mouseenter: "mouseover",
	    mouseleave: "mouseout"
	  });
	  if (d3_document) {
	    d3_selection_onFilters.forEach(function(k) {
	      if ("on" + k in d3_document) d3_selection_onFilters.remove(k);
	    });
	  }
	  function d3_selection_onListener(listener, argumentz) {
	    return function(e) {
	      var o = d3.event;
	      d3.event = e;
	      argumentz[0] = this.__data__;
	      try {
	        listener.apply(this, argumentz);
	      } finally {
	        d3.event = o;
	      }
	    };
	  }
	  function d3_selection_onFilter(listener, argumentz) {
	    var l = d3_selection_onListener(listener, argumentz);
	    return function(e) {
	      var target = this, related = e.relatedTarget;
	      if (!related || related !== target && !(related.compareDocumentPosition(target) & 8)) {
	        l.call(target, e);
	      }
	    };
	  }
	  var d3_event_dragSelect, d3_event_dragId = 0;
	  function d3_event_dragSuppress(node) {
	    var name = ".dragsuppress-" + ++d3_event_dragId, click = "click" + name, w = d3.select(d3_window(node)).on("touchmove" + name, d3_eventPreventDefault).on("dragstart" + name, d3_eventPreventDefault).on("selectstart" + name, d3_eventPreventDefault);
	    if (d3_event_dragSelect == null) {
	      d3_event_dragSelect = "onselectstart" in node ? false : d3_vendorSymbol(node.style, "userSelect");
	    }
	    if (d3_event_dragSelect) {
	      var style = d3_documentElement(node).style, select = style[d3_event_dragSelect];
	      style[d3_event_dragSelect] = "none";
	    }
	    return function(suppressClick) {
	      w.on(name, null);
	      if (d3_event_dragSelect) style[d3_event_dragSelect] = select;
	      if (suppressClick) {
	        var off = function() {
	          w.on(click, null);
	        };
	        w.on(click, function() {
	          d3_eventPreventDefault();
	          off();
	        }, true);
	        setTimeout(off, 0);
	      }
	    };
	  }
	  d3.mouse = function(container) {
	    return d3_mousePoint(container, d3_eventSource());
	  };
	  var d3_mouse_bug44083 = this.navigator && /WebKit/.test(this.navigator.userAgent) ? -1 : 0;
	  function d3_mousePoint(container, e) {
	    if (e.changedTouches) e = e.changedTouches[0];
	    var svg = container.ownerSVGElement || container;
	    if (svg.createSVGPoint) {
	      var point = svg.createSVGPoint();
	      if (d3_mouse_bug44083 < 0) {
	        var window = d3_window(container);
	        if (window.scrollX || window.scrollY) {
	          svg = d3.select("body").append("svg").style({
	            position: "absolute",
	            top: 0,
	            left: 0,
	            margin: 0,
	            padding: 0,
	            border: "none"
	          }, "important");
	          var ctm = svg[0][0].getScreenCTM();
	          d3_mouse_bug44083 = !(ctm.f || ctm.e);
	          svg.remove();
	        }
	      }
	      if (d3_mouse_bug44083) point.x = e.pageX, point.y = e.pageY; else point.x = e.clientX, 
	      point.y = e.clientY;
	      point = point.matrixTransform(container.getScreenCTM().inverse());
	      return [ point.x, point.y ];
	    }
	    var rect = container.getBoundingClientRect();
	    return [ e.clientX - rect.left - container.clientLeft, e.clientY - rect.top - container.clientTop ];
	  }
	  d3.touch = function(container, touches, identifier) {
	    if (arguments.length < 3) identifier = touches, touches = d3_eventSource().changedTouches;
	    if (touches) for (var i = 0, n = touches.length, touch; i < n; ++i) {
	      if ((touch = touches[i]).identifier === identifier) {
	        return d3_mousePoint(container, touch);
	      }
	    }
	  };
	  d3.behavior.drag = function() {
	    var event = d3_eventDispatch(drag, "drag", "dragstart", "dragend"), origin = null, mousedown = dragstart(d3_noop, d3.mouse, d3_window, "mousemove", "mouseup"), touchstart = dragstart(d3_behavior_dragTouchId, d3.touch, d3_identity, "touchmove", "touchend");
	    function drag() {
	      this.on("mousedown.drag", mousedown).on("touchstart.drag", touchstart);
	    }
	    function dragstart(id, position, subject, move, end) {
	      return function() {
	        var that = this, target = d3.event.target.correspondingElement || d3.event.target, parent = that.parentNode, dispatch = event.of(that, arguments), dragged = 0, dragId = id(), dragName = ".drag" + (dragId == null ? "" : "-" + dragId), dragOffset, dragSubject = d3.select(subject(target)).on(move + dragName, moved).on(end + dragName, ended), dragRestore = d3_event_dragSuppress(target), position0 = position(parent, dragId);
	        if (origin) {
	          dragOffset = origin.apply(that, arguments);
	          dragOffset = [ dragOffset.x - position0[0], dragOffset.y - position0[1] ];
	        } else {
	          dragOffset = [ 0, 0 ];
	        }
	        dispatch({
	          type: "dragstart"
	        });
	        function moved() {
	          var position1 = position(parent, dragId), dx, dy;
	          if (!position1) return;
	          dx = position1[0] - position0[0];
	          dy = position1[1] - position0[1];
	          dragged |= dx | dy;
	          position0 = position1;
	          dispatch({
	            type: "drag",
	            x: position1[0] + dragOffset[0],
	            y: position1[1] + dragOffset[1],
	            dx: dx,
	            dy: dy
	          });
	        }
	        function ended() {
	          if (!position(parent, dragId)) return;
	          dragSubject.on(move + dragName, null).on(end + dragName, null);
	          dragRestore(dragged);
	          dispatch({
	            type: "dragend"
	          });
	        }
	      };
	    }
	    drag.origin = function(x) {
	      if (!arguments.length) return origin;
	      origin = x;
	      return drag;
	    };
	    return d3.rebind(drag, event, "on");
	  };
	  function d3_behavior_dragTouchId() {
	    return d3.event.changedTouches[0].identifier;
	  }
	  d3.touches = function(container, touches) {
	    if (arguments.length < 2) touches = d3_eventSource().touches;
	    return touches ? d3_array(touches).map(function(touch) {
	      var point = d3_mousePoint(container, touch);
	      point.identifier = touch.identifier;
	      return point;
	    }) : [];
	  };
	  var ε = 1e-6, ε2 = ε * ε, π = Math.PI, τ = 2 * π, τε = τ - ε, halfπ = π / 2, d3_radians = π / 180, d3_degrees = 180 / π;
	  function d3_sgn(x) {
	    return x > 0 ? 1 : x < 0 ? -1 : 0;
	  }
	  function d3_cross2d(a, b, c) {
	    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
	  }
	  function d3_acos(x) {
	    return x > 1 ? 0 : x < -1 ? π : Math.acos(x);
	  }
	  function d3_asin(x) {
	    return x > 1 ? halfπ : x < -1 ? -halfπ : Math.asin(x);
	  }
	  function d3_sinh(x) {
	    return ((x = Math.exp(x)) - 1 / x) / 2;
	  }
	  function d3_cosh(x) {
	    return ((x = Math.exp(x)) + 1 / x) / 2;
	  }
	  function d3_tanh(x) {
	    return ((x = Math.exp(2 * x)) - 1) / (x + 1);
	  }
	  function d3_haversin(x) {
	    return (x = Math.sin(x / 2)) * x;
	  }
	  var ρ = Math.SQRT2, ρ2 = 2, ρ4 = 4;
	  d3.interpolateZoom = function(p0, p1) {
	    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2], dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, i, S;
	    if (d2 < ε2) {
	      S = Math.log(w1 / w0) / ρ;
	      i = function(t) {
	        return [ ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(ρ * t * S) ];
	      };
	    } else {
	      var d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + ρ4 * d2) / (2 * w0 * ρ2 * d1), b1 = (w1 * w1 - w0 * w0 - ρ4 * d2) / (2 * w1 * ρ2 * d1), r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
	      S = (r1 - r0) / ρ;
	      i = function(t) {
	        var s = t * S, coshr0 = d3_cosh(r0), u = w0 / (ρ2 * d1) * (coshr0 * d3_tanh(ρ * s + r0) - d3_sinh(r0));
	        return [ ux0 + u * dx, uy0 + u * dy, w0 * coshr0 / d3_cosh(ρ * s + r0) ];
	      };
	    }
	    i.duration = S * 1e3;
	    return i;
	  };
	  d3.behavior.zoom = function() {
	    var view = {
	      x: 0,
	      y: 0,
	      k: 1
	    }, translate0, center0, center, size = [ 960, 500 ], scaleExtent = d3_behavior_zoomInfinity, duration = 250, zooming = 0, mousedown = "mousedown.zoom", mousemove = "mousemove.zoom", mouseup = "mouseup.zoom", mousewheelTimer, touchstart = "touchstart.zoom", touchtime, event = d3_eventDispatch(zoom, "zoomstart", "zoom", "zoomend"), x0, x1, y0, y1;
	    if (!d3_behavior_zoomWheel) {
	      d3_behavior_zoomWheel = "onwheel" in d3_document ? (d3_behavior_zoomDelta = function() {
	        return -d3.event.deltaY * (d3.event.deltaMode ? 120 : 1);
	      }, "wheel") : "onmousewheel" in d3_document ? (d3_behavior_zoomDelta = function() {
	        return d3.event.wheelDelta;
	      }, "mousewheel") : (d3_behavior_zoomDelta = function() {
	        return -d3.event.detail;
	      }, "MozMousePixelScroll");
	    }
	    function zoom(g) {
	      g.on(mousedown, mousedowned).on(d3_behavior_zoomWheel + ".zoom", mousewheeled).on("dblclick.zoom", dblclicked).on(touchstart, touchstarted);
	    }
	    zoom.event = function(g) {
	      g.each(function() {
	        var dispatch = event.of(this, arguments), view1 = view;
	        if (d3_transitionInheritId) {
	          d3.select(this).transition().each("start.zoom", function() {
	            view = this.__chart__ || {
	              x: 0,
	              y: 0,
	              k: 1
	            };
	            zoomstarted(dispatch);
	          }).tween("zoom:zoom", function() {
	            var dx = size[0], dy = size[1], cx = center0 ? center0[0] : dx / 2, cy = center0 ? center0[1] : dy / 2, i = d3.interpolateZoom([ (cx - view.x) / view.k, (cy - view.y) / view.k, dx / view.k ], [ (cx - view1.x) / view1.k, (cy - view1.y) / view1.k, dx / view1.k ]);
	            return function(t) {
	              var l = i(t), k = dx / l[2];
	              this.__chart__ = view = {
	                x: cx - l[0] * k,
	                y: cy - l[1] * k,
	                k: k
	              };
	              zoomed(dispatch);
	            };
	          }).each("interrupt.zoom", function() {
	            zoomended(dispatch);
	          }).each("end.zoom", function() {
	            zoomended(dispatch);
	          });
	        } else {
	          this.__chart__ = view;
	          zoomstarted(dispatch);
	          zoomed(dispatch);
	          zoomended(dispatch);
	        }
	      });
	    };
	    zoom.translate = function(_) {
	      if (!arguments.length) return [ view.x, view.y ];
	      view = {
	        x: +_[0],
	        y: +_[1],
	        k: view.k
	      };
	      rescale();
	      return zoom;
	    };
	    zoom.scale = function(_) {
	      if (!arguments.length) return view.k;
	      view = {
	        x: view.x,
	        y: view.y,
	        k: null
	      };
	      scaleTo(+_);
	      rescale();
	      return zoom;
	    };
	    zoom.scaleExtent = function(_) {
	      if (!arguments.length) return scaleExtent;
	      scaleExtent = _ == null ? d3_behavior_zoomInfinity : [ +_[0], +_[1] ];
	      return zoom;
	    };
	    zoom.center = function(_) {
	      if (!arguments.length) return center;
	      center = _ && [ +_[0], +_[1] ];
	      return zoom;
	    };
	    zoom.size = function(_) {
	      if (!arguments.length) return size;
	      size = _ && [ +_[0], +_[1] ];
	      return zoom;
	    };
	    zoom.duration = function(_) {
	      if (!arguments.length) return duration;
	      duration = +_;
	      return zoom;
	    };
	    zoom.x = function(z) {
	      if (!arguments.length) return x1;
	      x1 = z;
	      x0 = z.copy();
	      view = {
	        x: 0,
	        y: 0,
	        k: 1
	      };
	      return zoom;
	    };
	    zoom.y = function(z) {
	      if (!arguments.length) return y1;
	      y1 = z;
	      y0 = z.copy();
	      view = {
	        x: 0,
	        y: 0,
	        k: 1
	      };
	      return zoom;
	    };
	    function location(p) {
	      return [ (p[0] - view.x) / view.k, (p[1] - view.y) / view.k ];
	    }
	    function point(l) {
	      return [ l[0] * view.k + view.x, l[1] * view.k + view.y ];
	    }
	    function scaleTo(s) {
	      view.k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], s));
	    }
	    function translateTo(p, l) {
	      l = point(l);
	      view.x += p[0] - l[0];
	      view.y += p[1] - l[1];
	    }
	    function zoomTo(that, p, l, k) {
	      that.__chart__ = {
	        x: view.x,
	        y: view.y,
	        k: view.k
	      };
	      scaleTo(Math.pow(2, k));
	      translateTo(center0 = p, l);
	      that = d3.select(that);
	      if (duration > 0) that = that.transition().duration(duration);
	      that.call(zoom.event);
	    }
	    function rescale() {
	      if (x1) x1.domain(x0.range().map(function(x) {
	        return (x - view.x) / view.k;
	      }).map(x0.invert));
	      if (y1) y1.domain(y0.range().map(function(y) {
	        return (y - view.y) / view.k;
	      }).map(y0.invert));
	    }
	    function zoomstarted(dispatch) {
	      if (!zooming++) dispatch({
	        type: "zoomstart"
	      });
	    }
	    function zoomed(dispatch) {
	      rescale();
	      dispatch({
	        type: "zoom",
	        scale: view.k,
	        translate: [ view.x, view.y ]
	      });
	    }
	    function zoomended(dispatch) {
	      if (!--zooming) dispatch({
	        type: "zoomend"
	      }), center0 = null;
	    }
	    function mousedowned() {
	      var that = this, dispatch = event.of(that, arguments), dragged = 0, subject = d3.select(d3_window(that)).on(mousemove, moved).on(mouseup, ended), location0 = location(d3.mouse(that)), dragRestore = d3_event_dragSuppress(that);
	      d3_selection_interrupt.call(that);
	      zoomstarted(dispatch);
	      function moved() {
	        dragged = 1;
	        translateTo(d3.mouse(that), location0);
	        zoomed(dispatch);
	      }
	      function ended() {
	        subject.on(mousemove, null).on(mouseup, null);
	        dragRestore(dragged);
	        zoomended(dispatch);
	      }
	    }
	    function touchstarted() {
	      var that = this, dispatch = event.of(that, arguments), locations0 = {}, distance0 = 0, scale0, zoomName = ".zoom-" + d3.event.changedTouches[0].identifier, touchmove = "touchmove" + zoomName, touchend = "touchend" + zoomName, targets = [], subject = d3.select(that), dragRestore = d3_event_dragSuppress(that);
	      started();
	      zoomstarted(dispatch);
	      subject.on(mousedown, null).on(touchstart, started);
	      function relocate() {
	        var touches = d3.touches(that);
	        scale0 = view.k;
	        touches.forEach(function(t) {
	          if (t.identifier in locations0) locations0[t.identifier] = location(t);
	        });
	        return touches;
	      }
	      function started() {
	        var target = d3.event.target;
	        d3.select(target).on(touchmove, moved).on(touchend, ended);
	        targets.push(target);
	        var changed = d3.event.changedTouches;
	        for (var i = 0, n = changed.length; i < n; ++i) {
	          locations0[changed[i].identifier] = null;
	        }
	        var touches = relocate(), now = Date.now();
	        if (touches.length === 1) {
	          if (now - touchtime < 500) {
	            var p = touches[0];
	            zoomTo(that, p, locations0[p.identifier], Math.floor(Math.log(view.k) / Math.LN2) + 1);
	            d3_eventPreventDefault();
	          }
	          touchtime = now;
	        } else if (touches.length > 1) {
	          var p = touches[0], q = touches[1], dx = p[0] - q[0], dy = p[1] - q[1];
	          distance0 = dx * dx + dy * dy;
	        }
	      }
	      function moved() {
	        var touches = d3.touches(that), p0, l0, p1, l1;
	        d3_selection_interrupt.call(that);
	        for (var i = 0, n = touches.length; i < n; ++i, l1 = null) {
	          p1 = touches[i];
	          if (l1 = locations0[p1.identifier]) {
	            if (l0) break;
	            p0 = p1, l0 = l1;
	          }
	        }
	        if (l1) {
	          var distance1 = (distance1 = p1[0] - p0[0]) * distance1 + (distance1 = p1[1] - p0[1]) * distance1, scale1 = distance0 && Math.sqrt(distance1 / distance0);
	          p0 = [ (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 ];
	          l0 = [ (l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2 ];
	          scaleTo(scale1 * scale0);
	        }
	        touchtime = null;
	        translateTo(p0, l0);
	        zoomed(dispatch);
	      }
	      function ended() {
	        if (d3.event.touches.length) {
	          var changed = d3.event.changedTouches;
	          for (var i = 0, n = changed.length; i < n; ++i) {
	            delete locations0[changed[i].identifier];
	          }
	          for (var identifier in locations0) {
	            return void relocate();
	          }
	        }
	        d3.selectAll(targets).on(zoomName, null);
	        subject.on(mousedown, mousedowned).on(touchstart, touchstarted);
	        dragRestore();
	        zoomended(dispatch);
	      }
	    }
	    function mousewheeled() {
	      var dispatch = event.of(this, arguments);
	      if (mousewheelTimer) clearTimeout(mousewheelTimer); else d3_selection_interrupt.call(this), 
	      translate0 = location(center0 = center || d3.mouse(this)), zoomstarted(dispatch);
	      mousewheelTimer = setTimeout(function() {
	        mousewheelTimer = null;
	        zoomended(dispatch);
	      }, 50);
	      d3_eventPreventDefault();
	      scaleTo(Math.pow(2, d3_behavior_zoomDelta() * .002) * view.k);
	      translateTo(center0, translate0);
	      zoomed(dispatch);
	    }
	    function dblclicked() {
	      var p = d3.mouse(this), k = Math.log(view.k) / Math.LN2;
	      zoomTo(this, p, location(p), d3.event.shiftKey ? Math.ceil(k) - 1 : Math.floor(k) + 1);
	    }
	    return d3.rebind(zoom, event, "on");
	  };
	  var d3_behavior_zoomInfinity = [ 0, Infinity ], d3_behavior_zoomDelta, d3_behavior_zoomWheel;
	  d3.color = d3_color;
	  function d3_color() {}
	  d3_color.prototype.toString = function() {
	    return this.rgb() + "";
	  };
	  d3.hsl = d3_hsl;
	  function d3_hsl(h, s, l) {
	    return this instanceof d3_hsl ? void (this.h = +h, this.s = +s, this.l = +l) : arguments.length < 2 ? h instanceof d3_hsl ? new d3_hsl(h.h, h.s, h.l) : d3_rgb_parse("" + h, d3_rgb_hsl, d3_hsl) : new d3_hsl(h, s, l);
	  }
	  var d3_hslPrototype = d3_hsl.prototype = new d3_color();
	  d3_hslPrototype.brighter = function(k) {
	    k = Math.pow(.7, arguments.length ? k : 1);
	    return new d3_hsl(this.h, this.s, this.l / k);
	  };
	  d3_hslPrototype.darker = function(k) {
	    k = Math.pow(.7, arguments.length ? k : 1);
	    return new d3_hsl(this.h, this.s, k * this.l);
	  };
	  d3_hslPrototype.rgb = function() {
	    return d3_hsl_rgb(this.h, this.s, this.l);
	  };
	  function d3_hsl_rgb(h, s, l) {
	    var m1, m2;
	    h = isNaN(h) ? 0 : (h %= 360) < 0 ? h + 360 : h;
	    s = isNaN(s) ? 0 : s < 0 ? 0 : s > 1 ? 1 : s;
	    l = l < 0 ? 0 : l > 1 ? 1 : l;
	    m2 = l <= .5 ? l * (1 + s) : l + s - l * s;
	    m1 = 2 * l - m2;
	    function v(h) {
	      if (h > 360) h -= 360; else if (h < 0) h += 360;
	      if (h < 60) return m1 + (m2 - m1) * h / 60;
	      if (h < 180) return m2;
	      if (h < 240) return m1 + (m2 - m1) * (240 - h) / 60;
	      return m1;
	    }
	    function vv(h) {
	      return Math.round(v(h) * 255);
	    }
	    return new d3_rgb(vv(h + 120), vv(h), vv(h - 120));
	  }
	  d3.hcl = d3_hcl;
	  function d3_hcl(h, c, l) {
	    return this instanceof d3_hcl ? void (this.h = +h, this.c = +c, this.l = +l) : arguments.length < 2 ? h instanceof d3_hcl ? new d3_hcl(h.h, h.c, h.l) : h instanceof d3_lab ? d3_lab_hcl(h.l, h.a, h.b) : d3_lab_hcl((h = d3_rgb_lab((h = d3.rgb(h)).r, h.g, h.b)).l, h.a, h.b) : new d3_hcl(h, c, l);
	  }
	  var d3_hclPrototype = d3_hcl.prototype = new d3_color();
	  d3_hclPrototype.brighter = function(k) {
	    return new d3_hcl(this.h, this.c, Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)));
	  };
	  d3_hclPrototype.darker = function(k) {
	    return new d3_hcl(this.h, this.c, Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)));
	  };
	  d3_hclPrototype.rgb = function() {
	    return d3_hcl_lab(this.h, this.c, this.l).rgb();
	  };
	  function d3_hcl_lab(h, c, l) {
	    if (isNaN(h)) h = 0;
	    if (isNaN(c)) c = 0;
	    return new d3_lab(l, Math.cos(h *= d3_radians) * c, Math.sin(h) * c);
	  }
	  d3.lab = d3_lab;
	  function d3_lab(l, a, b) {
	    return this instanceof d3_lab ? void (this.l = +l, this.a = +a, this.b = +b) : arguments.length < 2 ? l instanceof d3_lab ? new d3_lab(l.l, l.a, l.b) : l instanceof d3_hcl ? d3_hcl_lab(l.h, l.c, l.l) : d3_rgb_lab((l = d3_rgb(l)).r, l.g, l.b) : new d3_lab(l, a, b);
	  }
	  var d3_lab_K = 18;
	  var d3_lab_X = .95047, d3_lab_Y = 1, d3_lab_Z = 1.08883;
	  var d3_labPrototype = d3_lab.prototype = new d3_color();
	  d3_labPrototype.brighter = function(k) {
	    return new d3_lab(Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
	  };
	  d3_labPrototype.darker = function(k) {
	    return new d3_lab(Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
	  };
	  d3_labPrototype.rgb = function() {
	    return d3_lab_rgb(this.l, this.a, this.b);
	  };
	  function d3_lab_rgb(l, a, b) {
	    var y = (l + 16) / 116, x = y + a / 500, z = y - b / 200;
	    x = d3_lab_xyz(x) * d3_lab_X;
	    y = d3_lab_xyz(y) * d3_lab_Y;
	    z = d3_lab_xyz(z) * d3_lab_Z;
	    return new d3_rgb(d3_xyz_rgb(3.2404542 * x - 1.5371385 * y - .4985314 * z), d3_xyz_rgb(-.969266 * x + 1.8760108 * y + .041556 * z), d3_xyz_rgb(.0556434 * x - .2040259 * y + 1.0572252 * z));
	  }
	  function d3_lab_hcl(l, a, b) {
	    return l > 0 ? new d3_hcl(Math.atan2(b, a) * d3_degrees, Math.sqrt(a * a + b * b), l) : new d3_hcl(NaN, NaN, l);
	  }
	  function d3_lab_xyz(x) {
	    return x > .206893034 ? x * x * x : (x - 4 / 29) / 7.787037;
	  }
	  function d3_xyz_lab(x) {
	    return x > .008856 ? Math.pow(x, 1 / 3) : 7.787037 * x + 4 / 29;
	  }
	  function d3_xyz_rgb(r) {
	    return Math.round(255 * (r <= .00304 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - .055));
	  }
	  d3.rgb = d3_rgb;
	  function d3_rgb(r, g, b) {
	    return this instanceof d3_rgb ? void (this.r = ~~r, this.g = ~~g, this.b = ~~b) : arguments.length < 2 ? r instanceof d3_rgb ? new d3_rgb(r.r, r.g, r.b) : d3_rgb_parse("" + r, d3_rgb, d3_hsl_rgb) : new d3_rgb(r, g, b);
	  }
	  function d3_rgbNumber(value) {
	    return new d3_rgb(value >> 16, value >> 8 & 255, value & 255);
	  }
	  function d3_rgbString(value) {
	    return d3_rgbNumber(value) + "";
	  }
	  var d3_rgbPrototype = d3_rgb.prototype = new d3_color();
	  d3_rgbPrototype.brighter = function(k) {
	    k = Math.pow(.7, arguments.length ? k : 1);
	    var r = this.r, g = this.g, b = this.b, i = 30;
	    if (!r && !g && !b) return new d3_rgb(i, i, i);
	    if (r && r < i) r = i;
	    if (g && g < i) g = i;
	    if (b && b < i) b = i;
	    return new d3_rgb(Math.min(255, r / k), Math.min(255, g / k), Math.min(255, b / k));
	  };
	  d3_rgbPrototype.darker = function(k) {
	    k = Math.pow(.7, arguments.length ? k : 1);
	    return new d3_rgb(k * this.r, k * this.g, k * this.b);
	  };
	  d3_rgbPrototype.hsl = function() {
	    return d3_rgb_hsl(this.r, this.g, this.b);
	  };
	  d3_rgbPrototype.toString = function() {
	    return "#" + d3_rgb_hex(this.r) + d3_rgb_hex(this.g) + d3_rgb_hex(this.b);
	  };
	  function d3_rgb_hex(v) {
	    return v < 16 ? "0" + Math.max(0, v).toString(16) : Math.min(255, v).toString(16);
	  }
	  function d3_rgb_parse(format, rgb, hsl) {
	    var r = 0, g = 0, b = 0, m1, m2, color;
	    m1 = /([a-z]+)\((.*)\)/.exec(format = format.toLowerCase());
	    if (m1) {
	      m2 = m1[2].split(",");
	      switch (m1[1]) {
	       case "hsl":
	        {
	          return hsl(parseFloat(m2[0]), parseFloat(m2[1]) / 100, parseFloat(m2[2]) / 100);
	        }
	
	       case "rgb":
	        {
	          return rgb(d3_rgb_parseNumber(m2[0]), d3_rgb_parseNumber(m2[1]), d3_rgb_parseNumber(m2[2]));
	        }
	      }
	    }
	    if (color = d3_rgb_names.get(format)) {
	      return rgb(color.r, color.g, color.b);
	    }
	    if (format != null && format.charAt(0) === "#" && !isNaN(color = parseInt(format.slice(1), 16))) {
	      if (format.length === 4) {
	        r = (color & 3840) >> 4;
	        r = r >> 4 | r;
	        g = color & 240;
	        g = g >> 4 | g;
	        b = color & 15;
	        b = b << 4 | b;
	      } else if (format.length === 7) {
	        r = (color & 16711680) >> 16;
	        g = (color & 65280) >> 8;
	        b = color & 255;
	      }
	    }
	    return rgb(r, g, b);
	  }
	  function d3_rgb_hsl(r, g, b) {
	    var min = Math.min(r /= 255, g /= 255, b /= 255), max = Math.max(r, g, b), d = max - min, h, s, l = (max + min) / 2;
	    if (d) {
	      s = l < .5 ? d / (max + min) : d / (2 - max - min);
	      if (r == max) h = (g - b) / d + (g < b ? 6 : 0); else if (g == max) h = (b - r) / d + 2; else h = (r - g) / d + 4;
	      h *= 60;
	    } else {
	      h = NaN;
	      s = l > 0 && l < 1 ? 0 : h;
	    }
	    return new d3_hsl(h, s, l);
	  }
	  function d3_rgb_lab(r, g, b) {
	    r = d3_rgb_xyz(r);
	    g = d3_rgb_xyz(g);
	    b = d3_rgb_xyz(b);
	    var x = d3_xyz_lab((.4124564 * r + .3575761 * g + .1804375 * b) / d3_lab_X), y = d3_xyz_lab((.2126729 * r + .7151522 * g + .072175 * b) / d3_lab_Y), z = d3_xyz_lab((.0193339 * r + .119192 * g + .9503041 * b) / d3_lab_Z);
	    return d3_lab(116 * y - 16, 500 * (x - y), 200 * (y - z));
	  }
	  function d3_rgb_xyz(r) {
	    return (r /= 255) <= .04045 ? r / 12.92 : Math.pow((r + .055) / 1.055, 2.4);
	  }
	  function d3_rgb_parseNumber(c) {
	    var f = parseFloat(c);
	    return c.charAt(c.length - 1) === "%" ? Math.round(f * 2.55) : f;
	  }
	  var d3_rgb_names = d3.map({
	    aliceblue: 15792383,
	    antiquewhite: 16444375,
	    aqua: 65535,
	    aquamarine: 8388564,
	    azure: 15794175,
	    beige: 16119260,
	    bisque: 16770244,
	    black: 0,
	    blanchedalmond: 16772045,
	    blue: 255,
	    blueviolet: 9055202,
	    brown: 10824234,
	    burlywood: 14596231,
	    cadetblue: 6266528,
	    chartreuse: 8388352,
	    chocolate: 13789470,
	    coral: 16744272,
	    cornflowerblue: 6591981,
	    cornsilk: 16775388,
	    crimson: 14423100,
	    cyan: 65535,
	    darkblue: 139,
	    darkcyan: 35723,
	    darkgoldenrod: 12092939,
	    darkgray: 11119017,
	    darkgreen: 25600,
	    darkgrey: 11119017,
	    darkkhaki: 12433259,
	    darkmagenta: 9109643,
	    darkolivegreen: 5597999,
	    darkorange: 16747520,
	    darkorchid: 10040012,
	    darkred: 9109504,
	    darksalmon: 15308410,
	    darkseagreen: 9419919,
	    darkslateblue: 4734347,
	    darkslategray: 3100495,
	    darkslategrey: 3100495,
	    darkturquoise: 52945,
	    darkviolet: 9699539,
	    deeppink: 16716947,
	    deepskyblue: 49151,
	    dimgray: 6908265,
	    dimgrey: 6908265,
	    dodgerblue: 2003199,
	    firebrick: 11674146,
	    floralwhite: 16775920,
	    forestgreen: 2263842,
	    fuchsia: 16711935,
	    gainsboro: 14474460,
	    ghostwhite: 16316671,
	    gold: 16766720,
	    goldenrod: 14329120,
	    gray: 8421504,
	    green: 32768,
	    greenyellow: 11403055,
	    grey: 8421504,
	    honeydew: 15794160,
	    hotpink: 16738740,
	    indianred: 13458524,
	    indigo: 4915330,
	    ivory: 16777200,
	    khaki: 15787660,
	    lavender: 15132410,
	    lavenderblush: 16773365,
	    lawngreen: 8190976,
	    lemonchiffon: 16775885,
	    lightblue: 11393254,
	    lightcoral: 15761536,
	    lightcyan: 14745599,
	    lightgoldenrodyellow: 16448210,
	    lightgray: 13882323,
	    lightgreen: 9498256,
	    lightgrey: 13882323,
	    lightpink: 16758465,
	    lightsalmon: 16752762,
	    lightseagreen: 2142890,
	    lightskyblue: 8900346,
	    lightslategray: 7833753,
	    lightslategrey: 7833753,
	    lightsteelblue: 11584734,
	    lightyellow: 16777184,
	    lime: 65280,
	    limegreen: 3329330,
	    linen: 16445670,
	    magenta: 16711935,
	    maroon: 8388608,
	    mediumaquamarine: 6737322,
	    mediumblue: 205,
	    mediumorchid: 12211667,
	    mediumpurple: 9662683,
	    mediumseagreen: 3978097,
	    mediumslateblue: 8087790,
	    mediumspringgreen: 64154,
	    mediumturquoise: 4772300,
	    mediumvioletred: 13047173,
	    midnightblue: 1644912,
	    mintcream: 16121850,
	    mistyrose: 16770273,
	    moccasin: 16770229,
	    navajowhite: 16768685,
	    navy: 128,
	    oldlace: 16643558,
	    olive: 8421376,
	    olivedrab: 7048739,
	    orange: 16753920,
	    orangered: 16729344,
	    orchid: 14315734,
	    palegoldenrod: 15657130,
	    palegreen: 10025880,
	    paleturquoise: 11529966,
	    palevioletred: 14381203,
	    papayawhip: 16773077,
	    peachpuff: 16767673,
	    peru: 13468991,
	    pink: 16761035,
	    plum: 14524637,
	    powderblue: 11591910,
	    purple: 8388736,
	    rebeccapurple: 6697881,
	    red: 16711680,
	    rosybrown: 12357519,
	    royalblue: 4286945,
	    saddlebrown: 9127187,
	    salmon: 16416882,
	    sandybrown: 16032864,
	    seagreen: 3050327,
	    seashell: 16774638,
	    sienna: 10506797,
	    silver: 12632256,
	    skyblue: 8900331,
	    slateblue: 6970061,
	    slategray: 7372944,
	    slategrey: 7372944,
	    snow: 16775930,
	    springgreen: 65407,
	    steelblue: 4620980,
	    tan: 13808780,
	    teal: 32896,
	    thistle: 14204888,
	    tomato: 16737095,
	    turquoise: 4251856,
	    violet: 15631086,
	    wheat: 16113331,
	    white: 16777215,
	    whitesmoke: 16119285,
	    yellow: 16776960,
	    yellowgreen: 10145074
	  });
	  d3_rgb_names.forEach(function(key, value) {
	    d3_rgb_names.set(key, d3_rgbNumber(value));
	  });
	  function d3_functor(v) {
	    return typeof v === "function" ? v : function() {
	      return v;
	    };
	  }
	  d3.functor = d3_functor;
	  d3.xhr = d3_xhrType(d3_identity);
	  function d3_xhrType(response) {
	    return function(url, mimeType, callback) {
	      if (arguments.length === 2 && typeof mimeType === "function") callback = mimeType, 
	      mimeType = null;
	      return d3_xhr(url, mimeType, response, callback);
	    };
	  }
	  function d3_xhr(url, mimeType, response, callback) {
	    var xhr = {}, dispatch = d3.dispatch("beforesend", "progress", "load", "error"), headers = {}, request = new XMLHttpRequest(), responseType = null;
	    if (this.XDomainRequest && !("withCredentials" in request) && /^(http(s)?:)?\/\//.test(url)) request = new XDomainRequest();
	    "onload" in request ? request.onload = request.onerror = respond : request.onreadystatechange = function() {
	      request.readyState > 3 && respond();
	    };
	    function respond() {
	      var status = request.status, result;
	      if (!status && d3_xhrHasResponse(request) || status >= 200 && status < 300 || status === 304) {
	        try {
	          result = response.call(xhr, request);
	        } catch (e) {
	          dispatch.error.call(xhr, e);
	          return;
	        }
	        dispatch.load.call(xhr, result);
	      } else {
	        dispatch.error.call(xhr, request);
	      }
	    }
	    request.onprogress = function(event) {
	      var o = d3.event;
	      d3.event = event;
	      try {
	        dispatch.progress.call(xhr, request);
	      } finally {
	        d3.event = o;
	      }
	    };
	    xhr.header = function(name, value) {
	      name = (name + "").toLowerCase();
	      if (arguments.length < 2) return headers[name];
	      if (value == null) delete headers[name]; else headers[name] = value + "";
	      return xhr;
	    };
	    xhr.mimeType = function(value) {
	      if (!arguments.length) return mimeType;
	      mimeType = value == null ? null : value + "";
	      return xhr;
	    };
	    xhr.responseType = function(value) {
	      if (!arguments.length) return responseType;
	      responseType = value;
	      return xhr;
	    };
	    xhr.response = function(value) {
	      response = value;
	      return xhr;
	    };
	    [ "get", "post" ].forEach(function(method) {
	      xhr[method] = function() {
	        return xhr.send.apply(xhr, [ method ].concat(d3_array(arguments)));
	      };
	    });
	    xhr.send = function(method, data, callback) {
	      if (arguments.length === 2 && typeof data === "function") callback = data, data = null;
	      request.open(method, url, true);
	      if (mimeType != null && !("accept" in headers)) headers["accept"] = mimeType + ",*/*";
	      if (request.setRequestHeader) for (var name in headers) request.setRequestHeader(name, headers[name]);
	      if (mimeType != null && request.overrideMimeType) request.overrideMimeType(mimeType);
	      if (responseType != null) request.responseType = responseType;
	      if (callback != null) xhr.on("error", callback).on("load", function(request) {
	        callback(null, request);
	      });
	      dispatch.beforesend.call(xhr, request);
	      request.send(data == null ? null : data);
	      return xhr;
	    };
	    xhr.abort = function() {
	      request.abort();
	      return xhr;
	    };
	    d3.rebind(xhr, dispatch, "on");
	    return callback == null ? xhr : xhr.get(d3_xhr_fixCallback(callback));
	  }
	  function d3_xhr_fixCallback(callback) {
	    return callback.length === 1 ? function(error, request) {
	      callback(error == null ? request : null);
	    } : callback;
	  }
	  function d3_xhrHasResponse(request) {
	    var type = request.responseType;
	    return type && type !== "text" ? request.response : request.responseText;
	  }
	  d3.dsv = function(delimiter, mimeType) {
	    var reFormat = new RegExp('["' + delimiter + "\n]"), delimiterCode = delimiter.charCodeAt(0);
	    function dsv(url, row, callback) {
	      if (arguments.length < 3) callback = row, row = null;
	      var xhr = d3_xhr(url, mimeType, row == null ? response : typedResponse(row), callback);
	      xhr.row = function(_) {
	        return arguments.length ? xhr.response((row = _) == null ? response : typedResponse(_)) : row;
	      };
	      return xhr;
	    }
	    function response(request) {
	      return dsv.parse(request.responseText);
	    }
	    function typedResponse(f) {
	      return function(request) {
	        return dsv.parse(request.responseText, f);
	      };
	    }
	    dsv.parse = function(text, f) {
	      var o;
	      return dsv.parseRows(text, function(row, i) {
	        if (o) return o(row, i - 1);
	        var a = new Function("d", "return {" + row.map(function(name, i) {
	          return JSON.stringify(name) + ": d[" + i + "]";
	        }).join(",") + "}");
	        o = f ? function(row, i) {
	          return f(a(row), i);
	        } : a;
	      });
	    };
	    dsv.parseRows = function(text, f) {
	      var EOL = {}, EOF = {}, rows = [], N = text.length, I = 0, n = 0, t, eol;
	      function token() {
	        if (I >= N) return EOF;
	        if (eol) return eol = false, EOL;
	        var j = I;
	        if (text.charCodeAt(j) === 34) {
	          var i = j;
	          while (i++ < N) {
	            if (text.charCodeAt(i) === 34) {
	              if (text.charCodeAt(i + 1) !== 34) break;
	              ++i;
	            }
	          }
	          I = i + 2;
	          var c = text.charCodeAt(i + 1);
	          if (c === 13) {
	            eol = true;
	            if (text.charCodeAt(i + 2) === 10) ++I;
	          } else if (c === 10) {
	            eol = true;
	          }
	          return text.slice(j + 1, i).replace(/""/g, '"');
	        }
	        while (I < N) {
	          var c = text.charCodeAt(I++), k = 1;
	          if (c === 10) eol = true; else if (c === 13) {
	            eol = true;
	            if (text.charCodeAt(I) === 10) ++I, ++k;
	          } else if (c !== delimiterCode) continue;
	          return text.slice(j, I - k);
	        }
	        return text.slice(j);
	      }
	      while ((t = token()) !== EOF) {
	        var a = [];
	        while (t !== EOL && t !== EOF) {
	          a.push(t);
	          t = token();
	        }
	        if (f && (a = f(a, n++)) == null) continue;
	        rows.push(a);
	      }
	      return rows;
	    };
	    dsv.format = function(rows) {
	      if (Array.isArray(rows[0])) return dsv.formatRows(rows);
	      var fieldSet = new d3_Set(), fields = [];
	      rows.forEach(function(row) {
	        for (var field in row) {
	          if (!fieldSet.has(field)) {
	            fields.push(fieldSet.add(field));
	          }
	        }
	      });
	      return [ fields.map(formatValue).join(delimiter) ].concat(rows.map(function(row) {
	        return fields.map(function(field) {
	          return formatValue(row[field]);
	        }).join(delimiter);
	      })).join("\n");
	    };
	    dsv.formatRows = function(rows) {
	      return rows.map(formatRow).join("\n");
	    };
	    function formatRow(row) {
	      return row.map(formatValue).join(delimiter);
	    }
	    function formatValue(text) {
	      return reFormat.test(text) ? '"' + text.replace(/\"/g, '""') + '"' : text;
	    }
	    return dsv;
	  };
	  d3.csv = d3.dsv(",", "text/csv");
	  d3.tsv = d3.dsv("	", "text/tab-separated-values");
	  var d3_timer_queueHead, d3_timer_queueTail, d3_timer_interval, d3_timer_timeout, d3_timer_frame = this[d3_vendorSymbol(this, "requestAnimationFrame")] || function(callback) {
	    setTimeout(callback, 17);
	  };
	  d3.timer = function() {
	    d3_timer.apply(this, arguments);
	  };
	  function d3_timer(callback, delay, then) {
	    var n = arguments.length;
	    if (n < 2) delay = 0;
	    if (n < 3) then = Date.now();
	    var time = then + delay, timer = {
	      c: callback,
	      t: time,
	      n: null
	    };
	    if (d3_timer_queueTail) d3_timer_queueTail.n = timer; else d3_timer_queueHead = timer;
	    d3_timer_queueTail = timer;
	    if (!d3_timer_interval) {
	      d3_timer_timeout = clearTimeout(d3_timer_timeout);
	      d3_timer_interval = 1;
	      d3_timer_frame(d3_timer_step);
	    }
	    return timer;
	  }
	  function d3_timer_step() {
	    var now = d3_timer_mark(), delay = d3_timer_sweep() - now;
	    if (delay > 24) {
	      if (isFinite(delay)) {
	        clearTimeout(d3_timer_timeout);
	        d3_timer_timeout = setTimeout(d3_timer_step, delay);
	      }
	      d3_timer_interval = 0;
	    } else {
	      d3_timer_interval = 1;
	      d3_timer_frame(d3_timer_step);
	    }
	  }
	  d3.timer.flush = function() {
	    d3_timer_mark();
	    d3_timer_sweep();
	  };
	  function d3_timer_mark() {
	    var now = Date.now(), timer = d3_timer_queueHead;
	    while (timer) {
	      if (now >= timer.t && timer.c(now - timer.t)) timer.c = null;
	      timer = timer.n;
	    }
	    return now;
	  }
	  function d3_timer_sweep() {
	    var t0, t1 = d3_timer_queueHead, time = Infinity;
	    while (t1) {
	      if (t1.c) {
	        if (t1.t < time) time = t1.t;
	        t1 = (t0 = t1).n;
	      } else {
	        t1 = t0 ? t0.n = t1.n : d3_timer_queueHead = t1.n;
	      }
	    }
	    d3_timer_queueTail = t0;
	    return time;
	  }
	  function d3_format_precision(x, p) {
	    return p - (x ? Math.ceil(Math.log(x) / Math.LN10) : 1);
	  }
	  d3.round = function(x, n) {
	    return n ? Math.round(x * (n = Math.pow(10, n))) / n : Math.round(x);
	  };
	  var d3_formatPrefixes = [ "y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y" ].map(d3_formatPrefix);
	  d3.formatPrefix = function(value, precision) {
	    var i = 0;
	    if (value = +value) {
	      if (value < 0) value *= -1;
	      if (precision) value = d3.round(value, d3_format_precision(value, precision));
	      i = 1 + Math.floor(1e-12 + Math.log(value) / Math.LN10);
	      i = Math.max(-24, Math.min(24, Math.floor((i - 1) / 3) * 3));
	    }
	    return d3_formatPrefixes[8 + i / 3];
	  };
	  function d3_formatPrefix(d, i) {
	    var k = Math.pow(10, abs(8 - i) * 3);
	    return {
	      scale: i > 8 ? function(d) {
	        return d / k;
	      } : function(d) {
	        return d * k;
	      },
	      symbol: d
	    };
	  }
	  function d3_locale_numberFormat(locale) {
	    var locale_decimal = locale.decimal, locale_thousands = locale.thousands, locale_grouping = locale.grouping, locale_currency = locale.currency, formatGroup = locale_grouping && locale_thousands ? function(value, width) {
	      var i = value.length, t = [], j = 0, g = locale_grouping[0], length = 0;
	      while (i > 0 && g > 0) {
	        if (length + g + 1 > width) g = Math.max(1, width - length);
	        t.push(value.substring(i -= g, i + g));
	        if ((length += g + 1) > width) break;
	        g = locale_grouping[j = (j + 1) % locale_grouping.length];
	      }
	      return t.reverse().join(locale_thousands);
	    } : d3_identity;
	    return function(specifier) {
	      var match = d3_format_re.exec(specifier), fill = match[1] || " ", align = match[2] || ">", sign = match[3] || "-", symbol = match[4] || "", zfill = match[5], width = +match[6], comma = match[7], precision = match[8], type = match[9], scale = 1, prefix = "", suffix = "", integer = false, exponent = true;
	      if (precision) precision = +precision.substring(1);
	      if (zfill || fill === "0" && align === "=") {
	        zfill = fill = "0";
	        align = "=";
	      }
	      switch (type) {
	       case "n":
	        comma = true;
	        type = "g";
	        break;
	
	       case "%":
	        scale = 100;
	        suffix = "%";
	        type = "f";
	        break;
	
	       case "p":
	        scale = 100;
	        suffix = "%";
	        type = "r";
	        break;
	
	       case "b":
	       case "o":
	       case "x":
	       case "X":
	        if (symbol === "#") prefix = "0" + type.toLowerCase();
	
	       case "c":
	        exponent = false;
	
	       case "d":
	        integer = true;
	        precision = 0;
	        break;
	
	       case "s":
	        scale = -1;
	        type = "r";
	        break;
	      }
	      if (symbol === "$") prefix = locale_currency[0], suffix = locale_currency[1];
	      if (type == "r" && !precision) type = "g";
	      if (precision != null) {
	        if (type == "g") precision = Math.max(1, Math.min(21, precision)); else if (type == "e" || type == "f") precision = Math.max(0, Math.min(20, precision));
	      }
	      type = d3_format_types.get(type) || d3_format_typeDefault;
	      var zcomma = zfill && comma;
	      return function(value) {
	        var fullSuffix = suffix;
	        if (integer && value % 1) return "";
	        var negative = value < 0 || value === 0 && 1 / value < 0 ? (value = -value, "-") : sign === "-" ? "" : sign;
	        if (scale < 0) {
	          var unit = d3.formatPrefix(value, precision);
	          value = unit.scale(value);
	          fullSuffix = unit.symbol + suffix;
	        } else {
	          value *= scale;
	        }
	        value = type(value, precision);
	        var i = value.lastIndexOf("."), before, after;
	        if (i < 0) {
	          var j = exponent ? value.lastIndexOf("e") : -1;
	          if (j < 0) before = value, after = ""; else before = value.substring(0, j), after = value.substring(j);
	        } else {
	          before = value.substring(0, i);
	          after = locale_decimal + value.substring(i + 1);
	        }
	        if (!zfill && comma) before = formatGroup(before, Infinity);
	        var length = prefix.length + before.length + after.length + (zcomma ? 0 : negative.length), padding = length < width ? new Array(length = width - length + 1).join(fill) : "";
	        if (zcomma) before = formatGroup(padding + before, padding.length ? width - after.length : Infinity);
	        negative += prefix;
	        value = before + after;
	        return (align === "<" ? negative + value + padding : align === ">" ? padding + negative + value : align === "^" ? padding.substring(0, length >>= 1) + negative + value + padding.substring(length) : negative + (zcomma ? value : padding + value)) + fullSuffix;
	      };
	    };
	  }
	  var d3_format_re = /(?:([^{])?([<>=^]))?([+\- ])?([$#])?(0)?(\d+)?(,)?(\.-?\d+)?([a-z%])?/i;
	  var d3_format_types = d3.map({
	    b: function(x) {
	      return x.toString(2);
	    },
	    c: function(x) {
	      return String.fromCharCode(x);
	    },
	    o: function(x) {
	      return x.toString(8);
	    },
	    x: function(x) {
	      return x.toString(16);
	    },
	    X: function(x) {
	      return x.toString(16).toUpperCase();
	    },
	    g: function(x, p) {
	      return x.toPrecision(p);
	    },
	    e: function(x, p) {
	      return x.toExponential(p);
	    },
	    f: function(x, p) {
	      return x.toFixed(p);
	    },
	    r: function(x, p) {
	      return (x = d3.round(x, d3_format_precision(x, p))).toFixed(Math.max(0, Math.min(20, d3_format_precision(x * (1 + 1e-15), p))));
	    }
	  });
	  function d3_format_typeDefault(x) {
	    return x + "";
	  }
	  var d3_time = d3.time = {}, d3_date = Date;
	  function d3_date_utc() {
	    this._ = new Date(arguments.length > 1 ? Date.UTC.apply(this, arguments) : arguments[0]);
	  }
	  d3_date_utc.prototype = {
	    getDate: function() {
	      return this._.getUTCDate();
	    },
	    getDay: function() {
	      return this._.getUTCDay();
	    },
	    getFullYear: function() {
	      return this._.getUTCFullYear();
	    },
	    getHours: function() {
	      return this._.getUTCHours();
	    },
	    getMilliseconds: function() {
	      return this._.getUTCMilliseconds();
	    },
	    getMinutes: function() {
	      return this._.getUTCMinutes();
	    },
	    getMonth: function() {
	      return this._.getUTCMonth();
	    },
	    getSeconds: function() {
	      return this._.getUTCSeconds();
	    },
	    getTime: function() {
	      return this._.getTime();
	    },
	    getTimezoneOffset: function() {
	      return 0;
	    },
	    valueOf: function() {
	      return this._.valueOf();
	    },
	    setDate: function() {
	      d3_time_prototype.setUTCDate.apply(this._, arguments);
	    },
	    setDay: function() {
	      d3_time_prototype.setUTCDay.apply(this._, arguments);
	    },
	    setFullYear: function() {
	      d3_time_prototype.setUTCFullYear.apply(this._, arguments);
	    },
	    setHours: function() {
	      d3_time_prototype.setUTCHours.apply(this._, arguments);
	    },
	    setMilliseconds: function() {
	      d3_time_prototype.setUTCMilliseconds.apply(this._, arguments);
	    },
	    setMinutes: function() {
	      d3_time_prototype.setUTCMinutes.apply(this._, arguments);
	    },
	    setMonth: function() {
	      d3_time_prototype.setUTCMonth.apply(this._, arguments);
	    },
	    setSeconds: function() {
	      d3_time_prototype.setUTCSeconds.apply(this._, arguments);
	    },
	    setTime: function() {
	      d3_time_prototype.setTime.apply(this._, arguments);
	    }
	  };
	  var d3_time_prototype = Date.prototype;
	  function d3_time_interval(local, step, number) {
	    function round(date) {
	      var d0 = local(date), d1 = offset(d0, 1);
	      return date - d0 < d1 - date ? d0 : d1;
	    }
	    function ceil(date) {
	      step(date = local(new d3_date(date - 1)), 1);
	      return date;
	    }
	    function offset(date, k) {
	      step(date = new d3_date(+date), k);
	      return date;
	    }
	    function range(t0, t1, dt) {
	      var time = ceil(t0), times = [];
	      if (dt > 1) {
	        while (time < t1) {
	          if (!(number(time) % dt)) times.push(new Date(+time));
	          step(time, 1);
	        }
	      } else {
	        while (time < t1) times.push(new Date(+time)), step(time, 1);
	      }
	      return times;
	    }
	    function range_utc(t0, t1, dt) {
	      try {
	        d3_date = d3_date_utc;
	        var utc = new d3_date_utc();
	        utc._ = t0;
	        return range(utc, t1, dt);
	      } finally {
	        d3_date = Date;
	      }
	    }
	    local.floor = local;
	    local.round = round;
	    local.ceil = ceil;
	    local.offset = offset;
	    local.range = range;
	    var utc = local.utc = d3_time_interval_utc(local);
	    utc.floor = utc;
	    utc.round = d3_time_interval_utc(round);
	    utc.ceil = d3_time_interval_utc(ceil);
	    utc.offset = d3_time_interval_utc(offset);
	    utc.range = range_utc;
	    return local;
	  }
	  function d3_time_interval_utc(method) {
	    return function(date, k) {
	      try {
	        d3_date = d3_date_utc;
	        var utc = new d3_date_utc();
	        utc._ = date;
	        return method(utc, k)._;
	      } finally {
	        d3_date = Date;
	      }
	    };
	  }
	  d3_time.year = d3_time_interval(function(date) {
	    date = d3_time.day(date);
	    date.setMonth(0, 1);
	    return date;
	  }, function(date, offset) {
	    date.setFullYear(date.getFullYear() + offset);
	  }, function(date) {
	    return date.getFullYear();
	  });
	  d3_time.years = d3_time.year.range;
	  d3_time.years.utc = d3_time.year.utc.range;
	  d3_time.day = d3_time_interval(function(date) {
	    var day = new d3_date(2e3, 0);
	    day.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
	    return day;
	  }, function(date, offset) {
	    date.setDate(date.getDate() + offset);
	  }, function(date) {
	    return date.getDate() - 1;
	  });
	  d3_time.days = d3_time.day.range;
	  d3_time.days.utc = d3_time.day.utc.range;
	  d3_time.dayOfYear = function(date) {
	    var year = d3_time.year(date);
	    return Math.floor((date - year - (date.getTimezoneOffset() - year.getTimezoneOffset()) * 6e4) / 864e5);
	  };
	  [ "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday" ].forEach(function(day, i) {
	    i = 7 - i;
	    var interval = d3_time[day] = d3_time_interval(function(date) {
	      (date = d3_time.day(date)).setDate(date.getDate() - (date.getDay() + i) % 7);
	      return date;
	    }, function(date, offset) {
	      date.setDate(date.getDate() + Math.floor(offset) * 7);
	    }, function(date) {
	      var day = d3_time.year(date).getDay();
	      return Math.floor((d3_time.dayOfYear(date) + (day + i) % 7) / 7) - (day !== i);
	    });
	    d3_time[day + "s"] = interval.range;
	    d3_time[day + "s"].utc = interval.utc.range;
	    d3_time[day + "OfYear"] = function(date) {
	      var day = d3_time.year(date).getDay();
	      return Math.floor((d3_time.dayOfYear(date) + (day + i) % 7) / 7);
	    };
	  });
	  d3_time.week = d3_time.sunday;
	  d3_time.weeks = d3_time.sunday.range;
	  d3_time.weeks.utc = d3_time.sunday.utc.range;
	  d3_time.weekOfYear = d3_time.sundayOfYear;
	  function d3_locale_timeFormat(locale) {
	    var locale_dateTime = locale.dateTime, locale_date = locale.date, locale_time = locale.time, locale_periods = locale.periods, locale_days = locale.days, locale_shortDays = locale.shortDays, locale_months = locale.months, locale_shortMonths = locale.shortMonths;
	    function d3_time_format(template) {
	      var n = template.length;
	      function format(date) {
	        var string = [], i = -1, j = 0, c, p, f;
	        while (++i < n) {
	          if (template.charCodeAt(i) === 37) {
	            string.push(template.slice(j, i));
	            if ((p = d3_time_formatPads[c = template.charAt(++i)]) != null) c = template.charAt(++i);
	            if (f = d3_time_formats[c]) c = f(date, p == null ? c === "e" ? " " : "0" : p);
	            string.push(c);
	            j = i + 1;
	          }
	        }
	        string.push(template.slice(j, i));
	        return string.join("");
	      }
	      format.parse = function(string) {
	        var d = {
	          y: 1900,
	          m: 0,
	          d: 1,
	          H: 0,
	          M: 0,
	          S: 0,
	          L: 0,
	          Z: null
	        }, i = d3_time_parse(d, template, string, 0);
	        if (i != string.length) return null;
	        if ("p" in d) d.H = d.H % 12 + d.p * 12;
	        var localZ = d.Z != null && d3_date !== d3_date_utc, date = new (localZ ? d3_date_utc : d3_date)();
	        if ("j" in d) date.setFullYear(d.y, 0, d.j); else if ("W" in d || "U" in d) {
	          if (!("w" in d)) d.w = "W" in d ? 1 : 0;
	          date.setFullYear(d.y, 0, 1);
	          date.setFullYear(d.y, 0, "W" in d ? (d.w + 6) % 7 + d.W * 7 - (date.getDay() + 5) % 7 : d.w + d.U * 7 - (date.getDay() + 6) % 7);
	        } else date.setFullYear(d.y, d.m, d.d);
	        date.setHours(d.H + (d.Z / 100 | 0), d.M + d.Z % 100, d.S, d.L);
	        return localZ ? date._ : date;
	      };
	      format.toString = function() {
	        return template;
	      };
	      return format;
	    }
	    function d3_time_parse(date, template, string, j) {
	      var c, p, t, i = 0, n = template.length, m = string.length;
	      while (i < n) {
	        if (j >= m) return -1;
	        c = template.charCodeAt(i++);
	        if (c === 37) {
	          t = template.charAt(i++);
	          p = d3_time_parsers[t in d3_time_formatPads ? template.charAt(i++) : t];
	          if (!p || (j = p(date, string, j)) < 0) return -1;
	        } else if (c != string.charCodeAt(j++)) {
	          return -1;
	        }
	      }
	      return j;
	    }
	    d3_time_format.utc = function(template) {
	      var local = d3_time_format(template);
	      function format(date) {
	        try {
	          d3_date = d3_date_utc;
	          var utc = new d3_date();
	          utc._ = date;
	          return local(utc);
	        } finally {
	          d3_date = Date;
	        }
	      }
	      format.parse = function(string) {
	        try {
	          d3_date = d3_date_utc;
	          var date = local.parse(string);
	          return date && date._;
	        } finally {
	          d3_date = Date;
	        }
	      };
	      format.toString = local.toString;
	      return format;
	    };
	    d3_time_format.multi = d3_time_format.utc.multi = d3_time_formatMulti;
	    var d3_time_periodLookup = d3.map(), d3_time_dayRe = d3_time_formatRe(locale_days), d3_time_dayLookup = d3_time_formatLookup(locale_days), d3_time_dayAbbrevRe = d3_time_formatRe(locale_shortDays), d3_time_dayAbbrevLookup = d3_time_formatLookup(locale_shortDays), d3_time_monthRe = d3_time_formatRe(locale_months), d3_time_monthLookup = d3_time_formatLookup(locale_months), d3_time_monthAbbrevRe = d3_time_formatRe(locale_shortMonths), d3_time_monthAbbrevLookup = d3_time_formatLookup(locale_shortMonths);
	    locale_periods.forEach(function(p, i) {
	      d3_time_periodLookup.set(p.toLowerCase(), i);
	    });
	    var d3_time_formats = {
	      a: function(d) {
	        return locale_shortDays[d.getDay()];
	      },
	      A: function(d) {
	        return locale_days[d.getDay()];
	      },
	      b: function(d) {
	        return locale_shortMonths[d.getMonth()];
	      },
	      B: function(d) {
	        return locale_months[d.getMonth()];
	      },
	      c: d3_time_format(locale_dateTime),
	      d: function(d, p) {
	        return d3_time_formatPad(d.getDate(), p, 2);
	      },
	      e: function(d, p) {
	        return d3_time_formatPad(d.getDate(), p, 2);
	      },
	      H: function(d, p) {
	        return d3_time_formatPad(d.getHours(), p, 2);
	      },
	      I: function(d, p) {
	        return d3_time_formatPad(d.getHours() % 12 || 12, p, 2);
	      },
	      j: function(d, p) {
	        return d3_time_formatPad(1 + d3_time.dayOfYear(d), p, 3);
	      },
	      L: function(d, p) {
	        return d3_time_formatPad(d.getMilliseconds(), p, 3);
	      },
	      m: function(d, p) {
	        return d3_time_formatPad(d.getMonth() + 1, p, 2);
	      },
	      M: function(d, p) {
	        return d3_time_formatPad(d.getMinutes(), p, 2);
	      },
	      p: function(d) {
	        return locale_periods[+(d.getHours() >= 12)];
	      },
	      S: function(d, p) {
	        return d3_time_formatPad(d.getSeconds(), p, 2);
	      },
	      U: function(d, p) {
	        return d3_time_formatPad(d3_time.sundayOfYear(d), p, 2);
	      },
	      w: function(d) {
	        return d.getDay();
	      },
	      W: function(d, p) {
	        return d3_time_formatPad(d3_time.mondayOfYear(d), p, 2);
	      },
	      x: d3_time_format(locale_date),
	      X: d3_time_format(locale_time),
	      y: function(d, p) {
	        return d3_time_formatPad(d.getFullYear() % 100, p, 2);
	      },
	      Y: function(d, p) {
	        return d3_time_formatPad(d.getFullYear() % 1e4, p, 4);
	      },
	      Z: d3_time_zone,
	      "%": function() {
	        return "%";
	      }
	    };
	    var d3_time_parsers = {
	      a: d3_time_parseWeekdayAbbrev,
	      A: d3_time_parseWeekday,
	      b: d3_time_parseMonthAbbrev,
	      B: d3_time_parseMonth,
	      c: d3_time_parseLocaleFull,
	      d: d3_time_parseDay,
	      e: d3_time_parseDay,
	      H: d3_time_parseHour24,
	      I: d3_time_parseHour24,
	      j: d3_time_parseDayOfYear,
	      L: d3_time_parseMilliseconds,
	      m: d3_time_parseMonthNumber,
	      M: d3_time_parseMinutes,
	      p: d3_time_parseAmPm,
	      S: d3_time_parseSeconds,
	      U: d3_time_parseWeekNumberSunday,
	      w: d3_time_parseWeekdayNumber,
	      W: d3_time_parseWeekNumberMonday,
	      x: d3_time_parseLocaleDate,
	      X: d3_time_parseLocaleTime,
	      y: d3_time_parseYear,
	      Y: d3_time_parseFullYear,
	      Z: d3_time_parseZone,
	      "%": d3_time_parseLiteralPercent
	    };
	    function d3_time_parseWeekdayAbbrev(date, string, i) {
	      d3_time_dayAbbrevRe.lastIndex = 0;
	      var n = d3_time_dayAbbrevRe.exec(string.slice(i));
	      return n ? (date.w = d3_time_dayAbbrevLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
	    }
	    function d3_time_parseWeekday(date, string, i) {
	      d3_time_dayRe.lastIndex = 0;
	      var n = d3_time_dayRe.exec(string.slice(i));
	      return n ? (date.w = d3_time_dayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
	    }
	    function d3_time_parseMonthAbbrev(date, string, i) {
	      d3_time_monthAbbrevRe.lastIndex = 0;
	      var n = d3_time_monthAbbrevRe.exec(string.slice(i));
	      return n ? (date.m = d3_time_monthAbbrevLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
	    }
	    function d3_time_parseMonth(date, string, i) {
	      d3_time_monthRe.lastIndex = 0;
	      var n = d3_time_monthRe.exec(string.slice(i));
	      return n ? (date.m = d3_time_monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
	    }
	    function d3_time_parseLocaleFull(date, string, i) {
	      return d3_time_parse(date, d3_time_formats.c.toString(), string, i);
	    }
	    function d3_time_parseLocaleDate(date, string, i) {
	      return d3_time_parse(date, d3_time_formats.x.toString(), string, i);
	    }
	    function d3_time_parseLocaleTime(date, string, i) {
	      return d3_time_parse(date, d3_time_formats.X.toString(), string, i);
	    }
	    function d3_time_parseAmPm(date, string, i) {
	      var n = d3_time_periodLookup.get(string.slice(i, i += 2).toLowerCase());
	      return n == null ? -1 : (date.p = n, i);
	    }
	    return d3_time_format;
	  }
	  var d3_time_formatPads = {
	    "-": "",
	    _: " ",
	    "0": "0"
	  }, d3_time_numberRe = /^\s*\d+/, d3_time_percentRe = /^%/;
	  function d3_time_formatPad(value, fill, width) {
	    var sign = value < 0 ? "-" : "", string = (sign ? -value : value) + "", length = string.length;
	    return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
	  }
	  function d3_time_formatRe(names) {
	    return new RegExp("^(?:" + names.map(d3.requote).join("|") + ")", "i");
	  }
	  function d3_time_formatLookup(names) {
	    var map = new d3_Map(), i = -1, n = names.length;
	    while (++i < n) map.set(names[i].toLowerCase(), i);
	    return map;
	  }
	  function d3_time_parseWeekdayNumber(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 1));
	    return n ? (date.w = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseWeekNumberSunday(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i));
	    return n ? (date.U = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseWeekNumberMonday(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i));
	    return n ? (date.W = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseFullYear(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 4));
	    return n ? (date.y = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseYear(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
	    return n ? (date.y = d3_time_expandYear(+n[0]), i + n[0].length) : -1;
	  }
	  function d3_time_parseZone(date, string, i) {
	    return /^[+-]\d{4}$/.test(string = string.slice(i, i + 5)) ? (date.Z = -string, 
	    i + 5) : -1;
	  }
	  function d3_time_expandYear(d) {
	    return d + (d > 68 ? 1900 : 2e3);
	  }
	  function d3_time_parseMonthNumber(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
	    return n ? (date.m = n[0] - 1, i + n[0].length) : -1;
	  }
	  function d3_time_parseDay(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
	    return n ? (date.d = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseDayOfYear(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 3));
	    return n ? (date.j = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseHour24(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
	    return n ? (date.H = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseMinutes(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
	    return n ? (date.M = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseSeconds(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 2));
	    return n ? (date.S = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_parseMilliseconds(date, string, i) {
	    d3_time_numberRe.lastIndex = 0;
	    var n = d3_time_numberRe.exec(string.slice(i, i + 3));
	    return n ? (date.L = +n[0], i + n[0].length) : -1;
	  }
	  function d3_time_zone(d) {
	    var z = d.getTimezoneOffset(), zs = z > 0 ? "-" : "+", zh = abs(z) / 60 | 0, zm = abs(z) % 60;
	    return zs + d3_time_formatPad(zh, "0", 2) + d3_time_formatPad(zm, "0", 2);
	  }
	  function d3_time_parseLiteralPercent(date, string, i) {
	    d3_time_percentRe.lastIndex = 0;
	    var n = d3_time_percentRe.exec(string.slice(i, i + 1));
	    return n ? i + n[0].length : -1;
	  }
	  function d3_time_formatMulti(formats) {
	    var n = formats.length, i = -1;
	    while (++i < n) formats[i][0] = this(formats[i][0]);
	    return function(date) {
	      var i = 0, f = formats[i];
	      while (!f[1](date)) f = formats[++i];
	      return f[0](date);
	    };
	  }
	  d3.locale = function(locale) {
	    return {
	      numberFormat: d3_locale_numberFormat(locale),
	      timeFormat: d3_locale_timeFormat(locale)
	    };
	  };
	  var d3_locale_enUS = d3.locale({
	    decimal: ".",
	    thousands: ",",
	    grouping: [ 3 ],
	    currency: [ "$", "" ],
	    dateTime: "%a %b %e %X %Y",
	    date: "%m/%d/%Y",
	    time: "%H:%M:%S",
	    periods: [ "AM", "PM" ],
	    days: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
	    shortDays: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
	    months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
	    shortMonths: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]
	  });
	  d3.format = d3_locale_enUS.numberFormat;
	  d3.geo = {};
	  function d3_adder() {}
	  d3_adder.prototype = {
	    s: 0,
	    t: 0,
	    add: function(y) {
	      d3_adderSum(y, this.t, d3_adderTemp);
	      d3_adderSum(d3_adderTemp.s, this.s, this);
	      if (this.s) this.t += d3_adderTemp.t; else this.s = d3_adderTemp.t;
	    },
	    reset: function() {
	      this.s = this.t = 0;
	    },
	    valueOf: function() {
	      return this.s;
	    }
	  };
	  var d3_adderTemp = new d3_adder();
	  function d3_adderSum(a, b, o) {
	    var x = o.s = a + b, bv = x - a, av = x - bv;
	    o.t = a - av + (b - bv);
	  }
	  d3.geo.stream = function(object, listener) {
	    if (object && d3_geo_streamObjectType.hasOwnProperty(object.type)) {
	      d3_geo_streamObjectType[object.type](object, listener);
	    } else {
	      d3_geo_streamGeometry(object, listener);
	    }
	  };
	  function d3_geo_streamGeometry(geometry, listener) {
	    if (geometry && d3_geo_streamGeometryType.hasOwnProperty(geometry.type)) {
	      d3_geo_streamGeometryType[geometry.type](geometry, listener);
	    }
	  }
	  var d3_geo_streamObjectType = {
	    Feature: function(feature, listener) {
	      d3_geo_streamGeometry(feature.geometry, listener);
	    },
	    FeatureCollection: function(object, listener) {
	      var features = object.features, i = -1, n = features.length;
	      while (++i < n) d3_geo_streamGeometry(features[i].geometry, listener);
	    }
	  };
	  var d3_geo_streamGeometryType = {
	    Sphere: function(object, listener) {
	      listener.sphere();
	    },
	    Point: function(object, listener) {
	      object = object.coordinates;
	      listener.point(object[0], object[1], object[2]);
	    },
	    MultiPoint: function(object, listener) {
	      var coordinates = object.coordinates, i = -1, n = coordinates.length;
	      while (++i < n) object = coordinates[i], listener.point(object[0], object[1], object[2]);
	    },
	    LineString: function(object, listener) {
	      d3_geo_streamLine(object.coordinates, listener, 0);
	    },
	    MultiLineString: function(object, listener) {
	      var coordinates = object.coordinates, i = -1, n = coordinates.length;
	      while (++i < n) d3_geo_streamLine(coordinates[i], listener, 0);
	    },
	    Polygon: function(object, listener) {
	      d3_geo_streamPolygon(object.coordinates, listener);
	    },
	    MultiPolygon: function(object, listener) {
	      var coordinates = object.coordinates, i = -1, n = coordinates.length;
	      while (++i < n) d3_geo_streamPolygon(coordinates[i], listener);
	    },
	    GeometryCollection: function(object, listener) {
	      var geometries = object.geometries, i = -1, n = geometries.length;
	      while (++i < n) d3_geo_streamGeometry(geometries[i], listener);
	    }
	  };
	  function d3_geo_streamLine(coordinates, listener, closed) {
	    var i = -1, n = coordinates.length - closed, coordinate;
	    listener.lineStart();
	    while (++i < n) coordinate = coordinates[i], listener.point(coordinate[0], coordinate[1], coordinate[2]);
	    listener.lineEnd();
	  }
	  function d3_geo_streamPolygon(coordinates, listener) {
	    var i = -1, n = coordinates.length;
	    listener.polygonStart();
	    while (++i < n) d3_geo_streamLine(coordinates[i], listener, 1);
	    listener.polygonEnd();
	  }
	  d3.geo.area = function(object) {
	    d3_geo_areaSum = 0;
	    d3.geo.stream(object, d3_geo_area);
	    return d3_geo_areaSum;
	  };
	  var d3_geo_areaSum, d3_geo_areaRingSum = new d3_adder();
	  var d3_geo_area = {
	    sphere: function() {
	      d3_geo_areaSum += 4 * π;
	    },
	    point: d3_noop,
	    lineStart: d3_noop,
	    lineEnd: d3_noop,
	    polygonStart: function() {
	      d3_geo_areaRingSum.reset();
	      d3_geo_area.lineStart = d3_geo_areaRingStart;
	    },
	    polygonEnd: function() {
	      var area = 2 * d3_geo_areaRingSum;
	      d3_geo_areaSum += area < 0 ? 4 * π + area : area;
	      d3_geo_area.lineStart = d3_geo_area.lineEnd = d3_geo_area.point = d3_noop;
	    }
	  };
	  function d3_geo_areaRingStart() {
	    var λ00, φ00, λ0, cosφ0, sinφ0;
	    d3_geo_area.point = function(λ, φ) {
	      d3_geo_area.point = nextPoint;
	      λ0 = (λ00 = λ) * d3_radians, cosφ0 = Math.cos(φ = (φ00 = φ) * d3_radians / 2 + π / 4), 
	      sinφ0 = Math.sin(φ);
	    };
	    function nextPoint(λ, φ) {
	      λ *= d3_radians;
	      φ = φ * d3_radians / 2 + π / 4;
	      var dλ = λ - λ0, sdλ = dλ >= 0 ? 1 : -1, adλ = sdλ * dλ, cosφ = Math.cos(φ), sinφ = Math.sin(φ), k = sinφ0 * sinφ, u = cosφ0 * cosφ + k * Math.cos(adλ), v = k * sdλ * Math.sin(adλ);
	      d3_geo_areaRingSum.add(Math.atan2(v, u));
	      λ0 = λ, cosφ0 = cosφ, sinφ0 = sinφ;
	    }
	    d3_geo_area.lineEnd = function() {
	      nextPoint(λ00, φ00);
	    };
	  }
	  function d3_geo_cartesian(spherical) {
	    var λ = spherical[0], φ = spherical[1], cosφ = Math.cos(φ);
	    return [ cosφ * Math.cos(λ), cosφ * Math.sin(λ), Math.sin(φ) ];
	  }
	  function d3_geo_cartesianDot(a, b) {
	    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	  }
	  function d3_geo_cartesianCross(a, b) {
	    return [ a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0] ];
	  }
	  function d3_geo_cartesianAdd(a, b) {
	    a[0] += b[0];
	    a[1] += b[1];
	    a[2] += b[2];
	  }
	  function d3_geo_cartesianScale(vector, k) {
	    return [ vector[0] * k, vector[1] * k, vector[2] * k ];
	  }
	  function d3_geo_cartesianNormalize(d) {
	    var l = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
	    d[0] /= l;
	    d[1] /= l;
	    d[2] /= l;
	  }
	  function d3_geo_spherical(cartesian) {
	    return [ Math.atan2(cartesian[1], cartesian[0]), d3_asin(cartesian[2]) ];
	  }
	  function d3_geo_sphericalEqual(a, b) {
	    return abs(a[0] - b[0]) < ε && abs(a[1] - b[1]) < ε;
	  }
	  d3.geo.bounds = function() {
	    var λ0, φ0, λ1, φ1, λ_, λ__, φ__, p0, dλSum, ranges, range;
	    var bound = {
	      point: point,
	      lineStart: lineStart,
	      lineEnd: lineEnd,
	      polygonStart: function() {
	        bound.point = ringPoint;
	        bound.lineStart = ringStart;
	        bound.lineEnd = ringEnd;
	        dλSum = 0;
	        d3_geo_area.polygonStart();
	      },
	      polygonEnd: function() {
	        d3_geo_area.polygonEnd();
	        bound.point = point;
	        bound.lineStart = lineStart;
	        bound.lineEnd = lineEnd;
	        if (d3_geo_areaRingSum < 0) λ0 = -(λ1 = 180), φ0 = -(φ1 = 90); else if (dλSum > ε) φ1 = 90; else if (dλSum < -ε) φ0 = -90;
	        range[0] = λ0, range[1] = λ1;
	      }
	    };
	    function point(λ, φ) {
	      ranges.push(range = [ λ0 = λ, λ1 = λ ]);
	      if (φ < φ0) φ0 = φ;
	      if (φ > φ1) φ1 = φ;
	    }
	    function linePoint(λ, φ) {
	      var p = d3_geo_cartesian([ λ * d3_radians, φ * d3_radians ]);
	      if (p0) {
	        var normal = d3_geo_cartesianCross(p0, p), equatorial = [ normal[1], -normal[0], 0 ], inflection = d3_geo_cartesianCross(equatorial, normal);
	        d3_geo_cartesianNormalize(inflection);
	        inflection = d3_geo_spherical(inflection);
	        var dλ = λ - λ_, s = dλ > 0 ? 1 : -1, λi = inflection[0] * d3_degrees * s, antimeridian = abs(dλ) > 180;
	        if (antimeridian ^ (s * λ_ < λi && λi < s * λ)) {
	          var φi = inflection[1] * d3_degrees;
	          if (φi > φ1) φ1 = φi;
	        } else if (λi = (λi + 360) % 360 - 180, antimeridian ^ (s * λ_ < λi && λi < s * λ)) {
	          var φi = -inflection[1] * d3_degrees;
	          if (φi < φ0) φ0 = φi;
	        } else {
	          if (φ < φ0) φ0 = φ;
	          if (φ > φ1) φ1 = φ;
	        }
	        if (antimeridian) {
	          if (λ < λ_) {
	            if (angle(λ0, λ) > angle(λ0, λ1)) λ1 = λ;
	          } else {
	            if (angle(λ, λ1) > angle(λ0, λ1)) λ0 = λ;
	          }
	        } else {
	          if (λ1 >= λ0) {
	            if (λ < λ0) λ0 = λ;
	            if (λ > λ1) λ1 = λ;
	          } else {
	            if (λ > λ_) {
	              if (angle(λ0, λ) > angle(λ0, λ1)) λ1 = λ;
	            } else {
	              if (angle(λ, λ1) > angle(λ0, λ1)) λ0 = λ;
	            }
	          }
	        }
	      } else {
	        point(λ, φ);
	      }
	      p0 = p, λ_ = λ;
	    }
	    function lineStart() {
	      bound.point = linePoint;
	    }
	    function lineEnd() {
	      range[0] = λ0, range[1] = λ1;
	      bound.point = point;
	      p0 = null;
	    }
	    function ringPoint(λ, φ) {
	      if (p0) {
	        var dλ = λ - λ_;
	        dλSum += abs(dλ) > 180 ? dλ + (dλ > 0 ? 360 : -360) : dλ;
	      } else λ__ = λ, φ__ = φ;
	      d3_geo_area.point(λ, φ);
	      linePoint(λ, φ);
	    }
	    function ringStart() {
	      d3_geo_area.lineStart();
	    }
	    function ringEnd() {
	      ringPoint(λ__, φ__);
	      d3_geo_area.lineEnd();
	      if (abs(dλSum) > ε) λ0 = -(λ1 = 180);
	      range[0] = λ0, range[1] = λ1;
	      p0 = null;
	    }
	    function angle(λ0, λ1) {
	      return (λ1 -= λ0) < 0 ? λ1 + 360 : λ1;
	    }
	    function compareRanges(a, b) {
	      return a[0] - b[0];
	    }
	    function withinRange(x, range) {
	      return range[0] <= range[1] ? range[0] <= x && x <= range[1] : x < range[0] || range[1] < x;
	    }
	    return function(feature) {
	      φ1 = λ1 = -(λ0 = φ0 = Infinity);
	      ranges = [];
	      d3.geo.stream(feature, bound);
	      var n = ranges.length;
	      if (n) {
	        ranges.sort(compareRanges);
	        for (var i = 1, a = ranges[0], b, merged = [ a ]; i < n; ++i) {
	          b = ranges[i];
	          if (withinRange(b[0], a) || withinRange(b[1], a)) {
	            if (angle(a[0], b[1]) > angle(a[0], a[1])) a[1] = b[1];
	            if (angle(b[0], a[1]) > angle(a[0], a[1])) a[0] = b[0];
	          } else {
	            merged.push(a = b);
	          }
	        }
	        var best = -Infinity, dλ;
	        for (var n = merged.length - 1, i = 0, a = merged[n], b; i <= n; a = b, ++i) {
	          b = merged[i];
	          if ((dλ = angle(a[1], b[0])) > best) best = dλ, λ0 = b[0], λ1 = a[1];
	        }
	      }
	      ranges = range = null;
	      return λ0 === Infinity || φ0 === Infinity ? [ [ NaN, NaN ], [ NaN, NaN ] ] : [ [ λ0, φ0 ], [ λ1, φ1 ] ];
	    };
	  }();
	  d3.geo.centroid = function(object) {
	    d3_geo_centroidW0 = d3_geo_centroidW1 = d3_geo_centroidX0 = d3_geo_centroidY0 = d3_geo_centroidZ0 = d3_geo_centroidX1 = d3_geo_centroidY1 = d3_geo_centroidZ1 = d3_geo_centroidX2 = d3_geo_centroidY2 = d3_geo_centroidZ2 = 0;
	    d3.geo.stream(object, d3_geo_centroid);
	    var x = d3_geo_centroidX2, y = d3_geo_centroidY2, z = d3_geo_centroidZ2, m = x * x + y * y + z * z;
	    if (m < ε2) {
	      x = d3_geo_centroidX1, y = d3_geo_centroidY1, z = d3_geo_centroidZ1;
	      if (d3_geo_centroidW1 < ε) x = d3_geo_centroidX0, y = d3_geo_centroidY0, z = d3_geo_centroidZ0;
	      m = x * x + y * y + z * z;
	      if (m < ε2) return [ NaN, NaN ];
	    }
	    return [ Math.atan2(y, x) * d3_degrees, d3_asin(z / Math.sqrt(m)) * d3_degrees ];
	  };
	  var d3_geo_centroidW0, d3_geo_centroidW1, d3_geo_centroidX0, d3_geo_centroidY0, d3_geo_centroidZ0, d3_geo_centroidX1, d3_geo_centroidY1, d3_geo_centroidZ1, d3_geo_centroidX2, d3_geo_centroidY2, d3_geo_centroidZ2;
	  var d3_geo_centroid = {
	    sphere: d3_noop,
	    point: d3_geo_centroidPoint,
	    lineStart: d3_geo_centroidLineStart,
	    lineEnd: d3_geo_centroidLineEnd,
	    polygonStart: function() {
	      d3_geo_centroid.lineStart = d3_geo_centroidRingStart;
	    },
	    polygonEnd: function() {
	      d3_geo_centroid.lineStart = d3_geo_centroidLineStart;
	    }
	  };
	  function d3_geo_centroidPoint(λ, φ) {
	    λ *= d3_radians;
	    var cosφ = Math.cos(φ *= d3_radians);
	    d3_geo_centroidPointXYZ(cosφ * Math.cos(λ), cosφ * Math.sin(λ), Math.sin(φ));
	  }
	  function d3_geo_centroidPointXYZ(x, y, z) {
	    ++d3_geo_centroidW0;
	    d3_geo_centroidX0 += (x - d3_geo_centroidX0) / d3_geo_centroidW0;
	    d3_geo_centroidY0 += (y - d3_geo_centroidY0) / d3_geo_centroidW0;
	    d3_geo_centroidZ0 += (z - d3_geo_centroidZ0) / d3_geo_centroidW0;
	  }
	  function d3_geo_centroidLineStart() {
	    var x0, y0, z0;
	    d3_geo_centroid.point = function(λ, φ) {
	      λ *= d3_radians;
	      var cosφ = Math.cos(φ *= d3_radians);
	      x0 = cosφ * Math.cos(λ);
	      y0 = cosφ * Math.sin(λ);
	      z0 = Math.sin(φ);
	      d3_geo_centroid.point = nextPoint;
	      d3_geo_centroidPointXYZ(x0, y0, z0);
	    };
	    function nextPoint(λ, φ) {
	      λ *= d3_radians;
	      var cosφ = Math.cos(φ *= d3_radians), x = cosφ * Math.cos(λ), y = cosφ * Math.sin(λ), z = Math.sin(φ), w = Math.atan2(Math.sqrt((w = y0 * z - z0 * y) * w + (w = z0 * x - x0 * z) * w + (w = x0 * y - y0 * x) * w), x0 * x + y0 * y + z0 * z);
	      d3_geo_centroidW1 += w;
	      d3_geo_centroidX1 += w * (x0 + (x0 = x));
	      d3_geo_centroidY1 += w * (y0 + (y0 = y));
	      d3_geo_centroidZ1 += w * (z0 + (z0 = z));
	      d3_geo_centroidPointXYZ(x0, y0, z0);
	    }
	  }
	  function d3_geo_centroidLineEnd() {
	    d3_geo_centroid.point = d3_geo_centroidPoint;
	  }
	  function d3_geo_centroidRingStart() {
	    var λ00, φ00, x0, y0, z0;
	    d3_geo_centroid.point = function(λ, φ) {
	      λ00 = λ, φ00 = φ;
	      d3_geo_centroid.point = nextPoint;
	      λ *= d3_radians;
	      var cosφ = Math.cos(φ *= d3_radians);
	      x0 = cosφ * Math.cos(λ);
	      y0 = cosφ * Math.sin(λ);
	      z0 = Math.sin(φ);
	      d3_geo_centroidPointXYZ(x0, y0, z0);
	    };
	    d3_geo_centroid.lineEnd = function() {
	      nextPoint(λ00, φ00);
	      d3_geo_centroid.lineEnd = d3_geo_centroidLineEnd;
	      d3_geo_centroid.point = d3_geo_centroidPoint;
	    };
	    function nextPoint(λ, φ) {
	      λ *= d3_radians;
	      var cosφ = Math.cos(φ *= d3_radians), x = cosφ * Math.cos(λ), y = cosφ * Math.sin(λ), z = Math.sin(φ), cx = y0 * z - z0 * y, cy = z0 * x - x0 * z, cz = x0 * y - y0 * x, m = Math.sqrt(cx * cx + cy * cy + cz * cz), u = x0 * x + y0 * y + z0 * z, v = m && -d3_acos(u) / m, w = Math.atan2(m, u);
	      d3_geo_centroidX2 += v * cx;
	      d3_geo_centroidY2 += v * cy;
	      d3_geo_centroidZ2 += v * cz;
	      d3_geo_centroidW1 += w;
	      d3_geo_centroidX1 += w * (x0 + (x0 = x));
	      d3_geo_centroidY1 += w * (y0 + (y0 = y));
	      d3_geo_centroidZ1 += w * (z0 + (z0 = z));
	      d3_geo_centroidPointXYZ(x0, y0, z0);
	    }
	  }
	  function d3_geo_compose(a, b) {
	    function compose(x, y) {
	      return x = a(x, y), b(x[0], x[1]);
	    }
	    if (a.invert && b.invert) compose.invert = function(x, y) {
	      return x = b.invert(x, y), x && a.invert(x[0], x[1]);
	    };
	    return compose;
	  }
	  function d3_true() {
	    return true;
	  }
	  function d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener) {
	    var subject = [], clip = [];
	    segments.forEach(function(segment) {
	      if ((n = segment.length - 1) <= 0) return;
	      var n, p0 = segment[0], p1 = segment[n];
	      if (d3_geo_sphericalEqual(p0, p1)) {
	        listener.lineStart();
	        for (var i = 0; i < n; ++i) listener.point((p0 = segment[i])[0], p0[1]);
	        listener.lineEnd();
	        return;
	      }
	      var a = new d3_geo_clipPolygonIntersection(p0, segment, null, true), b = new d3_geo_clipPolygonIntersection(p0, null, a, false);
	      a.o = b;
	      subject.push(a);
	      clip.push(b);
	      a = new d3_geo_clipPolygonIntersection(p1, segment, null, false);
	      b = new d3_geo_clipPolygonIntersection(p1, null, a, true);
	      a.o = b;
	      subject.push(a);
	      clip.push(b);
	    });
	    clip.sort(compare);
	    d3_geo_clipPolygonLinkCircular(subject);
	    d3_geo_clipPolygonLinkCircular(clip);
	    if (!subject.length) return;
	    for (var i = 0, entry = clipStartInside, n = clip.length; i < n; ++i) {
	      clip[i].e = entry = !entry;
	    }
	    var start = subject[0], points, point;
	    while (1) {
	      var current = start, isSubject = true;
	      while (current.v) if ((current = current.n) === start) return;
	      points = current.z;
	      listener.lineStart();
	      do {
	        current.v = current.o.v = true;
	        if (current.e) {
	          if (isSubject) {
	            for (var i = 0, n = points.length; i < n; ++i) listener.point((point = points[i])[0], point[1]);
	          } else {
	            interpolate(current.x, current.n.x, 1, listener);
	          }
	          current = current.n;
	        } else {
	          if (isSubject) {
	            points = current.p.z;
	            for (var i = points.length - 1; i >= 0; --i) listener.point((point = points[i])[0], point[1]);
	          } else {
	            interpolate(current.x, current.p.x, -1, listener);
	          }
	          current = current.p;
	        }
	        current = current.o;
	        points = current.z;
	        isSubject = !isSubject;
	      } while (!current.v);
	      listener.lineEnd();
	    }
	  }
	  function d3_geo_clipPolygonLinkCircular(array) {
	    if (!(n = array.length)) return;
	    var n, i = 0, a = array[0], b;
	    while (++i < n) {
	      a.n = b = array[i];
	      b.p = a;
	      a = b;
	    }
	    a.n = b = array[0];
	    b.p = a;
	  }
	  function d3_geo_clipPolygonIntersection(point, points, other, entry) {
	    this.x = point;
	    this.z = points;
	    this.o = other;
	    this.e = entry;
	    this.v = false;
	    this.n = this.p = null;
	  }
	  function d3_geo_clip(pointVisible, clipLine, interpolate, clipStart) {
	    return function(rotate, listener) {
	      var line = clipLine(listener), rotatedClipStart = rotate.invert(clipStart[0], clipStart[1]);
	      var clip = {
	        point: point,
	        lineStart: lineStart,
	        lineEnd: lineEnd,
	        polygonStart: function() {
	          clip.point = pointRing;
	          clip.lineStart = ringStart;
	          clip.lineEnd = ringEnd;
	          segments = [];
	          polygon = [];
	        },
	        polygonEnd: function() {
	          clip.point = point;
	          clip.lineStart = lineStart;
	          clip.lineEnd = lineEnd;
	          segments = d3.merge(segments);
	          var clipStartInside = d3_geo_pointInPolygon(rotatedClipStart, polygon);
	          if (segments.length) {
	            if (!polygonStarted) listener.polygonStart(), polygonStarted = true;
	            d3_geo_clipPolygon(segments, d3_geo_clipSort, clipStartInside, interpolate, listener);
	          } else if (clipStartInside) {
	            if (!polygonStarted) listener.polygonStart(), polygonStarted = true;
	            listener.lineStart();
	            interpolate(null, null, 1, listener);
	            listener.lineEnd();
	          }
	          if (polygonStarted) listener.polygonEnd(), polygonStarted = false;
	          segments = polygon = null;
	        },
	        sphere: function() {
	          listener.polygonStart();
	          listener.lineStart();
	          interpolate(null, null, 1, listener);
	          listener.lineEnd();
	          listener.polygonEnd();
	        }
	      };
	      function point(λ, φ) {
	        var point = rotate(λ, φ);
	        if (pointVisible(λ = point[0], φ = point[1])) listener.point(λ, φ);
	      }
	      function pointLine(λ, φ) {
	        var point = rotate(λ, φ);
	        line.point(point[0], point[1]);
	      }
	      function lineStart() {
	        clip.point = pointLine;
	        line.lineStart();
	      }
	      function lineEnd() {
	        clip.point = point;
	        line.lineEnd();
	      }
	      var segments;
	      var buffer = d3_geo_clipBufferListener(), ringListener = clipLine(buffer), polygonStarted = false, polygon, ring;
	      function pointRing(λ, φ) {
	        ring.push([ λ, φ ]);
	        var point = rotate(λ, φ);
	        ringListener.point(point[0], point[1]);
	      }
	      function ringStart() {
	        ringListener.lineStart();
	        ring = [];
	      }
	      function ringEnd() {
	        pointRing(ring[0][0], ring[0][1]);
	        ringListener.lineEnd();
	        var clean = ringListener.clean(), ringSegments = buffer.buffer(), segment, n = ringSegments.length;
	        ring.pop();
	        polygon.push(ring);
	        ring = null;
	        if (!n) return;
	        if (clean & 1) {
	          segment = ringSegments[0];
	          var n = segment.length - 1, i = -1, point;
	          if (n > 0) {
	            if (!polygonStarted) listener.polygonStart(), polygonStarted = true;
	            listener.lineStart();
	            while (++i < n) listener.point((point = segment[i])[0], point[1]);
	            listener.lineEnd();
	          }
	          return;
	        }
	        if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));
	        segments.push(ringSegments.filter(d3_geo_clipSegmentLength1));
	      }
	      return clip;
	    };
	  }
	  function d3_geo_clipSegmentLength1(segment) {
	    return segment.length > 1;
	  }
	  function d3_geo_clipBufferListener() {
	    var lines = [], line;
	    return {
	      lineStart: function() {
	        lines.push(line = []);
	      },
	      point: function(λ, φ) {
	        line.push([ λ, φ ]);
	      },
	      lineEnd: d3_noop,
	      buffer: function() {
	        var buffer = lines;
	        lines = [];
	        line = null;
	        return buffer;
	      },
	      rejoin: function() {
	        if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
	      }
	    };
	  }
	  function d3_geo_clipSort(a, b) {
	    return ((a = a.x)[0] < 0 ? a[1] - halfπ - ε : halfπ - a[1]) - ((b = b.x)[0] < 0 ? b[1] - halfπ - ε : halfπ - b[1]);
	  }
	  var d3_geo_clipAntimeridian = d3_geo_clip(d3_true, d3_geo_clipAntimeridianLine, d3_geo_clipAntimeridianInterpolate, [ -π, -π / 2 ]);
	  function d3_geo_clipAntimeridianLine(listener) {
	    var λ0 = NaN, φ0 = NaN, sλ0 = NaN, clean;
	    return {
	      lineStart: function() {
	        listener.lineStart();
	        clean = 1;
	      },
	      point: function(λ1, φ1) {
	        var sλ1 = λ1 > 0 ? π : -π, dλ = abs(λ1 - λ0);
	        if (abs(dλ - π) < ε) {
	          listener.point(λ0, φ0 = (φ0 + φ1) / 2 > 0 ? halfπ : -halfπ);
	          listener.point(sλ0, φ0);
	          listener.lineEnd();
	          listener.lineStart();
	          listener.point(sλ1, φ0);
	          listener.point(λ1, φ0);
	          clean = 0;
	        } else if (sλ0 !== sλ1 && dλ >= π) {
	          if (abs(λ0 - sλ0) < ε) λ0 -= sλ0 * ε;
	          if (abs(λ1 - sλ1) < ε) λ1 -= sλ1 * ε;
	          φ0 = d3_geo_clipAntimeridianIntersect(λ0, φ0, λ1, φ1);
	          listener.point(sλ0, φ0);
	          listener.lineEnd();
	          listener.lineStart();
	          listener.point(sλ1, φ0);
	          clean = 0;
	        }
	        listener.point(λ0 = λ1, φ0 = φ1);
	        sλ0 = sλ1;
	      },
	      lineEnd: function() {
	        listener.lineEnd();
	        λ0 = φ0 = NaN;
	      },
	      clean: function() {
	        return 2 - clean;
	      }
	    };
	  }
	  function d3_geo_clipAntimeridianIntersect(λ0, φ0, λ1, φ1) {
	    var cosφ0, cosφ1, sinλ0_λ1 = Math.sin(λ0 - λ1);
	    return abs(sinλ0_λ1) > ε ? Math.atan((Math.sin(φ0) * (cosφ1 = Math.cos(φ1)) * Math.sin(λ1) - Math.sin(φ1) * (cosφ0 = Math.cos(φ0)) * Math.sin(λ0)) / (cosφ0 * cosφ1 * sinλ0_λ1)) : (φ0 + φ1) / 2;
	  }
	  function d3_geo_clipAntimeridianInterpolate(from, to, direction, listener) {
	    var φ;
	    if (from == null) {
	      φ = direction * halfπ;
	      listener.point(-π, φ);
	      listener.point(0, φ);
	      listener.point(π, φ);
	      listener.point(π, 0);
	      listener.point(π, -φ);
	      listener.point(0, -φ);
	      listener.point(-π, -φ);
	      listener.point(-π, 0);
	      listener.point(-π, φ);
	    } else if (abs(from[0] - to[0]) > ε) {
	      var s = from[0] < to[0] ? π : -π;
	      φ = direction * s / 2;
	      listener.point(-s, φ);
	      listener.point(0, φ);
	      listener.point(s, φ);
	    } else {
	      listener.point(to[0], to[1]);
	    }
	  }
	  function d3_geo_pointInPolygon(point, polygon) {
	    var meridian = point[0], parallel = point[1], meridianNormal = [ Math.sin(meridian), -Math.cos(meridian), 0 ], polarAngle = 0, winding = 0;
	    d3_geo_areaRingSum.reset();
	    for (var i = 0, n = polygon.length; i < n; ++i) {
	      var ring = polygon[i], m = ring.length;
	      if (!m) continue;
	      var point0 = ring[0], λ0 = point0[0], φ0 = point0[1] / 2 + π / 4, sinφ0 = Math.sin(φ0), cosφ0 = Math.cos(φ0), j = 1;
	      while (true) {
	        if (j === m) j = 0;
	        point = ring[j];
	        var λ = point[0], φ = point[1] / 2 + π / 4, sinφ = Math.sin(φ), cosφ = Math.cos(φ), dλ = λ - λ0, sdλ = dλ >= 0 ? 1 : -1, adλ = sdλ * dλ, antimeridian = adλ > π, k = sinφ0 * sinφ;
	        d3_geo_areaRingSum.add(Math.atan2(k * sdλ * Math.sin(adλ), cosφ0 * cosφ + k * Math.cos(adλ)));
	        polarAngle += antimeridian ? dλ + sdλ * τ : dλ;
	        if (antimeridian ^ λ0 >= meridian ^ λ >= meridian) {
	          var arc = d3_geo_cartesianCross(d3_geo_cartesian(point0), d3_geo_cartesian(point));
	          d3_geo_cartesianNormalize(arc);
	          var intersection = d3_geo_cartesianCross(meridianNormal, arc);
	          d3_geo_cartesianNormalize(intersection);
	          var φarc = (antimeridian ^ dλ >= 0 ? -1 : 1) * d3_asin(intersection[2]);
	          if (parallel > φarc || parallel === φarc && (arc[0] || arc[1])) {
	            winding += antimeridian ^ dλ >= 0 ? 1 : -1;
	          }
	        }
	        if (!j++) break;
	        λ0 = λ, sinφ0 = sinφ, cosφ0 = cosφ, point0 = point;
	      }
	    }
	    return (polarAngle < -ε || polarAngle < ε && d3_geo_areaRingSum < 0) ^ winding & 1;
	  }
	  function d3_geo_clipCircle(radius) {
	    var cr = Math.cos(radius), smallRadius = cr > 0, notHemisphere = abs(cr) > ε, interpolate = d3_geo_circleInterpolate(radius, 6 * d3_radians);
	    return d3_geo_clip(visible, clipLine, interpolate, smallRadius ? [ 0, -radius ] : [ -π, radius - π ]);
	    function visible(λ, φ) {
	      return Math.cos(λ) * Math.cos(φ) > cr;
	    }
	    function clipLine(listener) {
	      var point0, c0, v0, v00, clean;
	      return {
	        lineStart: function() {
	          v00 = v0 = false;
	          clean = 1;
	        },
	        point: function(λ, φ) {
	          var point1 = [ λ, φ ], point2, v = visible(λ, φ), c = smallRadius ? v ? 0 : code(λ, φ) : v ? code(λ + (λ < 0 ? π : -π), φ) : 0;
	          if (!point0 && (v00 = v0 = v)) listener.lineStart();
	          if (v !== v0) {
	            point2 = intersect(point0, point1);
	            if (d3_geo_sphericalEqual(point0, point2) || d3_geo_sphericalEqual(point1, point2)) {
	              point1[0] += ε;
	              point1[1] += ε;
	              v = visible(point1[0], point1[1]);
	            }
	          }
	          if (v !== v0) {
	            clean = 0;
	            if (v) {
	              listener.lineStart();
	              point2 = intersect(point1, point0);
	              listener.point(point2[0], point2[1]);
	            } else {
	              point2 = intersect(point0, point1);
	              listener.point(point2[0], point2[1]);
	              listener.lineEnd();
	            }
	            point0 = point2;
	          } else if (notHemisphere && point0 && smallRadius ^ v) {
	            var t;
	            if (!(c & c0) && (t = intersect(point1, point0, true))) {
	              clean = 0;
	              if (smallRadius) {
	                listener.lineStart();
	                listener.point(t[0][0], t[0][1]);
	                listener.point(t[1][0], t[1][1]);
	                listener.lineEnd();
	              } else {
	                listener.point(t[1][0], t[1][1]);
	                listener.lineEnd();
	                listener.lineStart();
	                listener.point(t[0][0], t[0][1]);
	              }
	            }
	          }
	          if (v && (!point0 || !d3_geo_sphericalEqual(point0, point1))) {
	            listener.point(point1[0], point1[1]);
	          }
	          point0 = point1, v0 = v, c0 = c;
	        },
	        lineEnd: function() {
	          if (v0) listener.lineEnd();
	          point0 = null;
	        },
	        clean: function() {
	          return clean | (v00 && v0) << 1;
	        }
	      };
	    }
	    function intersect(a, b, two) {
	      var pa = d3_geo_cartesian(a), pb = d3_geo_cartesian(b);
	      var n1 = [ 1, 0, 0 ], n2 = d3_geo_cartesianCross(pa, pb), n2n2 = d3_geo_cartesianDot(n2, n2), n1n2 = n2[0], determinant = n2n2 - n1n2 * n1n2;
	      if (!determinant) return !two && a;
	      var c1 = cr * n2n2 / determinant, c2 = -cr * n1n2 / determinant, n1xn2 = d3_geo_cartesianCross(n1, n2), A = d3_geo_cartesianScale(n1, c1), B = d3_geo_cartesianScale(n2, c2);
	      d3_geo_cartesianAdd(A, B);
	      var u = n1xn2, w = d3_geo_cartesianDot(A, u), uu = d3_geo_cartesianDot(u, u), t2 = w * w - uu * (d3_geo_cartesianDot(A, A) - 1);
	      if (t2 < 0) return;
	      var t = Math.sqrt(t2), q = d3_geo_cartesianScale(u, (-w - t) / uu);
	      d3_geo_cartesianAdd(q, A);
	      q = d3_geo_spherical(q);
	      if (!two) return q;
	      var λ0 = a[0], λ1 = b[0], φ0 = a[1], φ1 = b[1], z;
	      if (λ1 < λ0) z = λ0, λ0 = λ1, λ1 = z;
	      var δλ = λ1 - λ0, polar = abs(δλ - π) < ε, meridian = polar || δλ < ε;
	      if (!polar && φ1 < φ0) z = φ0, φ0 = φ1, φ1 = z;
	      if (meridian ? polar ? φ0 + φ1 > 0 ^ q[1] < (abs(q[0] - λ0) < ε ? φ0 : φ1) : φ0 <= q[1] && q[1] <= φ1 : δλ > π ^ (λ0 <= q[0] && q[0] <= λ1)) {
	        var q1 = d3_geo_cartesianScale(u, (-w + t) / uu);
	        d3_geo_cartesianAdd(q1, A);
	        return [ q, d3_geo_spherical(q1) ];
	      }
	    }
	    function code(λ, φ) {
	      var r = smallRadius ? radius : π - radius, code = 0;
	      if (λ < -r) code |= 1; else if (λ > r) code |= 2;
	      if (φ < -r) code |= 4; else if (φ > r) code |= 8;
	      return code;
	    }
	  }
	  function d3_geom_clipLine(x0, y0, x1, y1) {
	    return function(line) {
	      var a = line.a, b = line.b, ax = a.x, ay = a.y, bx = b.x, by = b.y, t0 = 0, t1 = 1, dx = bx - ax, dy = by - ay, r;
	      r = x0 - ax;
	      if (!dx && r > 0) return;
	      r /= dx;
	      if (dx < 0) {
	        if (r < t0) return;
	        if (r < t1) t1 = r;
	      } else if (dx > 0) {
	        if (r > t1) return;
	        if (r > t0) t0 = r;
	      }
	      r = x1 - ax;
	      if (!dx && r < 0) return;
	      r /= dx;
	      if (dx < 0) {
	        if (r > t1) return;
	        if (r > t0) t0 = r;
	      } else if (dx > 0) {
	        if (r < t0) return;
	        if (r < t1) t1 = r;
	      }
	      r = y0 - ay;
	      if (!dy && r > 0) return;
	      r /= dy;
	      if (dy < 0) {
	        if (r < t0) return;
	        if (r < t1) t1 = r;
	      } else if (dy > 0) {
	        if (r > t1) return;
	        if (r > t0) t0 = r;
	      }
	      r = y1 - ay;
	      if (!dy && r < 0) return;
	      r /= dy;
	      if (dy < 0) {
	        if (r > t1) return;
	        if (r > t0) t0 = r;
	      } else if (dy > 0) {
	        if (r < t0) return;
	        if (r < t1) t1 = r;
	      }
	      if (t0 > 0) line.a = {
	        x: ax + t0 * dx,
	        y: ay + t0 * dy
	      };
	      if (t1 < 1) line.b = {
	        x: ax + t1 * dx,
	        y: ay + t1 * dy
	      };
	      return line;
	    };
	  }
	  var d3_geo_clipExtentMAX = 1e9;
	  d3.geo.clipExtent = function() {
	    var x0, y0, x1, y1, stream, clip, clipExtent = {
	      stream: function(output) {
	        if (stream) stream.valid = false;
	        stream = clip(output);
	        stream.valid = true;
	        return stream;
	      },
	      extent: function(_) {
	        if (!arguments.length) return [ [ x0, y0 ], [ x1, y1 ] ];
	        clip = d3_geo_clipExtent(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]);
	        if (stream) stream.valid = false, stream = null;
	        return clipExtent;
	      }
	    };
	    return clipExtent.extent([ [ 0, 0 ], [ 960, 500 ] ]);
	  };
	  function d3_geo_clipExtent(x0, y0, x1, y1) {
	    return function(listener) {
	      var listener_ = listener, bufferListener = d3_geo_clipBufferListener(), clipLine = d3_geom_clipLine(x0, y0, x1, y1), segments, polygon, ring;
	      var clip = {
	        point: point,
	        lineStart: lineStart,
	        lineEnd: lineEnd,
	        polygonStart: function() {
	          listener = bufferListener;
	          segments = [];
	          polygon = [];
	          clean = true;
	        },
	        polygonEnd: function() {
	          listener = listener_;
	          segments = d3.merge(segments);
	          var clipStartInside = insidePolygon([ x0, y1 ]), inside = clean && clipStartInside, visible = segments.length;
	          if (inside || visible) {
	            listener.polygonStart();
	            if (inside) {
	              listener.lineStart();
	              interpolate(null, null, 1, listener);
	              listener.lineEnd();
	            }
	            if (visible) {
	              d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener);
	            }
	            listener.polygonEnd();
	          }
	          segments = polygon = ring = null;
	        }
	      };
	      function insidePolygon(p) {
	        var wn = 0, n = polygon.length, y = p[1];
	        for (var i = 0; i < n; ++i) {
	          for (var j = 1, v = polygon[i], m = v.length, a = v[0], b; j < m; ++j) {
	            b = v[j];
	            if (a[1] <= y) {
	              if (b[1] > y && d3_cross2d(a, b, p) > 0) ++wn;
	            } else {
	              if (b[1] <= y && d3_cross2d(a, b, p) < 0) --wn;
	            }
	            a = b;
	          }
	        }
	        return wn !== 0;
	      }
	      function interpolate(from, to, direction, listener) {
	        var a = 0, a1 = 0;
	        if (from == null || (a = corner(from, direction)) !== (a1 = corner(to, direction)) || comparePoints(from, to) < 0 ^ direction > 0) {
	          do {
	            listener.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
	          } while ((a = (a + direction + 4) % 4) !== a1);
	        } else {
	          listener.point(to[0], to[1]);
	        }
	      }
	      function pointVisible(x, y) {
	        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
	      }
	      function point(x, y) {
	        if (pointVisible(x, y)) listener.point(x, y);
	      }
	      var x__, y__, v__, x_, y_, v_, first, clean;
	      function lineStart() {
	        clip.point = linePoint;
	        if (polygon) polygon.push(ring = []);
	        first = true;
	        v_ = false;
	        x_ = y_ = NaN;
	      }
	      function lineEnd() {
	        if (segments) {
	          linePoint(x__, y__);
	          if (v__ && v_) bufferListener.rejoin();
	          segments.push(bufferListener.buffer());
	        }
	        clip.point = point;
	        if (v_) listener.lineEnd();
	      }
	      function linePoint(x, y) {
	        x = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, x));
	        y = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, y));
	        var v = pointVisible(x, y);
	        if (polygon) ring.push([ x, y ]);
	        if (first) {
	          x__ = x, y__ = y, v__ = v;
	          first = false;
	          if (v) {
	            listener.lineStart();
	            listener.point(x, y);
	          }
	        } else {
	          if (v && v_) listener.point(x, y); else {
	            var l = {
	              a: {
	                x: x_,
	                y: y_
	              },
	              b: {
	                x: x,
	                y: y
	              }
	            };
	            if (clipLine(l)) {
	              if (!v_) {
	                listener.lineStart();
	                listener.point(l.a.x, l.a.y);
	              }
	              listener.point(l.b.x, l.b.y);
	              if (!v) listener.lineEnd();
	              clean = false;
	            } else if (v) {
	              listener.lineStart();
	              listener.point(x, y);
	              clean = false;
	            }
	          }
	        }
	        x_ = x, y_ = y, v_ = v;
	      }
	      return clip;
	    };
	    function corner(p, direction) {
	      return abs(p[0] - x0) < ε ? direction > 0 ? 0 : 3 : abs(p[0] - x1) < ε ? direction > 0 ? 2 : 1 : abs(p[1] - y0) < ε ? direction > 0 ? 1 : 0 : direction > 0 ? 3 : 2;
	    }
	    function compare(a, b) {
	      return comparePoints(a.x, b.x);
	    }
	    function comparePoints(a, b) {
	      var ca = corner(a, 1), cb = corner(b, 1);
	      return ca !== cb ? ca - cb : ca === 0 ? b[1] - a[1] : ca === 1 ? a[0] - b[0] : ca === 2 ? a[1] - b[1] : b[0] - a[0];
	    }
	  }
	  function d3_geo_conic(projectAt) {
	    var φ0 = 0, φ1 = π / 3, m = d3_geo_projectionMutator(projectAt), p = m(φ0, φ1);
	    p.parallels = function(_) {
	      if (!arguments.length) return [ φ0 / π * 180, φ1 / π * 180 ];
	      return m(φ0 = _[0] * π / 180, φ1 = _[1] * π / 180);
	    };
	    return p;
	  }
	  function d3_geo_conicEqualArea(φ0, φ1) {
	    var sinφ0 = Math.sin(φ0), n = (sinφ0 + Math.sin(φ1)) / 2, C = 1 + sinφ0 * (2 * n - sinφ0), ρ0 = Math.sqrt(C) / n;
	    function forward(λ, φ) {
	      var ρ = Math.sqrt(C - 2 * n * Math.sin(φ)) / n;
	      return [ ρ * Math.sin(λ *= n), ρ0 - ρ * Math.cos(λ) ];
	    }
	    forward.invert = function(x, y) {
	      var ρ0_y = ρ0 - y;
	      return [ Math.atan2(x, ρ0_y) / n, d3_asin((C - (x * x + ρ0_y * ρ0_y) * n * n) / (2 * n)) ];
	    };
	    return forward;
	  }
	  (d3.geo.conicEqualArea = function() {
	    return d3_geo_conic(d3_geo_conicEqualArea);
	  }).raw = d3_geo_conicEqualArea;
	  d3.geo.albers = function() {
	    return d3.geo.conicEqualArea().rotate([ 96, 0 ]).center([ -.6, 38.7 ]).parallels([ 29.5, 45.5 ]).scale(1070);
	  };
	  d3.geo.albersUsa = function() {
	    var lower48 = d3.geo.albers();
	    var alaska = d3.geo.conicEqualArea().rotate([ 154, 0 ]).center([ -2, 58.5 ]).parallels([ 55, 65 ]);
	    var hawaii = d3.geo.conicEqualArea().rotate([ 157, 0 ]).center([ -3, 19.9 ]).parallels([ 8, 18 ]);
	    var point, pointStream = {
	      point: function(x, y) {
	        point = [ x, y ];
	      }
	    }, lower48Point, alaskaPoint, hawaiiPoint;
	    function albersUsa(coordinates) {
	      var x = coordinates[0], y = coordinates[1];
	      point = null;
	      (lower48Point(x, y), point) || (alaskaPoint(x, y), point) || hawaiiPoint(x, y);
	      return point;
	    }
	    albersUsa.invert = function(coordinates) {
	      var k = lower48.scale(), t = lower48.translate(), x = (coordinates[0] - t[0]) / k, y = (coordinates[1] - t[1]) / k;
	      return (y >= .12 && y < .234 && x >= -.425 && x < -.214 ? alaska : y >= .166 && y < .234 && x >= -.214 && x < -.115 ? hawaii : lower48).invert(coordinates);
	    };
	    albersUsa.stream = function(stream) {
	      var lower48Stream = lower48.stream(stream), alaskaStream = alaska.stream(stream), hawaiiStream = hawaii.stream(stream);
	      return {
	        point: function(x, y) {
	          lower48Stream.point(x, y);
	          alaskaStream.point(x, y);
	          hawaiiStream.point(x, y);
	        },
	        sphere: function() {
	          lower48Stream.sphere();
	          alaskaStream.sphere();
	          hawaiiStream.sphere();
	        },
	        lineStart: function() {
	          lower48Stream.lineStart();
	          alaskaStream.lineStart();
	          hawaiiStream.lineStart();
	        },
	        lineEnd: function() {
	          lower48Stream.lineEnd();
	          alaskaStream.lineEnd();
	          hawaiiStream.lineEnd();
	        },
	        polygonStart: function() {
	          lower48Stream.polygonStart();
	          alaskaStream.polygonStart();
	          hawaiiStream.polygonStart();
	        },
	        polygonEnd: function() {
	          lower48Stream.polygonEnd();
	          alaskaStream.polygonEnd();
	          hawaiiStream.polygonEnd();
	        }
	      };
	    };
	    albersUsa.precision = function(_) {
	      if (!arguments.length) return lower48.precision();
	      lower48.precision(_);
	      alaska.precision(_);
	      hawaii.precision(_);
	      return albersUsa;
	    };
	    albersUsa.scale = function(_) {
	      if (!arguments.length) return lower48.scale();
	      lower48.scale(_);
	      alaska.scale(_ * .35);
	      hawaii.scale(_);
	      return albersUsa.translate(lower48.translate());
	    };
	    albersUsa.translate = function(_) {
	      if (!arguments.length) return lower48.translate();
	      var k = lower48.scale(), x = +_[0], y = +_[1];
	      lower48Point = lower48.translate(_).clipExtent([ [ x - .455 * k, y - .238 * k ], [ x + .455 * k, y + .238 * k ] ]).stream(pointStream).point;
	      alaskaPoint = alaska.translate([ x - .307 * k, y + .201 * k ]).clipExtent([ [ x - .425 * k + ε, y + .12 * k + ε ], [ x - .214 * k - ε, y + .234 * k - ε ] ]).stream(pointStream).point;
	      hawaiiPoint = hawaii.translate([ x - .205 * k, y + .212 * k ]).clipExtent([ [ x - .214 * k + ε, y + .166 * k + ε ], [ x - .115 * k - ε, y + .234 * k - ε ] ]).stream(pointStream).point;
	      return albersUsa;
	    };
	    return albersUsa.scale(1070);
	  };
	  var d3_geo_pathAreaSum, d3_geo_pathAreaPolygon, d3_geo_pathArea = {
	    point: d3_noop,
	    lineStart: d3_noop,
	    lineEnd: d3_noop,
	    polygonStart: function() {
	      d3_geo_pathAreaPolygon = 0;
	      d3_geo_pathArea.lineStart = d3_geo_pathAreaRingStart;
	    },
	    polygonEnd: function() {
	      d3_geo_pathArea.lineStart = d3_geo_pathArea.lineEnd = d3_geo_pathArea.point = d3_noop;
	      d3_geo_pathAreaSum += abs(d3_geo_pathAreaPolygon / 2);
	    }
	  };
	  function d3_geo_pathAreaRingStart() {
	    var x00, y00, x0, y0;
	    d3_geo_pathArea.point = function(x, y) {
	      d3_geo_pathArea.point = nextPoint;
	      x00 = x0 = x, y00 = y0 = y;
	    };
	    function nextPoint(x, y) {
	      d3_geo_pathAreaPolygon += y0 * x - x0 * y;
	      x0 = x, y0 = y;
	    }
	    d3_geo_pathArea.lineEnd = function() {
	      nextPoint(x00, y00);
	    };
	  }
	  var d3_geo_pathBoundsX0, d3_geo_pathBoundsY0, d3_geo_pathBoundsX1, d3_geo_pathBoundsY1;
	  var d3_geo_pathBounds = {
	    point: d3_geo_pathBoundsPoint,
	    lineStart: d3_noop,
	    lineEnd: d3_noop,
	    polygonStart: d3_noop,
	    polygonEnd: d3_noop
	  };
	  function d3_geo_pathBoundsPoint(x, y) {
	    if (x < d3_geo_pathBoundsX0) d3_geo_pathBoundsX0 = x;
	    if (x > d3_geo_pathBoundsX1) d3_geo_pathBoundsX1 = x;
	    if (y < d3_geo_pathBoundsY0) d3_geo_pathBoundsY0 = y;
	    if (y > d3_geo_pathBoundsY1) d3_geo_pathBoundsY1 = y;
	  }
	  function d3_geo_pathBuffer() {
	    var pointCircle = d3_geo_pathBufferCircle(4.5), buffer = [];
	    var stream = {
	      point: point,
	      lineStart: function() {
	        stream.point = pointLineStart;
	      },
	      lineEnd: lineEnd,
	      polygonStart: function() {
	        stream.lineEnd = lineEndPolygon;
	      },
	      polygonEnd: function() {
	        stream.lineEnd = lineEnd;
	        stream.point = point;
	      },
	      pointRadius: function(_) {
	        pointCircle = d3_geo_pathBufferCircle(_);
	        return stream;
	      },
	      result: function() {
	        if (buffer.length) {
	          var result = buffer.join("");
	          buffer = [];
	          return result;
	        }
	      }
	    };
	    function point(x, y) {
	      buffer.push("M", x, ",", y, pointCircle);
	    }
	    function pointLineStart(x, y) {
	      buffer.push("M", x, ",", y);
	      stream.point = pointLine;
	    }
	    function pointLine(x, y) {
	      buffer.push("L", x, ",", y);
	    }
	    function lineEnd() {
	      stream.point = point;
	    }
	    function lineEndPolygon() {
	      buffer.push("Z");
	    }
	    return stream;
	  }
	  function d3_geo_pathBufferCircle(radius) {
	    return "m0," + radius + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius + "z";
	  }
	  var d3_geo_pathCentroid = {
	    point: d3_geo_pathCentroidPoint,
	    lineStart: d3_geo_pathCentroidLineStart,
	    lineEnd: d3_geo_pathCentroidLineEnd,
	    polygonStart: function() {
	      d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidRingStart;
	    },
	    polygonEnd: function() {
	      d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
	      d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidLineStart;
	      d3_geo_pathCentroid.lineEnd = d3_geo_pathCentroidLineEnd;
	    }
	  };
	  function d3_geo_pathCentroidPoint(x, y) {
	    d3_geo_centroidX0 += x;
	    d3_geo_centroidY0 += y;
	    ++d3_geo_centroidZ0;
	  }
	  function d3_geo_pathCentroidLineStart() {
	    var x0, y0;
	    d3_geo_pathCentroid.point = function(x, y) {
	      d3_geo_pathCentroid.point = nextPoint;
	      d3_geo_pathCentroidPoint(x0 = x, y0 = y);
	    };
	    function nextPoint(x, y) {
	      var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
	      d3_geo_centroidX1 += z * (x0 + x) / 2;
	      d3_geo_centroidY1 += z * (y0 + y) / 2;
	      d3_geo_centroidZ1 += z;
	      d3_geo_pathCentroidPoint(x0 = x, y0 = y);
	    }
	  }
	  function d3_geo_pathCentroidLineEnd() {
	    d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
	  }
	  function d3_geo_pathCentroidRingStart() {
	    var x00, y00, x0, y0;
	    d3_geo_pathCentroid.point = function(x, y) {
	      d3_geo_pathCentroid.point = nextPoint;
	      d3_geo_pathCentroidPoint(x00 = x0 = x, y00 = y0 = y);
	    };
	    function nextPoint(x, y) {
	      var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
	      d3_geo_centroidX1 += z * (x0 + x) / 2;
	      d3_geo_centroidY1 += z * (y0 + y) / 2;
	      d3_geo_centroidZ1 += z;
	      z = y0 * x - x0 * y;
	      d3_geo_centroidX2 += z * (x0 + x);
	      d3_geo_centroidY2 += z * (y0 + y);
	      d3_geo_centroidZ2 += z * 3;
	      d3_geo_pathCentroidPoint(x0 = x, y0 = y);
	    }
	    d3_geo_pathCentroid.lineEnd = function() {
	      nextPoint(x00, y00);
	    };
	  }
	  function d3_geo_pathContext(context) {
	    var pointRadius = 4.5;
	    var stream = {
	      point: point,
	      lineStart: function() {
	        stream.point = pointLineStart;
	      },
	      lineEnd: lineEnd,
	      polygonStart: function() {
	        stream.lineEnd = lineEndPolygon;
	      },
	      polygonEnd: function() {
	        stream.lineEnd = lineEnd;
	        stream.point = point;
	      },
	      pointRadius: function(_) {
	        pointRadius = _;
	        return stream;
	      },
	      result: d3_noop
	    };
	    function point(x, y) {
	      context.moveTo(x + pointRadius, y);
	      context.arc(x, y, pointRadius, 0, τ);
	    }
	    function pointLineStart(x, y) {
	      context.moveTo(x, y);
	      stream.point = pointLine;
	    }
	    function pointLine(x, y) {
	      context.lineTo(x, y);
	    }
	    function lineEnd() {
	      stream.point = point;
	    }
	    function lineEndPolygon() {
	      context.closePath();
	    }
	    return stream;
	  }
	  function d3_geo_resample(project) {
	    var δ2 = .5, cosMinDistance = Math.cos(30 * d3_radians), maxDepth = 16;
	    function resample(stream) {
	      return (maxDepth ? resampleRecursive : resampleNone)(stream);
	    }
	    function resampleNone(stream) {
	      return d3_geo_transformPoint(stream, function(x, y) {
	        x = project(x, y);
	        stream.point(x[0], x[1]);
	      });
	    }
	    function resampleRecursive(stream) {
	      var λ00, φ00, x00, y00, a00, b00, c00, λ0, x0, y0, a0, b0, c0;
	      var resample = {
	        point: point,
	        lineStart: lineStart,
	        lineEnd: lineEnd,
	        polygonStart: function() {
	          stream.polygonStart();
	          resample.lineStart = ringStart;
	        },
	        polygonEnd: function() {
	          stream.polygonEnd();
	          resample.lineStart = lineStart;
	        }
	      };
	      function point(x, y) {
	        x = project(x, y);
	        stream.point(x[0], x[1]);
	      }
	      function lineStart() {
	        x0 = NaN;
	        resample.point = linePoint;
	        stream.lineStart();
	      }
	      function linePoint(λ, φ) {
	        var c = d3_geo_cartesian([ λ, φ ]), p = project(λ, φ);
	        resampleLineTo(x0, y0, λ0, a0, b0, c0, x0 = p[0], y0 = p[1], λ0 = λ, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
	        stream.point(x0, y0);
	      }
	      function lineEnd() {
	        resample.point = point;
	        stream.lineEnd();
	      }
	      function ringStart() {
	        lineStart();
	        resample.point = ringPoint;
	        resample.lineEnd = ringEnd;
	      }
	      function ringPoint(λ, φ) {
	        linePoint(λ00 = λ, φ00 = φ), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
	        resample.point = linePoint;
	      }
	      function ringEnd() {
	        resampleLineTo(x0, y0, λ0, a0, b0, c0, x00, y00, λ00, a00, b00, c00, maxDepth, stream);
	        resample.lineEnd = lineEnd;
	        lineEnd();
	      }
	      return resample;
	    }
	    function resampleLineTo(x0, y0, λ0, a0, b0, c0, x1, y1, λ1, a1, b1, c1, depth, stream) {
	      var dx = x1 - x0, dy = y1 - y0, d2 = dx * dx + dy * dy;
	      if (d2 > 4 * δ2 && depth--) {
	        var a = a0 + a1, b = b0 + b1, c = c0 + c1, m = Math.sqrt(a * a + b * b + c * c), φ2 = Math.asin(c /= m), λ2 = abs(abs(c) - 1) < ε || abs(λ0 - λ1) < ε ? (λ0 + λ1) / 2 : Math.atan2(b, a), p = project(λ2, φ2), x2 = p[0], y2 = p[1], dx2 = x2 - x0, dy2 = y2 - y0, dz = dy * dx2 - dx * dy2;
	        if (dz * dz / d2 > δ2 || abs((dx * dx2 + dy * dy2) / d2 - .5) > .3 || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) {
	          resampleLineTo(x0, y0, λ0, a0, b0, c0, x2, y2, λ2, a /= m, b /= m, c, depth, stream);
	          stream.point(x2, y2);
	          resampleLineTo(x2, y2, λ2, a, b, c, x1, y1, λ1, a1, b1, c1, depth, stream);
	        }
	      }
	    }
	    resample.precision = function(_) {
	      if (!arguments.length) return Math.sqrt(δ2);
	      maxDepth = (δ2 = _ * _) > 0 && 16;
	      return resample;
	    };
	    return resample;
	  }
	  d3.geo.path = function() {
	    var pointRadius = 4.5, projection, context, projectStream, contextStream, cacheStream;
	    function path(object) {
	      if (object) {
	        if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
	        if (!cacheStream || !cacheStream.valid) cacheStream = projectStream(contextStream);
	        d3.geo.stream(object, cacheStream);
	      }
	      return contextStream.result();
	    }
	    path.area = function(object) {
	      d3_geo_pathAreaSum = 0;
	      d3.geo.stream(object, projectStream(d3_geo_pathArea));
	      return d3_geo_pathAreaSum;
	    };
	    path.centroid = function(object) {
	      d3_geo_centroidX0 = d3_geo_centroidY0 = d3_geo_centroidZ0 = d3_geo_centroidX1 = d3_geo_centroidY1 = d3_geo_centroidZ1 = d3_geo_centroidX2 = d3_geo_centroidY2 = d3_geo_centroidZ2 = 0;
	      d3.geo.stream(object, projectStream(d3_geo_pathCentroid));
	      return d3_geo_centroidZ2 ? [ d3_geo_centroidX2 / d3_geo_centroidZ2, d3_geo_centroidY2 / d3_geo_centroidZ2 ] : d3_geo_centroidZ1 ? [ d3_geo_centroidX1 / d3_geo_centroidZ1, d3_geo_centroidY1 / d3_geo_centroidZ1 ] : d3_geo_centroidZ0 ? [ d3_geo_centroidX0 / d3_geo_centroidZ0, d3_geo_centroidY0 / d3_geo_centroidZ0 ] : [ NaN, NaN ];
	    };
	    path.bounds = function(object) {
	      d3_geo_pathBoundsX1 = d3_geo_pathBoundsY1 = -(d3_geo_pathBoundsX0 = d3_geo_pathBoundsY0 = Infinity);
	      d3.geo.stream(object, projectStream(d3_geo_pathBounds));
	      return [ [ d3_geo_pathBoundsX0, d3_geo_pathBoundsY0 ], [ d3_geo_pathBoundsX1, d3_geo_pathBoundsY1 ] ];
	    };
	    path.projection = function(_) {
	      if (!arguments.length) return projection;
	      projectStream = (projection = _) ? _.stream || d3_geo_pathProjectStream(_) : d3_identity;
	      return reset();
	    };
	    path.context = function(_) {
	      if (!arguments.length) return context;
	      contextStream = (context = _) == null ? new d3_geo_pathBuffer() : new d3_geo_pathContext(_);
	      if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
	      return reset();
	    };
	    path.pointRadius = function(_) {
	      if (!arguments.length) return pointRadius;
	      pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
	      return path;
	    };
	    function reset() {
	      cacheStream = null;
	      return path;
	    }
	    return path.projection(d3.geo.albersUsa()).context(null);
	  };
	  function d3_geo_pathProjectStream(project) {
	    var resample = d3_geo_resample(function(x, y) {
	      return project([ x * d3_degrees, y * d3_degrees ]);
	    });
	    return function(stream) {
	      return d3_geo_projectionRadians(resample(stream));
	    };
	  }
	  d3.geo.transform = function(methods) {
	    return {
	      stream: function(stream) {
	        var transform = new d3_geo_transform(stream);
	        for (var k in methods) transform[k] = methods[k];
	        return transform;
	      }
	    };
	  };
	  function d3_geo_transform(stream) {
	    this.stream = stream;
	  }
	  d3_geo_transform.prototype = {
	    point: function(x, y) {
	      this.stream.point(x, y);
	    },
	    sphere: function() {
	      this.stream.sphere();
	    },
	    lineStart: function() {
	      this.stream.lineStart();
	    },
	    lineEnd: function() {
	      this.stream.lineEnd();
	    },
	    polygonStart: function() {
	      this.stream.polygonStart();
	    },
	    polygonEnd: function() {
	      this.stream.polygonEnd();
	    }
	  };
	  function d3_geo_transformPoint(stream, point) {
	    return {
	      point: point,
	      sphere: function() {
	        stream.sphere();
	      },
	      lineStart: function() {
	        stream.lineStart();
	      },
	      lineEnd: function() {
	        stream.lineEnd();
	      },
	      polygonStart: function() {
	        stream.polygonStart();
	      },
	      polygonEnd: function() {
	        stream.polygonEnd();
	      }
	    };
	  }
	  d3.geo.projection = d3_geo_projection;
	  d3.geo.projectionMutator = d3_geo_projectionMutator;
	  function d3_geo_projection(project) {
	    return d3_geo_projectionMutator(function() {
	      return project;
	    })();
	  }
	  function d3_geo_projectionMutator(projectAt) {
	    var project, rotate, projectRotate, projectResample = d3_geo_resample(function(x, y) {
	      x = project(x, y);
	      return [ x[0] * k + δx, δy - x[1] * k ];
	    }), k = 150, x = 480, y = 250, λ = 0, φ = 0, δλ = 0, δφ = 0, δγ = 0, δx, δy, preclip = d3_geo_clipAntimeridian, postclip = d3_identity, clipAngle = null, clipExtent = null, stream;
	    function projection(point) {
	      point = projectRotate(point[0] * d3_radians, point[1] * d3_radians);
	      return [ point[0] * k + δx, δy - point[1] * k ];
	    }
	    function invert(point) {
	      point = projectRotate.invert((point[0] - δx) / k, (δy - point[1]) / k);
	      return point && [ point[0] * d3_degrees, point[1] * d3_degrees ];
	    }
	    projection.stream = function(output) {
	      if (stream) stream.valid = false;
	      stream = d3_geo_projectionRadians(preclip(rotate, projectResample(postclip(output))));
	      stream.valid = true;
	      return stream;
	    };
	    projection.clipAngle = function(_) {
	      if (!arguments.length) return clipAngle;
	      preclip = _ == null ? (clipAngle = _, d3_geo_clipAntimeridian) : d3_geo_clipCircle((clipAngle = +_) * d3_radians);
	      return invalidate();
	    };
	    projection.clipExtent = function(_) {
	      if (!arguments.length) return clipExtent;
	      clipExtent = _;
	      postclip = _ ? d3_geo_clipExtent(_[0][0], _[0][1], _[1][0], _[1][1]) : d3_identity;
	      return invalidate();
	    };
	    projection.scale = function(_) {
	      if (!arguments.length) return k;
	      k = +_;
	      return reset();
	    };
	    projection.translate = function(_) {
	      if (!arguments.length) return [ x, y ];
	      x = +_[0];
	      y = +_[1];
	      return reset();
	    };
	    projection.center = function(_) {
	      if (!arguments.length) return [ λ * d3_degrees, φ * d3_degrees ];
	      λ = _[0] % 360 * d3_radians;
	      φ = _[1] % 360 * d3_radians;
	      return reset();
	    };
	    projection.rotate = function(_) {
	      if (!arguments.length) return [ δλ * d3_degrees, δφ * d3_degrees, δγ * d3_degrees ];
	      δλ = _[0] % 360 * d3_radians;
	      δφ = _[1] % 360 * d3_radians;
	      δγ = _.length > 2 ? _[2] % 360 * d3_radians : 0;
	      return reset();
	    };
	    d3.rebind(projection, projectResample, "precision");
	    function reset() {
	      projectRotate = d3_geo_compose(rotate = d3_geo_rotation(δλ, δφ, δγ), project);
	      var center = project(λ, φ);
	      δx = x - center[0] * k;
	      δy = y + center[1] * k;
	      return invalidate();
	    }
	    function invalidate() {
	      if (stream) stream.valid = false, stream = null;
	      return projection;
	    }
	    return function() {
	      project = projectAt.apply(this, arguments);
	      projection.invert = project.invert && invert;
	      return reset();
	    };
	  }
	  function d3_geo_projectionRadians(stream) {
	    return d3_geo_transformPoint(stream, function(x, y) {
	      stream.point(x * d3_radians, y * d3_radians);
	    });
	  }
	  function d3_geo_equirectangular(λ, φ) {
	    return [ λ, φ ];
	  }
	  (d3.geo.equirectangular = function() {
	    return d3_geo_projection(d3_geo_equirectangular);
	  }).raw = d3_geo_equirectangular.invert = d3_geo_equirectangular;
	  d3.geo.rotation = function(rotate) {
	    rotate = d3_geo_rotation(rotate[0] % 360 * d3_radians, rotate[1] * d3_radians, rotate.length > 2 ? rotate[2] * d3_radians : 0);
	    function forward(coordinates) {
	      coordinates = rotate(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
	      return coordinates[0] *= d3_degrees, coordinates[1] *= d3_degrees, coordinates;
	    }
	    forward.invert = function(coordinates) {
	      coordinates = rotate.invert(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
	      return coordinates[0] *= d3_degrees, coordinates[1] *= d3_degrees, coordinates;
	    };
	    return forward;
	  };
	  function d3_geo_identityRotation(λ, φ) {
	    return [ λ > π ? λ - τ : λ < -π ? λ + τ : λ, φ ];
	  }
	  d3_geo_identityRotation.invert = d3_geo_equirectangular;
	  function d3_geo_rotation(δλ, δφ, δγ) {
	    return δλ ? δφ || δγ ? d3_geo_compose(d3_geo_rotationλ(δλ), d3_geo_rotationφγ(δφ, δγ)) : d3_geo_rotationλ(δλ) : δφ || δγ ? d3_geo_rotationφγ(δφ, δγ) : d3_geo_identityRotation;
	  }
	  function d3_geo_forwardRotationλ(δλ) {
	    return function(λ, φ) {
	      return λ += δλ, [ λ > π ? λ - τ : λ < -π ? λ + τ : λ, φ ];
	    };
	  }
	  function d3_geo_rotationλ(δλ) {
	    var rotation = d3_geo_forwardRotationλ(δλ);
	    rotation.invert = d3_geo_forwardRotationλ(-δλ);
	    return rotation;
	  }
	  function d3_geo_rotationφγ(δφ, δγ) {
	    var cosδφ = Math.cos(δφ), sinδφ = Math.sin(δφ), cosδγ = Math.cos(δγ), sinδγ = Math.sin(δγ);
	    function rotation(λ, φ) {
	      var cosφ = Math.cos(φ), x = Math.cos(λ) * cosφ, y = Math.sin(λ) * cosφ, z = Math.sin(φ), k = z * cosδφ + x * sinδφ;
	      return [ Math.atan2(y * cosδγ - k * sinδγ, x * cosδφ - z * sinδφ), d3_asin(k * cosδγ + y * sinδγ) ];
	    }
	    rotation.invert = function(λ, φ) {
	      var cosφ = Math.cos(φ), x = Math.cos(λ) * cosφ, y = Math.sin(λ) * cosφ, z = Math.sin(φ), k = z * cosδγ - y * sinδγ;
	      return [ Math.atan2(y * cosδγ + z * sinδγ, x * cosδφ + k * sinδφ), d3_asin(k * cosδφ - x * sinδφ) ];
	    };
	    return rotation;
	  }
	  d3.geo.circle = function() {
	    var origin = [ 0, 0 ], angle, precision = 6, interpolate;
	    function circle() {
	      var center = typeof origin === "function" ? origin.apply(this, arguments) : origin, rotate = d3_geo_rotation(-center[0] * d3_radians, -center[1] * d3_radians, 0).invert, ring = [];
	      interpolate(null, null, 1, {
	        point: function(x, y) {
	          ring.push(x = rotate(x, y));
	          x[0] *= d3_degrees, x[1] *= d3_degrees;
	        }
	      });
	      return {
	        type: "Polygon",
	        coordinates: [ ring ]
	      };
	    }
	    circle.origin = function(x) {
	      if (!arguments.length) return origin;
	      origin = x;
	      return circle;
	    };
	    circle.angle = function(x) {
	      if (!arguments.length) return angle;
	      interpolate = d3_geo_circleInterpolate((angle = +x) * d3_radians, precision * d3_radians);
	      return circle;
	    };
	    circle.precision = function(_) {
	      if (!arguments.length) return precision;
	      interpolate = d3_geo_circleInterpolate(angle * d3_radians, (precision = +_) * d3_radians);
	      return circle;
	    };
	    return circle.angle(90);
	  };
	  function d3_geo_circleInterpolate(radius, precision) {
	    var cr = Math.cos(radius), sr = Math.sin(radius);
	    return function(from, to, direction, listener) {
	      var step = direction * precision;
	      if (from != null) {
	        from = d3_geo_circleAngle(cr, from);
	        to = d3_geo_circleAngle(cr, to);
	        if (direction > 0 ? from < to : from > to) from += direction * τ;
	      } else {
	        from = radius + direction * τ;
	        to = radius - .5 * step;
	      }
	      for (var point, t = from; direction > 0 ? t > to : t < to; t -= step) {
	        listener.point((point = d3_geo_spherical([ cr, -sr * Math.cos(t), -sr * Math.sin(t) ]))[0], point[1]);
	      }
	    };
	  }
	  function d3_geo_circleAngle(cr, point) {
	    var a = d3_geo_cartesian(point);
	    a[0] -= cr;
	    d3_geo_cartesianNormalize(a);
	    var angle = d3_acos(-a[1]);
	    return ((-a[2] < 0 ? -angle : angle) + 2 * Math.PI - ε) % (2 * Math.PI);
	  }
	  d3.geo.distance = function(a, b) {
	    var Δλ = (b[0] - a[0]) * d3_radians, φ0 = a[1] * d3_radians, φ1 = b[1] * d3_radians, sinΔλ = Math.sin(Δλ), cosΔλ = Math.cos(Δλ), sinφ0 = Math.sin(φ0), cosφ0 = Math.cos(φ0), sinφ1 = Math.sin(φ1), cosφ1 = Math.cos(φ1), t;
	    return Math.atan2(Math.sqrt((t = cosφ1 * sinΔλ) * t + (t = cosφ0 * sinφ1 - sinφ0 * cosφ1 * cosΔλ) * t), sinφ0 * sinφ1 + cosφ0 * cosφ1 * cosΔλ);
	  };
	  d3.geo.graticule = function() {
	    var x1, x0, X1, X0, y1, y0, Y1, Y0, dx = 10, dy = dx, DX = 90, DY = 360, x, y, X, Y, precision = 2.5;
	    function graticule() {
	      return {
	        type: "MultiLineString",
	        coordinates: lines()
	      };
	    }
	    function lines() {
	      return d3.range(Math.ceil(X0 / DX) * DX, X1, DX).map(X).concat(d3.range(Math.ceil(Y0 / DY) * DY, Y1, DY).map(Y)).concat(d3.range(Math.ceil(x0 / dx) * dx, x1, dx).filter(function(x) {
	        return abs(x % DX) > ε;
	      }).map(x)).concat(d3.range(Math.ceil(y0 / dy) * dy, y1, dy).filter(function(y) {
	        return abs(y % DY) > ε;
	      }).map(y));
	    }
	    graticule.lines = function() {
	      return lines().map(function(coordinates) {
	        return {
	          type: "LineString",
	          coordinates: coordinates
	        };
	      });
	    };
	    graticule.outline = function() {
	      return {
	        type: "Polygon",
	        coordinates: [ X(X0).concat(Y(Y1).slice(1), X(X1).reverse().slice(1), Y(Y0).reverse().slice(1)) ]
	      };
	    };
	    graticule.extent = function(_) {
	      if (!arguments.length) return graticule.minorExtent();
	      return graticule.majorExtent(_).minorExtent(_);
	    };
	    graticule.majorExtent = function(_) {
	      if (!arguments.length) return [ [ X0, Y0 ], [ X1, Y1 ] ];
	      X0 = +_[0][0], X1 = +_[1][0];
	      Y0 = +_[0][1], Y1 = +_[1][1];
	      if (X0 > X1) _ = X0, X0 = X1, X1 = _;
	      if (Y0 > Y1) _ = Y0, Y0 = Y1, Y1 = _;
	      return graticule.precision(precision);
	    };
	    graticule.minorExtent = function(_) {
	      if (!arguments.length) return [ [ x0, y0 ], [ x1, y1 ] ];
	      x0 = +_[0][0], x1 = +_[1][0];
	      y0 = +_[0][1], y1 = +_[1][1];
	      if (x0 > x1) _ = x0, x0 = x1, x1 = _;
	      if (y0 > y1) _ = y0, y0 = y1, y1 = _;
	      return graticule.precision(precision);
	    };
	    graticule.step = function(_) {
	      if (!arguments.length) return graticule.minorStep();
	      return graticule.majorStep(_).minorStep(_);
	    };
	    graticule.majorStep = function(_) {
	      if (!arguments.length) return [ DX, DY ];
	      DX = +_[0], DY = +_[1];
	      return graticule;
	    };
	    graticule.minorStep = function(_) {
	      if (!arguments.length) return [ dx, dy ];
	      dx = +_[0], dy = +_[1];
	      return graticule;
	    };
	    graticule.precision = function(_) {
	      if (!arguments.length) return precision;
	      precision = +_;
	      x = d3_geo_graticuleX(y0, y1, 90);
	      y = d3_geo_graticuleY(x0, x1, precision);
	      X = d3_geo_graticuleX(Y0, Y1, 90);
	      Y = d3_geo_graticuleY(X0, X1, precision);
	      return graticule;
	    };
	    return graticule.majorExtent([ [ -180, -90 + ε ], [ 180, 90 - ε ] ]).minorExtent([ [ -180, -80 - ε ], [ 180, 80 + ε ] ]);
	  };
	  function d3_geo_graticuleX(y0, y1, dy) {
	    var y = d3.range(y0, y1 - ε, dy).concat(y1);
	    return function(x) {
	      return y.map(function(y) {
	        return [ x, y ];
	      });
	    };
	  }
	  function d3_geo_graticuleY(x0, x1, dx) {
	    var x = d3.range(x0, x1 - ε, dx).concat(x1);
	    return function(y) {
	      return x.map(function(x) {
	        return [ x, y ];
	      });
	    };
	  }
	  function d3_source(d) {
	    return d.source;
	  }
	  function d3_target(d) {
	    return d.target;
	  }
	  d3.geo.greatArc = function() {
	    var source = d3_source, source_, target = d3_target, target_;
	    function greatArc() {
	      return {
	        type: "LineString",
	        coordinates: [ source_ || source.apply(this, arguments), target_ || target.apply(this, arguments) ]
	      };
	    }
	    greatArc.distance = function() {
	      return d3.geo.distance(source_ || source.apply(this, arguments), target_ || target.apply(this, arguments));
	    };
	    greatArc.source = function(_) {
	      if (!arguments.length) return source;
	      source = _, source_ = typeof _ === "function" ? null : _;
	      return greatArc;
	    };
	    greatArc.target = function(_) {
	      if (!arguments.length) return target;
	      target = _, target_ = typeof _ === "function" ? null : _;
	      return greatArc;
	    };
	    greatArc.precision = function() {
	      return arguments.length ? greatArc : 0;
	    };
	    return greatArc;
	  };
	  d3.geo.interpolate = function(source, target) {
	    return d3_geo_interpolate(source[0] * d3_radians, source[1] * d3_radians, target[0] * d3_radians, target[1] * d3_radians);
	  };
	  function d3_geo_interpolate(x0, y0, x1, y1) {
	    var cy0 = Math.cos(y0), sy0 = Math.sin(y0), cy1 = Math.cos(y1), sy1 = Math.sin(y1), kx0 = cy0 * Math.cos(x0), ky0 = cy0 * Math.sin(x0), kx1 = cy1 * Math.cos(x1), ky1 = cy1 * Math.sin(x1), d = 2 * Math.asin(Math.sqrt(d3_haversin(y1 - y0) + cy0 * cy1 * d3_haversin(x1 - x0))), k = 1 / Math.sin(d);
	    var interpolate = d ? function(t) {
	      var B = Math.sin(t *= d) * k, A = Math.sin(d - t) * k, x = A * kx0 + B * kx1, y = A * ky0 + B * ky1, z = A * sy0 + B * sy1;
	      return [ Math.atan2(y, x) * d3_degrees, Math.atan2(z, Math.sqrt(x * x + y * y)) * d3_degrees ];
	    } : function() {
	      return [ x0 * d3_degrees, y0 * d3_degrees ];
	    };
	    interpolate.distance = d;
	    return interpolate;
	  }
	  d3.geo.length = function(object) {
	    d3_geo_lengthSum = 0;
	    d3.geo.stream(object, d3_geo_length);
	    return d3_geo_lengthSum;
	  };
	  var d3_geo_lengthSum;
	  var d3_geo_length = {
	    sphere: d3_noop,
	    point: d3_noop,
	    lineStart: d3_geo_lengthLineStart,
	    lineEnd: d3_noop,
	    polygonStart: d3_noop,
	    polygonEnd: d3_noop
	  };
	  function d3_geo_lengthLineStart() {
	    var λ0, sinφ0, cosφ0;
	    d3_geo_length.point = function(λ, φ) {
	      λ0 = λ * d3_radians, sinφ0 = Math.sin(φ *= d3_radians), cosφ0 = Math.cos(φ);
	      d3_geo_length.point = nextPoint;
	    };
	    d3_geo_length.lineEnd = function() {
	      d3_geo_length.point = d3_geo_length.lineEnd = d3_noop;
	    };
	    function nextPoint(λ, φ) {
	      var sinφ = Math.sin(φ *= d3_radians), cosφ = Math.cos(φ), t = abs((λ *= d3_radians) - λ0), cosΔλ = Math.cos(t);
	      d3_geo_lengthSum += Math.atan2(Math.sqrt((t = cosφ * Math.sin(t)) * t + (t = cosφ0 * sinφ - sinφ0 * cosφ * cosΔλ) * t), sinφ0 * sinφ + cosφ0 * cosφ * cosΔλ);
	      λ0 = λ, sinφ0 = sinφ, cosφ0 = cosφ;
	    }
	  }
	  function d3_geo_azimuthal(scale, angle) {
	    function azimuthal(λ, φ) {
	      var cosλ = Math.cos(λ), cosφ = Math.cos(φ), k = scale(cosλ * cosφ);
	      return [ k * cosφ * Math.sin(λ), k * Math.sin(φ) ];
	    }
	    azimuthal.invert = function(x, y) {
	      var ρ = Math.sqrt(x * x + y * y), c = angle(ρ), sinc = Math.sin(c), cosc = Math.cos(c);
	      return [ Math.atan2(x * sinc, ρ * cosc), Math.asin(ρ && y * sinc / ρ) ];
	    };
	    return azimuthal;
	  }
	  var d3_geo_azimuthalEqualArea = d3_geo_azimuthal(function(cosλcosφ) {
	    return Math.sqrt(2 / (1 + cosλcosφ));
	  }, function(ρ) {
	    return 2 * Math.asin(ρ / 2);
	  });
	  (d3.geo.azimuthalEqualArea = function() {
	    return d3_geo_projection(d3_geo_azimuthalEqualArea);
	  }).raw = d3_geo_azimuthalEqualArea;
	  var d3_geo_azimuthalEquidistant = d3_geo_azimuthal(function(cosλcosφ) {
	    var c = Math.acos(cosλcosφ);
	    return c && c / Math.sin(c);
	  }, d3_identity);
	  (d3.geo.azimuthalEquidistant = function() {
	    return d3_geo_projection(d3_geo_azimuthalEquidistant);
	  }).raw = d3_geo_azimuthalEquidistant;
	  function d3_geo_conicConformal(φ0, φ1) {
	    var cosφ0 = Math.cos(φ0), t = function(φ) {
	      return Math.tan(π / 4 + φ / 2);
	    }, n = φ0 === φ1 ? Math.sin(φ0) : Math.log(cosφ0 / Math.cos(φ1)) / Math.log(t(φ1) / t(φ0)), F = cosφ0 * Math.pow(t(φ0), n) / n;
	    if (!n) return d3_geo_mercator;
	    function forward(λ, φ) {
	      if (F > 0) {
	        if (φ < -halfπ + ε) φ = -halfπ + ε;
	      } else {
	        if (φ > halfπ - ε) φ = halfπ - ε;
	      }
	      var ρ = F / Math.pow(t(φ), n);
	      return [ ρ * Math.sin(n * λ), F - ρ * Math.cos(n * λ) ];
	    }
	    forward.invert = function(x, y) {
	      var ρ0_y = F - y, ρ = d3_sgn(n) * Math.sqrt(x * x + ρ0_y * ρ0_y);
	      return [ Math.atan2(x, ρ0_y) / n, 2 * Math.atan(Math.pow(F / ρ, 1 / n)) - halfπ ];
	    };
	    return forward;
	  }
	  (d3.geo.conicConformal = function() {
	    return d3_geo_conic(d3_geo_conicConformal);
	  }).raw = d3_geo_conicConformal;
	  function d3_geo_conicEquidistant(φ0, φ1) {
	    var cosφ0 = Math.cos(φ0), n = φ0 === φ1 ? Math.sin(φ0) : (cosφ0 - Math.cos(φ1)) / (φ1 - φ0), G = cosφ0 / n + φ0;
	    if (abs(n) < ε) return d3_geo_equirectangular;
	    function forward(λ, φ) {
	      var ρ = G - φ;
	      return [ ρ * Math.sin(n * λ), G - ρ * Math.cos(n * λ) ];
	    }
	    forward.invert = function(x, y) {
	      var ρ0_y = G - y;
	      return [ Math.atan2(x, ρ0_y) / n, G - d3_sgn(n) * Math.sqrt(x * x + ρ0_y * ρ0_y) ];
	    };
	    return forward;
	  }
	  (d3.geo.conicEquidistant = function() {
	    return d3_geo_conic(d3_geo_conicEquidistant);
	  }).raw = d3_geo_conicEquidistant;
	  var d3_geo_gnomonic = d3_geo_azimuthal(function(cosλcosφ) {
	    return 1 / cosλcosφ;
	  }, Math.atan);
	  (d3.geo.gnomonic = function() {
	    return d3_geo_projection(d3_geo_gnomonic);
	  }).raw = d3_geo_gnomonic;
	  function d3_geo_mercator(λ, φ) {
	    return [ λ, Math.log(Math.tan(π / 4 + φ / 2)) ];
	  }
	  d3_geo_mercator.invert = function(x, y) {
	    return [ x, 2 * Math.atan(Math.exp(y)) - halfπ ];
	  };
	  function d3_geo_mercatorProjection(project) {
	    var m = d3_geo_projection(project), scale = m.scale, translate = m.translate, clipExtent = m.clipExtent, clipAuto;
	    m.scale = function() {
	      var v = scale.apply(m, arguments);
	      return v === m ? clipAuto ? m.clipExtent(null) : m : v;
	    };
	    m.translate = function() {
	      var v = translate.apply(m, arguments);
	      return v === m ? clipAuto ? m.clipExtent(null) : m : v;
	    };
	    m.clipExtent = function(_) {
	      var v = clipExtent.apply(m, arguments);
	      if (v === m) {
	        if (clipAuto = _ == null) {
	          var k = π * scale(), t = translate();
	          clipExtent([ [ t[0] - k, t[1] - k ], [ t[0] + k, t[1] + k ] ]);
	        }
	      } else if (clipAuto) {
	        v = null;
	      }
	      return v;
	    };
	    return m.clipExtent(null);
	  }
	  (d3.geo.mercator = function() {
	    return d3_geo_mercatorProjection(d3_geo_mercator);
	  }).raw = d3_geo_mercator;
	  var d3_geo_orthographic = d3_geo_azimuthal(function() {
	    return 1;
	  }, Math.asin);
	  (d3.geo.orthographic = function() {
	    return d3_geo_projection(d3_geo_orthographic);
	  }).raw = d3_geo_orthographic;
	  var d3_geo_stereographic = d3_geo_azimuthal(function(cosλcosφ) {
	    return 1 / (1 + cosλcosφ);
	  }, function(ρ) {
	    return 2 * Math.atan(ρ);
	  });
	  (d3.geo.stereographic = function() {
	    return d3_geo_projection(d3_geo_stereographic);
	  }).raw = d3_geo_stereographic;
	  function d3_geo_transverseMercator(λ, φ) {
	    return [ Math.log(Math.tan(π / 4 + φ / 2)), -λ ];
	  }
	  d3_geo_transverseMercator.invert = function(x, y) {
	    return [ -y, 2 * Math.atan(Math.exp(x)) - halfπ ];
	  };
	  (d3.geo.transverseMercator = function() {
	    var projection = d3_geo_mercatorProjection(d3_geo_transverseMercator), center = projection.center, rotate = projection.rotate;
	    projection.center = function(_) {
	      return _ ? center([ -_[1], _[0] ]) : (_ = center(), [ _[1], -_[0] ]);
	    };
	    projection.rotate = function(_) {
	      return _ ? rotate([ _[0], _[1], _.length > 2 ? _[2] + 90 : 90 ]) : (_ = rotate(), 
	      [ _[0], _[1], _[2] - 90 ]);
	    };
	    return rotate([ 0, 0, 90 ]);
	  }).raw = d3_geo_transverseMercator;
	  d3.geom = {};
	  function d3_geom_pointX(d) {
	    return d[0];
	  }
	  function d3_geom_pointY(d) {
	    return d[1];
	  }
	  d3.geom.hull = function(vertices) {
	    var x = d3_geom_pointX, y = d3_geom_pointY;
	    if (arguments.length) return hull(vertices);
	    function hull(data) {
	      if (data.length < 3) return [];
	      var fx = d3_functor(x), fy = d3_functor(y), i, n = data.length, points = [], flippedPoints = [];
	      for (i = 0; i < n; i++) {
	        points.push([ +fx.call(this, data[i], i), +fy.call(this, data[i], i), i ]);
	      }
	      points.sort(d3_geom_hullOrder);
	      for (i = 0; i < n; i++) flippedPoints.push([ points[i][0], -points[i][1] ]);
	      var upper = d3_geom_hullUpper(points), lower = d3_geom_hullUpper(flippedPoints);
	      var skipLeft = lower[0] === upper[0], skipRight = lower[lower.length - 1] === upper[upper.length - 1], polygon = [];
	      for (i = upper.length - 1; i >= 0; --i) polygon.push(data[points[upper[i]][2]]);
	      for (i = +skipLeft; i < lower.length - skipRight; ++i) polygon.push(data[points[lower[i]][2]]);
	      return polygon;
	    }
	    hull.x = function(_) {
	      return arguments.length ? (x = _, hull) : x;
	    };
	    hull.y = function(_) {
	      return arguments.length ? (y = _, hull) : y;
	    };
	    return hull;
	  };
	  function d3_geom_hullUpper(points) {
	    var n = points.length, hull = [ 0, 1 ], hs = 2;
	    for (var i = 2; i < n; i++) {
	      while (hs > 1 && d3_cross2d(points[hull[hs - 2]], points[hull[hs - 1]], points[i]) <= 0) --hs;
	      hull[hs++] = i;
	    }
	    return hull.slice(0, hs);
	  }
	  function d3_geom_hullOrder(a, b) {
	    return a[0] - b[0] || a[1] - b[1];
	  }
	  d3.geom.polygon = function(coordinates) {
	    d3_subclass(coordinates, d3_geom_polygonPrototype);
	    return coordinates;
	  };
	  var d3_geom_polygonPrototype = d3.geom.polygon.prototype = [];
	  d3_geom_polygonPrototype.area = function() {
	    var i = -1, n = this.length, a, b = this[n - 1], area = 0;
	    while (++i < n) {
	      a = b;
	      b = this[i];
	      area += a[1] * b[0] - a[0] * b[1];
	    }
	    return area * .5;
	  };
	  d3_geom_polygonPrototype.centroid = function(k) {
	    var i = -1, n = this.length, x = 0, y = 0, a, b = this[n - 1], c;
	    if (!arguments.length) k = -1 / (6 * this.area());
	    while (++i < n) {
	      a = b;
	      b = this[i];
	      c = a[0] * b[1] - b[0] * a[1];
	      x += (a[0] + b[0]) * c;
	      y += (a[1] + b[1]) * c;
	    }
	    return [ x * k, y * k ];
	  };
	  d3_geom_polygonPrototype.clip = function(subject) {
	    var input, closed = d3_geom_polygonClosed(subject), i = -1, n = this.length - d3_geom_polygonClosed(this), j, m, a = this[n - 1], b, c, d;
	    while (++i < n) {
	      input = subject.slice();
	      subject.length = 0;
	      b = this[i];
	      c = input[(m = input.length - closed) - 1];
	      j = -1;
	      while (++j < m) {
	        d = input[j];
	        if (d3_geom_polygonInside(d, a, b)) {
	          if (!d3_geom_polygonInside(c, a, b)) {
	            subject.push(d3_geom_polygonIntersect(c, d, a, b));
	          }
	          subject.push(d);
	        } else if (d3_geom_polygonInside(c, a, b)) {
	          subject.push(d3_geom_polygonIntersect(c, d, a, b));
	        }
	        c = d;
	      }
	      if (closed) subject.push(subject[0]);
	      a = b;
	    }
	    return subject;
	  };
	  function d3_geom_polygonInside(p, a, b) {
	    return (b[0] - a[0]) * (p[1] - a[1]) < (b[1] - a[1]) * (p[0] - a[0]);
	  }
	  function d3_geom_polygonIntersect(c, d, a, b) {
	    var x1 = c[0], x3 = a[0], x21 = d[0] - x1, x43 = b[0] - x3, y1 = c[1], y3 = a[1], y21 = d[1] - y1, y43 = b[1] - y3, ua = (x43 * (y1 - y3) - y43 * (x1 - x3)) / (y43 * x21 - x43 * y21);
	    return [ x1 + ua * x21, y1 + ua * y21 ];
	  }
	  function d3_geom_polygonClosed(coordinates) {
	    var a = coordinates[0], b = coordinates[coordinates.length - 1];
	    return !(a[0] - b[0] || a[1] - b[1]);
	  }
	  var d3_geom_voronoiEdges, d3_geom_voronoiCells, d3_geom_voronoiBeaches, d3_geom_voronoiBeachPool = [], d3_geom_voronoiFirstCircle, d3_geom_voronoiCircles, d3_geom_voronoiCirclePool = [];
	  function d3_geom_voronoiBeach() {
	    d3_geom_voronoiRedBlackNode(this);
	    this.edge = this.site = this.circle = null;
	  }
	  function d3_geom_voronoiCreateBeach(site) {
	    var beach = d3_geom_voronoiBeachPool.pop() || new d3_geom_voronoiBeach();
	    beach.site = site;
	    return beach;
	  }
	  function d3_geom_voronoiDetachBeach(beach) {
	    d3_geom_voronoiDetachCircle(beach);
	    d3_geom_voronoiBeaches.remove(beach);
	    d3_geom_voronoiBeachPool.push(beach);
	    d3_geom_voronoiRedBlackNode(beach);
	  }
	  function d3_geom_voronoiRemoveBeach(beach) {
	    var circle = beach.circle, x = circle.x, y = circle.cy, vertex = {
	      x: x,
	      y: y
	    }, previous = beach.P, next = beach.N, disappearing = [ beach ];
	    d3_geom_voronoiDetachBeach(beach);
	    var lArc = previous;
	    while (lArc.circle && abs(x - lArc.circle.x) < ε && abs(y - lArc.circle.cy) < ε) {
	      previous = lArc.P;
	      disappearing.unshift(lArc);
	      d3_geom_voronoiDetachBeach(lArc);
	      lArc = previous;
	    }
	    disappearing.unshift(lArc);
	    d3_geom_voronoiDetachCircle(lArc);
	    var rArc = next;
	    while (rArc.circle && abs(x - rArc.circle.x) < ε && abs(y - rArc.circle.cy) < ε) {
	      next = rArc.N;
	      disappearing.push(rArc);
	      d3_geom_voronoiDetachBeach(rArc);
	      rArc = next;
	    }
	    disappearing.push(rArc);
	    d3_geom_voronoiDetachCircle(rArc);
	    var nArcs = disappearing.length, iArc;
	    for (iArc = 1; iArc < nArcs; ++iArc) {
	      rArc = disappearing[iArc];
	      lArc = disappearing[iArc - 1];
	      d3_geom_voronoiSetEdgeEnd(rArc.edge, lArc.site, rArc.site, vertex);
	    }
	    lArc = disappearing[0];
	    rArc = disappearing[nArcs - 1];
	    rArc.edge = d3_geom_voronoiCreateEdge(lArc.site, rArc.site, null, vertex);
	    d3_geom_voronoiAttachCircle(lArc);
	    d3_geom_voronoiAttachCircle(rArc);
	  }
	  function d3_geom_voronoiAddBeach(site) {
	    var x = site.x, directrix = site.y, lArc, rArc, dxl, dxr, node = d3_geom_voronoiBeaches._;
	    while (node) {
	      dxl = d3_geom_voronoiLeftBreakPoint(node, directrix) - x;
	      if (dxl > ε) node = node.L; else {
	        dxr = x - d3_geom_voronoiRightBreakPoint(node, directrix);
	        if (dxr > ε) {
	          if (!node.R) {
	            lArc = node;
	            break;
	          }
	          node = node.R;
	        } else {
	          if (dxl > -ε) {
	            lArc = node.P;
	            rArc = node;
	          } else if (dxr > -ε) {
	            lArc = node;
	            rArc = node.N;
	          } else {
	            lArc = rArc = node;
	          }
	          break;
	        }
	      }
	    }
	    var newArc = d3_geom_voronoiCreateBeach(site);
	    d3_geom_voronoiBeaches.insert(lArc, newArc);
	    if (!lArc && !rArc) return;
	    if (lArc === rArc) {
	      d3_geom_voronoiDetachCircle(lArc);
	      rArc = d3_geom_voronoiCreateBeach(lArc.site);
	      d3_geom_voronoiBeaches.insert(newArc, rArc);
	      newArc.edge = rArc.edge = d3_geom_voronoiCreateEdge(lArc.site, newArc.site);
	      d3_geom_voronoiAttachCircle(lArc);
	      d3_geom_voronoiAttachCircle(rArc);
	      return;
	    }
	    if (!rArc) {
	      newArc.edge = d3_geom_voronoiCreateEdge(lArc.site, newArc.site);
	      return;
	    }
	    d3_geom_voronoiDetachCircle(lArc);
	    d3_geom_voronoiDetachCircle(rArc);
	    var lSite = lArc.site, ax = lSite.x, ay = lSite.y, bx = site.x - ax, by = site.y - ay, rSite = rArc.site, cx = rSite.x - ax, cy = rSite.y - ay, d = 2 * (bx * cy - by * cx), hb = bx * bx + by * by, hc = cx * cx + cy * cy, vertex = {
	      x: (cy * hb - by * hc) / d + ax,
	      y: (bx * hc - cx * hb) / d + ay
	    };
	    d3_geom_voronoiSetEdgeEnd(rArc.edge, lSite, rSite, vertex);
	    newArc.edge = d3_geom_voronoiCreateEdge(lSite, site, null, vertex);
	    rArc.edge = d3_geom_voronoiCreateEdge(site, rSite, null, vertex);
	    d3_geom_voronoiAttachCircle(lArc);
	    d3_geom_voronoiAttachCircle(rArc);
	  }
	  function d3_geom_voronoiLeftBreakPoint(arc, directrix) {
	    var site = arc.site, rfocx = site.x, rfocy = site.y, pby2 = rfocy - directrix;
	    if (!pby2) return rfocx;
	    var lArc = arc.P;
	    if (!lArc) return -Infinity;
	    site = lArc.site;
	    var lfocx = site.x, lfocy = site.y, plby2 = lfocy - directrix;
	    if (!plby2) return lfocx;
	    var hl = lfocx - rfocx, aby2 = 1 / pby2 - 1 / plby2, b = hl / plby2;
	    if (aby2) return (-b + Math.sqrt(b * b - 2 * aby2 * (hl * hl / (-2 * plby2) - lfocy + plby2 / 2 + rfocy - pby2 / 2))) / aby2 + rfocx;
	    return (rfocx + lfocx) / 2;
	  }
	  function d3_geom_voronoiRightBreakPoint(arc, directrix) {
	    var rArc = arc.N;
	    if (rArc) return d3_geom_voronoiLeftBreakPoint(rArc, directrix);
	    var site = arc.site;
	    return site.y === directrix ? site.x : Infinity;
	  }
	  function d3_geom_voronoiCell(site) {
	    this.site = site;
	    this.edges = [];
	  }
	  d3_geom_voronoiCell.prototype.prepare = function() {
	    var halfEdges = this.edges, iHalfEdge = halfEdges.length, edge;
	    while (iHalfEdge--) {
	      edge = halfEdges[iHalfEdge].edge;
	      if (!edge.b || !edge.a) halfEdges.splice(iHalfEdge, 1);
	    }
	    halfEdges.sort(d3_geom_voronoiHalfEdgeOrder);
	    return halfEdges.length;
	  };
	  function d3_geom_voronoiCloseCells(extent) {
	    var x0 = extent[0][0], x1 = extent[1][0], y0 = extent[0][1], y1 = extent[1][1], x2, y2, x3, y3, cells = d3_geom_voronoiCells, iCell = cells.length, cell, iHalfEdge, halfEdges, nHalfEdges, start, end;
	    while (iCell--) {
	      cell = cells[iCell];
	      if (!cell || !cell.prepare()) continue;
	      halfEdges = cell.edges;
	      nHalfEdges = halfEdges.length;
	      iHalfEdge = 0;
	      while (iHalfEdge < nHalfEdges) {
	        end = halfEdges[iHalfEdge].end(), x3 = end.x, y3 = end.y;
	        start = halfEdges[++iHalfEdge % nHalfEdges].start(), x2 = start.x, y2 = start.y;
	        if (abs(x3 - x2) > ε || abs(y3 - y2) > ε) {
	          halfEdges.splice(iHalfEdge, 0, new d3_geom_voronoiHalfEdge(d3_geom_voronoiCreateBorderEdge(cell.site, end, abs(x3 - x0) < ε && y1 - y3 > ε ? {
	            x: x0,
	            y: abs(x2 - x0) < ε ? y2 : y1
	          } : abs(y3 - y1) < ε && x1 - x3 > ε ? {
	            x: abs(y2 - y1) < ε ? x2 : x1,
	            y: y1
	          } : abs(x3 - x1) < ε && y3 - y0 > ε ? {
	            x: x1,
	            y: abs(x2 - x1) < ε ? y2 : y0
	          } : abs(y3 - y0) < ε && x3 - x0 > ε ? {
	            x: abs(y2 - y0) < ε ? x2 : x0,
	            y: y0
	          } : null), cell.site, null));
	          ++nHalfEdges;
	        }
	      }
	    }
	  }
	  function d3_geom_voronoiHalfEdgeOrder(a, b) {
	    return b.angle - a.angle;
	  }
	  function d3_geom_voronoiCircle() {
	    d3_geom_voronoiRedBlackNode(this);
	    this.x = this.y = this.arc = this.site = this.cy = null;
	  }
	  function d3_geom_voronoiAttachCircle(arc) {
	    var lArc = arc.P, rArc = arc.N;
	    if (!lArc || !rArc) return;
	    var lSite = lArc.site, cSite = arc.site, rSite = rArc.site;
	    if (lSite === rSite) return;
	    var bx = cSite.x, by = cSite.y, ax = lSite.x - bx, ay = lSite.y - by, cx = rSite.x - bx, cy = rSite.y - by;
	    var d = 2 * (ax * cy - ay * cx);
	    if (d >= -ε2) return;
	    var ha = ax * ax + ay * ay, hc = cx * cx + cy * cy, x = (cy * ha - ay * hc) / d, y = (ax * hc - cx * ha) / d, cy = y + by;
	    var circle = d3_geom_voronoiCirclePool.pop() || new d3_geom_voronoiCircle();
	    circle.arc = arc;
	    circle.site = cSite;
	    circle.x = x + bx;
	    circle.y = cy + Math.sqrt(x * x + y * y);
	    circle.cy = cy;
	    arc.circle = circle;
	    var before = null, node = d3_geom_voronoiCircles._;
	    while (node) {
	      if (circle.y < node.y || circle.y === node.y && circle.x <= node.x) {
	        if (node.L) node = node.L; else {
	          before = node.P;
	          break;
	        }
	      } else {
	        if (node.R) node = node.R; else {
	          before = node;
	          break;
	        }
	      }
	    }
	    d3_geom_voronoiCircles.insert(before, circle);
	    if (!before) d3_geom_voronoiFirstCircle = circle;
	  }
	  function d3_geom_voronoiDetachCircle(arc) {
	    var circle = arc.circle;
	    if (circle) {
	      if (!circle.P) d3_geom_voronoiFirstCircle = circle.N;
	      d3_geom_voronoiCircles.remove(circle);
	      d3_geom_voronoiCirclePool.push(circle);
	      d3_geom_voronoiRedBlackNode(circle);
	      arc.circle = null;
	    }
	  }
	  function d3_geom_voronoiClipEdges(extent) {
	    var edges = d3_geom_voronoiEdges, clip = d3_geom_clipLine(extent[0][0], extent[0][1], extent[1][0], extent[1][1]), i = edges.length, e;
	    while (i--) {
	      e = edges[i];
	      if (!d3_geom_voronoiConnectEdge(e, extent) || !clip(e) || abs(e.a.x - e.b.x) < ε && abs(e.a.y - e.b.y) < ε) {
	        e.a = e.b = null;
	        edges.splice(i, 1);
	      }
	    }
	  }
	  function d3_geom_voronoiConnectEdge(edge, extent) {
	    var vb = edge.b;
	    if (vb) return true;
	    var va = edge.a, x0 = extent[0][0], x1 = extent[1][0], y0 = extent[0][1], y1 = extent[1][1], lSite = edge.l, rSite = edge.r, lx = lSite.x, ly = lSite.y, rx = rSite.x, ry = rSite.y, fx = (lx + rx) / 2, fy = (ly + ry) / 2, fm, fb;
	    if (ry === ly) {
	      if (fx < x0 || fx >= x1) return;
	      if (lx > rx) {
	        if (!va) va = {
	          x: fx,
	          y: y0
	        }; else if (va.y >= y1) return;
	        vb = {
	          x: fx,
	          y: y1
	        };
	      } else {
	        if (!va) va = {
	          x: fx,
	          y: y1
	        }; else if (va.y < y0) return;
	        vb = {
	          x: fx,
	          y: y0
	        };
	      }
	    } else {
	      fm = (lx - rx) / (ry - ly);
	      fb = fy - fm * fx;
	      if (fm < -1 || fm > 1) {
	        if (lx > rx) {
	          if (!va) va = {
	            x: (y0 - fb) / fm,
	            y: y0
	          }; else if (va.y >= y1) return;
	          vb = {
	            x: (y1 - fb) / fm,
	            y: y1
	          };
	        } else {
	          if (!va) va = {
	            x: (y1 - fb) / fm,
	            y: y1
	          }; else if (va.y < y0) return;
	          vb = {
	            x: (y0 - fb) / fm,
	            y: y0
	          };
	        }
	      } else {
	        if (ly < ry) {
	          if (!va) va = {
	            x: x0,
	            y: fm * x0 + fb
	          }; else if (va.x >= x1) return;
	          vb = {
	            x: x1,
	            y: fm * x1 + fb
	          };
	        } else {
	          if (!va) va = {
	            x: x1,
	            y: fm * x1 + fb
	          }; else if (va.x < x0) return;
	          vb = {
	            x: x0,
	            y: fm * x0 + fb
	          };
	        }
	      }
	    }
	    edge.a = va;
	    edge.b = vb;
	    return true;
	  }
	  function d3_geom_voronoiEdge(lSite, rSite) {
	    this.l = lSite;
	    this.r = rSite;
	    this.a = this.b = null;
	  }
	  function d3_geom_voronoiCreateEdge(lSite, rSite, va, vb) {
	    var edge = new d3_geom_voronoiEdge(lSite, rSite);
	    d3_geom_voronoiEdges.push(edge);
	    if (va) d3_geom_voronoiSetEdgeEnd(edge, lSite, rSite, va);
	    if (vb) d3_geom_voronoiSetEdgeEnd(edge, rSite, lSite, vb);
	    d3_geom_voronoiCells[lSite.i].edges.push(new d3_geom_voronoiHalfEdge(edge, lSite, rSite));
	    d3_geom_voronoiCells[rSite.i].edges.push(new d3_geom_voronoiHalfEdge(edge, rSite, lSite));
	    return edge;
	  }
	  function d3_geom_voronoiCreateBorderEdge(lSite, va, vb) {
	    var edge = new d3_geom_voronoiEdge(lSite, null);
	    edge.a = va;
	    edge.b = vb;
	    d3_geom_voronoiEdges.push(edge);
	    return edge;
	  }
	  function d3_geom_voronoiSetEdgeEnd(edge, lSite, rSite, vertex) {
	    if (!edge.a && !edge.b) {
	      edge.a = vertex;
	      edge.l = lSite;
	      edge.r = rSite;
	    } else if (edge.l === rSite) {
	      edge.b = vertex;
	    } else {
	      edge.a = vertex;
	    }
	  }
	  function d3_geom_voronoiHalfEdge(edge, lSite, rSite) {
	    var va = edge.a, vb = edge.b;
	    this.edge = edge;
	    this.site = lSite;
	    this.angle = rSite ? Math.atan2(rSite.y - lSite.y, rSite.x - lSite.x) : edge.l === lSite ? Math.atan2(vb.x - va.x, va.y - vb.y) : Math.atan2(va.x - vb.x, vb.y - va.y);
	  }
	  d3_geom_voronoiHalfEdge.prototype = {
	    start: function() {
	      return this.edge.l === this.site ? this.edge.a : this.edge.b;
	    },
	    end: function() {
	      return this.edge.l === this.site ? this.edge.b : this.edge.a;
	    }
	  };
	  function d3_geom_voronoiRedBlackTree() {
	    this._ = null;
	  }
	  function d3_geom_voronoiRedBlackNode(node) {
	    node.U = node.C = node.L = node.R = node.P = node.N = null;
	  }
	  d3_geom_voronoiRedBlackTree.prototype = {
	    insert: function(after, node) {
	      var parent, grandpa, uncle;
	      if (after) {
	        node.P = after;
	        node.N = after.N;
	        if (after.N) after.N.P = node;
	        after.N = node;
	        if (after.R) {
	          after = after.R;
	          while (after.L) after = after.L;
	          after.L = node;
	        } else {
	          after.R = node;
	        }
	        parent = after;
	      } else if (this._) {
	        after = d3_geom_voronoiRedBlackFirst(this._);
	        node.P = null;
	        node.N = after;
	        after.P = after.L = node;
	        parent = after;
	      } else {
	        node.P = node.N = null;
	        this._ = node;
	        parent = null;
	      }
	      node.L = node.R = null;
	      node.U = parent;
	      node.C = true;
	      after = node;
	      while (parent && parent.C) {
	        grandpa = parent.U;
	        if (parent === grandpa.L) {
	          uncle = grandpa.R;
	          if (uncle && uncle.C) {
	            parent.C = uncle.C = false;
	            grandpa.C = true;
	            after = grandpa;
	          } else {
	            if (after === parent.R) {
	              d3_geom_voronoiRedBlackRotateLeft(this, parent);
	              after = parent;
	              parent = after.U;
	            }
	            parent.C = false;
	            grandpa.C = true;
	            d3_geom_voronoiRedBlackRotateRight(this, grandpa);
	          }
	        } else {
	          uncle = grandpa.L;
	          if (uncle && uncle.C) {
	            parent.C = uncle.C = false;
	            grandpa.C = true;
	            after = grandpa;
	          } else {
	            if (after === parent.L) {
	              d3_geom_voronoiRedBlackRotateRight(this, parent);
	              after = parent;
	              parent = after.U;
	            }
	            parent.C = false;
	            grandpa.C = true;
	            d3_geom_voronoiRedBlackRotateLeft(this, grandpa);
	          }
	        }
	        parent = after.U;
	      }
	      this._.C = false;
	    },
	    remove: function(node) {
	      if (node.N) node.N.P = node.P;
	      if (node.P) node.P.N = node.N;
	      node.N = node.P = null;
	      var parent = node.U, sibling, left = node.L, right = node.R, next, red;
	      if (!left) next = right; else if (!right) next = left; else next = d3_geom_voronoiRedBlackFirst(right);
	      if (parent) {
	        if (parent.L === node) parent.L = next; else parent.R = next;
	      } else {
	        this._ = next;
	      }
	      if (left && right) {
	        red = next.C;
	        next.C = node.C;
	        next.L = left;
	        left.U = next;
	        if (next !== right) {
	          parent = next.U;
	          next.U = node.U;
	          node = next.R;
	          parent.L = node;
	          next.R = right;
	          right.U = next;
	        } else {
	          next.U = parent;
	          parent = next;
	          node = next.R;
	        }
	      } else {
	        red = node.C;
	        node = next;
	      }
	      if (node) node.U = parent;
	      if (red) return;
	      if (node && node.C) {
	        node.C = false;
	        return;
	      }
	      do {
	        if (node === this._) break;
	        if (node === parent.L) {
	          sibling = parent.R;
	          if (sibling.C) {
	            sibling.C = false;
	            parent.C = true;
	            d3_geom_voronoiRedBlackRotateLeft(this, parent);
	            sibling = parent.R;
	          }
	          if (sibling.L && sibling.L.C || sibling.R && sibling.R.C) {
	            if (!sibling.R || !sibling.R.C) {
	              sibling.L.C = false;
	              sibling.C = true;
	              d3_geom_voronoiRedBlackRotateRight(this, sibling);
	              sibling = parent.R;
	            }
	            sibling.C = parent.C;
	            parent.C = sibling.R.C = false;
	            d3_geom_voronoiRedBlackRotateLeft(this, parent);
	            node = this._;
	            break;
	          }
	        } else {
	          sibling = parent.L;
	          if (sibling.C) {
	            sibling.C = false;
	            parent.C = true;
	            d3_geom_voronoiRedBlackRotateRight(this, parent);
	            sibling = parent.L;
	          }
	          if (sibling.L && sibling.L.C || sibling.R && sibling.R.C) {
	            if (!sibling.L || !sibling.L.C) {
	              sibling.R.C = false;
	              sibling.C = true;
	              d3_geom_voronoiRedBlackRotateLeft(this, sibling);
	              sibling = parent.L;
	            }
	            sibling.C = parent.C;
	            parent.C = sibling.L.C = false;
	            d3_geom_voronoiRedBlackRotateRight(this, parent);
	            node = this._;
	            break;
	          }
	        }
	        sibling.C = true;
	        node = parent;
	        parent = parent.U;
	      } while (!node.C);
	      if (node) node.C = false;
	    }
	  };
	  function d3_geom_voronoiRedBlackRotateLeft(tree, node) {
	    var p = node, q = node.R, parent = p.U;
	    if (parent) {
	      if (parent.L === p) parent.L = q; else parent.R = q;
	    } else {
	      tree._ = q;
	    }
	    q.U = parent;
	    p.U = q;
	    p.R = q.L;
	    if (p.R) p.R.U = p;
	    q.L = p;
	  }
	  function d3_geom_voronoiRedBlackRotateRight(tree, node) {
	    var p = node, q = node.L, parent = p.U;
	    if (parent) {
	      if (parent.L === p) parent.L = q; else parent.R = q;
	    } else {
	      tree._ = q;
	    }
	    q.U = parent;
	    p.U = q;
	    p.L = q.R;
	    if (p.L) p.L.U = p;
	    q.R = p;
	  }
	  function d3_geom_voronoiRedBlackFirst(node) {
	    while (node.L) node = node.L;
	    return node;
	  }
	  function d3_geom_voronoi(sites, bbox) {
	    var site = sites.sort(d3_geom_voronoiVertexOrder).pop(), x0, y0, circle;
	    d3_geom_voronoiEdges = [];
	    d3_geom_voronoiCells = new Array(sites.length);
	    d3_geom_voronoiBeaches = new d3_geom_voronoiRedBlackTree();
	    d3_geom_voronoiCircles = new d3_geom_voronoiRedBlackTree();
	    while (true) {
	      circle = d3_geom_voronoiFirstCircle;
	      if (site && (!circle || site.y < circle.y || site.y === circle.y && site.x < circle.x)) {
	        if (site.x !== x0 || site.y !== y0) {
	          d3_geom_voronoiCells[site.i] = new d3_geom_voronoiCell(site);
	          d3_geom_voronoiAddBeach(site);
	          x0 = site.x, y0 = site.y;
	        }
	        site = sites.pop();
	      } else if (circle) {
	        d3_geom_voronoiRemoveBeach(circle.arc);
	      } else {
	        break;
	      }
	    }
	    if (bbox) d3_geom_voronoiClipEdges(bbox), d3_geom_voronoiCloseCells(bbox);
	    var diagram = {
	      cells: d3_geom_voronoiCells,
	      edges: d3_geom_voronoiEdges
	    };
	    d3_geom_voronoiBeaches = d3_geom_voronoiCircles = d3_geom_voronoiEdges = d3_geom_voronoiCells = null;
	    return diagram;
	  }
	  function d3_geom_voronoiVertexOrder(a, b) {
	    return b.y - a.y || b.x - a.x;
	  }
	  d3.geom.voronoi = function(points) {
	    var x = d3_geom_pointX, y = d3_geom_pointY, fx = x, fy = y, clipExtent = d3_geom_voronoiClipExtent;
	    if (points) return voronoi(points);
	    function voronoi(data) {
	      var polygons = new Array(data.length), x0 = clipExtent[0][0], y0 = clipExtent[0][1], x1 = clipExtent[1][0], y1 = clipExtent[1][1];
	      d3_geom_voronoi(sites(data), clipExtent).cells.forEach(function(cell, i) {
	        var edges = cell.edges, site = cell.site, polygon = polygons[i] = edges.length ? edges.map(function(e) {
	          var s = e.start();
	          return [ s.x, s.y ];
	        }) : site.x >= x0 && site.x <= x1 && site.y >= y0 && site.y <= y1 ? [ [ x0, y1 ], [ x1, y1 ], [ x1, y0 ], [ x0, y0 ] ] : [];
	        polygon.point = data[i];
	      });
	      return polygons;
	    }
	    function sites(data) {
	      return data.map(function(d, i) {
	        return {
	          x: Math.round(fx(d, i) / ε) * ε,
	          y: Math.round(fy(d, i) / ε) * ε,
	          i: i
	        };
	      });
	    }
	    voronoi.links = function(data) {
	      return d3_geom_voronoi(sites(data)).edges.filter(function(edge) {
	        return edge.l && edge.r;
	      }).map(function(edge) {
	        return {
	          source: data[edge.l.i],
	          target: data[edge.r.i]
	        };
	      });
	    };
	    voronoi.triangles = function(data) {
	      var triangles = [];
	      d3_geom_voronoi(sites(data)).cells.forEach(function(cell, i) {
	        var site = cell.site, edges = cell.edges.sort(d3_geom_voronoiHalfEdgeOrder), j = -1, m = edges.length, e0, s0, e1 = edges[m - 1].edge, s1 = e1.l === site ? e1.r : e1.l;
	        while (++j < m) {
	          e0 = e1;
	          s0 = s1;
	          e1 = edges[j].edge;
	          s1 = e1.l === site ? e1.r : e1.l;
	          if (i < s0.i && i < s1.i && d3_geom_voronoiTriangleArea(site, s0, s1) < 0) {
	            triangles.push([ data[i], data[s0.i], data[s1.i] ]);
	          }
	        }
	      });
	      return triangles;
	    };
	    voronoi.x = function(_) {
	      return arguments.length ? (fx = d3_functor(x = _), voronoi) : x;
	    };
	    voronoi.y = function(_) {
	      return arguments.length ? (fy = d3_functor(y = _), voronoi) : y;
	    };
	    voronoi.clipExtent = function(_) {
	      if (!arguments.length) return clipExtent === d3_geom_voronoiClipExtent ? null : clipExtent;
	      clipExtent = _ == null ? d3_geom_voronoiClipExtent : _;
	      return voronoi;
	    };
	    voronoi.size = function(_) {
	      if (!arguments.length) return clipExtent === d3_geom_voronoiClipExtent ? null : clipExtent && clipExtent[1];
	      return voronoi.clipExtent(_ && [ [ 0, 0 ], _ ]);
	    };
	    return voronoi;
	  };
	  var d3_geom_voronoiClipExtent = [ [ -1e6, -1e6 ], [ 1e6, 1e6 ] ];
	  function d3_geom_voronoiTriangleArea(a, b, c) {
	    return (a.x - c.x) * (b.y - a.y) - (a.x - b.x) * (c.y - a.y);
	  }
	  d3.geom.delaunay = function(vertices) {
	    return d3.geom.voronoi().triangles(vertices);
	  };
	  d3.geom.quadtree = function(points, x1, y1, x2, y2) {
	    var x = d3_geom_pointX, y = d3_geom_pointY, compat;
	    if (compat = arguments.length) {
	      x = d3_geom_quadtreeCompatX;
	      y = d3_geom_quadtreeCompatY;
	      if (compat === 3) {
	        y2 = y1;
	        x2 = x1;
	        y1 = x1 = 0;
	      }
	      return quadtree(points);
	    }
	    function quadtree(data) {
	      var d, fx = d3_functor(x), fy = d3_functor(y), xs, ys, i, n, x1_, y1_, x2_, y2_;
	      if (x1 != null) {
	        x1_ = x1, y1_ = y1, x2_ = x2, y2_ = y2;
	      } else {
	        x2_ = y2_ = -(x1_ = y1_ = Infinity);
	        xs = [], ys = [];
	        n = data.length;
	        if (compat) for (i = 0; i < n; ++i) {
	          d = data[i];
	          if (d.x < x1_) x1_ = d.x;
	          if (d.y < y1_) y1_ = d.y;
	          if (d.x > x2_) x2_ = d.x;
	          if (d.y > y2_) y2_ = d.y;
	          xs.push(d.x);
	          ys.push(d.y);
	        } else for (i = 0; i < n; ++i) {
	          var x_ = +fx(d = data[i], i), y_ = +fy(d, i);
	          if (x_ < x1_) x1_ = x_;
	          if (y_ < y1_) y1_ = y_;
	          if (x_ > x2_) x2_ = x_;
	          if (y_ > y2_) y2_ = y_;
	          xs.push(x_);
	          ys.push(y_);
	        }
	      }
	      var dx = x2_ - x1_, dy = y2_ - y1_;
	      if (dx > dy) y2_ = y1_ + dx; else x2_ = x1_ + dy;
	      function insert(n, d, x, y, x1, y1, x2, y2) {
	        if (isNaN(x) || isNaN(y)) return;
	        if (n.leaf) {
	          var nx = n.x, ny = n.y;
	          if (nx != null) {
	            if (abs(nx - x) + abs(ny - y) < .01) {
	              insertChild(n, d, x, y, x1, y1, x2, y2);
	            } else {
	              var nPoint = n.point;
	              n.x = n.y = n.point = null;
	              insertChild(n, nPoint, nx, ny, x1, y1, x2, y2);
	              insertChild(n, d, x, y, x1, y1, x2, y2);
	            }
	          } else {
	            n.x = x, n.y = y, n.point = d;
	          }
	        } else {
	          insertChild(n, d, x, y, x1, y1, x2, y2);
	        }
	      }
	      function insertChild(n, d, x, y, x1, y1, x2, y2) {
	        var xm = (x1 + x2) * .5, ym = (y1 + y2) * .5, right = x >= xm, below = y >= ym, i = below << 1 | right;
	        n.leaf = false;
	        n = n.nodes[i] || (n.nodes[i] = d3_geom_quadtreeNode());
	        if (right) x1 = xm; else x2 = xm;
	        if (below) y1 = ym; else y2 = ym;
	        insert(n, d, x, y, x1, y1, x2, y2);
	      }
	      var root = d3_geom_quadtreeNode();
	      root.add = function(d) {
	        insert(root, d, +fx(d, ++i), +fy(d, i), x1_, y1_, x2_, y2_);
	      };
	      root.visit = function(f) {
	        d3_geom_quadtreeVisit(f, root, x1_, y1_, x2_, y2_);
	      };
	      root.find = function(point) {
	        return d3_geom_quadtreeFind(root, point[0], point[1], x1_, y1_, x2_, y2_);
	      };
	      i = -1;
	      if (x1 == null) {
	        while (++i < n) {
	          insert(root, data[i], xs[i], ys[i], x1_, y1_, x2_, y2_);
	        }
	        --i;
	      } else data.forEach(root.add);
	      xs = ys = data = d = null;
	      return root;
	    }
	    quadtree.x = function(_) {
	      return arguments.length ? (x = _, quadtree) : x;
	    };
	    quadtree.y = function(_) {
	      return arguments.length ? (y = _, quadtree) : y;
	    };
	    quadtree.extent = function(_) {
	      if (!arguments.length) return x1 == null ? null : [ [ x1, y1 ], [ x2, y2 ] ];
	      if (_ == null) x1 = y1 = x2 = y2 = null; else x1 = +_[0][0], y1 = +_[0][1], x2 = +_[1][0], 
	      y2 = +_[1][1];
	      return quadtree;
	    };
	    quadtree.size = function(_) {
	      if (!arguments.length) return x1 == null ? null : [ x2 - x1, y2 - y1 ];
	      if (_ == null) x1 = y1 = x2 = y2 = null; else x1 = y1 = 0, x2 = +_[0], y2 = +_[1];
	      return quadtree;
	    };
	    return quadtree;
	  };
	  function d3_geom_quadtreeCompatX(d) {
	    return d.x;
	  }
	  function d3_geom_quadtreeCompatY(d) {
	    return d.y;
	  }
	  function d3_geom_quadtreeNode() {
	    return {
	      leaf: true,
	      nodes: [],
	      point: null,
	      x: null,
	      y: null
	    };
	  }
	  function d3_geom_quadtreeVisit(f, node, x1, y1, x2, y2) {
	    if (!f(node, x1, y1, x2, y2)) {
	      var sx = (x1 + x2) * .5, sy = (y1 + y2) * .5, children = node.nodes;
	      if (children[0]) d3_geom_quadtreeVisit(f, children[0], x1, y1, sx, sy);
	      if (children[1]) d3_geom_quadtreeVisit(f, children[1], sx, y1, x2, sy);
	      if (children[2]) d3_geom_quadtreeVisit(f, children[2], x1, sy, sx, y2);
	      if (children[3]) d3_geom_quadtreeVisit(f, children[3], sx, sy, x2, y2);
	    }
	  }
	  function d3_geom_quadtreeFind(root, x, y, x0, y0, x3, y3) {
	    var minDistance2 = Infinity, closestPoint;
	    (function find(node, x1, y1, x2, y2) {
	      if (x1 > x3 || y1 > y3 || x2 < x0 || y2 < y0) return;
	      if (point = node.point) {
	        var point, dx = x - node.x, dy = y - node.y, distance2 = dx * dx + dy * dy;
	        if (distance2 < minDistance2) {
	          var distance = Math.sqrt(minDistance2 = distance2);
	          x0 = x - distance, y0 = y - distance;
	          x3 = x + distance, y3 = y + distance;
	          closestPoint = point;
	        }
	      }
	      var children = node.nodes, xm = (x1 + x2) * .5, ym = (y1 + y2) * .5, right = x >= xm, below = y >= ym;
	      for (var i = below << 1 | right, j = i + 4; i < j; ++i) {
	        if (node = children[i & 3]) switch (i & 3) {
	         case 0:
	          find(node, x1, y1, xm, ym);
	          break;
	
	         case 1:
	          find(node, xm, y1, x2, ym);
	          break;
	
	         case 2:
	          find(node, x1, ym, xm, y2);
	          break;
	
	         case 3:
	          find(node, xm, ym, x2, y2);
	          break;
	        }
	      }
	    })(root, x0, y0, x3, y3);
	    return closestPoint;
	  }
	  d3.interpolateRgb = d3_interpolateRgb;
	  function d3_interpolateRgb(a, b) {
	    a = d3.rgb(a);
	    b = d3.rgb(b);
	    var ar = a.r, ag = a.g, ab = a.b, br = b.r - ar, bg = b.g - ag, bb = b.b - ab;
	    return function(t) {
	      return "#" + d3_rgb_hex(Math.round(ar + br * t)) + d3_rgb_hex(Math.round(ag + bg * t)) + d3_rgb_hex(Math.round(ab + bb * t));
	    };
	  }
	  d3.interpolateObject = d3_interpolateObject;
	  function d3_interpolateObject(a, b) {
	    var i = {}, c = {}, k;
	    for (k in a) {
	      if (k in b) {
	        i[k] = d3_interpolate(a[k], b[k]);
	      } else {
	        c[k] = a[k];
	      }
	    }
	    for (k in b) {
	      if (!(k in a)) {
	        c[k] = b[k];
	      }
	    }
	    return function(t) {
	      for (k in i) c[k] = i[k](t);
	      return c;
	    };
	  }
	  d3.interpolateNumber = d3_interpolateNumber;
	  function d3_interpolateNumber(a, b) {
	    a = +a, b = +b;
	    return function(t) {
	      return a * (1 - t) + b * t;
	    };
	  }
	  d3.interpolateString = d3_interpolateString;
	  function d3_interpolateString(a, b) {
	    var bi = d3_interpolate_numberA.lastIndex = d3_interpolate_numberB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
	    a = a + "", b = b + "";
	    while ((am = d3_interpolate_numberA.exec(a)) && (bm = d3_interpolate_numberB.exec(b))) {
	      if ((bs = bm.index) > bi) {
	        bs = b.slice(bi, bs);
	        if (s[i]) s[i] += bs; else s[++i] = bs;
	      }
	      if ((am = am[0]) === (bm = bm[0])) {
	        if (s[i]) s[i] += bm; else s[++i] = bm;
	      } else {
	        s[++i] = null;
	        q.push({
	          i: i,
	          x: d3_interpolateNumber(am, bm)
	        });
	      }
	      bi = d3_interpolate_numberB.lastIndex;
	    }
	    if (bi < b.length) {
	      bs = b.slice(bi);
	      if (s[i]) s[i] += bs; else s[++i] = bs;
	    }
	    return s.length < 2 ? q[0] ? (b = q[0].x, function(t) {
	      return b(t) + "";
	    }) : function() {
	      return b;
	    } : (b = q.length, function(t) {
	      for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
	      return s.join("");
	    });
	  }
	  var d3_interpolate_numberA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, d3_interpolate_numberB = new RegExp(d3_interpolate_numberA.source, "g");
	  d3.interpolate = d3_interpolate;
	  function d3_interpolate(a, b) {
	    var i = d3.interpolators.length, f;
	    while (--i >= 0 && !(f = d3.interpolators[i](a, b))) ;
	    return f;
	  }
	  d3.interpolators = [ function(a, b) {
	    var t = typeof b;
	    return (t === "string" ? d3_rgb_names.has(b.toLowerCase()) || /^(#|rgb\(|hsl\()/i.test(b) ? d3_interpolateRgb : d3_interpolateString : b instanceof d3_color ? d3_interpolateRgb : Array.isArray(b) ? d3_interpolateArray : t === "object" && isNaN(b) ? d3_interpolateObject : d3_interpolateNumber)(a, b);
	  } ];
	  d3.interpolateArray = d3_interpolateArray;
	  function d3_interpolateArray(a, b) {
	    var x = [], c = [], na = a.length, nb = b.length, n0 = Math.min(a.length, b.length), i;
	    for (i = 0; i < n0; ++i) x.push(d3_interpolate(a[i], b[i]));
	    for (;i < na; ++i) c[i] = a[i];
	    for (;i < nb; ++i) c[i] = b[i];
	    return function(t) {
	      for (i = 0; i < n0; ++i) c[i] = x[i](t);
	      return c;
	    };
	  }
	  var d3_ease_default = function() {
	    return d3_identity;
	  };
	  var d3_ease = d3.map({
	    linear: d3_ease_default,
	    poly: d3_ease_poly,
	    quad: function() {
	      return d3_ease_quad;
	    },
	    cubic: function() {
	      return d3_ease_cubic;
	    },
	    sin: function() {
	      return d3_ease_sin;
	    },
	    exp: function() {
	      return d3_ease_exp;
	    },
	    circle: function() {
	      return d3_ease_circle;
	    },
	    elastic: d3_ease_elastic,
	    back: d3_ease_back,
	    bounce: function() {
	      return d3_ease_bounce;
	    }
	  });
	  var d3_ease_mode = d3.map({
	    "in": d3_identity,
	    out: d3_ease_reverse,
	    "in-out": d3_ease_reflect,
	    "out-in": function(f) {
	      return d3_ease_reflect(d3_ease_reverse(f));
	    }
	  });
	  d3.ease = function(name) {
	    var i = name.indexOf("-"), t = i >= 0 ? name.slice(0, i) : name, m = i >= 0 ? name.slice(i + 1) : "in";
	    t = d3_ease.get(t) || d3_ease_default;
	    m = d3_ease_mode.get(m) || d3_identity;
	    return d3_ease_clamp(m(t.apply(null, d3_arraySlice.call(arguments, 1))));
	  };
	  function d3_ease_clamp(f) {
	    return function(t) {
	      return t <= 0 ? 0 : t >= 1 ? 1 : f(t);
	    };
	  }
	  function d3_ease_reverse(f) {
	    return function(t) {
	      return 1 - f(1 - t);
	    };
	  }
	  function d3_ease_reflect(f) {
	    return function(t) {
	      return .5 * (t < .5 ? f(2 * t) : 2 - f(2 - 2 * t));
	    };
	  }
	  function d3_ease_quad(t) {
	    return t * t;
	  }
	  function d3_ease_cubic(t) {
	    return t * t * t;
	  }
	  function d3_ease_cubicInOut(t) {
	    if (t <= 0) return 0;
	    if (t >= 1) return 1;
	    var t2 = t * t, t3 = t2 * t;
	    return 4 * (t < .5 ? t3 : 3 * (t - t2) + t3 - .75);
	  }
	  function d3_ease_poly(e) {
	    return function(t) {
	      return Math.pow(t, e);
	    };
	  }
	  function d3_ease_sin(t) {
	    return 1 - Math.cos(t * halfπ);
	  }
	  function d3_ease_exp(t) {
	    return Math.pow(2, 10 * (t - 1));
	  }
	  function d3_ease_circle(t) {
	    return 1 - Math.sqrt(1 - t * t);
	  }
	  function d3_ease_elastic(a, p) {
	    var s;
	    if (arguments.length < 2) p = .45;
	    if (arguments.length) s = p / τ * Math.asin(1 / a); else a = 1, s = p / 4;
	    return function(t) {
	      return 1 + a * Math.pow(2, -10 * t) * Math.sin((t - s) * τ / p);
	    };
	  }
	  function d3_ease_back(s) {
	    if (!s) s = 1.70158;
	    return function(t) {
	      return t * t * ((s + 1) * t - s);
	    };
	  }
	  function d3_ease_bounce(t) {
	    return t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375;
	  }
	  d3.interpolateHcl = d3_interpolateHcl;
	  function d3_interpolateHcl(a, b) {
	    a = d3.hcl(a);
	    b = d3.hcl(b);
	    var ah = a.h, ac = a.c, al = a.l, bh = b.h - ah, bc = b.c - ac, bl = b.l - al;
	    if (isNaN(bc)) bc = 0, ac = isNaN(ac) ? b.c : ac;
	    if (isNaN(bh)) bh = 0, ah = isNaN(ah) ? b.h : ah; else if (bh > 180) bh -= 360; else if (bh < -180) bh += 360;
	    return function(t) {
	      return d3_hcl_lab(ah + bh * t, ac + bc * t, al + bl * t) + "";
	    };
	  }
	  d3.interpolateHsl = d3_interpolateHsl;
	  function d3_interpolateHsl(a, b) {
	    a = d3.hsl(a);
	    b = d3.hsl(b);
	    var ah = a.h, as = a.s, al = a.l, bh = b.h - ah, bs = b.s - as, bl = b.l - al;
	    if (isNaN(bs)) bs = 0, as = isNaN(as) ? b.s : as;
	    if (isNaN(bh)) bh = 0, ah = isNaN(ah) ? b.h : ah; else if (bh > 180) bh -= 360; else if (bh < -180) bh += 360;
	    return function(t) {
	      return d3_hsl_rgb(ah + bh * t, as + bs * t, al + bl * t) + "";
	    };
	  }
	  d3.interpolateLab = d3_interpolateLab;
	  function d3_interpolateLab(a, b) {
	    a = d3.lab(a);
	    b = d3.lab(b);
	    var al = a.l, aa = a.a, ab = a.b, bl = b.l - al, ba = b.a - aa, bb = b.b - ab;
	    return function(t) {
	      return d3_lab_rgb(al + bl * t, aa + ba * t, ab + bb * t) + "";
	    };
	  }
	  d3.interpolateRound = d3_interpolateRound;
	  function d3_interpolateRound(a, b) {
	    b -= a;
	    return function(t) {
	      return Math.round(a + b * t);
	    };
	  }
	  d3.transform = function(string) {
	    var g = d3_document.createElementNS(d3.ns.prefix.svg, "g");
	    return (d3.transform = function(string) {
	      if (string != null) {
	        g.setAttribute("transform", string);
	        var t = g.transform.baseVal.consolidate();
	      }
	      return new d3_transform(t ? t.matrix : d3_transformIdentity);
	    })(string);
	  };
	  function d3_transform(m) {
	    var r0 = [ m.a, m.b ], r1 = [ m.c, m.d ], kx = d3_transformNormalize(r0), kz = d3_transformDot(r0, r1), ky = d3_transformNormalize(d3_transformCombine(r1, r0, -kz)) || 0;
	    if (r0[0] * r1[1] < r1[0] * r0[1]) {
	      r0[0] *= -1;
	      r0[1] *= -1;
	      kx *= -1;
	      kz *= -1;
	    }
	    this.rotate = (kx ? Math.atan2(r0[1], r0[0]) : Math.atan2(-r1[0], r1[1])) * d3_degrees;
	    this.translate = [ m.e, m.f ];
	    this.scale = [ kx, ky ];
	    this.skew = ky ? Math.atan2(kz, ky) * d3_degrees : 0;
	  }
	  d3_transform.prototype.toString = function() {
	    return "translate(" + this.translate + ")rotate(" + this.rotate + ")skewX(" + this.skew + ")scale(" + this.scale + ")";
	  };
	  function d3_transformDot(a, b) {
	    return a[0] * b[0] + a[1] * b[1];
	  }
	  function d3_transformNormalize(a) {
	    var k = Math.sqrt(d3_transformDot(a, a));
	    if (k) {
	      a[0] /= k;
	      a[1] /= k;
	    }
	    return k;
	  }
	  function d3_transformCombine(a, b, k) {
	    a[0] += k * b[0];
	    a[1] += k * b[1];
	    return a;
	  }
	  var d3_transformIdentity = {
	    a: 1,
	    b: 0,
	    c: 0,
	    d: 1,
	    e: 0,
	    f: 0
	  };
	  d3.interpolateTransform = d3_interpolateTransform;
	  function d3_interpolateTransformPop(s) {
	    return s.length ? s.pop() + "," : "";
	  }
	  function d3_interpolateTranslate(ta, tb, s, q) {
	    if (ta[0] !== tb[0] || ta[1] !== tb[1]) {
	      var i = s.push("translate(", null, ",", null, ")");
	      q.push({
	        i: i - 4,
	        x: d3_interpolateNumber(ta[0], tb[0])
	      }, {
	        i: i - 2,
	        x: d3_interpolateNumber(ta[1], tb[1])
	      });
	    } else if (tb[0] || tb[1]) {
	      s.push("translate(" + tb + ")");
	    }
	  }
	  function d3_interpolateRotate(ra, rb, s, q) {
	    if (ra !== rb) {
	      if (ra - rb > 180) rb += 360; else if (rb - ra > 180) ra += 360;
	      q.push({
	        i: s.push(d3_interpolateTransformPop(s) + "rotate(", null, ")") - 2,
	        x: d3_interpolateNumber(ra, rb)
	      });
	    } else if (rb) {
	      s.push(d3_interpolateTransformPop(s) + "rotate(" + rb + ")");
	    }
	  }
	  function d3_interpolateSkew(wa, wb, s, q) {
	    if (wa !== wb) {
	      q.push({
	        i: s.push(d3_interpolateTransformPop(s) + "skewX(", null, ")") - 2,
	        x: d3_interpolateNumber(wa, wb)
	      });
	    } else if (wb) {
	      s.push(d3_interpolateTransformPop(s) + "skewX(" + wb + ")");
	    }
	  }
	  function d3_interpolateScale(ka, kb, s, q) {
	    if (ka[0] !== kb[0] || ka[1] !== kb[1]) {
	      var i = s.push(d3_interpolateTransformPop(s) + "scale(", null, ",", null, ")");
	      q.push({
	        i: i - 4,
	        x: d3_interpolateNumber(ka[0], kb[0])
	      }, {
	        i: i - 2,
	        x: d3_interpolateNumber(ka[1], kb[1])
	      });
	    } else if (kb[0] !== 1 || kb[1] !== 1) {
	      s.push(d3_interpolateTransformPop(s) + "scale(" + kb + ")");
	    }
	  }
	  function d3_interpolateTransform(a, b) {
	    var s = [], q = [];
	    a = d3.transform(a), b = d3.transform(b);
	    d3_interpolateTranslate(a.translate, b.translate, s, q);
	    d3_interpolateRotate(a.rotate, b.rotate, s, q);
	    d3_interpolateSkew(a.skew, b.skew, s, q);
	    d3_interpolateScale(a.scale, b.scale, s, q);
	    a = b = null;
	    return function(t) {
	      var i = -1, n = q.length, o;
	      while (++i < n) s[(o = q[i]).i] = o.x(t);
	      return s.join("");
	    };
	  }
	  function d3_uninterpolateNumber(a, b) {
	    b = (b -= a = +a) || 1 / b;
	    return function(x) {
	      return (x - a) / b;
	    };
	  }
	  function d3_uninterpolateClamp(a, b) {
	    b = (b -= a = +a) || 1 / b;
	    return function(x) {
	      return Math.max(0, Math.min(1, (x - a) / b));
	    };
	  }
	  d3.layout = {};
	  d3.layout.bundle = function() {
	    return function(links) {
	      var paths = [], i = -1, n = links.length;
	      while (++i < n) paths.push(d3_layout_bundlePath(links[i]));
	      return paths;
	    };
	  };
	  function d3_layout_bundlePath(link) {
	    var start = link.source, end = link.target, lca = d3_layout_bundleLeastCommonAncestor(start, end), points = [ start ];
	    while (start !== lca) {
	      start = start.parent;
	      points.push(start);
	    }
	    var k = points.length;
	    while (end !== lca) {
	      points.splice(k, 0, end);
	      end = end.parent;
	    }
	    return points;
	  }
	  function d3_layout_bundleAncestors(node) {
	    var ancestors = [], parent = node.parent;
	    while (parent != null) {
	      ancestors.push(node);
	      node = parent;
	      parent = parent.parent;
	    }
	    ancestors.push(node);
	    return ancestors;
	  }
	  function d3_layout_bundleLeastCommonAncestor(a, b) {
	    if (a === b) return a;
	    var aNodes = d3_layout_bundleAncestors(a), bNodes = d3_layout_bundleAncestors(b), aNode = aNodes.pop(), bNode = bNodes.pop(), sharedNode = null;
	    while (aNode === bNode) {
	      sharedNode = aNode;
	      aNode = aNodes.pop();
	      bNode = bNodes.pop();
	    }
	    return sharedNode;
	  }
	  d3.layout.chord = function() {
	    var chord = {}, chords, groups, matrix, n, padding = 0, sortGroups, sortSubgroups, sortChords;
	    function relayout() {
	      var subgroups = {}, groupSums = [], groupIndex = d3.range(n), subgroupIndex = [], k, x, x0, i, j;
	      chords = [];
	      groups = [];
	      k = 0, i = -1;
	      while (++i < n) {
	        x = 0, j = -1;
	        while (++j < n) {
	          x += matrix[i][j];
	        }
	        groupSums.push(x);
	        subgroupIndex.push(d3.range(n));
	        k += x;
	      }
	      if (sortGroups) {
	        groupIndex.sort(function(a, b) {
	          return sortGroups(groupSums[a], groupSums[b]);
	        });
	      }
	      if (sortSubgroups) {
	        subgroupIndex.forEach(function(d, i) {
	          d.sort(function(a, b) {
	            return sortSubgroups(matrix[i][a], matrix[i][b]);
	          });
	        });
	      }
	      k = (τ - padding * n) / k;
	      x = 0, i = -1;
	      while (++i < n) {
	        x0 = x, j = -1;
	        while (++j < n) {
	          var di = groupIndex[i], dj = subgroupIndex[di][j], v = matrix[di][dj], a0 = x, a1 = x += v * k;
	          subgroups[di + "-" + dj] = {
	            index: di,
	            subindex: dj,
	            startAngle: a0,
	            endAngle: a1,
	            value: v
	          };
	        }
	        groups[di] = {
	          index: di,
	          startAngle: x0,
	          endAngle: x,
	          value: groupSums[di]
	        };
	        x += padding;
	      }
	      i = -1;
	      while (++i < n) {
	        j = i - 1;
	        while (++j < n) {
	          var source = subgroups[i + "-" + j], target = subgroups[j + "-" + i];
	          if (source.value || target.value) {
	            chords.push(source.value < target.value ? {
	              source: target,
	              target: source
	            } : {
	              source: source,
	              target: target
	            });
	          }
	        }
	      }
	      if (sortChords) resort();
	    }
	    function resort() {
	      chords.sort(function(a, b) {
	        return sortChords((a.source.value + a.target.value) / 2, (b.source.value + b.target.value) / 2);
	      });
	    }
	    chord.matrix = function(x) {
	      if (!arguments.length) return matrix;
	      n = (matrix = x) && matrix.length;
	      chords = groups = null;
	      return chord;
	    };
	    chord.padding = function(x) {
	      if (!arguments.length) return padding;
	      padding = x;
	      chords = groups = null;
	      return chord;
	    };
	    chord.sortGroups = function(x) {
	      if (!arguments.length) return sortGroups;
	      sortGroups = x;
	      chords = groups = null;
	      return chord;
	    };
	    chord.sortSubgroups = function(x) {
	      if (!arguments.length) return sortSubgroups;
	      sortSubgroups = x;
	      chords = null;
	      return chord;
	    };
	    chord.sortChords = function(x) {
	      if (!arguments.length) return sortChords;
	      sortChords = x;
	      if (chords) resort();
	      return chord;
	    };
	    chord.chords = function() {
	      if (!chords) relayout();
	      return chords;
	    };
	    chord.groups = function() {
	      if (!groups) relayout();
	      return groups;
	    };
	    return chord;
	  };
	  d3.layout.force = function() {
	    var force = {}, event = d3.dispatch("start", "tick", "end"), timer, size = [ 1, 1 ], drag, alpha, friction = .9, linkDistance = d3_layout_forceLinkDistance, linkStrength = d3_layout_forceLinkStrength, charge = -30, chargeDistance2 = d3_layout_forceChargeDistance2, gravity = .1, theta2 = .64, nodes = [], links = [], distances, strengths, charges;
	    function repulse(node) {
	      return function(quad, x1, _, x2) {
	        if (quad.point !== node) {
	          var dx = quad.cx - node.x, dy = quad.cy - node.y, dw = x2 - x1, dn = dx * dx + dy * dy;
	          if (dw * dw / theta2 < dn) {
	            if (dn < chargeDistance2) {
	              var k = quad.charge / dn;
	              node.px -= dx * k;
	              node.py -= dy * k;
	            }
	            return true;
	          }
	          if (quad.point && dn && dn < chargeDistance2) {
	            var k = quad.pointCharge / dn;
	            node.px -= dx * k;
	            node.py -= dy * k;
	          }
	        }
	        return !quad.charge;
	      };
	    }
	    force.tick = function() {
	      if ((alpha *= .99) < .005) {
	        timer = null;
	        event.end({
	          type: "end",
	          alpha: alpha = 0
	        });
	        return true;
	      }
	      var n = nodes.length, m = links.length, q, i, o, s, t, l, k, x, y;
	      for (i = 0; i < m; ++i) {
	        o = links[i];
	        s = o.source;
	        t = o.target;
	        x = t.x - s.x;
	        y = t.y - s.y;
	        if (l = x * x + y * y) {
	          l = alpha * strengths[i] * ((l = Math.sqrt(l)) - distances[i]) / l;
	          x *= l;
	          y *= l;
	          t.x -= x * (k = s.weight + t.weight ? s.weight / (s.weight + t.weight) : .5);
	          t.y -= y * k;
	          s.x += x * (k = 1 - k);
	          s.y += y * k;
	        }
	      }
	      if (k = alpha * gravity) {
	        x = size[0] / 2;
	        y = size[1] / 2;
	        i = -1;
	        if (k) while (++i < n) {
	          o = nodes[i];
	          o.x += (x - o.x) * k;
	          o.y += (y - o.y) * k;
	        }
	      }
	      if (charge) {
	        d3_layout_forceAccumulate(q = d3.geom.quadtree(nodes), alpha, charges);
	        i = -1;
	        while (++i < n) {
	          if (!(o = nodes[i]).fixed) {
	            q.visit(repulse(o));
	          }
	        }
	      }
	      i = -1;
	      while (++i < n) {
	        o = nodes[i];
	        if (o.fixed) {
	          o.x = o.px;
	          o.y = o.py;
	        } else {
	          o.x -= (o.px - (o.px = o.x)) * friction;
	          o.y -= (o.py - (o.py = o.y)) * friction;
	        }
	      }
	      event.tick({
	        type: "tick",
	        alpha: alpha
	      });
	    };
	    force.nodes = function(x) {
	      if (!arguments.length) return nodes;
	      nodes = x;
	      return force;
	    };
	    force.links = function(x) {
	      if (!arguments.length) return links;
	      links = x;
	      return force;
	    };
	    force.size = function(x) {
	      if (!arguments.length) return size;
	      size = x;
	      return force;
	    };
	    force.linkDistance = function(x) {
	      if (!arguments.length) return linkDistance;
	      linkDistance = typeof x === "function" ? x : +x;
	      return force;
	    };
	    force.distance = force.linkDistance;
	    force.linkStrength = function(x) {
	      if (!arguments.length) return linkStrength;
	      linkStrength = typeof x === "function" ? x : +x;
	      return force;
	    };
	    force.friction = function(x) {
	      if (!arguments.length) return friction;
	      friction = +x;
	      return force;
	    };
	    force.charge = function(x) {
	      if (!arguments.length) return charge;
	      charge = typeof x === "function" ? x : +x;
	      return force;
	    };
	    force.chargeDistance = function(x) {
	      if (!arguments.length) return Math.sqrt(chargeDistance2);
	      chargeDistance2 = x * x;
	      return force;
	    };
	    force.gravity = function(x) {
	      if (!arguments.length) return gravity;
	      gravity = +x;
	      return force;
	    };
	    force.theta = function(x) {
	      if (!arguments.length) return Math.sqrt(theta2);
	      theta2 = x * x;
	      return force;
	    };
	    force.alpha = function(x) {
	      if (!arguments.length) return alpha;
	      x = +x;
	      if (alpha) {
	        if (x > 0) {
	          alpha = x;
	        } else {
	          timer.c = null, timer.t = NaN, timer = null;
	          event.end({
	            type: "end",
	            alpha: alpha = 0
	          });
	        }
	      } else if (x > 0) {
	        event.start({
	          type: "start",
	          alpha: alpha = x
	        });
	        timer = d3_timer(force.tick);
	      }
	      return force;
	    };
	    force.start = function() {
	      var i, n = nodes.length, m = links.length, w = size[0], h = size[1], neighbors, o;
	      for (i = 0; i < n; ++i) {
	        (o = nodes[i]).index = i;
	        o.weight = 0;
	      }
	      for (i = 0; i < m; ++i) {
	        o = links[i];
	        if (typeof o.source == "number") o.source = nodes[o.source];
	        if (typeof o.target == "number") o.target = nodes[o.target];
	        ++o.source.weight;
	        ++o.target.weight;
	      }
	      for (i = 0; i < n; ++i) {
	        o = nodes[i];
	        if (isNaN(o.x)) o.x = position("x", w);
	        if (isNaN(o.y)) o.y = position("y", h);
	        if (isNaN(o.px)) o.px = o.x;
	        if (isNaN(o.py)) o.py = o.y;
	      }
	      distances = [];
	      if (typeof linkDistance === "function") for (i = 0; i < m; ++i) distances[i] = +linkDistance.call(this, links[i], i); else for (i = 0; i < m; ++i) distances[i] = linkDistance;
	      strengths = [];
	      if (typeof linkStrength === "function") for (i = 0; i < m; ++i) strengths[i] = +linkStrength.call(this, links[i], i); else for (i = 0; i < m; ++i) strengths[i] = linkStrength;
	      charges = [];
	      if (typeof charge === "function") for (i = 0; i < n; ++i) charges[i] = +charge.call(this, nodes[i], i); else for (i = 0; i < n; ++i) charges[i] = charge;
	      function position(dimension, size) {
	        if (!neighbors) {
	          neighbors = new Array(n);
	          for (j = 0; j < n; ++j) {
	            neighbors[j] = [];
	          }
	          for (j = 0; j < m; ++j) {
	            var o = links[j];
	            neighbors[o.source.index].push(o.target);
	            neighbors[o.target.index].push(o.source);
	          }
	        }
	        var candidates = neighbors[i], j = -1, l = candidates.length, x;
	        while (++j < l) if (!isNaN(x = candidates[j][dimension])) return x;
	        return Math.random() * size;
	      }
	      return force.resume();
	    };
	    force.resume = function() {
	      return force.alpha(.1);
	    };
	    force.stop = function() {
	      return force.alpha(0);
	    };
	    force.drag = function() {
	      if (!drag) drag = d3.behavior.drag().origin(d3_identity).on("dragstart.force", d3_layout_forceDragstart).on("drag.force", dragmove).on("dragend.force", d3_layout_forceDragend);
	      if (!arguments.length) return drag;
	      this.on("mouseover.force", d3_layout_forceMouseover).on("mouseout.force", d3_layout_forceMouseout).call(drag);
	    };
	    function dragmove(d) {
	      d.px = d3.event.x, d.py = d3.event.y;
	      force.resume();
	    }
	    return d3.rebind(force, event, "on");
	  };
	  function d3_layout_forceDragstart(d) {
	    d.fixed |= 2;
	  }
	  function d3_layout_forceDragend(d) {
	    d.fixed &= ~6;
	  }
	  function d3_layout_forceMouseover(d) {
	    d.fixed |= 4;
	    d.px = d.x, d.py = d.y;
	  }
	  function d3_layout_forceMouseout(d) {
	    d.fixed &= ~4;
	  }
	  function d3_layout_forceAccumulate(quad, alpha, charges) {
	    var cx = 0, cy = 0;
	    quad.charge = 0;
	    if (!quad.leaf) {
	      var nodes = quad.nodes, n = nodes.length, i = -1, c;
	      while (++i < n) {
	        c = nodes[i];
	        if (c == null) continue;
	        d3_layout_forceAccumulate(c, alpha, charges);
	        quad.charge += c.charge;
	        cx += c.charge * c.cx;
	        cy += c.charge * c.cy;
	      }
	    }
	    if (quad.point) {
	      if (!quad.leaf) {
	        quad.point.x += Math.random() - .5;
	        quad.point.y += Math.random() - .5;
	      }
	      var k = alpha * charges[quad.point.index];
	      quad.charge += quad.pointCharge = k;
	      cx += k * quad.point.x;
	      cy += k * quad.point.y;
	    }
	    quad.cx = cx / quad.charge;
	    quad.cy = cy / quad.charge;
	  }
	  var d3_layout_forceLinkDistance = 20, d3_layout_forceLinkStrength = 1, d3_layout_forceChargeDistance2 = Infinity;
	  d3.layout.hierarchy = function() {
	    var sort = d3_layout_hierarchySort, children = d3_layout_hierarchyChildren, value = d3_layout_hierarchyValue;
	    function hierarchy(root) {
	      var stack = [ root ], nodes = [], node;
	      root.depth = 0;
	      while ((node = stack.pop()) != null) {
	        nodes.push(node);
	        if ((childs = children.call(hierarchy, node, node.depth)) && (n = childs.length)) {
	          var n, childs, child;
	          while (--n >= 0) {
	            stack.push(child = childs[n]);
	            child.parent = node;
	            child.depth = node.depth + 1;
	          }
	          if (value) node.value = 0;
	          node.children = childs;
	        } else {
	          if (value) node.value = +value.call(hierarchy, node, node.depth) || 0;
	          delete node.children;
	        }
	      }
	      d3_layout_hierarchyVisitAfter(root, function(node) {
	        var childs, parent;
	        if (sort && (childs = node.children)) childs.sort(sort);
	        if (value && (parent = node.parent)) parent.value += node.value;
	      });
	      return nodes;
	    }
	    hierarchy.sort = function(x) {
	      if (!arguments.length) return sort;
	      sort = x;
	      return hierarchy;
	    };
	    hierarchy.children = function(x) {
	      if (!arguments.length) return children;
	      children = x;
	      return hierarchy;
	    };
	    hierarchy.value = function(x) {
	      if (!arguments.length) return value;
	      value = x;
	      return hierarchy;
	    };
	    hierarchy.revalue = function(root) {
	      if (value) {
	        d3_layout_hierarchyVisitBefore(root, function(node) {
	          if (node.children) node.value = 0;
	        });
	        d3_layout_hierarchyVisitAfter(root, function(node) {
	          var parent;
	          if (!node.children) node.value = +value.call(hierarchy, node, node.depth) || 0;
	          if (parent = node.parent) parent.value += node.value;
	        });
	      }
	      return root;
	    };
	    return hierarchy;
	  };
	  function d3_layout_hierarchyRebind(object, hierarchy) {
	    d3.rebind(object, hierarchy, "sort", "children", "value");
	    object.nodes = object;
	    object.links = d3_layout_hierarchyLinks;
	    return object;
	  }
	  function d3_layout_hierarchyVisitBefore(node, callback) {
	    var nodes = [ node ];
	    while ((node = nodes.pop()) != null) {
	      callback(node);
	      if ((children = node.children) && (n = children.length)) {
	        var n, children;
	        while (--n >= 0) nodes.push(children[n]);
	      }
	    }
	  }
	  function d3_layout_hierarchyVisitAfter(node, callback) {
	    var nodes = [ node ], nodes2 = [];
	    while ((node = nodes.pop()) != null) {
	      nodes2.push(node);
	      if ((children = node.children) && (n = children.length)) {
	        var i = -1, n, children;
	        while (++i < n) nodes.push(children[i]);
	      }
	    }
	    while ((node = nodes2.pop()) != null) {
	      callback(node);
	    }
	  }
	  function d3_layout_hierarchyChildren(d) {
	    return d.children;
	  }
	  function d3_layout_hierarchyValue(d) {
	    return d.value;
	  }
	  function d3_layout_hierarchySort(a, b) {
	    return b.value - a.value;
	  }
	  function d3_layout_hierarchyLinks(nodes) {
	    return d3.merge(nodes.map(function(parent) {
	      return (parent.children || []).map(function(child) {
	        return {
	          source: parent,
	          target: child
	        };
	      });
	    }));
	  }
	  d3.layout.partition = function() {
	    var hierarchy = d3.layout.hierarchy(), size = [ 1, 1 ];
	    function position(node, x, dx, dy) {
	      var children = node.children;
	      node.x = x;
	      node.y = node.depth * dy;
	      node.dx = dx;
	      node.dy = dy;
	      if (children && (n = children.length)) {
	        var i = -1, n, c, d;
	        dx = node.value ? dx / node.value : 0;
	        while (++i < n) {
	          position(c = children[i], x, d = c.value * dx, dy);
	          x += d;
	        }
	      }
	    }
	    function depth(node) {
	      var children = node.children, d = 0;
	      if (children && (n = children.length)) {
	        var i = -1, n;
	        while (++i < n) d = Math.max(d, depth(children[i]));
	      }
	      return 1 + d;
	    }
	    function partition(d, i) {
	      var nodes = hierarchy.call(this, d, i);
	      position(nodes[0], 0, size[0], size[1] / depth(nodes[0]));
	      return nodes;
	    }
	    partition.size = function(x) {
	      if (!arguments.length) return size;
	      size = x;
	      return partition;
	    };
	    return d3_layout_hierarchyRebind(partition, hierarchy);
	  };
	  d3.layout.pie = function() {
	    var value = Number, sort = d3_layout_pieSortByValue, startAngle = 0, endAngle = τ, padAngle = 0;
	    function pie(data) {
	      var n = data.length, values = data.map(function(d, i) {
	        return +value.call(pie, d, i);
	      }), a = +(typeof startAngle === "function" ? startAngle.apply(this, arguments) : startAngle), da = (typeof endAngle === "function" ? endAngle.apply(this, arguments) : endAngle) - a, p = Math.min(Math.abs(da) / n, +(typeof padAngle === "function" ? padAngle.apply(this, arguments) : padAngle)), pa = p * (da < 0 ? -1 : 1), sum = d3.sum(values), k = sum ? (da - n * pa) / sum : 0, index = d3.range(n), arcs = [], v;
	      if (sort != null) index.sort(sort === d3_layout_pieSortByValue ? function(i, j) {
	        return values[j] - values[i];
	      } : function(i, j) {
	        return sort(data[i], data[j]);
	      });
	      index.forEach(function(i) {
	        arcs[i] = {
	          data: data[i],
	          value: v = values[i],
	          startAngle: a,
	          endAngle: a += v * k + pa,
	          padAngle: p
	        };
	      });
	      return arcs;
	    }
	    pie.value = function(_) {
	      if (!arguments.length) return value;
	      value = _;
	      return pie;
	    };
	    pie.sort = function(_) {
	      if (!arguments.length) return sort;
	      sort = _;
	      return pie;
	    };
	    pie.startAngle = function(_) {
	      if (!arguments.length) return startAngle;
	      startAngle = _;
	      return pie;
	    };
	    pie.endAngle = function(_) {
	      if (!arguments.length) return endAngle;
	      endAngle = _;
	      return pie;
	    };
	    pie.padAngle = function(_) {
	      if (!arguments.length) return padAngle;
	      padAngle = _;
	      return pie;
	    };
	    return pie;
	  };
	  var d3_layout_pieSortByValue = {};
	  d3.layout.stack = function() {
	    var values = d3_identity, order = d3_layout_stackOrderDefault, offset = d3_layout_stackOffsetZero, out = d3_layout_stackOut, x = d3_layout_stackX, y = d3_layout_stackY;
	    function stack(data, index) {
	      if (!(n = data.length)) return data;
	      var series = data.map(function(d, i) {
	        return values.call(stack, d, i);
	      });
	      var points = series.map(function(d) {
	        return d.map(function(v, i) {
	          return [ x.call(stack, v, i), y.call(stack, v, i) ];
	        });
	      });
	      var orders = order.call(stack, points, index);
	      series = d3.permute(series, orders);
	      points = d3.permute(points, orders);
	      var offsets = offset.call(stack, points, index);
	      var m = series[0].length, n, i, j, o;
	      for (j = 0; j < m; ++j) {
	        out.call(stack, series[0][j], o = offsets[j], points[0][j][1]);
	        for (i = 1; i < n; ++i) {
	          out.call(stack, series[i][j], o += points[i - 1][j][1], points[i][j][1]);
	        }
	      }
	      return data;
	    }
	    stack.values = function(x) {
	      if (!arguments.length) return values;
	      values = x;
	      return stack;
	    };
	    stack.order = function(x) {
	      if (!arguments.length) return order;
	      order = typeof x === "function" ? x : d3_layout_stackOrders.get(x) || d3_layout_stackOrderDefault;
	      return stack;
	    };
	    stack.offset = function(x) {
	      if (!arguments.length) return offset;
	      offset = typeof x === "function" ? x : d3_layout_stackOffsets.get(x) || d3_layout_stackOffsetZero;
	      return stack;
	    };
	    stack.x = function(z) {
	      if (!arguments.length) return x;
	      x = z;
	      return stack;
	    };
	    stack.y = function(z) {
	      if (!arguments.length) return y;
	      y = z;
	      return stack;
	    };
	    stack.out = function(z) {
	      if (!arguments.length) return out;
	      out = z;
	      return stack;
	    };
	    return stack;
	  };
	  function d3_layout_stackX(d) {
	    return d.x;
	  }
	  function d3_layout_stackY(d) {
	    return d.y;
	  }
	  function d3_layout_stackOut(d, y0, y) {
	    d.y0 = y0;
	    d.y = y;
	  }
	  var d3_layout_stackOrders = d3.map({
	    "inside-out": function(data) {
	      var n = data.length, i, j, max = data.map(d3_layout_stackMaxIndex), sums = data.map(d3_layout_stackReduceSum), index = d3.range(n).sort(function(a, b) {
	        return max[a] - max[b];
	      }), top = 0, bottom = 0, tops = [], bottoms = [];
	      for (i = 0; i < n; ++i) {
	        j = index[i];
	        if (top < bottom) {
	          top += sums[j];
	          tops.push(j);
	        } else {
	          bottom += sums[j];
	          bottoms.push(j);
	        }
	      }
	      return bottoms.reverse().concat(tops);
	    },
	    reverse: function(data) {
	      return d3.range(data.length).reverse();
	    },
	    "default": d3_layout_stackOrderDefault
	  });
	  var d3_layout_stackOffsets = d3.map({
	    silhouette: function(data) {
	      var n = data.length, m = data[0].length, sums = [], max = 0, i, j, o, y0 = [];
	      for (j = 0; j < m; ++j) {
	        for (i = 0, o = 0; i < n; i++) o += data[i][j][1];
	        if (o > max) max = o;
	        sums.push(o);
	      }
	      for (j = 0; j < m; ++j) {
	        y0[j] = (max - sums[j]) / 2;
	      }
	      return y0;
	    },
	    wiggle: function(data) {
	      var n = data.length, x = data[0], m = x.length, i, j, k, s1, s2, s3, dx, o, o0, y0 = [];
	      y0[0] = o = o0 = 0;
	      for (j = 1; j < m; ++j) {
	        for (i = 0, s1 = 0; i < n; ++i) s1 += data[i][j][1];
	        for (i = 0, s2 = 0, dx = x[j][0] - x[j - 1][0]; i < n; ++i) {
	          for (k = 0, s3 = (data[i][j][1] - data[i][j - 1][1]) / (2 * dx); k < i; ++k) {
	            s3 += (data[k][j][1] - data[k][j - 1][1]) / dx;
	          }
	          s2 += s3 * data[i][j][1];
	        }
	        y0[j] = o -= s1 ? s2 / s1 * dx : 0;
	        if (o < o0) o0 = o;
	      }
	      for (j = 0; j < m; ++j) y0[j] -= o0;
	      return y0;
	    },
	    expand: function(data) {
	      var n = data.length, m = data[0].length, k = 1 / n, i, j, o, y0 = [];
	      for (j = 0; j < m; ++j) {
	        for (i = 0, o = 0; i < n; i++) o += data[i][j][1];
	        if (o) for (i = 0; i < n; i++) data[i][j][1] /= o; else for (i = 0; i < n; i++) data[i][j][1] = k;
	      }
	      for (j = 0; j < m; ++j) y0[j] = 0;
	      return y0;
	    },
	    zero: d3_layout_stackOffsetZero
	  });
	  function d3_layout_stackOrderDefault(data) {
	    return d3.range(data.length);
	  }
	  function d3_layout_stackOffsetZero(data) {
	    var j = -1, m = data[0].length, y0 = [];
	    while (++j < m) y0[j] = 0;
	    return y0;
	  }
	  function d3_layout_stackMaxIndex(array) {
	    var i = 1, j = 0, v = array[0][1], k, n = array.length;
	    for (;i < n; ++i) {
	      if ((k = array[i][1]) > v) {
	        j = i;
	        v = k;
	      }
	    }
	    return j;
	  }
	  function d3_layout_stackReduceSum(d) {
	    return d.reduce(d3_layout_stackSum, 0);
	  }
	  function d3_layout_stackSum(p, d) {
	    return p + d[1];
	  }
	  d3.layout.histogram = function() {
	    var frequency = true, valuer = Number, ranger = d3_layout_histogramRange, binner = d3_layout_histogramBinSturges;
	    function histogram(data, i) {
	      var bins = [], values = data.map(valuer, this), range = ranger.call(this, values, i), thresholds = binner.call(this, range, values, i), bin, i = -1, n = values.length, m = thresholds.length - 1, k = frequency ? 1 : 1 / n, x;
	      while (++i < m) {
	        bin = bins[i] = [];
	        bin.dx = thresholds[i + 1] - (bin.x = thresholds[i]);
	        bin.y = 0;
	      }
	      if (m > 0) {
	        i = -1;
	        while (++i < n) {
	          x = values[i];
	          if (x >= range[0] && x <= range[1]) {
	            bin = bins[d3.bisect(thresholds, x, 1, m) - 1];
	            bin.y += k;
	            bin.push(data[i]);
	          }
	        }
	      }
	      return bins;
	    }
	    histogram.value = function(x) {
	      if (!arguments.length) return valuer;
	      valuer = x;
	      return histogram;
	    };
	    histogram.range = function(x) {
	      if (!arguments.length) return ranger;
	      ranger = d3_functor(x);
	      return histogram;
	    };
	    histogram.bins = function(x) {
	      if (!arguments.length) return binner;
	      binner = typeof x === "number" ? function(range) {
	        return d3_layout_histogramBinFixed(range, x);
	      } : d3_functor(x);
	      return histogram;
	    };
	    histogram.frequency = function(x) {
	      if (!arguments.length) return frequency;
	      frequency = !!x;
	      return histogram;
	    };
	    return histogram;
	  };
	  function d3_layout_histogramBinSturges(range, values) {
	    return d3_layout_histogramBinFixed(range, Math.ceil(Math.log(values.length) / Math.LN2 + 1));
	  }
	  function d3_layout_histogramBinFixed(range, n) {
	    var x = -1, b = +range[0], m = (range[1] - b) / n, f = [];
	    while (++x <= n) f[x] = m * x + b;
	    return f;
	  }
	  function d3_layout_histogramRange(values) {
	    return [ d3.min(values), d3.max(values) ];
	  }
	  d3.layout.pack = function() {
	    var hierarchy = d3.layout.hierarchy().sort(d3_layout_packSort), padding = 0, size = [ 1, 1 ], radius;
	    function pack(d, i) {
	      var nodes = hierarchy.call(this, d, i), root = nodes[0], w = size[0], h = size[1], r = radius == null ? Math.sqrt : typeof radius === "function" ? radius : function() {
	        return radius;
	      };
	      root.x = root.y = 0;
	      d3_layout_hierarchyVisitAfter(root, function(d) {
	        d.r = +r(d.value);
	      });
	      d3_layout_hierarchyVisitAfter(root, d3_layout_packSiblings);
	      if (padding) {
	        var dr = padding * (radius ? 1 : Math.max(2 * root.r / w, 2 * root.r / h)) / 2;
	        d3_layout_hierarchyVisitAfter(root, function(d) {
	          d.r += dr;
	        });
	        d3_layout_hierarchyVisitAfter(root, d3_layout_packSiblings);
	        d3_layout_hierarchyVisitAfter(root, function(d) {
	          d.r -= dr;
	        });
	      }
	      d3_layout_packTransform(root, w / 2, h / 2, radius ? 1 : 1 / Math.max(2 * root.r / w, 2 * root.r / h));
	      return nodes;
	    }
	    pack.size = function(_) {
	      if (!arguments.length) return size;
	      size = _;
	      return pack;
	    };
	    pack.radius = function(_) {
	      if (!arguments.length) return radius;
	      radius = _ == null || typeof _ === "function" ? _ : +_;
	      return pack;
	    };
	    pack.padding = function(_) {
	      if (!arguments.length) return padding;
	      padding = +_;
	      return pack;
	    };
	    return d3_layout_hierarchyRebind(pack, hierarchy);
	  };
	  function d3_layout_packSort(a, b) {
	    return a.value - b.value;
	  }
	  function d3_layout_packInsert(a, b) {
	    var c = a._pack_next;
	    a._pack_next = b;
	    b._pack_prev = a;
	    b._pack_next = c;
	    c._pack_prev = b;
	  }
	  function d3_layout_packSplice(a, b) {
	    a._pack_next = b;
	    b._pack_prev = a;
	  }
	  function d3_layout_packIntersects(a, b) {
	    var dx = b.x - a.x, dy = b.y - a.y, dr = a.r + b.r;
	    return .999 * dr * dr > dx * dx + dy * dy;
	  }
	  function d3_layout_packSiblings(node) {
	    if (!(nodes = node.children) || !(n = nodes.length)) return;
	    var nodes, xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity, a, b, c, i, j, k, n;
	    function bound(node) {
	      xMin = Math.min(node.x - node.r, xMin);
	      xMax = Math.max(node.x + node.r, xMax);
	      yMin = Math.min(node.y - node.r, yMin);
	      yMax = Math.max(node.y + node.r, yMax);
	    }
	    nodes.forEach(d3_layout_packLink);
	    a = nodes[0];
	    a.x = -a.r;
	    a.y = 0;
	    bound(a);
	    if (n > 1) {
	      b = nodes[1];
	      b.x = b.r;
	      b.y = 0;
	      bound(b);
	      if (n > 2) {
	        c = nodes[2];
	        d3_layout_packPlace(a, b, c);
	        bound(c);
	        d3_layout_packInsert(a, c);
	        a._pack_prev = c;
	        d3_layout_packInsert(c, b);
	        b = a._pack_next;
	        for (i = 3; i < n; i++) {
	          d3_layout_packPlace(a, b, c = nodes[i]);
	          var isect = 0, s1 = 1, s2 = 1;
	          for (j = b._pack_next; j !== b; j = j._pack_next, s1++) {
	            if (d3_layout_packIntersects(j, c)) {
	              isect = 1;
	              break;
	            }
	          }
	          if (isect == 1) {
	            for (k = a._pack_prev; k !== j._pack_prev; k = k._pack_prev, s2++) {
	              if (d3_layout_packIntersects(k, c)) {
	                break;
	              }
	            }
	          }
	          if (isect) {
	            if (s1 < s2 || s1 == s2 && b.r < a.r) d3_layout_packSplice(a, b = j); else d3_layout_packSplice(a = k, b);
	            i--;
	          } else {
	            d3_layout_packInsert(a, c);
	            b = c;
	            bound(c);
	          }
	        }
	      }
	    }
	    var cx = (xMin + xMax) / 2, cy = (yMin + yMax) / 2, cr = 0;
	    for (i = 0; i < n; i++) {
	      c = nodes[i];
	      c.x -= cx;
	      c.y -= cy;
	      cr = Math.max(cr, c.r + Math.sqrt(c.x * c.x + c.y * c.y));
	    }
	    node.r = cr;
	    nodes.forEach(d3_layout_packUnlink);
	  }
	  function d3_layout_packLink(node) {
	    node._pack_next = node._pack_prev = node;
	  }
	  function d3_layout_packUnlink(node) {
	    delete node._pack_next;
	    delete node._pack_prev;
	  }
	  function d3_layout_packTransform(node, x, y, k) {
	    var children = node.children;
	    node.x = x += k * node.x;
	    node.y = y += k * node.y;
	    node.r *= k;
	    if (children) {
	      var i = -1, n = children.length;
	      while (++i < n) d3_layout_packTransform(children[i], x, y, k);
	    }
	  }
	  function d3_layout_packPlace(a, b, c) {
	    var db = a.r + c.r, dx = b.x - a.x, dy = b.y - a.y;
	    if (db && (dx || dy)) {
	      var da = b.r + c.r, dc = dx * dx + dy * dy;
	      da *= da;
	      db *= db;
	      var x = .5 + (db - da) / (2 * dc), y = Math.sqrt(Math.max(0, 2 * da * (db + dc) - (db -= dc) * db - da * da)) / (2 * dc);
	      c.x = a.x + x * dx + y * dy;
	      c.y = a.y + x * dy - y * dx;
	    } else {
	      c.x = a.x + db;
	      c.y = a.y;
	    }
	  }
	  d3.layout.tree = function() {
	    var hierarchy = d3.layout.hierarchy().sort(null).value(null), separation = d3_layout_treeSeparation, size = [ 1, 1 ], nodeSize = null;
	    function tree(d, i) {
	      var nodes = hierarchy.call(this, d, i), root0 = nodes[0], root1 = wrapTree(root0);
	      d3_layout_hierarchyVisitAfter(root1, firstWalk), root1.parent.m = -root1.z;
	      d3_layout_hierarchyVisitBefore(root1, secondWalk);
	      if (nodeSize) d3_layout_hierarchyVisitBefore(root0, sizeNode); else {
	        var left = root0, right = root0, bottom = root0;
	        d3_layout_hierarchyVisitBefore(root0, function(node) {
	          if (node.x < left.x) left = node;
	          if (node.x > right.x) right = node;
	          if (node.depth > bottom.depth) bottom = node;
	        });
	        var tx = separation(left, right) / 2 - left.x, kx = size[0] / (right.x + separation(right, left) / 2 + tx), ky = size[1] / (bottom.depth || 1);
	        d3_layout_hierarchyVisitBefore(root0, function(node) {
	          node.x = (node.x + tx) * kx;
	          node.y = node.depth * ky;
	        });
	      }
	      return nodes;
	    }
	    function wrapTree(root0) {
	      var root1 = {
	        A: null,
	        children: [ root0 ]
	      }, queue = [ root1 ], node1;
	      while ((node1 = queue.pop()) != null) {
	        for (var children = node1.children, child, i = 0, n = children.length; i < n; ++i) {
	          queue.push((children[i] = child = {
	            _: children[i],
	            parent: node1,
	            children: (child = children[i].children) && child.slice() || [],
	            A: null,
	            a: null,
	            z: 0,
	            m: 0,
	            c: 0,
	            s: 0,
	            t: null,
	            i: i
	          }).a = child);
	        }
	      }
	      return root1.children[0];
	    }
	    function firstWalk(v) {
	      var children = v.children, siblings = v.parent.children, w = v.i ? siblings[v.i - 1] : null;
	      if (children.length) {
	        d3_layout_treeShift(v);
	        var midpoint = (children[0].z + children[children.length - 1].z) / 2;
	        if (w) {
	          v.z = w.z + separation(v._, w._);
	          v.m = v.z - midpoint;
	        } else {
	          v.z = midpoint;
	        }
	      } else if (w) {
	        v.z = w.z + separation(v._, w._);
	      }
	      v.parent.A = apportion(v, w, v.parent.A || siblings[0]);
	    }
	    function secondWalk(v) {
	      v._.x = v.z + v.parent.m;
	      v.m += v.parent.m;
	    }
	    function apportion(v, w, ancestor) {
	      if (w) {
	        var vip = v, vop = v, vim = w, vom = vip.parent.children[0], sip = vip.m, sop = vop.m, sim = vim.m, som = vom.m, shift;
	        while (vim = d3_layout_treeRight(vim), vip = d3_layout_treeLeft(vip), vim && vip) {
	          vom = d3_layout_treeLeft(vom);
	          vop = d3_layout_treeRight(vop);
	          vop.a = v;
	          shift = vim.z + sim - vip.z - sip + separation(vim._, vip._);
	          if (shift > 0) {
	            d3_layout_treeMove(d3_layout_treeAncestor(vim, v, ancestor), v, shift);
	            sip += shift;
	            sop += shift;
	          }
	          sim += vim.m;
	          sip += vip.m;
	          som += vom.m;
	          sop += vop.m;
	        }
	        if (vim && !d3_layout_treeRight(vop)) {
	          vop.t = vim;
	          vop.m += sim - sop;
	        }
	        if (vip && !d3_layout_treeLeft(vom)) {
	          vom.t = vip;
	          vom.m += sip - som;
	          ancestor = v;
	        }
	      }
	      return ancestor;
	    }
	    function sizeNode(node) {
	      node.x *= size[0];
	      node.y = node.depth * size[1];
	    }
	    tree.separation = function(x) {
	      if (!arguments.length) return separation;
	      separation = x;
	      return tree;
	    };
	    tree.size = function(x) {
	      if (!arguments.length) return nodeSize ? null : size;
	      nodeSize = (size = x) == null ? sizeNode : null;
	      return tree;
	    };
	    tree.nodeSize = function(x) {
	      if (!arguments.length) return nodeSize ? size : null;
	      nodeSize = (size = x) == null ? null : sizeNode;
	      return tree;
	    };
	    return d3_layout_hierarchyRebind(tree, hierarchy);
	  };
	  function d3_layout_treeSeparation(a, b) {
	    return a.parent == b.parent ? 1 : 2;
	  }
	  function d3_layout_treeLeft(v) {
	    var children = v.children;
	    return children.length ? children[0] : v.t;
	  }
	  function d3_layout_treeRight(v) {
	    var children = v.children, n;
	    return (n = children.length) ? children[n - 1] : v.t;
	  }
	  function d3_layout_treeMove(wm, wp, shift) {
	    var change = shift / (wp.i - wm.i);
	    wp.c -= change;
	    wp.s += shift;
	    wm.c += change;
	    wp.z += shift;
	    wp.m += shift;
	  }
	  function d3_layout_treeShift(v) {
	    var shift = 0, change = 0, children = v.children, i = children.length, w;
	    while (--i >= 0) {
	      w = children[i];
	      w.z += shift;
	      w.m += shift;
	      shift += w.s + (change += w.c);
	    }
	  }
	  function d3_layout_treeAncestor(vim, v, ancestor) {
	    return vim.a.parent === v.parent ? vim.a : ancestor;
	  }
	  d3.layout.cluster = function() {
	    var hierarchy = d3.layout.hierarchy().sort(null).value(null), separation = d3_layout_treeSeparation, size = [ 1, 1 ], nodeSize = false;
	    function cluster(d, i) {
	      var nodes = hierarchy.call(this, d, i), root = nodes[0], previousNode, x = 0;
	      d3_layout_hierarchyVisitAfter(root, function(node) {
	        var children = node.children;
	        if (children && children.length) {
	          node.x = d3_layout_clusterX(children);
	          node.y = d3_layout_clusterY(children);
	        } else {
	          node.x = previousNode ? x += separation(node, previousNode) : 0;
	          node.y = 0;
	          previousNode = node;
	        }
	      });
	      var left = d3_layout_clusterLeft(root), right = d3_layout_clusterRight(root), x0 = left.x - separation(left, right) / 2, x1 = right.x + separation(right, left) / 2;
	      d3_layout_hierarchyVisitAfter(root, nodeSize ? function(node) {
	        node.x = (node.x - root.x) * size[0];
	        node.y = (root.y - node.y) * size[1];
	      } : function(node) {
	        node.x = (node.x - x0) / (x1 - x0) * size[0];
	        node.y = (1 - (root.y ? node.y / root.y : 1)) * size[1];
	      });
	      return nodes;
	    }
	    cluster.separation = function(x) {
	      if (!arguments.length) return separation;
	      separation = x;
	      return cluster;
	    };
	    cluster.size = function(x) {
	      if (!arguments.length) return nodeSize ? null : size;
	      nodeSize = (size = x) == null;
	      return cluster;
	    };
	    cluster.nodeSize = function(x) {
	      if (!arguments.length) return nodeSize ? size : null;
	      nodeSize = (size = x) != null;
	      return cluster;
	    };
	    return d3_layout_hierarchyRebind(cluster, hierarchy);
	  };
	  function d3_layout_clusterY(children) {
	    return 1 + d3.max(children, function(child) {
	      return child.y;
	    });
	  }
	  function d3_layout_clusterX(children) {
	    return children.reduce(function(x, child) {
	      return x + child.x;
	    }, 0) / children.length;
	  }
	  function d3_layout_clusterLeft(node) {
	    var children = node.children;
	    return children && children.length ? d3_layout_clusterLeft(children[0]) : node;
	  }
	  function d3_layout_clusterRight(node) {
	    var children = node.children, n;
	    return children && (n = children.length) ? d3_layout_clusterRight(children[n - 1]) : node;
	  }
	  d3.layout.treemap = function() {
	    var hierarchy = d3.layout.hierarchy(), round = Math.round, size = [ 1, 1 ], padding = null, pad = d3_layout_treemapPadNull, sticky = false, stickies, mode = "squarify", ratio = .5 * (1 + Math.sqrt(5));
	    function scale(children, k) {
	      var i = -1, n = children.length, child, area;
	      while (++i < n) {
	        area = (child = children[i]).value * (k < 0 ? 0 : k);
	        child.area = isNaN(area) || area <= 0 ? 0 : area;
	      }
	    }
	    function squarify(node) {
	      var children = node.children;
	      if (children && children.length) {
	        var rect = pad(node), row = [], remaining = children.slice(), child, best = Infinity, score, u = mode === "slice" ? rect.dx : mode === "dice" ? rect.dy : mode === "slice-dice" ? node.depth & 1 ? rect.dy : rect.dx : Math.min(rect.dx, rect.dy), n;
	        scale(remaining, rect.dx * rect.dy / node.value);
	        row.area = 0;
	        while ((n = remaining.length) > 0) {
	          row.push(child = remaining[n - 1]);
	          row.area += child.area;
	          if (mode !== "squarify" || (score = worst(row, u)) <= best) {
	            remaining.pop();
	            best = score;
	          } else {
	            row.area -= row.pop().area;
	            position(row, u, rect, false);
	            u = Math.min(rect.dx, rect.dy);
	            row.length = row.area = 0;
	            best = Infinity;
	          }
	        }
	        if (row.length) {
	          position(row, u, rect, true);
	          row.length = row.area = 0;
	        }
	        children.forEach(squarify);
	      }
	    }
	    function stickify(node) {
	      var children = node.children;
	      if (children && children.length) {
	        var rect = pad(node), remaining = children.slice(), child, row = [];
	        scale(remaining, rect.dx * rect.dy / node.value);
	        row.area = 0;
	        while (child = remaining.pop()) {
	          row.push(child);
	          row.area += child.area;
	          if (child.z != null) {
	            position(row, child.z ? rect.dx : rect.dy, rect, !remaining.length);
	            row.length = row.area = 0;
	          }
	        }
	        children.forEach(stickify);
	      }
	    }
	    function worst(row, u) {
	      var s = row.area, r, rmax = 0, rmin = Infinity, i = -1, n = row.length;
	      while (++i < n) {
	        if (!(r = row[i].area)) continue;
	        if (r < rmin) rmin = r;
	        if (r > rmax) rmax = r;
	      }
	      s *= s;
	      u *= u;
	      return s ? Math.max(u * rmax * ratio / s, s / (u * rmin * ratio)) : Infinity;
	    }
	    function position(row, u, rect, flush) {
	      var i = -1, n = row.length, x = rect.x, y = rect.y, v = u ? round(row.area / u) : 0, o;
	      if (u == rect.dx) {
	        if (flush || v > rect.dy) v = rect.dy;
	        while (++i < n) {
	          o = row[i];
	          o.x = x;
	          o.y = y;
	          o.dy = v;
	          x += o.dx = Math.min(rect.x + rect.dx - x, v ? round(o.area / v) : 0);
	        }
	        o.z = true;
	        o.dx += rect.x + rect.dx - x;
	        rect.y += v;
	        rect.dy -= v;
	      } else {
	        if (flush || v > rect.dx) v = rect.dx;
	        while (++i < n) {
	          o = row[i];
	          o.x = x;
	          o.y = y;
	          o.dx = v;
	          y += o.dy = Math.min(rect.y + rect.dy - y, v ? round(o.area / v) : 0);
	        }
	        o.z = false;
	        o.dy += rect.y + rect.dy - y;
	        rect.x += v;
	        rect.dx -= v;
	      }
	    }
	    function treemap(d) {
	      var nodes = stickies || hierarchy(d), root = nodes[0];
	      root.x = root.y = 0;
	      if (root.value) root.dx = size[0], root.dy = size[1]; else root.dx = root.dy = 0;
	      if (stickies) hierarchy.revalue(root);
	      scale([ root ], root.dx * root.dy / root.value);
	      (stickies ? stickify : squarify)(root);
	      if (sticky) stickies = nodes;
	      return nodes;
	    }
	    treemap.size = function(x) {
	      if (!arguments.length) return size;
	      size = x;
	      return treemap;
	    };
	    treemap.padding = function(x) {
	      if (!arguments.length) return padding;
	      function padFunction(node) {
	        var p = x.call(treemap, node, node.depth);
	        return p == null ? d3_layout_treemapPadNull(node) : d3_layout_treemapPad(node, typeof p === "number" ? [ p, p, p, p ] : p);
	      }
	      function padConstant(node) {
	        return d3_layout_treemapPad(node, x);
	      }
	      var type;
	      pad = (padding = x) == null ? d3_layout_treemapPadNull : (type = typeof x) === "function" ? padFunction : type === "number" ? (x = [ x, x, x, x ], 
	      padConstant) : padConstant;
	      return treemap;
	    };
	    treemap.round = function(x) {
	      if (!arguments.length) return round != Number;
	      round = x ? Math.round : Number;
	      return treemap;
	    };
	    treemap.sticky = function(x) {
	      if (!arguments.length) return sticky;
	      sticky = x;
	      stickies = null;
	      return treemap;
	    };
	    treemap.ratio = function(x) {
	      if (!arguments.length) return ratio;
	      ratio = x;
	      return treemap;
	    };
	    treemap.mode = function(x) {
	      if (!arguments.length) return mode;
	      mode = x + "";
	      return treemap;
	    };
	    return d3_layout_hierarchyRebind(treemap, hierarchy);
	  };
	  function d3_layout_treemapPadNull(node) {
	    return {
	      x: node.x,
	      y: node.y,
	      dx: node.dx,
	      dy: node.dy
	    };
	  }
	  function d3_layout_treemapPad(node, padding) {
	    var x = node.x + padding[3], y = node.y + padding[0], dx = node.dx - padding[1] - padding[3], dy = node.dy - padding[0] - padding[2];
	    if (dx < 0) {
	      x += dx / 2;
	      dx = 0;
	    }
	    if (dy < 0) {
	      y += dy / 2;
	      dy = 0;
	    }
	    return {
	      x: x,
	      y: y,
	      dx: dx,
	      dy: dy
	    };
	  }
	  d3.random = {
	    normal: function(µ, σ) {
	      var n = arguments.length;
	      if (n < 2) σ = 1;
	      if (n < 1) µ = 0;
	      return function() {
	        var x, y, r;
	        do {
	          x = Math.random() * 2 - 1;
	          y = Math.random() * 2 - 1;
	          r = x * x + y * y;
	        } while (!r || r > 1);
	        return µ + σ * x * Math.sqrt(-2 * Math.log(r) / r);
	      };
	    },
	    logNormal: function() {
	      var random = d3.random.normal.apply(d3, arguments);
	      return function() {
	        return Math.exp(random());
	      };
	    },
	    bates: function(m) {
	      var random = d3.random.irwinHall(m);
	      return function() {
	        return random() / m;
	      };
	    },
	    irwinHall: function(m) {
	      return function() {
	        for (var s = 0, j = 0; j < m; j++) s += Math.random();
	        return s;
	      };
	    }
	  };
	  d3.scale = {};
	  function d3_scaleExtent(domain) {
	    var start = domain[0], stop = domain[domain.length - 1];
	    return start < stop ? [ start, stop ] : [ stop, start ];
	  }
	  function d3_scaleRange(scale) {
	    return scale.rangeExtent ? scale.rangeExtent() : d3_scaleExtent(scale.range());
	  }
	  function d3_scale_bilinear(domain, range, uninterpolate, interpolate) {
	    var u = uninterpolate(domain[0], domain[1]), i = interpolate(range[0], range[1]);
	    return function(x) {
	      return i(u(x));
	    };
	  }
	  function d3_scale_nice(domain, nice) {
	    var i0 = 0, i1 = domain.length - 1, x0 = domain[i0], x1 = domain[i1], dx;
	    if (x1 < x0) {
	      dx = i0, i0 = i1, i1 = dx;
	      dx = x0, x0 = x1, x1 = dx;
	    }
	    domain[i0] = nice.floor(x0);
	    domain[i1] = nice.ceil(x1);
	    return domain;
	  }
	  function d3_scale_niceStep(step) {
	    return step ? {
	      floor: function(x) {
	        return Math.floor(x / step) * step;
	      },
	      ceil: function(x) {
	        return Math.ceil(x / step) * step;
	      }
	    } : d3_scale_niceIdentity;
	  }
	  var d3_scale_niceIdentity = {
	    floor: d3_identity,
	    ceil: d3_identity
	  };
	  function d3_scale_polylinear(domain, range, uninterpolate, interpolate) {
	    var u = [], i = [], j = 0, k = Math.min(domain.length, range.length) - 1;
	    if (domain[k] < domain[0]) {
	      domain = domain.slice().reverse();
	      range = range.slice().reverse();
	    }
	    while (++j <= k) {
	      u.push(uninterpolate(domain[j - 1], domain[j]));
	      i.push(interpolate(range[j - 1], range[j]));
	    }
	    return function(x) {
	      var j = d3.bisect(domain, x, 1, k) - 1;
	      return i[j](u[j](x));
	    };
	  }
	  d3.scale.linear = function() {
	    return d3_scale_linear([ 0, 1 ], [ 0, 1 ], d3_interpolate, false);
	  };
	  function d3_scale_linear(domain, range, interpolate, clamp) {
	    var output, input;
	    function rescale() {
	      var linear = Math.min(domain.length, range.length) > 2 ? d3_scale_polylinear : d3_scale_bilinear, uninterpolate = clamp ? d3_uninterpolateClamp : d3_uninterpolateNumber;
	      output = linear(domain, range, uninterpolate, interpolate);
	      input = linear(range, domain, uninterpolate, d3_interpolate);
	      return scale;
	    }
	    function scale(x) {
	      return output(x);
	    }
	    scale.invert = function(y) {
	      return input(y);
	    };
	    scale.domain = function(x) {
	      if (!arguments.length) return domain;
	      domain = x.map(Number);
	      return rescale();
	    };
	    scale.range = function(x) {
	      if (!arguments.length) return range;
	      range = x;
	      return rescale();
	    };
	    scale.rangeRound = function(x) {
	      return scale.range(x).interpolate(d3_interpolateRound);
	    };
	    scale.clamp = function(x) {
	      if (!arguments.length) return clamp;
	      clamp = x;
	      return rescale();
	    };
	    scale.interpolate = function(x) {
	      if (!arguments.length) return interpolate;
	      interpolate = x;
	      return rescale();
	    };
	    scale.ticks = function(m) {
	      return d3_scale_linearTicks(domain, m);
	    };
	    scale.tickFormat = function(m, format) {
	      return d3_scale_linearTickFormat(domain, m, format);
	    };
	    scale.nice = function(m) {
	      d3_scale_linearNice(domain, m);
	      return rescale();
	    };
	    scale.copy = function() {
	      return d3_scale_linear(domain, range, interpolate, clamp);
	    };
	    return rescale();
	  }
	  function d3_scale_linearRebind(scale, linear) {
	    return d3.rebind(scale, linear, "range", "rangeRound", "interpolate", "clamp");
	  }
	  function d3_scale_linearNice(domain, m) {
	    d3_scale_nice(domain, d3_scale_niceStep(d3_scale_linearTickRange(domain, m)[2]));
	    d3_scale_nice(domain, d3_scale_niceStep(d3_scale_linearTickRange(domain, m)[2]));
	    return domain;
	  }
	  function d3_scale_linearTickRange(domain, m) {
	    if (m == null) m = 10;
	    var extent = d3_scaleExtent(domain), span = extent[1] - extent[0], step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10)), err = m / span * step;
	    if (err <= .15) step *= 10; else if (err <= .35) step *= 5; else if (err <= .75) step *= 2;
	    extent[0] = Math.ceil(extent[0] / step) * step;
	    extent[1] = Math.floor(extent[1] / step) * step + step * .5;
	    extent[2] = step;
	    return extent;
	  }
	  function d3_scale_linearTicks(domain, m) {
	    return d3.range.apply(d3, d3_scale_linearTickRange(domain, m));
	  }
	  function d3_scale_linearTickFormat(domain, m, format) {
	    var range = d3_scale_linearTickRange(domain, m);
	    if (format) {
	      var match = d3_format_re.exec(format);
	      match.shift();
	      if (match[8] === "s") {
	        var prefix = d3.formatPrefix(Math.max(abs(range[0]), abs(range[1])));
	        if (!match[7]) match[7] = "." + d3_scale_linearPrecision(prefix.scale(range[2]));
	        match[8] = "f";
	        format = d3.format(match.join(""));
	        return function(d) {
	          return format(prefix.scale(d)) + prefix.symbol;
	        };
	      }
	      if (!match[7]) match[7] = "." + d3_scale_linearFormatPrecision(match[8], range);
	      format = match.join("");
	    } else {
	      format = ",." + d3_scale_linearPrecision(range[2]) + "f";
	    }
	    return d3.format(format);
	  }
	  var d3_scale_linearFormatSignificant = {
	    s: 1,
	    g: 1,
	    p: 1,
	    r: 1,
	    e: 1
	  };
	  function d3_scale_linearPrecision(value) {
	    return -Math.floor(Math.log(value) / Math.LN10 + .01);
	  }
	  function d3_scale_linearFormatPrecision(type, range) {
	    var p = d3_scale_linearPrecision(range[2]);
	    return type in d3_scale_linearFormatSignificant ? Math.abs(p - d3_scale_linearPrecision(Math.max(abs(range[0]), abs(range[1])))) + +(type !== "e") : p - (type === "%") * 2;
	  }
	  d3.scale.log = function() {
	    return d3_scale_log(d3.scale.linear().domain([ 0, 1 ]), 10, true, [ 1, 10 ]);
	  };
	  function d3_scale_log(linear, base, positive, domain) {
	    function log(x) {
	      return (positive ? Math.log(x < 0 ? 0 : x) : -Math.log(x > 0 ? 0 : -x)) / Math.log(base);
	    }
	    function pow(x) {
	      return positive ? Math.pow(base, x) : -Math.pow(base, -x);
	    }
	    function scale(x) {
	      return linear(log(x));
	    }
	    scale.invert = function(x) {
	      return pow(linear.invert(x));
	    };
	    scale.domain = function(x) {
	      if (!arguments.length) return domain;
	      positive = x[0] >= 0;
	      linear.domain((domain = x.map(Number)).map(log));
	      return scale;
	    };
	    scale.base = function(_) {
	      if (!arguments.length) return base;
	      base = +_;
	      linear.domain(domain.map(log));
	      return scale;
	    };
	    scale.nice = function() {
	      var niced = d3_scale_nice(domain.map(log), positive ? Math : d3_scale_logNiceNegative);
	      linear.domain(niced);
	      domain = niced.map(pow);
	      return scale;
	    };
	    scale.ticks = function() {
	      var extent = d3_scaleExtent(domain), ticks = [], u = extent[0], v = extent[1], i = Math.floor(log(u)), j = Math.ceil(log(v)), n = base % 1 ? 2 : base;
	      if (isFinite(j - i)) {
	        if (positive) {
	          for (;i < j; i++) for (var k = 1; k < n; k++) ticks.push(pow(i) * k);
	          ticks.push(pow(i));
	        } else {
	          ticks.push(pow(i));
	          for (;i++ < j; ) for (var k = n - 1; k > 0; k--) ticks.push(pow(i) * k);
	        }
	        for (i = 0; ticks[i] < u; i++) {}
	        for (j = ticks.length; ticks[j - 1] > v; j--) {}
	        ticks = ticks.slice(i, j);
	      }
	      return ticks;
	    };
	    scale.tickFormat = function(n, format) {
	      if (!arguments.length) return d3_scale_logFormat;
	      if (arguments.length < 2) format = d3_scale_logFormat; else if (typeof format !== "function") format = d3.format(format);
	      var k = Math.max(1, base * n / scale.ticks().length);
	      return function(d) {
	        var i = d / pow(Math.round(log(d)));
	        if (i * base < base - .5) i *= base;
	        return i <= k ? format(d) : "";
	      };
	    };
	    scale.copy = function() {
	      return d3_scale_log(linear.copy(), base, positive, domain);
	    };
	    return d3_scale_linearRebind(scale, linear);
	  }
	  var d3_scale_logFormat = d3.format(".0e"), d3_scale_logNiceNegative = {
	    floor: function(x) {
	      return -Math.ceil(-x);
	    },
	    ceil: function(x) {
	      return -Math.floor(-x);
	    }
	  };
	  d3.scale.pow = function() {
	    return d3_scale_pow(d3.scale.linear(), 1, [ 0, 1 ]);
	  };
	  function d3_scale_pow(linear, exponent, domain) {
	    var powp = d3_scale_powPow(exponent), powb = d3_scale_powPow(1 / exponent);
	    function scale(x) {
	      return linear(powp(x));
	    }
	    scale.invert = function(x) {
	      return powb(linear.invert(x));
	    };
	    scale.domain = function(x) {
	      if (!arguments.length) return domain;
	      linear.domain((domain = x.map(Number)).map(powp));
	      return scale;
	    };
	    scale.ticks = function(m) {
	      return d3_scale_linearTicks(domain, m);
	    };
	    scale.tickFormat = function(m, format) {
	      return d3_scale_linearTickFormat(domain, m, format);
	    };
	    scale.nice = function(m) {
	      return scale.domain(d3_scale_linearNice(domain, m));
	    };
	    scale.exponent = function(x) {
	      if (!arguments.length) return exponent;
	      powp = d3_scale_powPow(exponent = x);
	      powb = d3_scale_powPow(1 / exponent);
	      linear.domain(domain.map(powp));
	      return scale;
	    };
	    scale.copy = function() {
	      return d3_scale_pow(linear.copy(), exponent, domain);
	    };
	    return d3_scale_linearRebind(scale, linear);
	  }
	  function d3_scale_powPow(e) {
	    return function(x) {
	      return x < 0 ? -Math.pow(-x, e) : Math.pow(x, e);
	    };
	  }
	  d3.scale.sqrt = function() {
	    return d3.scale.pow().exponent(.5);
	  };
	  d3.scale.ordinal = function() {
	    return d3_scale_ordinal([], {
	      t: "range",
	      a: [ [] ]
	    });
	  };
	  function d3_scale_ordinal(domain, ranger) {
	    var index, range, rangeBand;
	    function scale(x) {
	      return range[((index.get(x) || (ranger.t === "range" ? index.set(x, domain.push(x)) : NaN)) - 1) % range.length];
	    }
	    function steps(start, step) {
	      return d3.range(domain.length).map(function(i) {
	        return start + step * i;
	      });
	    }
	    scale.domain = function(x) {
	      if (!arguments.length) return domain;
	      domain = [];
	      index = new d3_Map();
	      var i = -1, n = x.length, xi;
	      while (++i < n) if (!index.has(xi = x[i])) index.set(xi, domain.push(xi));
	      return scale[ranger.t].apply(scale, ranger.a);
	    };
	    scale.range = function(x) {
	      if (!arguments.length) return range;
	      range = x;
	      rangeBand = 0;
	      ranger = {
	        t: "range",
	        a: arguments
	      };
	      return scale;
	    };
	    scale.rangePoints = function(x, padding) {
	      if (arguments.length < 2) padding = 0;
	      var start = x[0], stop = x[1], step = domain.length < 2 ? (start = (start + stop) / 2, 
	      0) : (stop - start) / (domain.length - 1 + padding);
	      range = steps(start + step * padding / 2, step);
	      rangeBand = 0;
	      ranger = {
	        t: "rangePoints",
	        a: arguments
	      };
	      return scale;
	    };
	    scale.rangeRoundPoints = function(x, padding) {
	      if (arguments.length < 2) padding = 0;
	      var start = x[0], stop = x[1], step = domain.length < 2 ? (start = stop = Math.round((start + stop) / 2), 
	      0) : (stop - start) / (domain.length - 1 + padding) | 0;
	      range = steps(start + Math.round(step * padding / 2 + (stop - start - (domain.length - 1 + padding) * step) / 2), step);
	      rangeBand = 0;
	      ranger = {
	        t: "rangeRoundPoints",
	        a: arguments
	      };
	      return scale;
	    };
	    scale.rangeBands = function(x, padding, outerPadding) {
	      if (arguments.length < 2) padding = 0;
	      if (arguments.length < 3) outerPadding = padding;
	      var reverse = x[1] < x[0], start = x[reverse - 0], stop = x[1 - reverse], step = (stop - start) / (domain.length - padding + 2 * outerPadding);
	      range = steps(start + step * outerPadding, step);
	      if (reverse) range.reverse();
	      rangeBand = step * (1 - padding);
	      ranger = {
	        t: "rangeBands",
	        a: arguments
	      };
	      return scale;
	    };
	    scale.rangeRoundBands = function(x, padding, outerPadding) {
	      if (arguments.length < 2) padding = 0;
	      if (arguments.length < 3) outerPadding = padding;
	      var reverse = x[1] < x[0], start = x[reverse - 0], stop = x[1 - reverse], step = Math.floor((stop - start) / (domain.length - padding + 2 * outerPadding));
	      range = steps(start + Math.round((stop - start - (domain.length - padding) * step) / 2), step);
	      if (reverse) range.reverse();
	      rangeBand = Math.round(step * (1 - padding));
	      ranger = {
	        t: "rangeRoundBands",
	        a: arguments
	      };
	      return scale;
	    };
	    scale.rangeBand = function() {
	      return rangeBand;
	    };
	    scale.rangeExtent = function() {
	      return d3_scaleExtent(ranger.a[0]);
	    };
	    scale.copy = function() {
	      return d3_scale_ordinal(domain, ranger);
	    };
	    return scale.domain(domain);
	  }
	  d3.scale.category10 = function() {
	    return d3.scale.ordinal().range(d3_category10);
	  };
	  d3.scale.category20 = function() {
	    return d3.scale.ordinal().range(d3_category20);
	  };
	  d3.scale.category20b = function() {
	    return d3.scale.ordinal().range(d3_category20b);
	  };
	  d3.scale.category20c = function() {
	    return d3.scale.ordinal().range(d3_category20c);
	  };
	  var d3_category10 = [ 2062260, 16744206, 2924588, 14034728, 9725885, 9197131, 14907330, 8355711, 12369186, 1556175 ].map(d3_rgbString);
	  var d3_category20 = [ 2062260, 11454440, 16744206, 16759672, 2924588, 10018698, 14034728, 16750742, 9725885, 12955861, 9197131, 12885140, 14907330, 16234194, 8355711, 13092807, 12369186, 14408589, 1556175, 10410725 ].map(d3_rgbString);
	  var d3_category20b = [ 3750777, 5395619, 7040719, 10264286, 6519097, 9216594, 11915115, 13556636, 9202993, 12426809, 15186514, 15190932, 8666169, 11356490, 14049643, 15177372, 8077683, 10834324, 13528509, 14589654 ].map(d3_rgbString);
	  var d3_category20c = [ 3244733, 7057110, 10406625, 13032431, 15095053, 16616764, 16625259, 16634018, 3253076, 7652470, 10607003, 13101504, 7695281, 10394312, 12369372, 14342891, 6513507, 9868950, 12434877, 14277081 ].map(d3_rgbString);
	  d3.scale.quantile = function() {
	    return d3_scale_quantile([], []);
	  };
	  function d3_scale_quantile(domain, range) {
	    var thresholds;
	    function rescale() {
	      var k = 0, q = range.length;
	      thresholds = [];
	      while (++k < q) thresholds[k - 1] = d3.quantile(domain, k / q);
	      return scale;
	    }
	    function scale(x) {
	      if (!isNaN(x = +x)) return range[d3.bisect(thresholds, x)];
	    }
	    scale.domain = function(x) {
	      if (!arguments.length) return domain;
	      domain = x.map(d3_number).filter(d3_numeric).sort(d3_ascending);
	      return rescale();
	    };
	    scale.range = function(x) {
	      if (!arguments.length) return range;
	      range = x;
	      return rescale();
	    };
	    scale.quantiles = function() {
	      return thresholds;
	    };
	    scale.invertExtent = function(y) {
	      y = range.indexOf(y);
	      return y < 0 ? [ NaN, NaN ] : [ y > 0 ? thresholds[y - 1] : domain[0], y < thresholds.length ? thresholds[y] : domain[domain.length - 1] ];
	    };
	    scale.copy = function() {
	      return d3_scale_quantile(domain, range);
	    };
	    return rescale();
	  }
	  d3.scale.quantize = function() {
	    return d3_scale_quantize(0, 1, [ 0, 1 ]);
	  };
	  function d3_scale_quantize(x0, x1, range) {
	    var kx, i;
	    function scale(x) {
	      return range[Math.max(0, Math.min(i, Math.floor(kx * (x - x0))))];
	    }
	    function rescale() {
	      kx = range.length / (x1 - x0);
	      i = range.length - 1;
	      return scale;
	    }
	    scale.domain = function(x) {
	      if (!arguments.length) return [ x0, x1 ];
	      x0 = +x[0];
	      x1 = +x[x.length - 1];
	      return rescale();
	    };
	    scale.range = function(x) {
	      if (!arguments.length) return range;
	      range = x;
	      return rescale();
	    };
	    scale.invertExtent = function(y) {
	      y = range.indexOf(y);
	      y = y < 0 ? NaN : y / kx + x0;
	      return [ y, y + 1 / kx ];
	    };
	    scale.copy = function() {
	      return d3_scale_quantize(x0, x1, range);
	    };
	    return rescale();
	  }
	  d3.scale.threshold = function() {
	    return d3_scale_threshold([ .5 ], [ 0, 1 ]);
	  };
	  function d3_scale_threshold(domain, range) {
	    function scale(x) {
	      if (x <= x) return range[d3.bisect(domain, x)];
	    }
	    scale.domain = function(_) {
	      if (!arguments.length) return domain;
	      domain = _;
	      return scale;
	    };
	    scale.range = function(_) {
	      if (!arguments.length) return range;
	      range = _;
	      return scale;
	    };
	    scale.invertExtent = function(y) {
	      y = range.indexOf(y);
	      return [ domain[y - 1], domain[y] ];
	    };
	    scale.copy = function() {
	      return d3_scale_threshold(domain, range);
	    };
	    return scale;
	  }
	  d3.scale.identity = function() {
	    return d3_scale_identity([ 0, 1 ]);
	  };
	  function d3_scale_identity(domain) {
	    function identity(x) {
	      return +x;
	    }
	    identity.invert = identity;
	    identity.domain = identity.range = function(x) {
	      if (!arguments.length) return domain;
	      domain = x.map(identity);
	      return identity;
	    };
	    identity.ticks = function(m) {
	      return d3_scale_linearTicks(domain, m);
	    };
	    identity.tickFormat = function(m, format) {
	      return d3_scale_linearTickFormat(domain, m, format);
	    };
	    identity.copy = function() {
	      return d3_scale_identity(domain);
	    };
	    return identity;
	  }
	  d3.svg = {};
	  function d3_zero() {
	    return 0;
	  }
	  d3.svg.arc = function() {
	    var innerRadius = d3_svg_arcInnerRadius, outerRadius = d3_svg_arcOuterRadius, cornerRadius = d3_zero, padRadius = d3_svg_arcAuto, startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle, padAngle = d3_svg_arcPadAngle;
	    function arc() {
	      var r0 = Math.max(0, +innerRadius.apply(this, arguments)), r1 = Math.max(0, +outerRadius.apply(this, arguments)), a0 = startAngle.apply(this, arguments) - halfπ, a1 = endAngle.apply(this, arguments) - halfπ, da = Math.abs(a1 - a0), cw = a0 > a1 ? 0 : 1;
	      if (r1 < r0) rc = r1, r1 = r0, r0 = rc;
	      if (da >= τε) return circleSegment(r1, cw) + (r0 ? circleSegment(r0, 1 - cw) : "") + "Z";
	      var rc, cr, rp, ap, p0 = 0, p1 = 0, x0, y0, x1, y1, x2, y2, x3, y3, path = [];
	      if (ap = (+padAngle.apply(this, arguments) || 0) / 2) {
	        rp = padRadius === d3_svg_arcAuto ? Math.sqrt(r0 * r0 + r1 * r1) : +padRadius.apply(this, arguments);
	        if (!cw) p1 *= -1;
	        if (r1) p1 = d3_asin(rp / r1 * Math.sin(ap));
	        if (r0) p0 = d3_asin(rp / r0 * Math.sin(ap));
	      }
	      if (r1) {
	        x0 = r1 * Math.cos(a0 + p1);
	        y0 = r1 * Math.sin(a0 + p1);
	        x1 = r1 * Math.cos(a1 - p1);
	        y1 = r1 * Math.sin(a1 - p1);
	        var l1 = Math.abs(a1 - a0 - 2 * p1) <= π ? 0 : 1;
	        if (p1 && d3_svg_arcSweep(x0, y0, x1, y1) === cw ^ l1) {
	          var h1 = (a0 + a1) / 2;
	          x0 = r1 * Math.cos(h1);
	          y0 = r1 * Math.sin(h1);
	          x1 = y1 = null;
	        }
	      } else {
	        x0 = y0 = 0;
	      }
	      if (r0) {
	        x2 = r0 * Math.cos(a1 - p0);
	        y2 = r0 * Math.sin(a1 - p0);
	        x3 = r0 * Math.cos(a0 + p0);
	        y3 = r0 * Math.sin(a0 + p0);
	        var l0 = Math.abs(a0 - a1 + 2 * p0) <= π ? 0 : 1;
	        if (p0 && d3_svg_arcSweep(x2, y2, x3, y3) === 1 - cw ^ l0) {
	          var h0 = (a0 + a1) / 2;
	          x2 = r0 * Math.cos(h0);
	          y2 = r0 * Math.sin(h0);
	          x3 = y3 = null;
	        }
	      } else {
	        x2 = y2 = 0;
	      }
	      if (da > ε && (rc = Math.min(Math.abs(r1 - r0) / 2, +cornerRadius.apply(this, arguments))) > .001) {
	        cr = r0 < r1 ^ cw ? 0 : 1;
	        var rc1 = rc, rc0 = rc;
	        if (da < π) {
	          var oc = x3 == null ? [ x2, y2 ] : x1 == null ? [ x0, y0 ] : d3_geom_polygonIntersect([ x0, y0 ], [ x3, y3 ], [ x1, y1 ], [ x2, y2 ]), ax = x0 - oc[0], ay = y0 - oc[1], bx = x1 - oc[0], by = y1 - oc[1], kc = 1 / Math.sin(Math.acos((ax * bx + ay * by) / (Math.sqrt(ax * ax + ay * ay) * Math.sqrt(bx * bx + by * by))) / 2), lc = Math.sqrt(oc[0] * oc[0] + oc[1] * oc[1]);
	          rc0 = Math.min(rc, (r0 - lc) / (kc - 1));
	          rc1 = Math.min(rc, (r1 - lc) / (kc + 1));
	        }
	        if (x1 != null) {
	          var t30 = d3_svg_arcCornerTangents(x3 == null ? [ x2, y2 ] : [ x3, y3 ], [ x0, y0 ], r1, rc1, cw), t12 = d3_svg_arcCornerTangents([ x1, y1 ], [ x2, y2 ], r1, rc1, cw);
	          if (rc === rc1) {
	            path.push("M", t30[0], "A", rc1, ",", rc1, " 0 0,", cr, " ", t30[1], "A", r1, ",", r1, " 0 ", 1 - cw ^ d3_svg_arcSweep(t30[1][0], t30[1][1], t12[1][0], t12[1][1]), ",", cw, " ", t12[1], "A", rc1, ",", rc1, " 0 0,", cr, " ", t12[0]);
	          } else {
	            path.push("M", t30[0], "A", rc1, ",", rc1, " 0 1,", cr, " ", t12[0]);
	          }
	        } else {
	          path.push("M", x0, ",", y0);
	        }
	        if (x3 != null) {
	          var t03 = d3_svg_arcCornerTangents([ x0, y0 ], [ x3, y3 ], r0, -rc0, cw), t21 = d3_svg_arcCornerTangents([ x2, y2 ], x1 == null ? [ x0, y0 ] : [ x1, y1 ], r0, -rc0, cw);
	          if (rc === rc0) {
	            path.push("L", t21[0], "A", rc0, ",", rc0, " 0 0,", cr, " ", t21[1], "A", r0, ",", r0, " 0 ", cw ^ d3_svg_arcSweep(t21[1][0], t21[1][1], t03[1][0], t03[1][1]), ",", 1 - cw, " ", t03[1], "A", rc0, ",", rc0, " 0 0,", cr, " ", t03[0]);
	          } else {
	            path.push("L", t21[0], "A", rc0, ",", rc0, " 0 0,", cr, " ", t03[0]);
	          }
	        } else {
	          path.push("L", x2, ",", y2);
	        }
	      } else {
	        path.push("M", x0, ",", y0);
	        if (x1 != null) path.push("A", r1, ",", r1, " 0 ", l1, ",", cw, " ", x1, ",", y1);
	        path.push("L", x2, ",", y2);
	        if (x3 != null) path.push("A", r0, ",", r0, " 0 ", l0, ",", 1 - cw, " ", x3, ",", y3);
	      }
	      path.push("Z");
	      return path.join("");
	    }
	    function circleSegment(r1, cw) {
	      return "M0," + r1 + "A" + r1 + "," + r1 + " 0 1," + cw + " 0," + -r1 + "A" + r1 + "," + r1 + " 0 1," + cw + " 0," + r1;
	    }
	    arc.innerRadius = function(v) {
	      if (!arguments.length) return innerRadius;
	      innerRadius = d3_functor(v);
	      return arc;
	    };
	    arc.outerRadius = function(v) {
	      if (!arguments.length) return outerRadius;
	      outerRadius = d3_functor(v);
	      return arc;
	    };
	    arc.cornerRadius = function(v) {
	      if (!arguments.length) return cornerRadius;
	      cornerRadius = d3_functor(v);
	      return arc;
	    };
	    arc.padRadius = function(v) {
	      if (!arguments.length) return padRadius;
	      padRadius = v == d3_svg_arcAuto ? d3_svg_arcAuto : d3_functor(v);
	      return arc;
	    };
	    arc.startAngle = function(v) {
	      if (!arguments.length) return startAngle;
	      startAngle = d3_functor(v);
	      return arc;
	    };
	    arc.endAngle = function(v) {
	      if (!arguments.length) return endAngle;
	      endAngle = d3_functor(v);
	      return arc;
	    };
	    arc.padAngle = function(v) {
	      if (!arguments.length) return padAngle;
	      padAngle = d3_functor(v);
	      return arc;
	    };
	    arc.centroid = function() {
	      var r = (+innerRadius.apply(this, arguments) + +outerRadius.apply(this, arguments)) / 2, a = (+startAngle.apply(this, arguments) + +endAngle.apply(this, arguments)) / 2 - halfπ;
	      return [ Math.cos(a) * r, Math.sin(a) * r ];
	    };
	    return arc;
	  };
	  var d3_svg_arcAuto = "auto";
	  function d3_svg_arcInnerRadius(d) {
	    return d.innerRadius;
	  }
	  function d3_svg_arcOuterRadius(d) {
	    return d.outerRadius;
	  }
	  function d3_svg_arcStartAngle(d) {
	    return d.startAngle;
	  }
	  function d3_svg_arcEndAngle(d) {
	    return d.endAngle;
	  }
	  function d3_svg_arcPadAngle(d) {
	    return d && d.padAngle;
	  }
	  function d3_svg_arcSweep(x0, y0, x1, y1) {
	    return (x0 - x1) * y0 - (y0 - y1) * x0 > 0 ? 0 : 1;
	  }
	  function d3_svg_arcCornerTangents(p0, p1, r1, rc, cw) {
	    var x01 = p0[0] - p1[0], y01 = p0[1] - p1[1], lo = (cw ? rc : -rc) / Math.sqrt(x01 * x01 + y01 * y01), ox = lo * y01, oy = -lo * x01, x1 = p0[0] + ox, y1 = p0[1] + oy, x2 = p1[0] + ox, y2 = p1[1] + oy, x3 = (x1 + x2) / 2, y3 = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, d2 = dx * dx + dy * dy, r = r1 - rc, D = x1 * y2 - x2 * y1, d = (dy < 0 ? -1 : 1) * Math.sqrt(Math.max(0, r * r * d2 - D * D)), cx0 = (D * dy - dx * d) / d2, cy0 = (-D * dx - dy * d) / d2, cx1 = (D * dy + dx * d) / d2, cy1 = (-D * dx + dy * d) / d2, dx0 = cx0 - x3, dy0 = cy0 - y3, dx1 = cx1 - x3, dy1 = cy1 - y3;
	    if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) cx0 = cx1, cy0 = cy1;
	    return [ [ cx0 - ox, cy0 - oy ], [ cx0 * r1 / r, cy0 * r1 / r ] ];
	  }
	  function d3_svg_line(projection) {
	    var x = d3_geom_pointX, y = d3_geom_pointY, defined = d3_true, interpolate = d3_svg_lineLinear, interpolateKey = interpolate.key, tension = .7;
	    function line(data) {
	      var segments = [], points = [], i = -1, n = data.length, d, fx = d3_functor(x), fy = d3_functor(y);
	      function segment() {
	        segments.push("M", interpolate(projection(points), tension));
	      }
	      while (++i < n) {
	        if (defined.call(this, d = data[i], i)) {
	          points.push([ +fx.call(this, d, i), +fy.call(this, d, i) ]);
	        } else if (points.length) {
	          segment();
	          points = [];
	        }
	      }
	      if (points.length) segment();
	      return segments.length ? segments.join("") : null;
	    }
	    line.x = function(_) {
	      if (!arguments.length) return x;
	      x = _;
	      return line;
	    };
	    line.y = function(_) {
	      if (!arguments.length) return y;
	      y = _;
	      return line;
	    };
	    line.defined = function(_) {
	      if (!arguments.length) return defined;
	      defined = _;
	      return line;
	    };
	    line.interpolate = function(_) {
	      if (!arguments.length) return interpolateKey;
	      if (typeof _ === "function") interpolateKey = interpolate = _; else interpolateKey = (interpolate = d3_svg_lineInterpolators.get(_) || d3_svg_lineLinear).key;
	      return line;
	    };
	    line.tension = function(_) {
	      if (!arguments.length) return tension;
	      tension = _;
	      return line;
	    };
	    return line;
	  }
	  d3.svg.line = function() {
	    return d3_svg_line(d3_identity);
	  };
	  var d3_svg_lineInterpolators = d3.map({
	    linear: d3_svg_lineLinear,
	    "linear-closed": d3_svg_lineLinearClosed,
	    step: d3_svg_lineStep,
	    "step-before": d3_svg_lineStepBefore,
	    "step-after": d3_svg_lineStepAfter,
	    basis: d3_svg_lineBasis,
	    "basis-open": d3_svg_lineBasisOpen,
	    "basis-closed": d3_svg_lineBasisClosed,
	    bundle: d3_svg_lineBundle,
	    cardinal: d3_svg_lineCardinal,
	    "cardinal-open": d3_svg_lineCardinalOpen,
	    "cardinal-closed": d3_svg_lineCardinalClosed,
	    monotone: d3_svg_lineMonotone
	  });
	  d3_svg_lineInterpolators.forEach(function(key, value) {
	    value.key = key;
	    value.closed = /-closed$/.test(key);
	  });
	  function d3_svg_lineLinear(points) {
	    return points.length > 1 ? points.join("L") : points + "Z";
	  }
	  function d3_svg_lineLinearClosed(points) {
	    return points.join("L") + "Z";
	  }
	  function d3_svg_lineStep(points) {
	    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
	    while (++i < n) path.push("H", (p[0] + (p = points[i])[0]) / 2, "V", p[1]);
	    if (n > 1) path.push("H", p[0]);
	    return path.join("");
	  }
	  function d3_svg_lineStepBefore(points) {
	    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
	    while (++i < n) path.push("V", (p = points[i])[1], "H", p[0]);
	    return path.join("");
	  }
	  function d3_svg_lineStepAfter(points) {
	    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
	    while (++i < n) path.push("H", (p = points[i])[0], "V", p[1]);
	    return path.join("");
	  }
	  function d3_svg_lineCardinalOpen(points, tension) {
	    return points.length < 4 ? d3_svg_lineLinear(points) : points[1] + d3_svg_lineHermite(points.slice(1, -1), d3_svg_lineCardinalTangents(points, tension));
	  }
	  function d3_svg_lineCardinalClosed(points, tension) {
	    return points.length < 3 ? d3_svg_lineLinearClosed(points) : points[0] + d3_svg_lineHermite((points.push(points[0]), 
	    points), d3_svg_lineCardinalTangents([ points[points.length - 2] ].concat(points, [ points[1] ]), tension));
	  }
	  function d3_svg_lineCardinal(points, tension) {
	    return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineCardinalTangents(points, tension));
	  }
	  function d3_svg_lineHermite(points, tangents) {
	    if (tangents.length < 1 || points.length != tangents.length && points.length != tangents.length + 2) {
	      return d3_svg_lineLinear(points);
	    }
	    var quad = points.length != tangents.length, path = "", p0 = points[0], p = points[1], t0 = tangents[0], t = t0, pi = 1;
	    if (quad) {
	      path += "Q" + (p[0] - t0[0] * 2 / 3) + "," + (p[1] - t0[1] * 2 / 3) + "," + p[0] + "," + p[1];
	      p0 = points[1];
	      pi = 2;
	    }
	    if (tangents.length > 1) {
	      t = tangents[1];
	      p = points[pi];
	      pi++;
	      path += "C" + (p0[0] + t0[0]) + "," + (p0[1] + t0[1]) + "," + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
	      for (var i = 2; i < tangents.length; i++, pi++) {
	        p = points[pi];
	        t = tangents[i];
	        path += "S" + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
	      }
	    }
	    if (quad) {
	      var lp = points[pi];
	      path += "Q" + (p[0] + t[0] * 2 / 3) + "," + (p[1] + t[1] * 2 / 3) + "," + lp[0] + "," + lp[1];
	    }
	    return path;
	  }
	  function d3_svg_lineCardinalTangents(points, tension) {
	    var tangents = [], a = (1 - tension) / 2, p0, p1 = points[0], p2 = points[1], i = 1, n = points.length;
	    while (++i < n) {
	      p0 = p1;
	      p1 = p2;
	      p2 = points[i];
	      tangents.push([ a * (p2[0] - p0[0]), a * (p2[1] - p0[1]) ]);
	    }
	    return tangents;
	  }
	  function d3_svg_lineBasis(points) {
	    if (points.length < 3) return d3_svg_lineLinear(points);
	    var i = 1, n = points.length, pi = points[0], x0 = pi[0], y0 = pi[1], px = [ x0, x0, x0, (pi = points[1])[0] ], py = [ y0, y0, y0, pi[1] ], path = [ x0, ",", y0, "L", d3_svg_lineDot4(d3_svg_lineBasisBezier3, px), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, py) ];
	    points.push(points[n - 1]);
	    while (++i <= n) {
	      pi = points[i];
	      px.shift();
	      px.push(pi[0]);
	      py.shift();
	      py.push(pi[1]);
	      d3_svg_lineBasisBezier(path, px, py);
	    }
	    points.pop();
	    path.push("L", pi);
	    return path.join("");
	  }
	  function d3_svg_lineBasisOpen(points) {
	    if (points.length < 4) return d3_svg_lineLinear(points);
	    var path = [], i = -1, n = points.length, pi, px = [ 0 ], py = [ 0 ];
	    while (++i < 3) {
	      pi = points[i];
	      px.push(pi[0]);
	      py.push(pi[1]);
	    }
	    path.push(d3_svg_lineDot4(d3_svg_lineBasisBezier3, px) + "," + d3_svg_lineDot4(d3_svg_lineBasisBezier3, py));
	    --i;
	    while (++i < n) {
	      pi = points[i];
	      px.shift();
	      px.push(pi[0]);
	      py.shift();
	      py.push(pi[1]);
	      d3_svg_lineBasisBezier(path, px, py);
	    }
	    return path.join("");
	  }
	  function d3_svg_lineBasisClosed(points) {
	    var path, i = -1, n = points.length, m = n + 4, pi, px = [], py = [];
	    while (++i < 4) {
	      pi = points[i % n];
	      px.push(pi[0]);
	      py.push(pi[1]);
	    }
	    path = [ d3_svg_lineDot4(d3_svg_lineBasisBezier3, px), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, py) ];
	    --i;
	    while (++i < m) {
	      pi = points[i % n];
	      px.shift();
	      px.push(pi[0]);
	      py.shift();
	      py.push(pi[1]);
	      d3_svg_lineBasisBezier(path, px, py);
	    }
	    return path.join("");
	  }
	  function d3_svg_lineBundle(points, tension) {
	    var n = points.length - 1;
	    if (n) {
	      var x0 = points[0][0], y0 = points[0][1], dx = points[n][0] - x0, dy = points[n][1] - y0, i = -1, p, t;
	      while (++i <= n) {
	        p = points[i];
	        t = i / n;
	        p[0] = tension * p[0] + (1 - tension) * (x0 + t * dx);
	        p[1] = tension * p[1] + (1 - tension) * (y0 + t * dy);
	      }
	    }
	    return d3_svg_lineBasis(points);
	  }
	  function d3_svg_lineDot4(a, b) {
	    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
	  }
	  var d3_svg_lineBasisBezier1 = [ 0, 2 / 3, 1 / 3, 0 ], d3_svg_lineBasisBezier2 = [ 0, 1 / 3, 2 / 3, 0 ], d3_svg_lineBasisBezier3 = [ 0, 1 / 6, 2 / 3, 1 / 6 ];
	  function d3_svg_lineBasisBezier(path, x, y) {
	    path.push("C", d3_svg_lineDot4(d3_svg_lineBasisBezier1, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier1, y), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, y), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, y));
	  }
	  function d3_svg_lineSlope(p0, p1) {
	    return (p1[1] - p0[1]) / (p1[0] - p0[0]);
	  }
	  function d3_svg_lineFiniteDifferences(points) {
	    var i = 0, j = points.length - 1, m = [], p0 = points[0], p1 = points[1], d = m[0] = d3_svg_lineSlope(p0, p1);
	    while (++i < j) {
	      m[i] = (d + (d = d3_svg_lineSlope(p0 = p1, p1 = points[i + 1]))) / 2;
	    }
	    m[i] = d;
	    return m;
	  }
	  function d3_svg_lineMonotoneTangents(points) {
	    var tangents = [], d, a, b, s, m = d3_svg_lineFiniteDifferences(points), i = -1, j = points.length - 1;
	    while (++i < j) {
	      d = d3_svg_lineSlope(points[i], points[i + 1]);
	      if (abs(d) < ε) {
	        m[i] = m[i + 1] = 0;
	      } else {
	        a = m[i] / d;
	        b = m[i + 1] / d;
	        s = a * a + b * b;
	        if (s > 9) {
	          s = d * 3 / Math.sqrt(s);
	          m[i] = s * a;
	          m[i + 1] = s * b;
	        }
	      }
	    }
	    i = -1;
	    while (++i <= j) {
	      s = (points[Math.min(j, i + 1)][0] - points[Math.max(0, i - 1)][0]) / (6 * (1 + m[i] * m[i]));
	      tangents.push([ s || 0, m[i] * s || 0 ]);
	    }
	    return tangents;
	  }
	  function d3_svg_lineMonotone(points) {
	    return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineMonotoneTangents(points));
	  }
	  d3.svg.line.radial = function() {
	    var line = d3_svg_line(d3_svg_lineRadial);
	    line.radius = line.x, delete line.x;
	    line.angle = line.y, delete line.y;
	    return line;
	  };
	  function d3_svg_lineRadial(points) {
	    var point, i = -1, n = points.length, r, a;
	    while (++i < n) {
	      point = points[i];
	      r = point[0];
	      a = point[1] - halfπ;
	      point[0] = r * Math.cos(a);
	      point[1] = r * Math.sin(a);
	    }
	    return points;
	  }
	  function d3_svg_area(projection) {
	    var x0 = d3_geom_pointX, x1 = d3_geom_pointX, y0 = 0, y1 = d3_geom_pointY, defined = d3_true, interpolate = d3_svg_lineLinear, interpolateKey = interpolate.key, interpolateReverse = interpolate, L = "L", tension = .7;
	    function area(data) {
	      var segments = [], points0 = [], points1 = [], i = -1, n = data.length, d, fx0 = d3_functor(x0), fy0 = d3_functor(y0), fx1 = x0 === x1 ? function() {
	        return x;
	      } : d3_functor(x1), fy1 = y0 === y1 ? function() {
	        return y;
	      } : d3_functor(y1), x, y;
	      function segment() {
	        segments.push("M", interpolate(projection(points1), tension), L, interpolateReverse(projection(points0.reverse()), tension), "Z");
	      }
	      while (++i < n) {
	        if (defined.call(this, d = data[i], i)) {
	          points0.push([ x = +fx0.call(this, d, i), y = +fy0.call(this, d, i) ]);
	          points1.push([ +fx1.call(this, d, i), +fy1.call(this, d, i) ]);
	        } else if (points0.length) {
	          segment();
	          points0 = [];
	          points1 = [];
	        }
	      }
	      if (points0.length) segment();
	      return segments.length ? segments.join("") : null;
	    }
	    area.x = function(_) {
	      if (!arguments.length) return x1;
	      x0 = x1 = _;
	      return area;
	    };
	    area.x0 = function(_) {
	      if (!arguments.length) return x0;
	      x0 = _;
	      return area;
	    };
	    area.x1 = function(_) {
	      if (!arguments.length) return x1;
	      x1 = _;
	      return area;
	    };
	    area.y = function(_) {
	      if (!arguments.length) return y1;
	      y0 = y1 = _;
	      return area;
	    };
	    area.y0 = function(_) {
	      if (!arguments.length) return y0;
	      y0 = _;
	      return area;
	    };
	    area.y1 = function(_) {
	      if (!arguments.length) return y1;
	      y1 = _;
	      return area;
	    };
	    area.defined = function(_) {
	      if (!arguments.length) return defined;
	      defined = _;
	      return area;
	    };
	    area.interpolate = function(_) {
	      if (!arguments.length) return interpolateKey;
	      if (typeof _ === "function") interpolateKey = interpolate = _; else interpolateKey = (interpolate = d3_svg_lineInterpolators.get(_) || d3_svg_lineLinear).key;
	      interpolateReverse = interpolate.reverse || interpolate;
	      L = interpolate.closed ? "M" : "L";
	      return area;
	    };
	    area.tension = function(_) {
	      if (!arguments.length) return tension;
	      tension = _;
	      return area;
	    };
	    return area;
	  }
	  d3_svg_lineStepBefore.reverse = d3_svg_lineStepAfter;
	  d3_svg_lineStepAfter.reverse = d3_svg_lineStepBefore;
	  d3.svg.area = function() {
	    return d3_svg_area(d3_identity);
	  };
	  d3.svg.area.radial = function() {
	    var area = d3_svg_area(d3_svg_lineRadial);
	    area.radius = area.x, delete area.x;
	    area.innerRadius = area.x0, delete area.x0;
	    area.outerRadius = area.x1, delete area.x1;
	    area.angle = area.y, delete area.y;
	    area.startAngle = area.y0, delete area.y0;
	    area.endAngle = area.y1, delete area.y1;
	    return area;
	  };
	  d3.svg.chord = function() {
	    var source = d3_source, target = d3_target, radius = d3_svg_chordRadius, startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle;
	    function chord(d, i) {
	      var s = subgroup(this, source, d, i), t = subgroup(this, target, d, i);
	      return "M" + s.p0 + arc(s.r, s.p1, s.a1 - s.a0) + (equals(s, t) ? curve(s.r, s.p1, s.r, s.p0) : curve(s.r, s.p1, t.r, t.p0) + arc(t.r, t.p1, t.a1 - t.a0) + curve(t.r, t.p1, s.r, s.p0)) + "Z";
	    }
	    function subgroup(self, f, d, i) {
	      var subgroup = f.call(self, d, i), r = radius.call(self, subgroup, i), a0 = startAngle.call(self, subgroup, i) - halfπ, a1 = endAngle.call(self, subgroup, i) - halfπ;
	      return {
	        r: r,
	        a0: a0,
	        a1: a1,
	        p0: [ r * Math.cos(a0), r * Math.sin(a0) ],
	        p1: [ r * Math.cos(a1), r * Math.sin(a1) ]
	      };
	    }
	    function equals(a, b) {
	      return a.a0 == b.a0 && a.a1 == b.a1;
	    }
	    function arc(r, p, a) {
	      return "A" + r + "," + r + " 0 " + +(a > π) + ",1 " + p;
	    }
	    function curve(r0, p0, r1, p1) {
	      return "Q 0,0 " + p1;
	    }
	    chord.radius = function(v) {
	      if (!arguments.length) return radius;
	      radius = d3_functor(v);
	      return chord;
	    };
	    chord.source = function(v) {
	      if (!arguments.length) return source;
	      source = d3_functor(v);
	      return chord;
	    };
	    chord.target = function(v) {
	      if (!arguments.length) return target;
	      target = d3_functor(v);
	      return chord;
	    };
	    chord.startAngle = function(v) {
	      if (!arguments.length) return startAngle;
	      startAngle = d3_functor(v);
	      return chord;
	    };
	    chord.endAngle = function(v) {
	      if (!arguments.length) return endAngle;
	      endAngle = d3_functor(v);
	      return chord;
	    };
	    return chord;
	  };
	  function d3_svg_chordRadius(d) {
	    return d.radius;
	  }
	  d3.svg.diagonal = function() {
	    var source = d3_source, target = d3_target, projection = d3_svg_diagonalProjection;
	    function diagonal(d, i) {
	      var p0 = source.call(this, d, i), p3 = target.call(this, d, i), m = (p0.y + p3.y) / 2, p = [ p0, {
	        x: p0.x,
	        y: m
	      }, {
	        x: p3.x,
	        y: m
	      }, p3 ];
	      p = p.map(projection);
	      return "M" + p[0] + "C" + p[1] + " " + p[2] + " " + p[3];
	    }
	    diagonal.source = function(x) {
	      if (!arguments.length) return source;
	      source = d3_functor(x);
	      return diagonal;
	    };
	    diagonal.target = function(x) {
	      if (!arguments.length) return target;
	      target = d3_functor(x);
	      return diagonal;
	    };
	    diagonal.projection = function(x) {
	      if (!arguments.length) return projection;
	      projection = x;
	      return diagonal;
	    };
	    return diagonal;
	  };
	  function d3_svg_diagonalProjection(d) {
	    return [ d.x, d.y ];
	  }
	  d3.svg.diagonal.radial = function() {
	    var diagonal = d3.svg.diagonal(), projection = d3_svg_diagonalProjection, projection_ = diagonal.projection;
	    diagonal.projection = function(x) {
	      return arguments.length ? projection_(d3_svg_diagonalRadialProjection(projection = x)) : projection;
	    };
	    return diagonal;
	  };
	  function d3_svg_diagonalRadialProjection(projection) {
	    return function() {
	      var d = projection.apply(this, arguments), r = d[0], a = d[1] - halfπ;
	      return [ r * Math.cos(a), r * Math.sin(a) ];
	    };
	  }
	  d3.svg.symbol = function() {
	    var type = d3_svg_symbolType, size = d3_svg_symbolSize;
	    function symbol(d, i) {
	      return (d3_svg_symbols.get(type.call(this, d, i)) || d3_svg_symbolCircle)(size.call(this, d, i));
	    }
	    symbol.type = function(x) {
	      if (!arguments.length) return type;
	      type = d3_functor(x);
	      return symbol;
	    };
	    symbol.size = function(x) {
	      if (!arguments.length) return size;
	      size = d3_functor(x);
	      return symbol;
	    };
	    return symbol;
	  };
	  function d3_svg_symbolSize() {
	    return 64;
	  }
	  function d3_svg_symbolType() {
	    return "circle";
	  }
	  function d3_svg_symbolCircle(size) {
	    var r = Math.sqrt(size / π);
	    return "M0," + r + "A" + r + "," + r + " 0 1,1 0," + -r + "A" + r + "," + r + " 0 1,1 0," + r + "Z";
	  }
	  var d3_svg_symbols = d3.map({
	    circle: d3_svg_symbolCircle,
	    cross: function(size) {
	      var r = Math.sqrt(size / 5) / 2;
	      return "M" + -3 * r + "," + -r + "H" + -r + "V" + -3 * r + "H" + r + "V" + -r + "H" + 3 * r + "V" + r + "H" + r + "V" + 3 * r + "H" + -r + "V" + r + "H" + -3 * r + "Z";
	    },
	    diamond: function(size) {
	      var ry = Math.sqrt(size / (2 * d3_svg_symbolTan30)), rx = ry * d3_svg_symbolTan30;
	      return "M0," + -ry + "L" + rx + ",0" + " 0," + ry + " " + -rx + ",0" + "Z";
	    },
	    square: function(size) {
	      var r = Math.sqrt(size) / 2;
	      return "M" + -r + "," + -r + "L" + r + "," + -r + " " + r + "," + r + " " + -r + "," + r + "Z";
	    },
	    "triangle-down": function(size) {
	      var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
	      return "M0," + ry + "L" + rx + "," + -ry + " " + -rx + "," + -ry + "Z";
	    },
	    "triangle-up": function(size) {
	      var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
	      return "M0," + -ry + "L" + rx + "," + ry + " " + -rx + "," + ry + "Z";
	    }
	  });
	  d3.svg.symbolTypes = d3_svg_symbols.keys();
	  var d3_svg_symbolSqrt3 = Math.sqrt(3), d3_svg_symbolTan30 = Math.tan(30 * d3_radians);
	  d3_selectionPrototype.transition = function(name) {
	    var id = d3_transitionInheritId || ++d3_transitionId, ns = d3_transitionNamespace(name), subgroups = [], subgroup, node, transition = d3_transitionInherit || {
	      time: Date.now(),
	      ease: d3_ease_cubicInOut,
	      delay: 0,
	      duration: 250
	    };
	    for (var j = -1, m = this.length; ++j < m; ) {
	      subgroups.push(subgroup = []);
	      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
	        if (node = group[i]) d3_transitionNode(node, i, ns, id, transition);
	        subgroup.push(node);
	      }
	    }
	    return d3_transition(subgroups, ns, id);
	  };
	  d3_selectionPrototype.interrupt = function(name) {
	    return this.each(name == null ? d3_selection_interrupt : d3_selection_interruptNS(d3_transitionNamespace(name)));
	  };
	  var d3_selection_interrupt = d3_selection_interruptNS(d3_transitionNamespace());
	  function d3_selection_interruptNS(ns) {
	    return function() {
	      var lock, activeId, active;
	      if ((lock = this[ns]) && (active = lock[activeId = lock.active])) {
	        active.timer.c = null;
	        active.timer.t = NaN;
	        if (--lock.count) delete lock[activeId]; else delete this[ns];
	        lock.active += .5;
	        active.event && active.event.interrupt.call(this, this.__data__, active.index);
	      }
	    };
	  }
	  function d3_transition(groups, ns, id) {
	    d3_subclass(groups, d3_transitionPrototype);
	    groups.namespace = ns;
	    groups.id = id;
	    return groups;
	  }
	  var d3_transitionPrototype = [], d3_transitionId = 0, d3_transitionInheritId, d3_transitionInherit;
	  d3_transitionPrototype.call = d3_selectionPrototype.call;
	  d3_transitionPrototype.empty = d3_selectionPrototype.empty;
	  d3_transitionPrototype.node = d3_selectionPrototype.node;
	  d3_transitionPrototype.size = d3_selectionPrototype.size;
	  d3.transition = function(selection, name) {
	    return selection && selection.transition ? d3_transitionInheritId ? selection.transition(name) : selection : d3.selection().transition(selection);
	  };
	  d3.transition.prototype = d3_transitionPrototype;
	  d3_transitionPrototype.select = function(selector) {
	    var id = this.id, ns = this.namespace, subgroups = [], subgroup, subnode, node;
	    selector = d3_selection_selector(selector);
	    for (var j = -1, m = this.length; ++j < m; ) {
	      subgroups.push(subgroup = []);
	      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
	        if ((node = group[i]) && (subnode = selector.call(node, node.__data__, i, j))) {
	          if ("__data__" in node) subnode.__data__ = node.__data__;
	          d3_transitionNode(subnode, i, ns, id, node[ns][id]);
	          subgroup.push(subnode);
	        } else {
	          subgroup.push(null);
	        }
	      }
	    }
	    return d3_transition(subgroups, ns, id);
	  };
	  d3_transitionPrototype.selectAll = function(selector) {
	    var id = this.id, ns = this.namespace, subgroups = [], subgroup, subnodes, node, subnode, transition;
	    selector = d3_selection_selectorAll(selector);
	    for (var j = -1, m = this.length; ++j < m; ) {
	      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
	        if (node = group[i]) {
	          transition = node[ns][id];
	          subnodes = selector.call(node, node.__data__, i, j);
	          subgroups.push(subgroup = []);
	          for (var k = -1, o = subnodes.length; ++k < o; ) {
	            if (subnode = subnodes[k]) d3_transitionNode(subnode, k, ns, id, transition);
	            subgroup.push(subnode);
	          }
	        }
	      }
	    }
	    return d3_transition(subgroups, ns, id);
	  };
	  d3_transitionPrototype.filter = function(filter) {
	    var subgroups = [], subgroup, group, node;
	    if (typeof filter !== "function") filter = d3_selection_filter(filter);
	    for (var j = 0, m = this.length; j < m; j++) {
	      subgroups.push(subgroup = []);
	      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
	        if ((node = group[i]) && filter.call(node, node.__data__, i, j)) {
	          subgroup.push(node);
	        }
	      }
	    }
	    return d3_transition(subgroups, this.namespace, this.id);
	  };
	  d3_transitionPrototype.tween = function(name, tween) {
	    var id = this.id, ns = this.namespace;
	    if (arguments.length < 2) return this.node()[ns][id].tween.get(name);
	    return d3_selection_each(this, tween == null ? function(node) {
	      node[ns][id].tween.remove(name);
	    } : function(node) {
	      node[ns][id].tween.set(name, tween);
	    });
	  };
	  function d3_transition_tween(groups, name, value, tween) {
	    var id = groups.id, ns = groups.namespace;
	    return d3_selection_each(groups, typeof value === "function" ? function(node, i, j) {
	      node[ns][id].tween.set(name, tween(value.call(node, node.__data__, i, j)));
	    } : (value = tween(value), function(node) {
	      node[ns][id].tween.set(name, value);
	    }));
	  }
	  d3_transitionPrototype.attr = function(nameNS, value) {
	    if (arguments.length < 2) {
	      for (value in nameNS) this.attr(value, nameNS[value]);
	      return this;
	    }
	    var interpolate = nameNS == "transform" ? d3_interpolateTransform : d3_interpolate, name = d3.ns.qualify(nameNS);
	    function attrNull() {
	      this.removeAttribute(name);
	    }
	    function attrNullNS() {
	      this.removeAttributeNS(name.space, name.local);
	    }
	    function attrTween(b) {
	      return b == null ? attrNull : (b += "", function() {
	        var a = this.getAttribute(name), i;
	        return a !== b && (i = interpolate(a, b), function(t) {
	          this.setAttribute(name, i(t));
	        });
	      });
	    }
	    function attrTweenNS(b) {
	      return b == null ? attrNullNS : (b += "", function() {
	        var a = this.getAttributeNS(name.space, name.local), i;
	        return a !== b && (i = interpolate(a, b), function(t) {
	          this.setAttributeNS(name.space, name.local, i(t));
	        });
	      });
	    }
	    return d3_transition_tween(this, "attr." + nameNS, value, name.local ? attrTweenNS : attrTween);
	  };
	  d3_transitionPrototype.attrTween = function(nameNS, tween) {
	    var name = d3.ns.qualify(nameNS);
	    function attrTween(d, i) {
	      var f = tween.call(this, d, i, this.getAttribute(name));
	      return f && function(t) {
	        this.setAttribute(name, f(t));
	      };
	    }
	    function attrTweenNS(d, i) {
	      var f = tween.call(this, d, i, this.getAttributeNS(name.space, name.local));
	      return f && function(t) {
	        this.setAttributeNS(name.space, name.local, f(t));
	      };
	    }
	    return this.tween("attr." + nameNS, name.local ? attrTweenNS : attrTween);
	  };
	  d3_transitionPrototype.style = function(name, value, priority) {
	    var n = arguments.length;
	    if (n < 3) {
	      if (typeof name !== "string") {
	        if (n < 2) value = "";
	        for (priority in name) this.style(priority, name[priority], value);
	        return this;
	      }
	      priority = "";
	    }
	    function styleNull() {
	      this.style.removeProperty(name);
	    }
	    function styleString(b) {
	      return b == null ? styleNull : (b += "", function() {
	        var a = d3_window(this).getComputedStyle(this, null).getPropertyValue(name), i;
	        return a !== b && (i = d3_interpolate(a, b), function(t) {
	          this.style.setProperty(name, i(t), priority);
	        });
	      });
	    }
	    return d3_transition_tween(this, "style." + name, value, styleString);
	  };
	  d3_transitionPrototype.styleTween = function(name, tween, priority) {
	    if (arguments.length < 3) priority = "";
	    function styleTween(d, i) {
	      var f = tween.call(this, d, i, d3_window(this).getComputedStyle(this, null).getPropertyValue(name));
	      return f && function(t) {
	        this.style.setProperty(name, f(t), priority);
	      };
	    }
	    return this.tween("style." + name, styleTween);
	  };
	  d3_transitionPrototype.text = function(value) {
	    return d3_transition_tween(this, "text", value, d3_transition_text);
	  };
	  function d3_transition_text(b) {
	    if (b == null) b = "";
	    return function() {
	      this.textContent = b;
	    };
	  }
	  d3_transitionPrototype.remove = function() {
	    var ns = this.namespace;
	    return this.each("end.transition", function() {
	      var p;
	      if (this[ns].count < 2 && (p = this.parentNode)) p.removeChild(this);
	    });
	  };
	  d3_transitionPrototype.ease = function(value) {
	    var id = this.id, ns = this.namespace;
	    if (arguments.length < 1) return this.node()[ns][id].ease;
	    if (typeof value !== "function") value = d3.ease.apply(d3, arguments);
	    return d3_selection_each(this, function(node) {
	      node[ns][id].ease = value;
	    });
	  };
	  d3_transitionPrototype.delay = function(value) {
	    var id = this.id, ns = this.namespace;
	    if (arguments.length < 1) return this.node()[ns][id].delay;
	    return d3_selection_each(this, typeof value === "function" ? function(node, i, j) {
	      node[ns][id].delay = +value.call(node, node.__data__, i, j);
	    } : (value = +value, function(node) {
	      node[ns][id].delay = value;
	    }));
	  };
	  d3_transitionPrototype.duration = function(value) {
	    var id = this.id, ns = this.namespace;
	    if (arguments.length < 1) return this.node()[ns][id].duration;
	    return d3_selection_each(this, typeof value === "function" ? function(node, i, j) {
	      node[ns][id].duration = Math.max(1, value.call(node, node.__data__, i, j));
	    } : (value = Math.max(1, value), function(node) {
	      node[ns][id].duration = value;
	    }));
	  };
	  d3_transitionPrototype.each = function(type, listener) {
	    var id = this.id, ns = this.namespace;
	    if (arguments.length < 2) {
	      var inherit = d3_transitionInherit, inheritId = d3_transitionInheritId;
	      try {
	        d3_transitionInheritId = id;
	        d3_selection_each(this, function(node, i, j) {
	          d3_transitionInherit = node[ns][id];
	          type.call(node, node.__data__, i, j);
	        });
	      } finally {
	        d3_transitionInherit = inherit;
	        d3_transitionInheritId = inheritId;
	      }
	    } else {
	      d3_selection_each(this, function(node) {
	        var transition = node[ns][id];
	        (transition.event || (transition.event = d3.dispatch("start", "end", "interrupt"))).on(type, listener);
	      });
	    }
	    return this;
	  };
	  d3_transitionPrototype.transition = function() {
	    var id0 = this.id, id1 = ++d3_transitionId, ns = this.namespace, subgroups = [], subgroup, group, node, transition;
	    for (var j = 0, m = this.length; j < m; j++) {
	      subgroups.push(subgroup = []);
	      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
	        if (node = group[i]) {
	          transition = node[ns][id0];
	          d3_transitionNode(node, i, ns, id1, {
	            time: transition.time,
	            ease: transition.ease,
	            delay: transition.delay + transition.duration,
	            duration: transition.duration
	          });
	        }
	        subgroup.push(node);
	      }
	    }
	    return d3_transition(subgroups, ns, id1);
	  };
	  function d3_transitionNamespace(name) {
	    return name == null ? "__transition__" : "__transition_" + name + "__";
	  }
	  function d3_transitionNode(node, i, ns, id, inherit) {
	    var lock = node[ns] || (node[ns] = {
	      active: 0,
	      count: 0
	    }), transition = lock[id], time, timer, duration, ease, tweens;
	    function schedule(elapsed) {
	      var delay = transition.delay;
	      timer.t = delay + time;
	      if (delay <= elapsed) return start(elapsed - delay);
	      timer.c = start;
	    }
	    function start(elapsed) {
	      var activeId = lock.active, active = lock[activeId];
	      if (active) {
	        active.timer.c = null;
	        active.timer.t = NaN;
	        --lock.count;
	        delete lock[activeId];
	        active.event && active.event.interrupt.call(node, node.__data__, active.index);
	      }
	      for (var cancelId in lock) {
	        if (+cancelId < id) {
	          var cancel = lock[cancelId];
	          cancel.timer.c = null;
	          cancel.timer.t = NaN;
	          --lock.count;
	          delete lock[cancelId];
	        }
	      }
	      timer.c = tick;
	      d3_timer(function() {
	        if (timer.c && tick(elapsed || 1)) {
	          timer.c = null;
	          timer.t = NaN;
	        }
	        return 1;
	      }, 0, time);
	      lock.active = id;
	      transition.event && transition.event.start.call(node, node.__data__, i);
	      tweens = [];
	      transition.tween.forEach(function(key, value) {
	        if (value = value.call(node, node.__data__, i)) {
	          tweens.push(value);
	        }
	      });
	      ease = transition.ease;
	      duration = transition.duration;
	    }
	    function tick(elapsed) {
	      var t = elapsed / duration, e = ease(t), n = tweens.length;
	      while (n > 0) {
	        tweens[--n].call(node, e);
	      }
	      if (t >= 1) {
	        transition.event && transition.event.end.call(node, node.__data__, i);
	        if (--lock.count) delete lock[id]; else delete node[ns];
	        return 1;
	      }
	    }
	    if (!transition) {
	      time = inherit.time;
	      timer = d3_timer(schedule, 0, time);
	      transition = lock[id] = {
	        tween: new d3_Map(),
	        time: time,
	        timer: timer,
	        delay: inherit.delay,
	        duration: inherit.duration,
	        ease: inherit.ease,
	        index: i
	      };
	      inherit = null;
	      ++lock.count;
	    }
	  }
	  d3.svg.axis = function() {
	    var scale = d3.scale.linear(), orient = d3_svg_axisDefaultOrient, innerTickSize = 6, outerTickSize = 6, tickPadding = 3, tickArguments_ = [ 10 ], tickValues = null, tickFormat_;
	    function axis(g) {
	      g.each(function() {
	        var g = d3.select(this);
	        var scale0 = this.__chart__ || scale, scale1 = this.__chart__ = scale.copy();
	        var ticks = tickValues == null ? scale1.ticks ? scale1.ticks.apply(scale1, tickArguments_) : scale1.domain() : tickValues, tickFormat = tickFormat_ == null ? scale1.tickFormat ? scale1.tickFormat.apply(scale1, tickArguments_) : d3_identity : tickFormat_, tick = g.selectAll(".tick").data(ticks, scale1), tickEnter = tick.enter().insert("g", ".domain").attr("class", "tick").style("opacity", ε), tickExit = d3.transition(tick.exit()).style("opacity", ε).remove(), tickUpdate = d3.transition(tick.order()).style("opacity", 1), tickSpacing = Math.max(innerTickSize, 0) + tickPadding, tickTransform;
	        var range = d3_scaleRange(scale1), path = g.selectAll(".domain").data([ 0 ]), pathUpdate = (path.enter().append("path").attr("class", "domain"), 
	        d3.transition(path));
	        tickEnter.append("line");
	        tickEnter.append("text");
	        var lineEnter = tickEnter.select("line"), lineUpdate = tickUpdate.select("line"), text = tick.select("text").text(tickFormat), textEnter = tickEnter.select("text"), textUpdate = tickUpdate.select("text"), sign = orient === "top" || orient === "left" ? -1 : 1, x1, x2, y1, y2;
	        if (orient === "bottom" || orient === "top") {
	          tickTransform = d3_svg_axisX, x1 = "x", y1 = "y", x2 = "x2", y2 = "y2";
	          text.attr("dy", sign < 0 ? "0em" : ".71em").style("text-anchor", "middle");
	          pathUpdate.attr("d", "M" + range[0] + "," + sign * outerTickSize + "V0H" + range[1] + "V" + sign * outerTickSize);
	        } else {
	          tickTransform = d3_svg_axisY, x1 = "y", y1 = "x", x2 = "y2", y2 = "x2";
	          text.attr("dy", ".32em").style("text-anchor", sign < 0 ? "end" : "start");
	          pathUpdate.attr("d", "M" + sign * outerTickSize + "," + range[0] + "H0V" + range[1] + "H" + sign * outerTickSize);
	        }
	        lineEnter.attr(y2, sign * innerTickSize);
	        textEnter.attr(y1, sign * tickSpacing);
	        lineUpdate.attr(x2, 0).attr(y2, sign * innerTickSize);
	        textUpdate.attr(x1, 0).attr(y1, sign * tickSpacing);
	        if (scale1.rangeBand) {
	          var x = scale1, dx = x.rangeBand() / 2;
	          scale0 = scale1 = function(d) {
	            return x(d) + dx;
	          };
	        } else if (scale0.rangeBand) {
	          scale0 = scale1;
	        } else {
	          tickExit.call(tickTransform, scale1, scale0);
	        }
	        tickEnter.call(tickTransform, scale0, scale1);
	        tickUpdate.call(tickTransform, scale1, scale1);
	      });
	    }
	    axis.scale = function(x) {
	      if (!arguments.length) return scale;
	      scale = x;
	      return axis;
	    };
	    axis.orient = function(x) {
	      if (!arguments.length) return orient;
	      orient = x in d3_svg_axisOrients ? x + "" : d3_svg_axisDefaultOrient;
	      return axis;
	    };
	    axis.ticks = function() {
	      if (!arguments.length) return tickArguments_;
	      tickArguments_ = d3_array(arguments);
	      return axis;
	    };
	    axis.tickValues = function(x) {
	      if (!arguments.length) return tickValues;
	      tickValues = x;
	      return axis;
	    };
	    axis.tickFormat = function(x) {
	      if (!arguments.length) return tickFormat_;
	      tickFormat_ = x;
	      return axis;
	    };
	    axis.tickSize = function(x) {
	      var n = arguments.length;
	      if (!n) return innerTickSize;
	      innerTickSize = +x;
	      outerTickSize = +arguments[n - 1];
	      return axis;
	    };
	    axis.innerTickSize = function(x) {
	      if (!arguments.length) return innerTickSize;
	      innerTickSize = +x;
	      return axis;
	    };
	    axis.outerTickSize = function(x) {
	      if (!arguments.length) return outerTickSize;
	      outerTickSize = +x;
	      return axis;
	    };
	    axis.tickPadding = function(x) {
	      if (!arguments.length) return tickPadding;
	      tickPadding = +x;
	      return axis;
	    };
	    axis.tickSubdivide = function() {
	      return arguments.length && axis;
	    };
	    return axis;
	  };
	  var d3_svg_axisDefaultOrient = "bottom", d3_svg_axisOrients = {
	    top: 1,
	    right: 1,
	    bottom: 1,
	    left: 1
	  };
	  function d3_svg_axisX(selection, x0, x1) {
	    selection.attr("transform", function(d) {
	      var v0 = x0(d);
	      return "translate(" + (isFinite(v0) ? v0 : x1(d)) + ",0)";
	    });
	  }
	  function d3_svg_axisY(selection, y0, y1) {
	    selection.attr("transform", function(d) {
	      var v0 = y0(d);
	      return "translate(0," + (isFinite(v0) ? v0 : y1(d)) + ")";
	    });
	  }
	  d3.svg.brush = function() {
	    var event = d3_eventDispatch(brush, "brushstart", "brush", "brushend"), x = null, y = null, xExtent = [ 0, 0 ], yExtent = [ 0, 0 ], xExtentDomain, yExtentDomain, xClamp = true, yClamp = true, resizes = d3_svg_brushResizes[0];
	    function brush(g) {
	      g.each(function() {
	        var g = d3.select(this).style("pointer-events", "all").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)").on("mousedown.brush", brushstart).on("touchstart.brush", brushstart);
	        var background = g.selectAll(".background").data([ 0 ]);
	        background.enter().append("rect").attr("class", "background").style("visibility", "hidden").style("cursor", "crosshair");
	        g.selectAll(".extent").data([ 0 ]).enter().append("rect").attr("class", "extent").style("cursor", "move");
	        var resize = g.selectAll(".resize").data(resizes, d3_identity);
	        resize.exit().remove();
	        resize.enter().append("g").attr("class", function(d) {
	          return "resize " + d;
	        }).style("cursor", function(d) {
	          return d3_svg_brushCursor[d];
	        }).append("rect").attr("x", function(d) {
	          return /[ew]$/.test(d) ? -3 : null;
	        }).attr("y", function(d) {
	          return /^[ns]/.test(d) ? -3 : null;
	        }).attr("width", 6).attr("height", 6).style("visibility", "hidden");
	        resize.style("display", brush.empty() ? "none" : null);
	        var gUpdate = d3.transition(g), backgroundUpdate = d3.transition(background), range;
	        if (x) {
	          range = d3_scaleRange(x);
	          backgroundUpdate.attr("x", range[0]).attr("width", range[1] - range[0]);
	          redrawX(gUpdate);
	        }
	        if (y) {
	          range = d3_scaleRange(y);
	          backgroundUpdate.attr("y", range[0]).attr("height", range[1] - range[0]);
	          redrawY(gUpdate);
	        }
	        redraw(gUpdate);
	      });
	    }
	    brush.event = function(g) {
	      g.each(function() {
	        var event_ = event.of(this, arguments), extent1 = {
	          x: xExtent,
	          y: yExtent,
	          i: xExtentDomain,
	          j: yExtentDomain
	        }, extent0 = this.__chart__ || extent1;
	        this.__chart__ = extent1;
	        if (d3_transitionInheritId) {
	          d3.select(this).transition().each("start.brush", function() {
	            xExtentDomain = extent0.i;
	            yExtentDomain = extent0.j;
	            xExtent = extent0.x;
	            yExtent = extent0.y;
	            event_({
	              type: "brushstart"
	            });
	          }).tween("brush:brush", function() {
	            var xi = d3_interpolateArray(xExtent, extent1.x), yi = d3_interpolateArray(yExtent, extent1.y);
	            xExtentDomain = yExtentDomain = null;
	            return function(t) {
	              xExtent = extent1.x = xi(t);
	              yExtent = extent1.y = yi(t);
	              event_({
	                type: "brush",
	                mode: "resize"
	              });
	            };
	          }).each("end.brush", function() {
	            xExtentDomain = extent1.i;
	            yExtentDomain = extent1.j;
	            event_({
	              type: "brush",
	              mode: "resize"
	            });
	            event_({
	              type: "brushend"
	            });
	          });
	        } else {
	          event_({
	            type: "brushstart"
	          });
	          event_({
	            type: "brush",
	            mode: "resize"
	          });
	          event_({
	            type: "brushend"
	          });
	        }
	      });
	    };
	    function redraw(g) {
	      g.selectAll(".resize").attr("transform", function(d) {
	        return "translate(" + xExtent[+/e$/.test(d)] + "," + yExtent[+/^s/.test(d)] + ")";
	      });
	    }
	    function redrawX(g) {
	      g.select(".extent").attr("x", xExtent[0]);
	      g.selectAll(".extent,.n>rect,.s>rect").attr("width", xExtent[1] - xExtent[0]);
	    }
	    function redrawY(g) {
	      g.select(".extent").attr("y", yExtent[0]);
	      g.selectAll(".extent,.e>rect,.w>rect").attr("height", yExtent[1] - yExtent[0]);
	    }
	    function brushstart() {
	      var target = this, eventTarget = d3.select(d3.event.target), event_ = event.of(target, arguments), g = d3.select(target), resizing = eventTarget.datum(), resizingX = !/^(n|s)$/.test(resizing) && x, resizingY = !/^(e|w)$/.test(resizing) && y, dragging = eventTarget.classed("extent"), dragRestore = d3_event_dragSuppress(target), center, origin = d3.mouse(target), offset;
	      var w = d3.select(d3_window(target)).on("keydown.brush", keydown).on("keyup.brush", keyup);
	      if (d3.event.changedTouches) {
	        w.on("touchmove.brush", brushmove).on("touchend.brush", brushend);
	      } else {
	        w.on("mousemove.brush", brushmove).on("mouseup.brush", brushend);
	      }
	      g.interrupt().selectAll("*").interrupt();
	      if (dragging) {
	        origin[0] = xExtent[0] - origin[0];
	        origin[1] = yExtent[0] - origin[1];
	      } else if (resizing) {
	        var ex = +/w$/.test(resizing), ey = +/^n/.test(resizing);
	        offset = [ xExtent[1 - ex] - origin[0], yExtent[1 - ey] - origin[1] ];
	        origin[0] = xExtent[ex];
	        origin[1] = yExtent[ey];
	      } else if (d3.event.altKey) center = origin.slice();
	      g.style("pointer-events", "none").selectAll(".resize").style("display", null);
	      d3.select("body").style("cursor", eventTarget.style("cursor"));
	      event_({
	        type: "brushstart"
	      });
	      brushmove();
	      function keydown() {
	        if (d3.event.keyCode == 32) {
	          if (!dragging) {
	            center = null;
	            origin[0] -= xExtent[1];
	            origin[1] -= yExtent[1];
	            dragging = 2;
	          }
	          d3_eventPreventDefault();
	        }
	      }
	      function keyup() {
	        if (d3.event.keyCode == 32 && dragging == 2) {
	          origin[0] += xExtent[1];
	          origin[1] += yExtent[1];
	          dragging = 0;
	          d3_eventPreventDefault();
	        }
	      }
	      function brushmove() {
	        var point = d3.mouse(target), moved = false;
	        if (offset) {
	          point[0] += offset[0];
	          point[1] += offset[1];
	        }
	        if (!dragging) {
	          if (d3.event.altKey) {
	            if (!center) center = [ (xExtent[0] + xExtent[1]) / 2, (yExtent[0] + yExtent[1]) / 2 ];
	            origin[0] = xExtent[+(point[0] < center[0])];
	            origin[1] = yExtent[+(point[1] < center[1])];
	          } else center = null;
	        }
	        if (resizingX && move1(point, x, 0)) {
	          redrawX(g);
	          moved = true;
	        }
	        if (resizingY && move1(point, y, 1)) {
	          redrawY(g);
	          moved = true;
	        }
	        if (moved) {
	          redraw(g);
	          event_({
	            type: "brush",
	            mode: dragging ? "move" : "resize"
	          });
	        }
	      }
	      function move1(point, scale, i) {
	        var range = d3_scaleRange(scale), r0 = range[0], r1 = range[1], position = origin[i], extent = i ? yExtent : xExtent, size = extent[1] - extent[0], min, max;
	        if (dragging) {
	          r0 -= position;
	          r1 -= size + position;
	        }
	        min = (i ? yClamp : xClamp) ? Math.max(r0, Math.min(r1, point[i])) : point[i];
	        if (dragging) {
	          max = (min += position) + size;
	        } else {
	          if (center) position = Math.max(r0, Math.min(r1, 2 * center[i] - min));
	          if (position < min) {
	            max = min;
	            min = position;
	          } else {
	            max = position;
	          }
	        }
	        if (extent[0] != min || extent[1] != max) {
	          if (i) yExtentDomain = null; else xExtentDomain = null;
	          extent[0] = min;
	          extent[1] = max;
	          return true;
	        }
	      }
	      function brushend() {
	        brushmove();
	        g.style("pointer-events", "all").selectAll(".resize").style("display", brush.empty() ? "none" : null);
	        d3.select("body").style("cursor", null);
	        w.on("mousemove.brush", null).on("mouseup.brush", null).on("touchmove.brush", null).on("touchend.brush", null).on("keydown.brush", null).on("keyup.brush", null);
	        dragRestore();
	        event_({
	          type: "brushend"
	        });
	      }
	    }
	    brush.x = function(z) {
	      if (!arguments.length) return x;
	      x = z;
	      resizes = d3_svg_brushResizes[!x << 1 | !y];
	      return brush;
	    };
	    brush.y = function(z) {
	      if (!arguments.length) return y;
	      y = z;
	      resizes = d3_svg_brushResizes[!x << 1 | !y];
	      return brush;
	    };
	    brush.clamp = function(z) {
	      if (!arguments.length) return x && y ? [ xClamp, yClamp ] : x ? xClamp : y ? yClamp : null;
	      if (x && y) xClamp = !!z[0], yClamp = !!z[1]; else if (x) xClamp = !!z; else if (y) yClamp = !!z;
	      return brush;
	    };
	    brush.extent = function(z) {
	      var x0, x1, y0, y1, t;
	      if (!arguments.length) {
	        if (x) {
	          if (xExtentDomain) {
	            x0 = xExtentDomain[0], x1 = xExtentDomain[1];
	          } else {
	            x0 = xExtent[0], x1 = xExtent[1];
	            if (x.invert) x0 = x.invert(x0), x1 = x.invert(x1);
	            if (x1 < x0) t = x0, x0 = x1, x1 = t;
	          }
	        }
	        if (y) {
	          if (yExtentDomain) {
	            y0 = yExtentDomain[0], y1 = yExtentDomain[1];
	          } else {
	            y0 = yExtent[0], y1 = yExtent[1];
	            if (y.invert) y0 = y.invert(y0), y1 = y.invert(y1);
	            if (y1 < y0) t = y0, y0 = y1, y1 = t;
	          }
	        }
	        return x && y ? [ [ x0, y0 ], [ x1, y1 ] ] : x ? [ x0, x1 ] : y && [ y0, y1 ];
	      }
	      if (x) {
	        x0 = z[0], x1 = z[1];
	        if (y) x0 = x0[0], x1 = x1[0];
	        xExtentDomain = [ x0, x1 ];
	        if (x.invert) x0 = x(x0), x1 = x(x1);
	        if (x1 < x0) t = x0, x0 = x1, x1 = t;
	        if (x0 != xExtent[0] || x1 != xExtent[1]) xExtent = [ x0, x1 ];
	      }
	      if (y) {
	        y0 = z[0], y1 = z[1];
	        if (x) y0 = y0[1], y1 = y1[1];
	        yExtentDomain = [ y0, y1 ];
	        if (y.invert) y0 = y(y0), y1 = y(y1);
	        if (y1 < y0) t = y0, y0 = y1, y1 = t;
	        if (y0 != yExtent[0] || y1 != yExtent[1]) yExtent = [ y0, y1 ];
	      }
	      return brush;
	    };
	    brush.clear = function() {
	      if (!brush.empty()) {
	        xExtent = [ 0, 0 ], yExtent = [ 0, 0 ];
	        xExtentDomain = yExtentDomain = null;
	      }
	      return brush;
	    };
	    brush.empty = function() {
	      return !!x && xExtent[0] == xExtent[1] || !!y && yExtent[0] == yExtent[1];
	    };
	    return d3.rebind(brush, event, "on");
	  };
	  var d3_svg_brushCursor = {
	    n: "ns-resize",
	    e: "ew-resize",
	    s: "ns-resize",
	    w: "ew-resize",
	    nw: "nwse-resize",
	    ne: "nesw-resize",
	    se: "nwse-resize",
	    sw: "nesw-resize"
	  };
	  var d3_svg_brushResizes = [ [ "n", "e", "s", "w", "nw", "ne", "se", "sw" ], [ "e", "w" ], [ "n", "s" ], [] ];
	  var d3_time_format = d3_time.format = d3_locale_enUS.timeFormat;
	  var d3_time_formatUtc = d3_time_format.utc;
	  var d3_time_formatIso = d3_time_formatUtc("%Y-%m-%dT%H:%M:%S.%LZ");
	  d3_time_format.iso = Date.prototype.toISOString && +new Date("2000-01-01T00:00:00.000Z") ? d3_time_formatIsoNative : d3_time_formatIso;
	  function d3_time_formatIsoNative(date) {
	    return date.toISOString();
	  }
	  d3_time_formatIsoNative.parse = function(string) {
	    var date = new Date(string);
	    return isNaN(date) ? null : date;
	  };
	  d3_time_formatIsoNative.toString = d3_time_formatIso.toString;
	  d3_time.second = d3_time_interval(function(date) {
	    return new d3_date(Math.floor(date / 1e3) * 1e3);
	  }, function(date, offset) {
	    date.setTime(date.getTime() + Math.floor(offset) * 1e3);
	  }, function(date) {
	    return date.getSeconds();
	  });
	  d3_time.seconds = d3_time.second.range;
	  d3_time.seconds.utc = d3_time.second.utc.range;
	  d3_time.minute = d3_time_interval(function(date) {
	    return new d3_date(Math.floor(date / 6e4) * 6e4);
	  }, function(date, offset) {
	    date.setTime(date.getTime() + Math.floor(offset) * 6e4);
	  }, function(date) {
	    return date.getMinutes();
	  });
	  d3_time.minutes = d3_time.minute.range;
	  d3_time.minutes.utc = d3_time.minute.utc.range;
	  d3_time.hour = d3_time_interval(function(date) {
	    var timezone = date.getTimezoneOffset() / 60;
	    return new d3_date((Math.floor(date / 36e5 - timezone) + timezone) * 36e5);
	  }, function(date, offset) {
	    date.setTime(date.getTime() + Math.floor(offset) * 36e5);
	  }, function(date) {
	    return date.getHours();
	  });
	  d3_time.hours = d3_time.hour.range;
	  d3_time.hours.utc = d3_time.hour.utc.range;
	  d3_time.month = d3_time_interval(function(date) {
	    date = d3_time.day(date);
	    date.setDate(1);
	    return date;
	  }, function(date, offset) {
	    date.setMonth(date.getMonth() + offset);
	  }, function(date) {
	    return date.getMonth();
	  });
	  d3_time.months = d3_time.month.range;
	  d3_time.months.utc = d3_time.month.utc.range;
	  function d3_time_scale(linear, methods, format) {
	    function scale(x) {
	      return linear(x);
	    }
	    scale.invert = function(x) {
	      return d3_time_scaleDate(linear.invert(x));
	    };
	    scale.domain = function(x) {
	      if (!arguments.length) return linear.domain().map(d3_time_scaleDate);
	      linear.domain(x);
	      return scale;
	    };
	    function tickMethod(extent, count) {
	      var span = extent[1] - extent[0], target = span / count, i = d3.bisect(d3_time_scaleSteps, target);
	      return i == d3_time_scaleSteps.length ? [ methods.year, d3_scale_linearTickRange(extent.map(function(d) {
	        return d / 31536e6;
	      }), count)[2] ] : !i ? [ d3_time_scaleMilliseconds, d3_scale_linearTickRange(extent, count)[2] ] : methods[target / d3_time_scaleSteps[i - 1] < d3_time_scaleSteps[i] / target ? i - 1 : i];
	    }
	    scale.nice = function(interval, skip) {
	      var domain = scale.domain(), extent = d3_scaleExtent(domain), method = interval == null ? tickMethod(extent, 10) : typeof interval === "number" && tickMethod(extent, interval);
	      if (method) interval = method[0], skip = method[1];
	      function skipped(date) {
	        return !isNaN(date) && !interval.range(date, d3_time_scaleDate(+date + 1), skip).length;
	      }
	      return scale.domain(d3_scale_nice(domain, skip > 1 ? {
	        floor: function(date) {
	          while (skipped(date = interval.floor(date))) date = d3_time_scaleDate(date - 1);
	          return date;
	        },
	        ceil: function(date) {
	          while (skipped(date = interval.ceil(date))) date = d3_time_scaleDate(+date + 1);
	          return date;
	        }
	      } : interval));
	    };
	    scale.ticks = function(interval, skip) {
	      var extent = d3_scaleExtent(scale.domain()), method = interval == null ? tickMethod(extent, 10) : typeof interval === "number" ? tickMethod(extent, interval) : !interval.range && [ {
	        range: interval
	      }, skip ];
	      if (method) interval = method[0], skip = method[1];
	      return interval.range(extent[0], d3_time_scaleDate(+extent[1] + 1), skip < 1 ? 1 : skip);
	    };
	    scale.tickFormat = function() {
	      return format;
	    };
	    scale.copy = function() {
	      return d3_time_scale(linear.copy(), methods, format);
	    };
	    return d3_scale_linearRebind(scale, linear);
	  }
	  function d3_time_scaleDate(t) {
	    return new Date(t);
	  }
	  var d3_time_scaleSteps = [ 1e3, 5e3, 15e3, 3e4, 6e4, 3e5, 9e5, 18e5, 36e5, 108e5, 216e5, 432e5, 864e5, 1728e5, 6048e5, 2592e6, 7776e6, 31536e6 ];
	  var d3_time_scaleLocalMethods = [ [ d3_time.second, 1 ], [ d3_time.second, 5 ], [ d3_time.second, 15 ], [ d3_time.second, 30 ], [ d3_time.minute, 1 ], [ d3_time.minute, 5 ], [ d3_time.minute, 15 ], [ d3_time.minute, 30 ], [ d3_time.hour, 1 ], [ d3_time.hour, 3 ], [ d3_time.hour, 6 ], [ d3_time.hour, 12 ], [ d3_time.day, 1 ], [ d3_time.day, 2 ], [ d3_time.week, 1 ], [ d3_time.month, 1 ], [ d3_time.month, 3 ], [ d3_time.year, 1 ] ];
	  var d3_time_scaleLocalFormat = d3_time_format.multi([ [ ".%L", function(d) {
	    return d.getMilliseconds();
	  } ], [ ":%S", function(d) {
	    return d.getSeconds();
	  } ], [ "%I:%M", function(d) {
	    return d.getMinutes();
	  } ], [ "%I %p", function(d) {
	    return d.getHours();
	  } ], [ "%a %d", function(d) {
	    return d.getDay() && d.getDate() != 1;
	  } ], [ "%b %d", function(d) {
	    return d.getDate() != 1;
	  } ], [ "%B", function(d) {
	    return d.getMonth();
	  } ], [ "%Y", d3_true ] ]);
	  var d3_time_scaleMilliseconds = {
	    range: function(start, stop, step) {
	      return d3.range(Math.ceil(start / step) * step, +stop, step).map(d3_time_scaleDate);
	    },
	    floor: d3_identity,
	    ceil: d3_identity
	  };
	  d3_time_scaleLocalMethods.year = d3_time.year;
	  d3_time.scale = function() {
	    return d3_time_scale(d3.scale.linear(), d3_time_scaleLocalMethods, d3_time_scaleLocalFormat);
	  };
	  var d3_time_scaleUtcMethods = d3_time_scaleLocalMethods.map(function(m) {
	    return [ m[0].utc, m[1] ];
	  });
	  var d3_time_scaleUtcFormat = d3_time_formatUtc.multi([ [ ".%L", function(d) {
	    return d.getUTCMilliseconds();
	  } ], [ ":%S", function(d) {
	    return d.getUTCSeconds();
	  } ], [ "%I:%M", function(d) {
	    return d.getUTCMinutes();
	  } ], [ "%I %p", function(d) {
	    return d.getUTCHours();
	  } ], [ "%a %d", function(d) {
	    return d.getUTCDay() && d.getUTCDate() != 1;
	  } ], [ "%b %d", function(d) {
	    return d.getUTCDate() != 1;
	  } ], [ "%B", function(d) {
	    return d.getUTCMonth();
	  } ], [ "%Y", d3_true ] ]);
	  d3_time_scaleUtcMethods.year = d3_time.year.utc;
	  d3_time.scale.utc = function() {
	    return d3_time_scale(d3.scale.linear(), d3_time_scaleUtcMethods, d3_time_scaleUtcFormat);
	  };
	  d3.text = d3_xhrType(function(request) {
	    return request.responseText;
	  });
	  d3.json = function(url, callback) {
	    return d3_xhr(url, "application/json", d3_json, callback);
	  };
	  function d3_json(request) {
	    return JSON.parse(request.responseText);
	  }
	  d3.html = function(url, callback) {
	    return d3_xhr(url, "text/html", d3_html, callback);
	  };
	  function d3_html(request) {
	    var range = d3_document.createRange();
	    range.selectNode(d3_document.body);
	    return range.createContextualFragment(request.responseText);
	  }
	  d3.xml = d3_xhrType(function(request) {
	    return request.responseXML;
	  });
	  if (true) this.d3 = d3, !(__WEBPACK_AMD_DEFINE_FACTORY__ = (d3), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); else if (typeof module === "object" && module.exports) module.exports = d3; else this.d3 = d3;
	}();

/***/ }
/******/ ]);
//# sourceMappingURL=main.map