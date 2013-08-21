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
					tickerMessages = tickerMessages.concat(data.results);
					var $message, $messages = $('#hootticker .messages'); 
					$.each(tickerMessages, function(index, element) {
						$message = renderMessage(element);
						$messages.append($message);
					});
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

	var tickTicker = function() {
		if (socialNetworks.length > 0) {
			if (tickerMessages.length > parseInt($(window).width()/350)) {
				slideTicker();
			} else {
				if (tickerMessages.length > 0) {
					retrieveMessages();
				}
			}
		}
	};

	var slideTicker = function() {
		var $firstMessage = $($('#hootticker .messages .message')[0]);
		var readMessages = parseInt($(window).width()/350);
		tickerMessages.splice(0, readMessages);

		var marginLeft = parseInt($firstMessage.css('marginLeft'));
		marginLeft -= readMessages * 350;

		// Slide ticker to the left
		$firstMessage.animate(
			{
				marginLeft: marginLeft + 'px'
			},
			'slow'
		);
	};

	var renderMessage = function(message) {
		var messageType;
		if ('undefined' === typeof(message.user)) {
			messageType = 'FACEBOOK';
		} else {
			messageType = 'TWITTER';
		}

		var networkAvatarLink, networkName, postTime, messageContent, borderTop;

		var $networkAvatarLink = $('<img></img>');
		var $networkName = $('<p></p>');
		var $postTime = $('<p></p>');
		var $messageContent = $('<p></p>');

		switch (messageType) {
			case 'FACEBOOK':
				networkAvatarLink = message.avatar;
				networkName = message.name;
				postTime = message.createdFormatted;
				messageContent = message.message;
				borderTop = '4px solid #4c66a4';
				break;
			case 'TWITTER':
				networkAvatarLink = message.user.profile_image_url;
				networkName = message.user.screen_name;
				postTime = message.created_at;
				messageContent = message.text;
				borderTop = '4px solid #9AE4E8';
				break;
		}

		var $container = $('<div></div>');
		$container.addClass('message');
		$container.css('borderTop', borderTop);

		$networkAvatarLink.attr('src', networkAvatarLink);
		$networkAvatarLink.addClass('networkAvatarLink');

		$networkName.html(networkName);
		$networkName.addClass('networkName');

		$postTime.html(postTime);
		$postTime.addClass('postTime');

		$messageContent.html(messageContent);
		$messageContent.addClass('messageContent');

		$container.append([$networkAvatarLink, $networkName, $postTime, $messageContent]);

		return $container;
	};

	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			// console.log(sender.tab ?
			// "from a content script:" + sender.tab.url :
			// "from the extension");
			// if (request.greeting == "hello")
			// sendResponse({farewell: "goodbye"});

			accessToken = request.accessToken;

			if (socialNetworks.length === 0) {
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
		}
	);

	renderTicker();
	setInterval(tickTicker, 30000);

	window.onscroll = function(evt) {
		if((window.innerHeight + window.scrollY) >= document.height) {
			$('#hootticker').hide();
		} else {
			$('#hootticker').show();
		}
	};

})();