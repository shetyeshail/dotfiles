$(function () {

  var wunderlistSDK, appView, loginView, debouncedListsRender;

  var WL = window.WL;
  var apiActions = WL.apiActions;
  var WB = wunderbits.core;
  var WBDeferred = WB.WBDeferred;
  var when = WB.lib.when;
  var storage = chrome.storage.sync;
  var localStorage = chrome.storage.local;
  var clientID = WL.clientID;

  var $body = $('body');
  var $loginView = $('#login');
  var $appView = $('#app');

  start();

  function start () {

    storage.get(null, function (data) {

      var token = data.token;
      WL.lastUsedListID = data.lastUsedListID || 'inbox';

      attachViews();

      if (token) {
        loadCachedData();
        initializeSDK(token);
      }
      else {
        showLogin();
      }

      $body.addClass('shown');
    });
  }

  function attachViews () {

    var views = WL.views;

    loginView = new views.LoginView({

      'el': $loginView,
      'onLogin': function (token) {

        initializeSDK(token);
      }
    });

    appView = new views.AppView({

      'el': $appView
    });
  }

  function loadCachedData () {

    localStorage.get(null, function (data) {

      var err = chrome.runtime.error;
      err && console.error(err);

      if (data.tasks) {
        var tasks = JSON.parse(data.tasks);
        appView.onShowTasks(tasks);
      }

      if (data.lists) {
        var lists = JSON.parse(data.lists);
        getCurrentList(lists);
        appView.renderListSelect(lists);
      }

      if (data.background) {
        renderBackground(data.background);
      }

      if (data.user) {
        var user = JSON.parse(data.user)
        appView.renderInputLabel(user);
      }
    });
  }

  // API Interaction

  function initializeSDK (token) {

    wunderlistSDK = new wunderlist.sdk({
      'accessToken': token,
      'clientID': clientID,
      'product': 'wunderlist new tab extension'
    });

    WL.apiActions.init(wunderlistSDK);

    wunderlistSDK.initialized
      .done(loadApp)
      .done(apiActions.updateToTop.bind(apiActions));

    wunderlistSDK.on('unauthorized', function () {

      localStorage.clear();
      storage.clear(function () {

        var err = chrome.runtime.lastError;
        err && console.error(err);
        showLogin();
      });
    });
  }

  function loadApp () {

    showApp();
    loadSettings();
    loadUser();
    loadLists();
    bindToRealtime();
  }

  function showApp () {

    $loginView.addClass('hidden');
    $appView.removeClass('hidden');
  }

  function showLogin () {

    $appView.addClass('hidden');
    $loginView.removeClass('hidden');
    $body.css({'background-image':'url(../backgrounds/blurred.jpg)'});
    loginView.renderVersion();
  }

  function loadUser () {

    apiActions.getUser().done(function (userData) {

      localStorage.set({
        'user': JSON.stringify(userData)
      });

      appView.renderInputLabel(userData);
      appView.renderAvatar(userData);
    });
  }

  function loadSettings () {

    apiActions.getSettings().done(function (settingsData) {

      loadAudioSettings(settingsData);
      loadBackground(settingsData);
    });
  }

  function loadAudioSettings (settingsData) {

    var completionSoundSetting = _.findWhere(settingsData, {'key': 'sound_checkoff_enabled'});
    WL.playCompletionSound = completionSoundSetting ? completionSoundSetting.value === 'true' : true;
  }

  function loadBackground (settingsData) {

    var backgroundSetting = _.findWhere(settingsData, {'key': 'background'});
    if (backgroundSetting) {
      var bg = backgroundSetting.value.replace('wlbackground', '');
      renderBackground(bg);
    }
    else {
      renderBackground('06');
    }
  }

  function renderBackground (bg) {

    localStorage.set({'background': bg});
    requestAnimationFrame(function () {

      $body
        .css({'background-image':'url(../backgrounds/' + bg + '.jpg)'})
        .addClass('bg-' + bg);
    });
  }

  function loadLists () {

    apiActions.getSortedLists().done(function (lists) {

      localStorage.set({
        'lists': JSON.stringify(lists)
      });

      getCurrentList(lists);
      appView.renderListSelect(lists);
      appView.loadTasks(WL.lastUsedListID);
    });
  }

  function getCurrentList (lists) {

    var listFound = false;
    lists.forEach(function (list) {

      if (list.list_type === 'inbox') {
        WL.inboxID = list.id;
      }

      if (list.id === WL.lastUsedListID || list.list_type === WL.lastUsedListID) {
        listFound = true;
      }
    });

    var isInboxSelected = WL.lastUsedListID === 'inbox';
    var isTodaySelected = WL.lastUsedListID === 'today';

    if ((!listFound || WL.lastUsedListID === 'inbox') && !isTodaySelected) {
      WL.lastUsedListID = WL.inboxID;
    }
  }

  function bindToRealtime () {

    !debouncedListsRender && (debouncedListsRender = _.debounce(appView.loadTasks.bind(appView), 1000));

    wunderlistSDK.on('event', function (data) {

      var isCreateOrDelete = data.operation === 'create' || data.operation === 'delete';
      if (data.operation === 'touch') {
        debouncedListsRender(WL.lastUsedListID);
      }
      else if (isCreateOrDelete && (data.subject.type === 'list' || data.subject.type === 'membership')) {
        loadLists();
      }
    });
  }
});