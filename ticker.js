(function() {
	console.log("And we're alive!");

	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
			if (request.greeting == "hello") {
				sendResponse({farewell: "goodbye"});
			}
		}
	);

	var initialize = function() {

	};

	var next = function() {

	};

	var previous = function() {

	};	
})();