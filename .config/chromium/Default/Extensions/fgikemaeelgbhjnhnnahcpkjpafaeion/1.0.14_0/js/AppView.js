(function () {

  var WL = window.WL;
  var apiActions = WL.apiActions;
  var views = WL.views;
  var clientID = WL.clientID;
  var authDomain = WL.authBaseDomain;
  var storage = chrome.storage.sync;
  var localStorage = chrome.storage.local;
  var authBaseUrl = authDomain + '/oauth/authorize';
  var completeSound = new Audio('../sounds/wl3-complete.ogg');

  var listCharacterLength = 50;

  var BaseView = Backbone.View;

  var _super = BaseView.prototype;

  views.AppView = BaseView.extend({

    'events': {
      'click .logout-button': 'onClickLogout',
      'click .tasks li': 'onClickTask',
      'click .open-apps': 'onClickOpenApps',
      'click .love-wunderlist': 'onClickRate',
      'keydown .addTask': 'onAddTaskInput',
      'change .list-chooser': 'onListSelectChange',
    },

    'initialize': function () {

      var self = this;
      _super.initialize.apply(self, arguments);

      self.$addTask = self.$('.addTask');
      self.$avatar = $('.avatar');
      self.$inputLabel = $('.input-label');
      self.$listLabel = self.$('.select-label');
      self.$listSelect = self.$('.list-chooser');
      self.$tasks = self.$('.tasks');
    },

    'onClickLogout': function () {

      var self = this;

      chrome.identity.launchWebAuthFlow({
        'url': WL.authBaseDomain + '/logout',
        'interactive': false
      }, function (resp) {

        var err = chrome.runtime.lastError;
        if (err) {
          console.error(err.message);
        }
        localStorage.clear();
        storage.clear();
        window.location.reload();
      });
    },

    'onClickTask': function (ev) {

      var self = this;

      var $target = $(ev.currentTarget);
      var taskID = parseInt($target.attr('rel'), 10);

      if (ev.metaKey && ev.shiftKey) {
        console.debug('open task in desktop');
        var desktop = true;
        self.openTask(taskID, desktop);
      }
      else if (ev.metaKey) {
        console.debug('open task in web app');
        self.openTask(taskID);
      }
      else {
        self.completeTask(taskID, $target);
      }
    },

    'onClickOpenApps': function (e) {

      _gaq.push(['_trackEvent', 'UI', 'LinkClicked', 'chrome://apps']);
      e.preventDefault();

      setTimeout(function () {

        chrome.tabs.update({
          'url': 'chrome://apps'
        });
      }, 100);
    },

    'onClickRate': function () {

      _gaq.push(['_trackEvent', 'UI', 'LinkClicked', 'rating']);
    },

    'onAddTaskInput': function (ev) {

      var self = this;

      if (ev.keyCode === 13) {
        var title = self.$addTask.val();
        if (title) {
          self.$addTask.val('');
          self.onAddTask(title);
        }
      }
    },

    'onListSelectChange': function () {

      var self = this;

      var selected = $('.list-chooser option:selected')[0];
      var value = selected.value;
      self.setListLabel(selected.innerText);

      var id = parseInt(selected.value, 10) || value;
      WL.lastUsedListID = id;

      var isInbox = selected.dataset.inbox === 'true';
      _gaq.push(['_trackEvent', 'UI', 'ListChanged', isInbox ? 'Inbox' : id === 'today' ? 'Today' : 'Normal List']);

      storage.set({
        'lastUsedListID': id
      }, function () {

        var showLoading = true;
        self.loadTasks(id, showLoading);
      });

      console.debug('selected id', id);
    },

    'onAddTask': function (title) {

      var self = this;
      var options = {};

      requestAnimationFrame(function () {

        var $taskIem = $('<li rel="local"></li>').text(title);
        $taskIem.attr('aria-label', title);

        self.$tasks[WL.toTop ? 'prepend' : 'append']($taskIem);
      });

      var listID = WL.lastUsedListID === 'today' ? WL.inboxID : WL.lastUsedListID;

      if (WL.lastUsedListID === 'today') {
        options.due_date = moment().format('YYYY-MM-DD');
      }

      apiActions.createTask(listID, title, options)
        .done(function () {

          console.debug('create task done');
          var usedList = WL.lastUsedListID === 'today' ? 'Today' : listID === WL.inboxID ? 'Inbox' : 'Normal List';
          _gaq.push(['_trackEvent', 'Activity', 'TaskCreatedInList', usedList]);
          self.loadTasks(WL.lastUsedListID);
        })
        .fail(function (resp, code) {

          console.error('create task failed', resp, code);
        });
    },

    'completeTask': function (taskID, $target) {

      if (WL.playCompletionSound) {
        completeSound.currentTime = 0;
        completeSound.play();
      }
      $target.addClass('completed');
      apiActions.completeTask(taskID).done(function () {

        var listID = WL.lastUsedListID;
        var usedList = listID === 'today' ? 'Today' : listID === WL.inboxID ? 'Inbox' : 'Normal List';
        _gaq.push(['_trackEvent', 'Activity', 'TaskCompletedInList', usedList]);
      });
    },

    'openTask': function (taskID, desktop) {

      var isDesktop = desktop === true;
      var baseUrl = isDesktop ? 'wunderlist://' : 'https://www.wunderlist.com/#/';

      _gaq.push(['_trackEvent', 'UI', 'TaskOpenedViaMetaClick', isDesktop ? 'Desktop' : 'Webapp']);

      setTimeout(function () {

        chrome.tabs.update({
          'url': baseUrl + 'tasks/' + taskID
        });
      }, 100);
    },

    'loadTasks': function (listID, showLoading) {

      var self = this;
      var timer;

      if (showLoading) {
        timer = setTimeout(function () {
          self.$tasks.addClass('loading');
        }, 500);
      }

      var promise = listID === 'today' ? self.loadTodayTasks() : self.loadNormalTasks(listID);
      promise.done(function (tasks) {

        showLoading && self.$tasks.removeClass('loading');
        timer && clearTimeout(timer);

        localStorage.set({
          'tasks': JSON.stringify(tasks)
        }, function () {

          var err = chrome.runtime.error;
          err && console.error(err);
        });

        var shownList = listID === 'today' ? 'Today' : listID === WL.inboxID ? 'Inbox' : 'Normal List';
        _gaq.push(['_trackEvent', 'UI', 'ListShown', shownList]);
      });

      return promise;
    },

    'loadTodayTasks': function () {

      var self = this;
      return apiActions.getTodayTasks().done(function (tasks) {

        self.onShowTasks(tasks);
      });
    },

    'loadNormalTasks': function (listID) {

      var self = this;
      return apiActions.getSortedTasksForList(listID).done(function (tasks) {

        self.onShowTasks(tasks);
      });
    },

    'onShowTasks': function (tasks) {

      var self = this;

      var frag = document.createDocumentFragment();
      tasks.forEach(function (task) {

        var $li = $('<li/>', {
          'text': task.title,
          'rel': task.id,
          'aria-label': task.title,
          'tabindex': 0
        });

        frag.appendChild($li[0]);
      });

      requestAnimationFrame(function () {

        self.$tasks.empty().html(frag);
      });
    },

    'setListLabel': function (label) {

      var self = this;
      var gap = 10;

      requestAnimationFrame(function () {

        self.$listLabel.text(label);
        var width = self.$listLabel.outerWidth() + gap;
        self.$addTask.css('padding-right', width);
        self.$listSelect.width(width);
      });
    },

    'renderListSelect': function (lists) {

      var self = this;
      var frag = document.createDocumentFragment();

      self.renderTodayOption(frag);
      self.renderSpacer(frag);

      lists.forEach(function (list) {

        var opt = document.createElement('option');
        opt.textContent = list.title.substr(0, listCharacterLength) + (list.title.length > listCharacterLength ? '...' : '');
        opt.value = list.id;

        var $opt = $(opt);
        if (list.list_type === 'inbox') {
          opt.textContent = WL.localization.getString('smart_list_inbox');
          $opt.attr('data-inbox', 'true');
        }

        if (list.id === WL.lastUsedListID) {
          $opt.attr('selected','selected');
          self.setListLabel($opt[0].innerText);
        }

        frag.appendChild(opt);
      });

      requestAnimationFrame(function () {

        self.$listSelect.html(frag);
      });
    },

    'renderTodayOption': function (frag) {

      var self = this;

      var todayOption = document.createElement('option');
      todayOption.textContent = WL.localization.getString('smart_list_today');
      todayOption.value = 'today';
      if (WL.lastUsedListID === 'today') {
        todayOption.setAttribute('selected', 'selected');
        self.setListLabel(todayOption.innerText);
      }
      frag.appendChild(todayOption);
    },

    'renderSpacer': function (frag) {

      var spacer = document.createElement('option');
      spacer.innerText = '----';
      spacer.setAttribute('disabled', 'true');
      frag.appendChild(spacer);
    },

    'renderAvatar': function (userData) {

      var self = this;
      requestAnimationFrame(function () {

        self.$avatar.attr('src', 'https://a.wunderlist.com/api/v1/avatar?user_id=' + userData.id);
      });
    },

    'renderInputLabel': function (userData) {

      var self = this;
      var inputLabel = WL.localization.getString('label_new_tab_task_input_$', userData.name);
      requestAnimationFrame(function () {

        self.$inputLabel.text(inputLabel);
      });
    }
  });
})();