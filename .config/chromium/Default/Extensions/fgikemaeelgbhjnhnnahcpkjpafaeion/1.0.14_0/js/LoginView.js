(function () {

  var WL = window.WL;
  var views = WL.views;
  var clientID = WL.clientID;
  var authDomain = WL.authBaseDomain;
  var storage = chrome.storage.sync;
  var authBaseUrl = authDomain + '/oauth/authorize';

  var BaseView = Backbone.View;

  var _super = BaseView.prototype;

  views.LoginView = BaseView.extend({

    'events': {
      'click .login-button': 'onClickLogin'
    },

    'initialize': function (options) {

      var self = this;
      _super.initialize.apply(self, arguments);

      self.onLogin = options.onLogin;
      self.$version = self.$('.version-number');
    },

    'onClickLogin': function () {

      var self = this;

      chrome.identity.launchWebAuthFlow({
        'url': self.getAuthUrl(),
        'interactive': true
      }, function (resp) {

        console.log('resp', resp);

        var respParts = resp && resp.split(/\#access_token\=/);
        var token = respParts && respParts[1];
        token = token && token.replace(/\?.+/, '');

        console.log('token', token)

        if (token) {
          token = token;
          storage.set({
            'token': token
          }, function () {

            self.onLogin(token);
          });
        }
      });
    },

    'authParams': function (state) {

      return {
        'client_id': clientID,
        'response_type' : 'token',
        'redirect_uri': 'https://' + chrome.app.getDetails().id + '.chromiumapp.org/provider_cb',
        'state': state || 'chromeExtensionFlow'
      };
    },

    'getAuthUrl': function (state) {

      var url = authBaseUrl;
      var self = this;
      var params = self.authParams(state);

      Object.keys(params).forEach(function (key, index) {

        url += (index === 0 ? '?' : '&') + key + '=' + params[key];
      });

      return url;
    },

    'renderVersion': function () {

      var appDetails = chrome.app.getDetails();
      this.$version.text(appDetails.version);
    }
  });
})();