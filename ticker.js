(function() {
	console.log("And we're alive!");

	var tickerStatus = true;
	var tickerTimer = null;
	var tickerMessages = [];

	var renderTicker = function() {
		var $container = $('<div></div>');
		$container.attr('id', 'hootticker');
		$container.append('<div class="messages"></div>');

		$('body').append($container);
		renderMessages();

		window.onscroll = function(evt) {
			if((window.innerHeight + window.scrollY) >= document.height) {
				$('#hootticker').hide();
			} else {
				$('#hootticker').show();
			}
		};

		tickerTimer = setInterval(tickTicker, 5000);
	};

	var renderMessages = function() {
		$('#hootloader').stop();
		$('#hootloader').remove();

		var $message, $messages = $('#hootticker .messages'); 
		$.each(tickerMessages, function(index, element) {
			$message = renderMessage(element);
			$messages.append($message);
		});
	}

	var renderMessage = function(message) {
		var messageType;
		if ('undefined' === typeof(message.user)) {
			messageType = 'FACEBOOK';
		} else {
			messageType = 'TWITTER';
		}

		var networkAvatarLink, networkName, postTime, messageContent, borderTop;

		var $networkAvatarLink = $('<img></img>');
		var $networkName = $('<a></a>');
		var $postTime = $('<p></p>');
		var $messageContent = $('<p></p>');

		switch (messageType) {
			case 'FACEBOOK':
				networkAvatarLink = message.avatar;
				networkName = message.name;
				networkNameUrl = message.profileUrl;
				postTime = message.createdFormatted;
				messageContent = message.message;
				borderTop = '4px solid #4c66a4';
				break;
			case 'TWITTER':
				networkAvatarLink = message.user.profile_image_url;
				networkName = message.user.screen_name;
				networkNameUrl = message.user.url;
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
		$networkName.attr('href', networkNameUrl);
		$networkName.addClass('networkName');

		$postTime.html(postTime);
		$postTime.addClass('postTime');

		$messageContent.html(messageContent);
		$messageContent.addClass('messageContent');

		$container.append([$networkAvatarLink, $networkName, $postTime, $messageContent]);

		return $container;
	};

	var tickTicker = function() {
		var tick = parseInt($(window).width()/350);
		slideTicker(tick);
		chrome.runtime.sendMessage(
			{
				command: "tick",
				tick: tick
			}, 
			function(response) {}
		);
	};

	var slideTicker = function(tick) {
		var $firstMessage = $($('#hootticker .messages .message')[0]);
		var marginLeft = parseInt($firstMessage.css('marginLeft'));
		marginLeft -= tick * 350;

		// Slide ticker to the left
		$firstMessage.animate(
			{
				marginLeft: marginLeft + 'px'
			},
			'slow'
		);
	};

	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			switch (request.command) {
				case "live":
					var $container = $('<div></div>');
					$container.attr('id', 'hootloader');
					$container.css('width', '0');
					$container.css('height', '76px');
					$container.css('borderTop', '4px solid #4e763e');

					$('body').append($container);
					$container.animate(
						{
							width: '100%'
						},
						5000,
						function() {
							$('#hootloader').remove();
						}
					);
					break;
				case "sync":
					if (request.messages.length > 0) {
						tickerMessages = request.messages;
						if ($('#hootticker').length > 0) {
							renderMessages();
						} else {
							renderTicker();
						}
					}
					break;
				case "die":
					if ('undefined' !== typeof(tickerTimer)) {
						clearInterval(tickerTimer);
					}
					$('#hootticker').remove();
					break;
				default:
					break;
			}
		}
	);

	chrome.runtime.sendMessage(
		{
			command: "sync"
		}, 
		function(response) {
			if ('undefined' !== typeof(response.messages) && response.messages.length > 0) {
				tickerMessages = response.messages;
				renderTicker();
			}
		}
	);
})();