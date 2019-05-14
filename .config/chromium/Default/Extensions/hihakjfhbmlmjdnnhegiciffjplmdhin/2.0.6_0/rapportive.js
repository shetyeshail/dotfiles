(function () {
    // Various bits of log-related code.
// FIXME: This could be much better encapsulated.

/*jslint plusplus: false */

// Cross-browser exception stack trace extractor & formatter. Borrowed heavily
// from: https://github.com/eriwen/javascript-stacktrace/blob/master/stacktrace.js
function stackTrace(e) {
    /**
     * Given an Error object, return a formatted Array based on Chrome's stack string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    function chrome(e) {
        var stack = (e.stack + '\n').replace(/^\S[^\(]+?[\n$]/gm, '')
          .replace(/^\s+at\s+/gm, '')
          .replace(/^([^\(]+?)([\n$])/gm, '{anonymous}()@$1$2')
          .replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}()@$1').split('\n');
        stack.pop();
        return stack;
    }

    /**
     * Given an Error object, return a formatted Array based on Firefox's stack string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    function firefox(e) {
        return e.stack.replace(/(?:\n@:0)?\s+$/m, '').replace(/^\(/gm, '{anonymous}(').split('\n');
    }

    /**
     * Given an Error object, return a formatted Array based on Opera 10's stacktrace string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    function opera10(e) {
        var stack = e.stacktrace;
        var lines = stack.split('\n'), ANON = '{anonymous}', lineRE = /.*line (\d+), column (\d+) in ((<anonymous function\:?\s*(\S+))|([^\(]+)\([^\)]*\))(?: in )?(.*)\s*$/i, i, j, len;
        for (i = 2, j = 0, len = lines.length; i < len - 2; i++) {
            if (lineRE.test(lines[i])) {
                var location = RegExp.$6 + ':' + RegExp.$1 + ':' + RegExp.$2;
                var fnName = RegExp.$3;
                fnName = fnName.replace(/<anonymous function\:?\s?(\S+)?>/g, ANON);
                lines[j++] = fnName + '@' + location;
            }
        }

        lines.splice(j, lines.length - j);
        return lines;
    }

    // Opera 7.x-9.x only!
    function opera(e) {
        var lines = e.message.split('\n'), ANON = '{anonymous}', lineRE = /Line\s+(\d+).*script\s+(http\S+)(?:.*in\s+function\s+(\S+))?/i, i, j, len;

        for (i = 4, j = 0, len = lines.length; i < len; i += 2) {
            //TODO: RegExp.exec() would probably be cleaner here
            if (lineRE.test(lines[i])) {
                lines[j++] = (RegExp.$3 ? RegExp.$3 + '()@' + RegExp.$2 + RegExp.$1 : ANON + '()@' + RegExp.$2 + ':' + RegExp.$1) + ' -- ' + lines[i + 1].replace(/^\s+/, '');
            }
        }

        lines.splice(j, lines.length - j);
        return lines;
    }

    function stringifyArguments(args) {
        var slice = Array.prototype.slice;
        for (var i = 0; i < args.length; ++i) {
            var arg = args[i];
            if (arg === undefined) {
                args[i] = 'undefined';
            } else if (arg === null) {
                args[i] = 'null';
            } else if (arg.constructor) {
                if (arg.constructor === Array) {
                    if (arg.length < 3) {
                        args[i] = '[' + stringifyArguments(arg) + ']';
                    } else {
                        args[i] = '[' + stringifyArguments(slice.call(arg, 0, 1)) + '...' + stringifyArguments(slice.call(arg, -1)) + ']';
                    }
                } else if (arg.constructor === Object) {
                    args[i] = '#object';
                } else if (arg.constructor === Function) {
                    args[i] = '#function';
                } else if (arg.constructor === String) {
                    args[i] = '"' + arg + '"';
                }
            }
        }
        return args.join(',');
    }

    // Safari, IE, and others
    function other(curr) {
        var ANON = '{anonymous}', fnRE = /function\s*([\w\-$]+)?\s*\(/i, stack = [], fn, args, maxStackSize = 10;
        while (curr && stack.length < maxStackSize) {
            fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
            args = Array.prototype.slice.call(curr['arguments'] || []);
            stack[stack.length] = fn + '(' + stringifyArguments(args) + ')';
            curr = curr.caller;
        }
        return stack;
    }

    if (e['arguments'] && e.stack) {
        return chrome(e);
    } else if (e.message && typeof window !== 'undefined' && window.opera) {
        return e.stacktrace ? opera10(e) : opera(e);
    } else if (e.stack) {
        return firefox(e);
    }
    return other(e);
}


// Executes a continuation loggily. In a loggy manner, you know. I mean, you give it a
// callback functions and it returns a wrapped function which does the same thing, but also
// catches any exceptions and logs them to the server. Now we have a reasonable chance of
// finding out about exceptions, and hey, we might even fix them! Wrap this function around
// any callback which gets executed in a new call stack, e.g. jQuery.ajax() or
// window.setTimeout(). Takes an error category to make it easier to trace errors.
//
// Example:
//      jQuery.getJSON(url, function (result) { ... });
// becomes:
//      jQuery.getJSON(url, loggily("widget.ping_server", function (result) { ... }));
function loggily(category, continuation) {
    return function loggilyInternal() {
        try {
            return continuation.apply(this, arguments);
        } catch (exception) {
            var e = exception; // jslint :(.
            // Convert strings into real exceptions,
            // the stack trace won't be quite right, but it's better than nowt.
            if (!e || typeof e !== 'object') {
                try {
                    throw new Error(e);
                } catch (e2) {
                    e = e2;
                }
            }
            if (e.loggedByLoggily) {
                throw e;
            }
            var exception_details = {};
            var trace = stackTrace(e);
            if (trace) {
                exception_details.backtrace = trace.join("\n");
            }
            exception_details.message = (e && e.message ? e.message : "" + e);

            rapportiveLogger.error(category, "Rapportive exception: " + e, exception_details);
            rapportiveLogger.consoleLog("Rapportive exception: " + category + ": " + e);
            if (exception_details.backtrace) {
                rapportiveLogger.consoleLog(exception_details.backtrace);
            }
            try {
                // Don't loggily the same exception multiple times, if we can avoid it.
                e.loggedByLoggily = true;
            } catch (e3) {
                // Firefox: Cannot modify properties of a WrappedNative
            }
            throw e;
        }
    };
}


// General-purpose logger implementation. Log events are sent to the browser console, and the
// intention is that they can also be sent to a server for further processing. The logging to server
// is actually removed for now, but we're keeping the framework in place so that we can add it again
// if required in future.
function RapportiveLogger(args) {
    var _public = {};

    var max_log_history = 10000; // maximum lines of console logs to store

    // internal use only: assign each level a code so we can compare them
    var levels = {
        all:      0,
        debug:   10,
        info:    20,
        warn:    30,
        warning: 30,
        error:   40,
        fatal:  100
    };

    args = args || {};

    // Master logging function.
    _public.log = function (level, category, message, params) {
        if (message === undefined && params === undefined) {
            // probably means it was called with one or two parameters,
            // i.e. you forgot the level and/or the category
            throw new Error("Please specify level, category and message");
        }

        if (levels[level] >= levels[args.min_level || 'warn']) {
            // log to server
        }
    };

    _public.debug = function (category, message, params) {
        _public.log("debug", category, message, params);
    };
    _public.info = function (category, message, params) {
        _public.log("info", category, message, params);
    };
    _public.warning = _public.warn = function (category, message, params) {
        _public.log("warning", category, message, params);
    };
    _public.error = function (category, message, params) {
        _public.log("error", category, message, params);
    };
    _public.fatal = function (category, message, params) {
        _public.log("fatal", category, message, params);
    };

    // Helper function to log an event which will be tracked in our analytics
    // If 'probability' argument is present, it will be passed down to the
    // server (in the params hash), which will use it as the probability with
    // which to send the event to Mixpanel.
    // It must be between 0 and 1 (i.e. it's a probability, not a percentage).
    _public.track = function (message, params, probability) {
        if (undefined !== probability) {
            var params_with_probability = {probability: probability};
            for (var param in params) {
                if (params.hasOwnProperty(param)) {
                    params_with_probability[param] = params[param];
                }
            }
            params = params_with_probability;
        }
        _public.log("info", "track", message, params);
    };

    // Browser console logging function (compatible with fsLog, which is used all over our codebase).
    // If only a message is given, only logs to the browser console and not to the server.
    //  - server_category: If set, we also log to the server.
    //  - server_level: Log level if message is sent to server. Default is "debug".
    _public.consoleLog = function (message, server_category, server_level) {
        var use_top_window = !args.in_iframe;

        // If the firebug console is available, log to it.
        try {
            if (use_top_window && window.top && window.top.console) {
                window.top.console.log(message);
            } else if (window.console) {
                window.console.log(message);
            }
        } catch (e) {
            // Firefox 3.6 throws a horrible security manager exception if you try to access window.top
            // from inside an extension.
        }
        _public.silentLog(message, server_category, server_level);
    };

    // Log an event to the in-browser log store, and (if a category is given) the server.
    //  - server_category: If set, we also log to the server.
    //  - server_level: Log level if message is sent to server. Default is "debug".
    _public.silentLog = function (message, server_category, server_level) {

        // Keep a history of log entries, if requested
        if (args.log_history) {
            while (args.log_history.length > max_log_history) {
                args.log_history.shift();
            }
            args.log_history.push('[' + (new Date()).toGMTString() + '] ' + message);
        }

        // Log to server if desired
        if (server_category) {
            _public.log(server_level || 'debug', server_category, message);
        }
    };

    return _public;
}


    var rapportiveLogger = RapportiveLogger(),
        fsLog = rapportiveLogger.consoleLog,
        lib = {};

    /*jslint onevar: false */
/*global window: false, fsLog: false, loggily: false */

// Function that waits for a condition and then does stuff.
// Used both by extensions and application.js
// Depends on logging.js

function delayedConditionalExecute(options) {
    // Define our default options
    var default_options = {
        poll_delay: 200,
        max_poll_attempts: 100,
        failure_message: "Ran out of delayedConditionalExecute search attempts -- giving up!",
        condition: function () {
            throw "No condition supplied to delayedConditionalExecute!";
        },
        continuation: function () { },
        error_continuation: function () { },
        log_level_on_failure: "error",
        log_level_on_error: null    // if falsy, use log_level_on_failure
    };

    // User supplied options override the defaults
    for (var key in options) {
        if (options.hasOwnProperty(key)) {
            default_options[key] = options[key];
        }
    }
    options = default_options;

    if (!options.log_category) {
        throw "delayedConditionalExecute needs a log_category";
    }

    var attempts = 0;

    // Generalised logger which allows the message to be a function
    function log(message, additional_message, category, level) {
        if (typeof(message) === "function") {
            message = message();
        }
        if (message) {
            fsLog(message + " " + (additional_message || ""), category, level);
        }
    }

    // Keep testing the continue condition until it becomes true, then run the continuation.
    function doAttempt() {
        if (options.condition()) { // If this line throws, it gets handled by our loggily wrappers
            loggily(options.log_category + ".success." + options.continuation.name, options.continuation)();
        } else {
            if (attempts < options.max_poll_attempts) {
                attempts += 1;
                log(options.retry_message);
                window.setTimeout(
                    loggily(options.log_category + ".attempt.subsequent", doAttempt),
                    options.poll_delay
                );
            } else {
                loggily(options.log_category + ".error." + options.error_continuation.name, options.error_continuation)();
                log(options.failure_message, null, options.log_category, options.log_level_on_failure);
            }
        }
    }

    loggily(options.log_category + ".attempt.first", doAttempt)();
}

// Fires the specified 'continuation' when the specified 'condition' jQuery expression evaluates as visible.
// Optionally accepts 'max_wait' as the maximum number of seconds we should be checking for.
function fireWhenVisible(options) {
    var attempts = 500, poll_delay = 20; // spin for upto 10 seconds by default

    if (options && options.max_wait) {
        attempts = (1000 / poll_delay) * options.max_wait;
    }
    delayedConditionalExecute({
        poll_delay: poll_delay,
        max_poll_attempts: attempts,
        failure_message: "Failed to find visible item",
        log_category: options.log_category,
        condition: function () {
            return options.condition().is(':visible');
        },
        continuation: options.continuation || function () {},
        error_continuation: options.error_continuation || function () {}
    });
}

    /*global delayedConditionalExecute */

// Takes a DOM document and tries to insert a script tag into its head.
// Prevents multiple insertions of script into the same document. Waits for the presence of the
// loaded_indicator attribute on the <html> element, which is taken to be an indication
// of Rapportive having successfully loaded.
//
// In the case of observable failure (i.e. the HTTP request to get the <script> tag we inserted
// failed to return a valid javascript response body with a status code of 200), we retry up to
// five times, taking care to count attempts made by other concurrently executing copies of this
// code.
lib.scriptTag = function (options) {

    var attempt = 1,

        // DOM document into whose head we should insert the script tag
        doc = options.document || document,

        // URL of the script to insert. The attempt number will be added as a query parameter.
        script_url = options.script_url,

        // DOM element ID of the script tag (used to detect multiple insertion)
        script_id = options.script_id,

        // Name of an attribute on the document's top-level <html> element that we use as indicator
        // that the script has correctly loaded. (It must be set by the inserted script.)
        loaded_indicator = options.loaded_indicator,

        // Log category to use for logging load failures to the server
        log_category = options.log_category || 'gmail.loader.initialize';


    // Add ?attempt=<n> to the script_url for the <n>th attempt.
    // Code inline from jQuery.utils#addParams
    function getAttemptUrl() {
        if (attempt === 1) {
            return script_url;
        } else {
            return script_url.replace(/(\?[^#]*)?(?=#|$)/, function (query) {
                return (query ? query + "&attempt=" : "?attempt=") + encodeURIComponent(attempt);
            });
        }
    }

    // Create the script tag referencing /load/application, unless it already exists.
    function createScriptElement() {
        var head = doc.getElementsByTagName("head")[0];
        if (head) {
            var script = doc.getElementById(script_id);
            if (script) {
                // Read the latest attempt number from the DOM so that all concurrently
                // running copies of the injection code know how many attempts have already
                // been tried.
                attempt = Number(script.getAttribute('data-rapportive-attempt')) + 1;
            } else {
                fsLog("Loading " + script_id + "... (attempt " + attempt + ")");

                script = doc.createElement("script");
                script.type = "text/javascript";
                script.src = getAttemptUrl();
                script.setAttribute("id", script_id);

                // Set the data-rapportive-attempt attribute to synchronize multiple concurrently
                // loading copies of the application.
                script.setAttribute("data-rapportive-attempt", attempt);
                script.addEventListener('error', function () {
                    // If loading the application fails, wait for a short time and then remove the
                    // script tag from the head. This will cause another attempt to insert the
                    // script tag if the delayedConditionalExecute below is still running.
                    window.setTimeout(function () {
                        head.removeChild(script);
                    }, 5000 * attempt);
                }, false);

                head.appendChild(script);
                attempt += 1;
            }
        }
    }

    delayedConditionalExecute({
        poll_delay: 1000,
        max_poll_attempts: 200,
        failure_message: 'Rapportive application injected, but failed to initialize',
        log_category: log_category,

        condition: function () {
            var html = doc.getElementsByTagName('html')[0];
            if (html && html.getAttribute(loaded_indicator) === 'true') {
                fsLog(loaded_indicator + ' ok');
                return true; // The script has loaded. We can calm down now.
            } else {
                if (attempt <= 5) {
                    createScriptElement();
                }

                return false;
            }
        }
    });
};


    function injectRapportive(doc) {
        lib.scriptTag({
            document: doc,
            script_url: 'https://rapportive.com/load/launchpad',
            script_id: 'rapportiveLaunchpad',
            loaded_indicator: 'data-rapportive-launchpad'
        });
    }

    // Safari, and the userscript in some browsers, run the rapportive extension on every
    // domain. Avoid spamming the console and the logs by aborting early if that has happened.
    if (document.location.host === 'mail.google.com') {
        fsLog('Bootstrapping Rapportive on ' + document.location.href);
        try {
            injectRapportive(document);
        } catch (e) {
            fsLog('Exception in Rapportive extension: ' + e, 'extension.setup', 'fatal');
        }
    }
}());
