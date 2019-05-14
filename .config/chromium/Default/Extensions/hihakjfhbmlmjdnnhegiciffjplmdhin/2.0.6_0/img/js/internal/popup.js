$(function() {
	$(".version").text("v" + chrome.runtime.getManifest().version);

	$("#li-plug-feedback").on("click", function() {
		var url = "https://www.linkedin.com/help/sales-navigator/ask";

		window.open(url, "_blank");
	});
});