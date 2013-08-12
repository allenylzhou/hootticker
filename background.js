(function() {
	var messages = messages || {};

	var tick = function() {

	};

	var refresh = function() {

	};

	// Listen for icon browser action
	chrome.browserAction.onClicked.addListener(function(tab) {
		// Initialize ChromeExOAuth
		// var oauth = ChromeExOAuth.initBackgroundPage({
			// 'request_url': <OAuth request URL>,
			// 'authorize_url': <OAuth authorize URL>,
			// 'access_url': <OAuth access token URL>,
			// 'consumer_key': <OAuth consumer key>,
			// 'consumer_secret': <OAuth consumer secret>,
			// 'scope': <scope of data access, not used by all OAuth providers>,
			// 'app_name': <application name, not used by all OAuth providers>
		// });

		// oauth.authorize(function() {
		// 	var url = 'https://api.hootsuite.com/api/2/networks';
		// 	var callback = function(resp, xhr) {

		// 	};
		// 	var request = {
		// 		'method': 'GET'
		// 	}

		// 	oauth.sendSignedRequest(url, callback, request);
		// });

		// Handle incoming messages from content script
		chrome.runtime.onMessage.addListener(
			function(request, sender, sendResponse) {
				console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
				if (request.greeting == "hello") {
					sendResponse({farewell: "goodbye"});
				}
			}
		);

		// Send initial message to content script
		chrome.tabs.query(
			{
				active: true, 
				currentWindow: true
			},
			function(tabs) {
				chrome.tabs.sendMessage(
					tabs[0].id,
					{
						greeting: "hello"
					},
					function(response) {
						console.log(response.farewell);
					}
				);
			}
		);
	});
})();
