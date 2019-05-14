if (localStorage.openin === undefined)
	localStorage.openin = 'window';
if (localStorage.deleteconfirm === undefined)
	localStorage.deleteconfirm = 'yes';
	
localStorage.tempWindowNames = "{}";

var processLink = function (link, cb) {
	if (link.match(/\/\/www\.amazon\.com\//) != null) {
		if (link.match(/\?/) != null) {
			link = link.replace("?", "?tag=tabcloud-20&");
		} else {
			link = link + "?tag=tabcloud-20";
		}
		setTimeout(function () {
			cb(link);
		}, 0);
		return;
	}
	if (link.match(/\/\/www\.amazon\.co\.uk\//) != null) {
		if (link.match(/\?/) != null) {
			link = link.replace("?", "?tag=tabcloud-21&");
		} else {
			link = link + "?tag=tabcloud-21";
		}
		setTimeout(function () {
			cb(link);
		}, 0);
		return;
	}
	var loaded = false;
	$.ajax({
		url: "https://api.viglink.com/api/click?key=9d713bf5e9d2bfe8e71aaf3c70d986ee&out="+encodeURIComponent(link)+"&loc="+encodeURIComponent("http://chrometabcloud.appspot.com")+"&reaf=1&format=jsonp&jsonp=?",
		dataType: "jsonp",
		timeout: 1000,
		success: function (data) {
			if (loaded) {
				return;
			}
			var url = data || link;
			cb(url);
		} 
	});
	setTimeout(function () {
		if (loaded) {
			return;
		}
		loaded = true;
		cb(link);
	}, 1000);
};
	
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
	if (localStorage.openin === 'window') {
		chrome.windows.create({}, function (window) {
			chrome.tabs.getAllInWindow(window.id, function (tabs) {
				var removeId = tabs[0].id;
				var remaining = 0;
				var processed = Array(tabs.length)
				var index = 0;
				request.tabs.forEach(function (tab) {
					remaining++;
					var lIndex = index;
					index++;
					processLink(tab.url, function (link) {
						processed[lIndex] = {pinned: tab.pinned, url: link};
						remaining--;
						if (remaining == 0) {
							processed.forEach(function (tabData) {
								var curTab = {
									windowId: window.id,
									url: tabData.url,
									selected: false
								};
								if (localStorage.supportPinned == 1 && tabData.pinned) {
									curTab.pinned = true;
								}
								chrome.tabs.create(curTab);
								if (removeId !== null) {
									chrome.tabs.remove(removeId);
									removeId = null;
								}
							});
						}
					});
				});
			});
		});
	} else if (localStorage.openin === 'tab') {
		var processed = Array(request.tabs.length)
		var index = 0;
		var remaining = 0;
		request.tabs.forEach(function (tab) {
			remaining++;
			var lIndex = index;
			index++;
			processLink(tab.url, function (link) {
				processed[lIndex] = {pinned: tab.pinned, url: link};
				remaining--;
				if (remaining == 0) {
					processed.forEach(function (tabData) {
						curTab = {
							url: tabData.url
						};
						if (localStorage.supportPinned == 1 && tabData.pinned) {
							curTab.pinned = true;
						}
						chrome.tabs.create(curTab);
					});
				}
			});
		});
	}
});
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-20126830-2']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
