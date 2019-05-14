// Content Script for Cisco WebEx Meeting Extension (Chrome)

var ContentScript = (function(self) {
    var kHostNotInstalled = 'HostNotInstalled';
    var kExtensionNotInstalled = 'ExtensionNotInstalled';
    var inFrame = true;
    self.id = chrome.runtime.id;
    self.port = null;
    self.token_ = '';
    self.whiteList = [];
    self.hashList = [];
    self.uuid_ = '';

    self.initHashList = function() {
        self.hashList.push('X4WKTojPTBCkUep3mJ4lISkJd5xjgCy7t3WOV9ekcYQ=');
        self.hashList.push('64tUupzAFkz0sO9FdxdKzXPU1M+kX5addpE8cY8KwMY=');
        self.hashList.push('Y1UGgNTP1Q1s+ApMq8hsYXhEOhDHsCr5/q5bbvBFP/c=');
        self.hashList.push('eaShT5BXYGibkON42a7ewRxsy4+PSGtTMh2fG54Zf7A=');
        self.hashList.push('bzT9bgmTETuVqCgVxPDSjrnTqC6N14zH8kVD/pHJBdw=');
        self.hashList.push('Y1KRUKo4HpiaxizSb9jeqQR7pL82VYHg0CMQHD0EHHI=');
        self.hashList.push('1bIZVrqEKHJbytsxxLWDyOXWT4CQO7K46V4lOryJIJo=');
    };

    self.initWhiteList = function() {
        // NOTICE: use lower case
        //Windows
        //self.whiteList.push('ieatgpc.dll');
        self.whiteList.push('atmccli.dll');
        //self.whiteList.push('webexmgr.dll');
        self.whiteList.push('ateccli.dll');
        //self.whiteList.push('wbxmgrec.dll');
        self.whiteList.push('wbxtccli.dll');
        self.whiteList.push('wbxmgrtc.dll');
        self.whiteList.push('wbxtcholcli.dll');
        self.whiteList.push('tcholmgr.dll');
        self.whiteList.push('atsc3cls.dll');
        self.whiteList.push('atsccli.dll');
        self.whiteList.push('atsccust.dll');
        //self.whiteList.push('scplugin.dll');
        self.whiteList.push('ataactrl.dll');
        self.whiteList.push('aasetup.dll');
        //self.whiteList.push('atonecli.dll');
        //self.whiteList.push('mailutil.dll');
        //self.whiteList.push('ramtmgr.dll');
        self.whiteList.push('raagt.dll');
        self.whiteList.push('atstctrl.dll');
        self.whiteList.push('atplycli.dll');
        self.whiteList.push('atrcp.dll');
        self.whiteList.push('atshcli.dll');
        //MacOS
        self.whiteList.push('atconfui.bundle');
        self.whiteList.push('wbxmgrmc.bundle');
        self.whiteList.push('wbxmgrtc.bundle');
        self.whiteList.push('wbxmgrec.bundle');
        self.whiteList.push('tcholmgr.bundle');
        self.whiteList.push('asplayback.bundle');
        self.whiteList.push('nbrpfw.bundle');
        self.whiteList.push('raconfui.bundle');
        self.whiteList.push('pcnow client.app');
        self.whiteList.push('pcnow process manager.app');
    };

    self.uuid = function() {
        var d = new Date().getTime();
        var uuid_ = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid_;
    };

    self.filterLog = function(jsonLog) {
        var newLog = {};
        for (var key in jsonLog) {
            var value = jsonLog[key];
            if (key.match(/location\d+_url|szhomepage\d+/i)) {
                try {
                    var parser = document.createElement('a');
                    parser.href = atob(value);
                    if (parser.hostname.trim().toLowerCase().match(/webex\.com$|webex\.com\.cn$|^_self$/i)) {
                        continue;
                    }
                } catch (err) {
                }
            } else if (key.trim().toLowerCase() === 'clientparam_value') {
                var xmlDoc = (new DOMParser()).parseFromString(atob(value), 'text/xml');
                if (xmlDoc && xmlDoc.childNodes[0].nodeName === 'root') {
                    continue;
                }
            } else if (value.match(/^\d+$|^\d+\.\d+$/)) {   // IGNORE NUMBER
                continue;
            }
            newLog[key] = value;
        }
        return newLog;
    };

    self.sendLog = function(message) {
        if (navigator.platform.match(/win/i)) {
            try {
                var jsonLog = (typeof message.message === 'string') ? JSON.parse(message.message) : message.message;
                if (message.message_type === 'launch_meeting') {
                    jsonLog = self.filterLog(jsonLog);
                }
                jsonLog['ext_tracking_id'] = self.uuid_;
                chrome.runtime.sendMessage(jsonLog, function(response) { });
            } catch (err) {
                chrome.runtime.sendMessage(message.message, function(response) { });
                //console.error('[ContentScript] sendLog: err=', err);
            }
        }
    };

    self.verifyScriptCall = function (strScriptCall) {
        var regx = /^(WebEx_|As[ADEPS]|RA[AM])|^(Ex|In)it|^(FinishC|Is[NS]|JoinM|[NM][BCS][JRUC]|Set|Name|Noti|Trans|Update)|^(td|SCSP)$/;
        if (strScriptCall.length > 10240) {
            return false;
        }

        var items = strScriptCall.split(";");

        for (var i = 0; i < items.length; i++) {
            var item = items[i].trim();
            var strParam = "";

            var pos = item.indexOf("=");
            if (pos >= 0) {
                var key = item.substring(0, pos).trim();
                if (key != 'szCookie') {
                    return false;
                }
                item = item.substring(pos + 1).trim();
            }

            pos = item.indexOf("(");
            if (pos >= 0) {
                strParam = item.substring(pos + 1);
                item = item.substring(0, pos).trim();
            }
            var vParams = strParam.split(",");
            if (strParam.length > 1024 || vParams.length > 20) {
                return false;
            }
            if (item.length > 0 && !item.match(regx)) {
                return false;
            }
            if (item.match(/2$/)) {
                return false;
            }
            var hash = self.crypto(item);
            for (var j = 0; j < self.hashList.length; j++) {
                if (hash == self.hashList[j]) {
                    return false;
                }
            }
        }
        return true;
    }

    self.verify = function(message) {
        // if not an expected type, return false
        if (message.message_type != 'connect' && message.message_type != 'disconnect' && message.message_type != 'launch_meeting') {
            return false;
        }

        if (message.message_type == 'launch_meeting') {
            try {
                if (typeof message.message !== 'string') {
                    return false;
                }
                if (message.message.includes('\\u0000')) {
                    return false;
                }
                var jsonMsg = JSON.parse(message.message);
                var platform = '';

                if (navigator.platform.match(/win/i)) {
                    platform = 'Win';

                    var gpcExtName = jsonMsg['GpcExtName'];
                    if (gpcExtName) {
                        gpcExtName = gpcExtName.trim();
                        if (gpcExtName.toLowerCase() != 'atgpcext' && atob(gpcExtName).toLowerCase().trim() != 'atgpcext') {
                            return false;
                        }
                    }

                    var gpcUnpackName = jsonMsg['GpcUnpackName'];
                    if (gpcUnpackName) {
                        gpcUnpackName = gpcUnpackName.trim();
                        if (gpcUnpackName.toLowerCase() != 'atgpcdec' && atob(gpcUnpackName).toLowerCase().trim() != 'atgpcdec') {
                            return false;
                        }
                    }

                    var gpcInitCall = jsonMsg['GpcInitCall'];
                    if (gpcInitCall) {
                        if (!self.verifyScriptCall(atob(gpcInitCall.trim()))) {
                            return false;
                        }
                    }

                    var gpcExitCall = jsonMsg['GpcExitCall'];
                    if (gpcExitCall) {
                        if (!self.verifyScriptCall(atob(gpcExitCall.trim()))) {
                            return false;
                        }
                    }
                } else if (navigator.platform.match(/mac/i)) {
                    platform = 'Mac';
                    var gpcExtName = jsonMsg['GpcExtName'].trim();
                    if (gpcExtName.toLowerCase() != 'atgpcext64' && atob(gpcExtName).toLowerCase().trim() != 'atgpcext64') {
                        return false;
                    }
                } else {
                    return false;
                }

                var gpcComponentName = jsonMsg['GpcComponentName'].toLowerCase().trim();
                if (null == gpcComponentName.match(/\.dll$|\.bundle$|\.app$/)) {
                    gpcComponentName = atob(jsonMsg['GpcComponentName']);
                    gpcComponentName = gpcComponentName.toLowerCase().trim();
                }
                var i = 0;
                for (i = 0; i < self.whiteList.length; i++) {
                    if (gpcComponentName == self.whiteList[i]) {
                        return true;
                    }
                }
            } catch (err) {
                //console.error('[ContentScript]:', err);
            }
            return false;
        }
        return true;
    };

    self.handleStateChanged = function(result) {
        console.info('[ContentScript] handleStateChanged: result=', result);
        var stateMsg = {
            'timestamp': (new Date()).toUTCString(),
            'token': self.token_,
            'message_type': 'state_changed',
            'message': {
                'ExtState': {
                    'result': result,
                    'reason': (result ? 'ok' : kExtensionNotInstalled)
                },
                'HostState': {
                    'result': false,
                    'reason': kHostNotInstalled
                }
            }
        };

        self.handleNativeMessage(stateMsg);
    };

    self.handleNativeMessage = function(message) {
        console.info('[ContentScript] handleNativeMessage: message=', message);
        if (message.message_type === 'launch_meeting_ack') {
            //message.message = JSON.stringify(message.message));
            self.sendLog(message);
        }
        var event = new CustomEvent('native_message', {
            detail: message
        });
        if (inFrame) {
            window.parent.document.dispatchEvent(event);
        } else {
            document.dispatchEvent(event);
        }
    };

    self.handleNativeDisconnect = function(port) {
        //console.info('[ContentScript] port.onDisconnect: port=', port);
        console.info('[ContentScript] port.onDisconnect: self.port=', self.port);    // self.port == port
        var msg = {
            'timestamp': (new Date()).toUTCString(),
            'token': self.token_,
            'message_type': 'disconnect',
            'message': 'disconnect'
        };
        self.port = null;
        self.handleNativeMessage(msg);
    };

    // sendMessage: send message to background
    self.sendMessage = function(message, responseCallback) {
        console.info('[ContentScript] sendMessage: self.port=', self.port);
        console.info('[ContentScript] sendMessage: message=', message);
        try {
            if (!self.verify(message)) {
                //if (message.message_type == 'launch_meeting') {
                //    self.sendLog(message, 'Illegal');
                //}
                var errorMsg = {
                    'timestamp': (new Date()).toUTCString(),
                    'token': self.token_,
                    'message_type': 'error',
                    'message': {
                        'error_code': 1005,
                        'error_message': 'BadDocShow'
                    }
                };
                self.handleNativeMessage(errorMsg);

                if (self.port != null) {
                    var disconnectMsg = {
                        'timestamp': (new Date()).toUTCString(),
                        'token': self.token_,
                        'message_type': 'disconnect',
                        'message': 'disconnect'
                    };
                    self.port.postMessage(disconnectMsg);
                }
                return;
            }
            if (message.message_type === 'launch_meeting') {
                message['domain'] =  window.location.protocol + '//' + window.location.host;
            }
            //chrome.runtime.sendMessage(message, responseCallback);
            if (self.port != null) {
                self.port.postMessage(message);
            }
            if (message.message_type === 'launch_meeting') {
                self.sendLog(message);
            }
        } catch(err) {
            //console.error('[ContentScript] sendMessage: err=', err);
            var errorMsg = {
                'timestamp': (new Date()).toUTCString(),
                'token': self.token_,
                'message_type': 'error',
                'message': {
                    'error_code': -1,
                    'error_message': err.toString()
                }
            };
            self.handleNativeMessage(errorMsg);
            //console.error(err.toString());
        }
    };

    self.connectPort = function(extId) {
        var host = window.location.host;
        console.info('[ContentScript] connectPort: extId=', extId, 'self.port=', self.port, 'host=', host);

        if (!self.port) {
            try {
                self.port = chrome.runtime.connect(extId, { 'name': self.token_ });
                console.info('[ContentScript] connectPort: self.port=', self.port, 'now=', performance.now());

                if (self.port != null) {
                    self.port.onMessage.addListener(self.handleNativeMessage);
                    self.port.onDisconnect.addListener(self.handleNativeDisconnect);
                }
            } catch (err) {
                console.info('[ContentScript] connectPort: err=', err);
                ContentScript.handleStateChanged(false);
            }
        }
    };

    self.crypto = function(s) {
        var sha256 = CryptoJS.SHA256(s);
        return sha256.toString(CryptoJS.enc.Base64)
    };

    self.init = function() {
        console.info('[ContentScript] init: chrome.runtime.id=', chrome.runtime.id);
        self.initWhiteList();
        self.initHashList();

        self.uuid_ = self.uuid();

        document.addEventListener('connect', function(e) {
            //self.connectPort('jlhmfgmfgeifomenelglieieghnjghma');
            console.info('[ContentScript] connect: e=', e);
            self.token_ = e.detail.token;
            self.connectPort(chrome.runtime.id);
        });

        document.addEventListener('message', function(e) {
            console.info('[ContentScript] message: e=', e);
            self.sendMessage(e.detail, self.handleNativeMessage);
        });

        /*
        chrome.runtime.onConnect.addListener(function(port) {
            console.info('chrome.runtime.onConnect, port=', port);
        });
        chrome.extension.onConnect.addListener(function(port) {
            console.info('chrome.extension.onConnect, port=', port);
        });
        */
    };

    return self;

})(ContentScript || {});

ContentScript.init();

window.onload = function() {
    //ContentScript.token_ = $('#wbx-extension-iframe', window.parent.document).attr('token');
    ContentScript.handleStateChanged(true);
};
