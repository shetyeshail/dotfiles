(function () {

  var WL = window.WL;
  var langData = WL.langData;
  WL.localization = {

    'getString': function (key, replacement) {

      var value;
      var code = navigator.language;
      var shortCode = _.first(code.split('-'));
      var data = langData[code] || langData[shortCode] || langData['en'];

      if (data) {
        value = data[key];
        if (value && replacement) {
          value = value.replace('%@', replacement);
        }
      }

      return value || 'NOT LOCALIZED';
    },

    'localize': function () {

      var self = this;
      requestAnimationFrame(function () {

        self.renderLabels();
        self.renderPlaceHolders();
        self.renderOptions();
        self.renderTitles();
      });
    },

    'renderLabels': function () {

      var self = this;

      var labels = $('localized[rel]');
      var label, key, value, data;

      if (labels.length) {
        for (var i = 0, len = labels.length; i < len; i++) {
          label = $(labels[i]);
          key = label.attr('rel');
          value = self.getString(key);

          if (!value) {
            continue;
          }

          data = label.attr('data');
          if (data && data.length) {
            // split by "snowman" unicode character
            data = data.split('\u2603');
            value = self.convertSymbols(value);
            data = WBLanguageManager.localizationception(data);
            value = self.replaceSymbols(value, data);
          }

          label.html(value);
        }
      }
    },

    'renderAttributes': function (attributeName, selectorString, applyAsText) {

      var self = this;
      var elements = $(selectorString) || [];
      var element, key, extraData, args, value;

      if (elements.length) {
        for (var i = 0, len = elements.length; i < len; i++) {

          element = $(elements[i]);
          key = element.attr('data-key-' + attributeName);
          if (key) {
            args = [key];
            extraData = element.attr('data-' + attributeName);
            if (extraData) {
              extraData = extraData.split('\u2603');
              args.push(extraData);
            }

            value = self.getString(key);

            if (applyAsText) {
              element.text(value);
            }
            else {
              element.attr(attributeName, value);
            }
          }
        }
      }
    },

    'renderTitles': function () {

      var self = this;
      self.renderAttributes('title', '[data-key-title]');
    },

    'renderPlaceHolders': function () {

      var self = this;
      self.renderAttributes('placeholder', 'input[data-key-placeholder], textarea[data-key-placeholder], input[data-key-value]', false, true);
      self.renderAttributes('value',  'input[data-key-value], textarea[data-key-value]');
    },

    'renderOptions': function () {

      var self = this;
      var applyAsText = true;
      self.renderAttributes('text', 'option[data-key-text]', applyAsText);
    },

    'renderAriaAttributes': function () {

      var self = this;
      self.renderAttributes('aria-label', '[data-key-aria-label]');
    }
  };

})();

$(function () {

  WL.localization.localize();
});