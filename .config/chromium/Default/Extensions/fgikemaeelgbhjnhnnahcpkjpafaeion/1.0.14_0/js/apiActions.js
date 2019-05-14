(function () {

  var WL = window.WL;
  var WB = wunderbits.core;
  var WBDeferred = WB.WBDeferred;
  var when = WB.lib.when;

  WL.apiActions = {

    'init': function (sdkInstance) {

      this.sdk = sdkInstance;
    },

    'getUser': function () {

      return this.sdk.getOutlet().user.all();
    },

    'getSettings': function () {

      return this.sdk.getOutlet().settings.all();
    },

    'getSortedLists': function () {

      var self = this;
      var outlet = this.sdk.getOutlet();
      var deferred = new WBDeferred();

      outlet.lists.accepted().done(function (lists) {

        outlet.list_positions.all().done(function (listPositions) {

          lists = self.sortLists(lists, listPositions[0].values);
          deferred.resolve(lists);
        });
      });

      return deferred.promise();
    },

    'getSortedTasksForList': function (listID) {

      var self = this;
      var outlet = self.sdk.getOutlet();
      var deferred = new WBDeferred();

      outlet.tasks.forList(listID)
        .done(function (tasks) {

          outlet.task_positions.getID(listID)
            .done(function (taskPositions) {

              tasks = self.sortTasks(tasks, taskPositions.values);
              deferred.resolve(tasks);
            });

        });

      return deferred.promise();
    },

    'getAllTasks': function () {

      var then = Date.now();

      var self = this;
      var outlet = self.sdk.getOutlet();
      var deferred = new WBDeferred();

      deferred.always(function (allTasks) {

        console.debug('getAllTasks took', Date.now() - then);
      });

      outlet.lists.accepted().done(function (lists) {

        var allTasks = [];
        var taskRequests = [];

        lists.forEach(function (list) {

          var taskRequest = outlet.tasks.forList(list.id);
          taskRequests.push(taskRequest);
          taskRequest.done(function (tasks) {

            tasks.forEach(function (task) {

              task.list_title = list.title;
            });

            allTasks = allTasks.concat(tasks);
          });
        });

        when(taskRequests).done(function () {

          deferred.resolve(allTasks);
        });
      });

      return deferred.promise();
    },

    'getTodayTasks': function () {

      var then = Date.now();

      var self = this;
      var deferred = new WBDeferred();

      deferred.always(function () {

        console.debug('getTodayTasks took', Date.now() - then);
      });

      var today = moment().startOf('day');
      self.getAllTasks().done(function (allTasks) {

        var todayTasks = allTasks.filter(function (task) {

          var dueDate = task.due_date;
          if (!dueDate) {
            return false;
          }
          else {
            var diff = moment(dueDate).diff(today, 'days');
            task.due_diff = diff;
            return diff <= 0;
          }
        });

        todayTasks = _.sortBy(todayTasks, 'due_diff');

        deferred.resolve(todayTasks);
      });

      return deferred.promise();
    },

    'updateToTop': function () {

      var self = this;

      var promise = self.getSettings().done(function (settings) {

        var locationSetting = _.findWhere(settings, {
          'key': 'new_task_location'
        });

        WL.toTop = locationSetting ? locationSetting.value === 'top' : true;
        console.debug('toTop updated to', WL.toTop);
      });

      return promise;
    },

    'createTask': function (listID, title, options) {

      var self = this;
      var deferred = new WBDeferred();
      options = options || {};

      var taskData = {
        'list_id': listID,
        'title': title
      };

      if (options.due_date) {
        taskData.due_date = options.due_date;
      }

      self.sdk.getOutlet().tasks.create(taskData)
        .done(function (taskData) {

          self.addTaskToPositions(taskData.id, listID)
            .done(deferred.resolve, deferred)
            .fail(deferred.reject, deferred);
        })
        .fail(deferred.reject, deferred);

      return deferred.promise();
    },

    'completeTask': function (taskID) {

      var self = this;
      var outlet = self.sdk.getOutlet();
      var deferred = new WBDeferred();

      outlet.tasks.getID(taskID).done(function (data) {

        outlet.tasks.update(taskID, data.revision, {'completed': true})
          .done(function() {

            console.debug('task', taskID, 'completion synced');
            deferred.resolve();
          })
          .fail(deferred.reject, deferred);
      })
      .fail(deferred.reject, deferred);

      return deferred.promise();
    },

    'addTaskToPositions': function  (taskID, listID) {

      var self = this;
      var deferred = new WBDeferred();
      var outlet = this.sdk.getOutlet();

      self.updateToTop().done(function () {

        outlet.task_positions.forList(listID).done(function (taskPositions) {

          var positions = taskPositions[0];
          var values = positions.values;

          values[WL.toTop ? 'unshift' : 'push'](taskID);

          outlet.task_positions.update(positions.id, positions.revision, {
            'values': values
          })
          .done(deferred.resolve, deferred)
          .fail(deferred.reject, deferred);
        })
        .fail(deferred.reject, deferred);
      })
      .fail(deferred.reject, deferred);

      return deferred.promise();
    },

    'sortLists': function  (lists, values) {

      lists.sort(function (a, b) {

        if (a.list_type === 'inbox') {
          return -1;
        }
        else if (b.list_type === 'inbox') {
          return 1;
        }
        else {
          var aIdx = values.indexOf(a.id);
          var bIdx = values.indexOf(b.id);
          return aIdx < bIdx ? -1 : 1;
        }
      });

      return lists;
    },

    'sortTasks': function (tasks, values) {

      tasks.sort(function (a, b) {

        var aIdx = values.indexOf(a.id);
        var bIdx = values.indexOf(b.id);
        return aIdx < bIdx ? -1 : 1;
      });

      return tasks;
    }
  };
})();