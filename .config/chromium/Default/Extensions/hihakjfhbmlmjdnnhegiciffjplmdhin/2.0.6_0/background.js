(function init() {

  var chromeRuntime = chrome && chrome.runtime && chrome.runtime.onMessageExternal !== undefined;
  console.log('chromeRuntime', chromeRuntime);
  var chromeRuntimeHasntBeenSetYet = true;

  function handleExternalMessages(req, sender, cb) {
    var config = {}
    if (chromeRuntime || req.fromChromeRuntime) {
      chromeRuntime = true;
      if (chromeRuntimeHasntBeenSetYet) {
        chrome.runtime.onMessageExternal.addListener(handleExternalMessages);
        chromeRuntimeHasntBeenSetYet = false;
      }
    }
    switch (req.mode) {
      case 'getAjax':
        config = {
          method: 'GET',
          credentials: 'include'
        }
        break;
      case 'postAjax':
        config = {
          method: 'POST',
          credentials: 'include',
          body: req.params.data,
        }
        if (req.params.headers) {
          config.headers = new Headers(req.params.headers);
        }
        break;
      default:
        cb({ data: null, err: 'SN4G: Request method not found.' });
        return false;
    }

    if (chromeRuntime) {
      fetch(req.params.url, config).then(function(payload) {
        return payload.text();
      })
      .then(function(response) {
        cb({ data: response, xhr: {} });
      })
      .catch(function(err) {
        cb({ data: null, xhr: err })
        console.log('BACKGROUND TRANSPORT ERROR >', err);
      });
    } else {
      return fetch(req.params.url, config).then(function(payload) {
        return payload.text();
      })
      .then(function(response) {
        cb({ data: response, xhr: {} });
        return { data: response, xhr: {} };
      })
      .catch(function(err) {
        cb({ data: null, xhr: err })
        console.log('BACKGROUND TRANSPORT ERROR >', err);
        return { data: null, xhr: {} };
      });
    }

    return true;
  }

  if (chromeRuntime){
    chrome.runtime.onMessageExternal.addListener(handleExternalMessages);
  } else {
    window.addEventListener("message", function(message) {
      // Don't do anything if it's not from us...
      if (message.source !== window || !message.data || message.data.source !== 'snax') {
        return;
      }

      var req = message.data.request;
      var messageId = req.messageId;
      if (req.fromChromeRuntime) {
        // strip out request from window calls
        req.fromChromeRuntime = false;
      }

      handleExternalMessages(req, null, function(){})
      .then(function(response) {
        window.postMessage({
          source: "backgroundScript",
          secret_key: "my_secret_key",
          messageId: messageId,
          payload: response,
        }, "*");
      });
    }, false);
  }
})();
