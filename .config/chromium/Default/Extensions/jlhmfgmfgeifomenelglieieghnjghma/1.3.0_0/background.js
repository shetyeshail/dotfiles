// Background for Cisco WebEx Meeting Extension

//var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);

var Background = (function(self) {
    // native ports, map port name with port object
    var nativePorts = new Map();
    // client ports, map port name with port object
    var clientPorts = new Map();

    var hostName_ = "com.webex.meeting";

    // post message to page via client port
    self.postMessageToPage = function(name, message) {
        var clientPort = clientPorts.get(name);
        console.log('[Background] postMessageToPage: name=', name);
        console.log('[Background] postMessageToPage: clientPort=', clientPort);
        if (clientPort) {
            try {
                console.log('[Background] postMessageToPage: message=', message);
                clientPort.postMessage(message);
            } catch(e) {
                console.log('[Background] postMessageToPage: err=', e.toString());
            }
        } else {
        }
    };

    // post message to native via native port
    self.postMessageToNative = function(name, message) {
        var nativePort = nativePorts.get(name);
        console.log('[Background] postMessageToNative: name=', name);
        console.log('[Background] postMessageToNative: nativePort=', nativePort);
        if (nativePort) {
            try {
                console.log('[Background] postMessageToNative: message=', message);
                nativePort.postMessage(message);
            } catch(e) {
                var errorMsg = {
                    'timestamp': (new Date()).toUTCString(),
                    'token': name,
                    'message_type': 'error',
                    'message': {
                        'error_no': -1,
                        'error_message': e.toString()
                    }
                };
                self.postMessageToPage(nativePort.token, errorMsg);
                console.log('[Background] postMessageToNative: err=', e.toString());
            }
        } else {
        }
    };

    self.handleClientMessage = function(message, clientPort) {
        console.log('[Background] handleClientMessage: clientPort=', clientPort);
        console.log('[Background] handleClientMessage: message=', message);
        self.postMessageToNative(clientPort.name, message);
    };

    self.handleNativeMessage = function(message, nativePort) {
        console.log('[Background] handleNativeMessage: nativePort=', nativePort);
        console.log('[Background] handleNativeMessage: message=', message);
        self.postMessageToPage(nativePort.token, message);
    };

    self.handleNativeDisconnect = function(nativePort) {
        console.log('[Background] handleNativeDisconnect: nativePort=', nativePort);
        if (!nativePort)
            return ;
        console.log('[Background] handleNativeDisconnect: lastError=', chrome.runtime.lastError.message);

        if (nativePorts.get(nativePort.token)) {
            nativePorts.delete(nativePort.token);
        }
        console.log('[Background] handleNativeDisconnect: nativePorts=', nativePorts);

        var clientPort = clientPorts.get(nativePort.token);
        console.log('[Background] handleNativeDisconnect: clientPort=', clientPort);
        if (clientPort) {
            // send DISCONNECT message to PAGE
            var msg = {
                'timestamp': (new Date()).toUTCString(),
                'token': clientPort.name,
                'message_type': 'disconnect',
                'message': chrome.runtime.lastError.message
            };

            clientPort.postMessage(msg);
            clientPort.disconnect();
            if (clientPorts.get(clientPort.name)) {
                clientPorts.delete(clientPort.name);
            }
            console.log('[Background] handleNativeDisconnect: clientPorts=', clientPorts);
        }
    };

    self.handleClientDisconnect = function(clientPort) {
        console.log('[Background] handleClientDisconnect: clientPort=', clientPort);
        if (clientPorts.get(clientPort.name)) {
            clientPorts.delete(clientPort.name);
        }
        console.log('[Background] handleClientDisconnect: clientPorts=', clientPorts);

        var nativePort = nativePorts.get(clientPort.name);
        if (nativePort) {
            // send DISCONNECT message to NATIVE
            var msg = {
                    'timestamp': (new Date()).toUTCString(),
                    'token': nativePort.token,
                    'message_type': 'disconnect',
                    'message': 'disconnect'
            };
            self.postMessageToNative(nativePort.token, msg);
            if (nativePorts.get(nativePort.token)) {
                nativePorts.delete(nativePort.token);
            }
            console.log('[Background] handleClientDisconnect: nativePorts=', nativePorts);
        }
    };

    self.connectNative = function(name) {
        var nativePort = nativePorts.get(name);
        console.log('[Background] connectNative: name=', name);
        console.log('[Background] connectNative: nativePort=', nativePort, 'now=', performance.now());

        if (!nativePort) {
            try {
                nativePort = chrome.runtime.connectNative(hostName_);
                //console.log('[Background] connectNative: nativePort=', nativePort, 'now=', performance.now());
                nativePort.token = name;
                nativePort.onMessage.addListener(self.handleNativeMessage);
                nativePort.onDisconnect.addListener(self.handleNativeDisconnect);
                nativePorts.set(nativePort.token, nativePort);
                console.log('[Background] connectNative: nativePorts=', nativePorts);
            } catch (e) {
                console.log('[Background] connectNative: Failed connecting to native port,', e.toString());
                return null;
            }
        }
        return nativePort;
    };

    //self.handleClientDestroy = function(args) {
    //    console.log('[Background] self.handleClientDestroy: args=', args);
    //};

    self.handleClientConnect = function(clientPort) {
        console.log('[Background] chrome.runtime.onConnect, clientPort=', clientPort);
        //var portSenderId = clientPort.sender.id;

        //NOTE: CLIENT port and NATIVE port are one to one relationship

        clientPort.onMessage.addListener(self.handleClientMessage);
        clientPort.onDisconnect.addListener(self.handleClientDisconnect);
        //clientPort.onDestroy_ = self.handleClientDestroy;

        clientPorts.set(clientPort.name, clientPort);
        console.log('[Background] chrome.runtime.onConnect, clientPorts=', clientPorts);

        var nativePort = self.connectNative(clientPort.name);
        if (nativePort) {
            // send a HELLO message to NATIVE
            var helloMsg = {
                'timestamp': (new Date()).toUTCString(),
                'token': clientPort.name,
                'message_type': 'hello',
                'message': 'hello'
            };
            self.postMessageToNative(clientPort.name, helloMsg);
        }
    };

    self.doiReady = false;
    self.appID = '65014E32-67C8-4698-9D92-9528BE74F65A';
    self.telemetryURL = 'https://sec-tws-prod-vip.webex.com/metric/v1';

    self.initDoi = function() {
        //console.log('[Background] initDoi');
        if (self.doiReady) {
            return;
        }
        /*
        var siteName = window.location.host.replace(/(\.(qa|webex|com|cn)|:\d+)/g, '');
        var metricsURL = self.telemetryURL + (/\?/.test(self.telemetryURL) ? '&' : '?')
                            + 'sitename=' + siteName
                            + '&appid=' + self.appID;
        */
        //console.log('[Background] initDoi, siteName=', siteName, 'metricsURL=', metricsURL);
        // default doi header
        var header = {
            appID: self.appID,
            metricsURL: self.telemetryURL,
            metricsTicket: 'YzJWakxYUjNjeTF3Y205a0xYWnBjQzUzWldKbGVDNWpiMjA9',
            timeStamp: (new Date()).getTime(),
            appName: 'Cisco-WebEx-Extension',
            confId: '00000000',
            siteId: '000000'
        };

        // init doi
        doi.init({
            URL: header.metricsURL,
            appID: header.appID,
            interval: 5,
            retry: 3
        });

        doi.setHeader('appId', header.appID);
        doi.setHeader('metricsTicket', header.metricsTicket);
        doi.setHeader('timeStamp', header.timeStamp);
        doi.setHeader('appName', header.appName);
        doi.setHeader('confId', header.confId);
        doi.setHeader('siteId', header.siteId);
        self.doiReady = true;
    };

    self.init = function() {
        //console.log('[Background] init: chromeVersion=', chromeVersion);
        //console.log('[Background] init: hostName_=', hostName_);

        self.initDoi();

        chrome.runtime.onConnect.addListener(self.handleClientConnect);
        if (chrome.runtime.onUpdateAvailable)
        {
            chrome.runtime.onUpdateAvailable.addListener(function(details) {
                //console.log('chrome.runtime.onUpdateAvailable, details=', details);
            });
        }
        //chrome.runtime.onConnectExternal(function(port) {
        //});
        //chrome.runtime.onRequest.addListener(function(request, sender, sendResponse) {
        //});
        
        chrome.runtime.onInstalled.addListener(function (details) {
            if (details.reason == "install") {
            	chrome.tabs.query({url:[
                    "*://*.webex.com/*",
                    "*://*.qa.webex.com/*",
                    "*://*.webex.com.cn/*"
                ]}, function(arrayOfTabs) {
                	if(arrayOfTabs.length > 0){
                		var tab = arrayOfTabs[0];
                		chrome.tabs.update(tab.id, {active:true}, function (){});
                	}
            	});
            } else if(details.reason == "update") {
             
            }
        });
        
        
        chrome.runtime.onMessage.addListener(function(data, sender) {
            if (self.doiReady) {
                var values = {
                    'category': 'browser-extension',
                    'event': 'launch-meeting',
                    'extVal': data
                };
                doi.send('Event', values, true);
            }
        });
    };
    return self;

}(Background || {}));

window.addEventListener('load', function() {
    Background.init();
}, false);
