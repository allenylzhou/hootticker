(function() {

	var oAuth2 = new OAuth2('hootsuite', {
		client_id: 'Cc6zW32Acp5cc64lPvGB',
		client_secret: 'ZdQEgP2vW9j4W64pvWQrbdCmDEAEEcFqhXLC6hNf',
		api_scope: ''
	});

	// Listen for icon browser action
	chrome.browserAction.onClicked.addListener(function(tab) {

		oAuth2.authorize(function() {
			//Send initial message to content script
			chrome.tabs.query({}, function(tabs) {
				for (var i = 0; i < tabs.length; i++) {
					chrome.tabs.sendMessage(tabs[i].id, {/*greeting: "hello", */accessToken: oAuth2.getAccessToken()}, function(response) {
			    		// console.log(response.farewell);
			  		}); 
				}
			});
		});

			// Handle incoming messages from content script
			// chrome.runtime.onMessage.addListener(
			// 	function(request, sender, sendResponse) {
			// 		console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
			// 		if (request.greeting == "hello") {
			// 			sendResponse({farewell: "goodbye"});
			// 		}
			// 	}
			// );
	});
})();
