/* globals chrome, navigator */
(function () {

  'use strict';

  var runtime = chrome.app.runtime;

  var windowOptions = {
    'id': 'wunderlist',
    'resizable': true,
    'minWidth': 400,
    'minHeight': 600,
    'state': 'normal',
    'hidden': true
  };

  function loadScript (doc, path, callback) {
    var script = doc.createElement('script');
    script.type = 'application/javascript';
    script.onload = callback;
    script.src = path;
    doc.head.appendChild(script);
  }

  function launch (path) {
    chrome.app.window.create('blank.html', windowOptions, function (win) {

      var window = win.contentWindow;
      var document = window.document;

      window.onload = function () {
        loadScript(document, 'vendor/require.js', function () {

          var requirejs = window.requirejs.config({
            'context': 'wunderlist',
            'paths': {
              'project': 'loaders/project'
            }
          });

          requirejs([
            'backend/database',
            'application/runtime'
          ], function (database, runtime) {

            runtime.once('interface:ready', function () {
              win.show();
            });

            runtime.once('reload', function (reloadPath) {
              win.close();
              setTimeout(launch, 50, reloadPath);
            });

            database.init().then(function () {
              database.getAll('user', function (users) {

                var userData = users[0] || {};

                var loggedIn = !!userData.access_token;

                // set the route, if has been reloaded
                window.location.hash = typeof path === 'string' ? path : '/';

                if ((typeof path === 'string' && path.indexOf('/login') !== -1) || !loggedIn) {
                  window.location.hash = '/login';
                  console.log('loading login');
                }
                else {
                  console.log('loading main app');
                }

                requirejs(['bootstrap']);
              });
            });

          });
        });
      };
    });
  }

  runtime.onLaunched.addListener(function () { // options
    launch('/');
  });

}).call(this);
