(function() {

	var alive = false;
	var networks = [];
	var messages = [];

	var oAuth2 = new OAuth2('hootsuite', {
		client_id: 'Cc6zW32Acp5cc64lPvGB',
		client_secret: 'ZdQEgP2vW9j4W64pvWQrbdCmDEAEEcFqhXLC6hNf',
		api_scope: ''
	});

	var passMessages = function() {
		var requestData = [];
		$.each(networks, function(index, element) {
			var streamType;
			switch(element.type) {
				case 'FACEBOOK':
				case 'FACEBOOKGROUP':
					streamType = "F_HOME_STREAM";
					break;
				case 'FACEBOOKPAGE':
					streamType = "F_WALL";
					break;
				case 'TWITTER':
					streamType = "HOME";
					break;
				default:
					break;
			}
			if ('undefined' !== typeof(streamType) && requestData.length <= 5) {
				// Build request for multiple streams, max 5
				requestData.push(
					{
						socialNetworkId: element.socialNetworkId,
						type: streamType,
						count: 30
					}
				);
			}
		});

		$.ajax(
			{
				url: "https://hootsuite.com/api/2/messages",
				type: "GET",
				data: {
					interleaved: 1,
					streams: requestData
				},
				beforeSend: function(xhr) {
					xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
				},
				success: function(data) {
					messages = messages.concat(data.results);

					//Send initial messages to content script
					chrome.tabs.query({}, function(tabs) {
						for (var i = 0; i < tabs.length; i++) {
							chrome.tabs.sendMessage(tabs[i].id, {command: "sync", messages: messages}, function(response) {}); 
						}
					});
				}
			}
		);
	}

	// Listen for icon browser action
	chrome.browserAction.onClicked.addListener(function(tab) {

		oAuth2.authorize(function() {

			accessToken = oAuth2.getAccessToken();

			if (!alive) {
				alive = true;
				chrome.tabs.query({}, function(tabs) {
					for (var i = 0; i < tabs.length; i++) {
						chrome.tabs.executeScript(
							tabs[i].id,
							{
								code: "chrome.extension.sendMessage({command: 'live', tickerStatus: ('undefined' !== typeof(tickerStatus)), tabId: " + tabs[i].id + "});"
							}
						);
					}
				});
				$.ajax(
					{
						url: "https://hootsuite.com/api/2/networks",
						type: "GET",
						data: {},
						beforeSend: function(xhr) {
							xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
						},
						success: function(data) {
							// $('#hootticker').show();
							networks = data.results;
							passMessages();
						}
					}
				);
			} else {
				alive = false;
				networks.length = 0;
				messages.length = 0;

				chrome.tabs.query({}, function(tabs) {
					for (var i = 0; i < tabs.length; i++) {
						chrome.tabs.sendMessage(tabs[i].id, {command: "die"}, function(response) {}); 
					}
				});
			}
		});
	});

	//Handle incoming messages from content script
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			switch (request.command) {
				case 'live':
					if (false === request.tickerStatus) {
						chrome.tabs.executeScript(request.tabId, {file: "jquery.js" }, function() {
				            chrome.tabs.executeScript(request.tabId, {file: "ticker.js" }, function() {
				                chrome.tabs.insertCSS(request.tabId, {file: "ticker.css" }, function() {
									chrome.tabs.sendMessage(request.tabId, {command: "live"}, function(response) {}); 
				                });
				            });
				        });
					} else {
						chrome.tabs.sendMessage(request.tabId, {command: "live"}, function(response) {}); 
					}
					break;
				case 'sync':
					sendResponse({messages: messages});
					break;
				case 'tick':
					messages.splice(0, request.tick);
					if (messages.length <= 30) {
						passMessages();
					}
					break;
				default:
					break;
			}
		}
	);
})();
