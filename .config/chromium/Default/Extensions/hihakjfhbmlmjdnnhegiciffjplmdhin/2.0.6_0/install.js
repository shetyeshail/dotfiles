console.log('Loading...', new Date().getTime());

/**
 * loadResource -- a method that appends css or js to document.body. The source can be a file OR arbitrary source.
 *
 * args
 *   string url - A string that points to a web resource OR a content type used when injecting arbitrary source ["js"|"css"] (defaults to "js").
 *   string text (optional) - If included, will inject the contents of text instead of loading external resource.
 *   int timeout (optional) - How long to wait in ms before throwing a timeout error.
 *
 * returns a Promise
 */
function loadResource(url, text, timeout) {
  if (timeout === undefined) {
    timeout = 5000;
  }
  return new Promise(function (resolve, reject) {
    var tagLoader;
    if (/css$/i.test(url)) {
      tagLoader = document.createElement('link');
      tagLoader.rel = "stylesheet";
      tagLoader.media = "all";
      if (text) {
        tagLoader.text = text;
        resolve();
      } else {
        tagLoader.href = url;
      }
    } else {
      tagLoader = document.createElement('script');
      tagLoader.type = "text/javascript"
      if (text) {
        tagLoader.text = text;
        resolve();
      } else {
        tagLoader.src = url;
      }
    }
    if (!text) {
      tagLoader.onload = resolve;
      tagLoader.onerror = function (err) { reject(new Error(err)) };
      setTimeout(function () { reject(new Error("Timeout error.")) }, timeout);
    }
    document.body.appendChild(tagLoader);
    return tagLoader;
  });
}

/**
 * Maps an array for files into an array of loadResource promises wrapped by a Promise.all object.
 * @param  {array} files   An array of file URL strings
 * @return {promise.all}   Resolves when all file promises are settled
 */
function loadFiles(files) {
  var fileLoaders = files.map(function (file) {
    var fileLoader = { path: file };
    fileLoader.status = loadResource(fileLoader.path, null, GLOBAL.LOADING_TIMEOUT_MS);
    return fileLoader;
  });
  return Promise.all(fileLoaders.map(function (o) { return o.status }));
};

// Load dependencies and initialize app
loadResource(GLOBAL.SERVER.APP + "sales/assets/%2Flighthouse-frontend%2Fjavascripts%2Fintegrations%2FSN4X%2Fpublic%2Fjquery-2.2.4.min.js")
  .then(function () {
    return loadFiles(GLOBAL.DEPENDENCIES)
  })
  .then(function () {
    var window_loader_init = "if (window.glb === undefined) {window.glb = {};} " +
      "if (window.glb.uri === undefined) {window.glb.uri = {};} " +
      "if (window.glb.trackingConfig === undefined) {window.glb.trackingConfig = {};} " +
      "window.glb.isProd             = '" + GLOBAL.IS_PROD_ADDIN + "'; " +
      "window.glb.extid              = '" + chrome.runtime.id + "'; " +
      "window.glb.extvers            = '" + chrome.runtime.getManifest().version + "'; " +
      "window.glb.uri.domain         = '" + GLOBAL.SERVER.APP + "'; " +
      "window.glb.uri.salesforce     = '" + GLOBAL.SERVER.SFDC + "'; " +
      "window.glb.trackingConfig.url = window.glb.uri.domain + 'li/track/'; " +
      "window.glb.trackingConfig.appId = 'com.linkedin.Lighthouse'; " +
      "window.glb.trackingConfig.topicPrefix = 'Echo'; " +
      "window.glb.uri.base           = window.glb.uri.domain + 'sales/'; " +
      "window.glb.uri.js             = window.glb.uri.base   + 'assets/%2Flighthouse-frontend%2Fjavascripts%2F'; " +
      "window.glb.uri.img            = window.glb.uri.base   + 'assets/%2Flighthouse-frontend%2Fimages%2Fintegrations%2Flfg%2F'; " +
      "window.glb.uri.remote         = window.glb.uri.base   + 'gmail/'; " +
      "window.glb.webstore    = 'https://chrome.google.com/webstore/detail/linkedin-sales-navigator/'; " +
      "window.glb.width    = {}; " +
      "window.glb.base    = 240; " +
      "window.init_SN4X();";

    return loadResource('.js', window_loader_init, GLOBAL.LOADING_TIMEOUT_MS);
  })
  .then(function () {
    window.localStorage.setItem('rapportiveUser', true);
  })
  .catch(function (err) {
    console.log("SN4G loading error.", err);
  });
