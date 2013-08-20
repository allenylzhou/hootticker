(function() {
	console.log("And we're alive!");

	var accessToken;
	var socialNetworks = [];
	var tickerMessages = [];

	var retrieveMessages = function() {
		var requestData = [];
		$.each(socialNetworks, function(index, element) {
			var streamType;
			switch(element.type) {
				case 'FACEBOOK':
				case 'FACEBOOKPAGE':
				case 'FACEBOOKGROUP':
					streamType = "F_HOME_STREAM";
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

		console.log(requestData);

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
					tickerMessages = data.results;
					slideTicker();
				}
			}
		);
	}

	var renderTicker = function() {
		var $container = $('<div></div>');
		$container.attr('id', 'hootticker');
		$container.append('<div class="messages"></div>');

		$('body').append($container);
		$container.hide();
	};

	var slideTicker = function() {
		var i, message, $message;
		for(i = 0; i < 3; i++) {
			message = tickerMessages.shift();
			$message = renderMessage(message);
			$('#hootticker .messages').append($message);
		}
	};

	var renderMessage = function(message) {
		// TODO: use a helper method to parse message data
		var $profileImageUrl = $('<img></img>'), 
			profileImageUrl = ('undefined' !== typeof(message.user.profile_image_url)) ? 
				message.user.profile_image_url : //twitter
				message.avatar; //facebook

		var $screenName = $('<span></span>'), 
			screenName = ('undefined' !== typeof(message.user.screen_name)) ?
				message.user.screen_name : //twitter
				message.name; //facebook

		var $createdAt = $('<span></span>'), 
			createdAt = ('undefined' !== typeof(message.user.created_at)) ?
				message.user.created_at : //twitter
				message.createdFormatted; //facebook

		var $text = $('<span></span>'), 
			text = ('undefined' !== typeof(message.user.text)) ?
				message.text : //twitter
				message.message; //facebook

		var $container = $('<div></div>');
		$container.addClass('message');

		$profileImageUrl.attr('src', profileImageUrl);
		$screenName.html(screenName);
		$createdAt.html(createdAt);
		$text.html(text);

		$container.append($profileImageUrl);
		$container.append('<p></p>');
		$container.find('p').append([$screenName, $createdAt, $text]);

		return $container;
	};

	var initialize = function() {

	};

	var next = function() {

	};

	var previous = function() {

	};

	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			// console.log(sender.tab ?
			// "from a content script:" + sender.tab.url :
			// "from the extension");
			// if (request.greeting == "hello")
			// sendResponse({farewell: "goodbye"});

			accessToken = request.accessToken;

			$.ajax(
				{
					url: "https://hootsuite.com/api/2/networks",
					type: "GET",
					data: {},
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
					},
					success: function(data) {
						$('#hootticker').show();

						socialNetworks = data.results;
						retrieveMessages();
					}
				}
			);
		}
	);

	renderTicker();
	if('undefined' === typeof(accessToken)) {
		// Request access token from extension
	}

})();