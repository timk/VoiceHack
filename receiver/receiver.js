window.onload = function() {
	cast.receiver.logger.setLevelValue(0);
	window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
	console.log('Starting Receiver Manager');

	// handler for the 'ready' event
	castReceiverManager.onReady = function(event) {
		console.log('Received Ready event: ' + JSON.stringify(event.data));
		window.castReceiverManager.setApplicationState("Application status is ready...");
	};

	// handler for 'senderconnected' event
	castReceiverManager.onSenderConnected = function(event) {
		console.log('Received Sender Connected event: ' + event.data);
		console.log(window.castReceiverManager.getSender(event.data).userAgent);
	};

	// handler for 'senderdisconnected' event
	castReceiverManager.onSenderDisconnected = function(event) {
		console.log('Received Sender Disconnected event: ' + event.data);
		if (window.castReceiverManager.getSenders().length == 0) {
			window.close();
		}
	};

	// handler for 'systemvolumechanged' event
	castReceiverManager.onSystemVolumeChanged = function(event) {
		console.log('Received System Volume Changed event: '
				+ event.data['level'] + ' ' + event.data['muted']);
	};

	// create a CastMessageBus to handle messages for a custom namespace
	window.messageBus = window.castReceiverManager
			.getCastMessageBus('urn:x-cast:com.google.cast.sample.helloworld');

	// handler for the CastMessageBus message event
	window.messageBus.onMessage = function(event) {
		console.log('Message [' + event.senderId + ']: ' + event.data);

		// display the message from the sender
		handleMessage(JSON.parse(event.data));

		// inform all senders on the CastMessageBus of the incoming message event
		// sender message listener will be invoked
		window.messageBus.send(event.senderId, event.data);
	}

	// initialize the CastReceiverManager with an application status message
	window.castReceiverManager.start({
		statusText : "Application is starting"
	});
	
	console.log('Receiver Manager started');
};

// utility function to display the text message in the input field
function handleMessage(message) {
	console.log(message);
	console.log("Message: " + message["key"]);

	if (message.key == "search") {
		parseCommand(message.value);
	} else {
		displayText(message.value);
	}
};

function parseCommand(text) {
	var idx = text.indexOf(' ');
	var command = text.substr(0, idx);
	var rest = text.substr(idx + 1);
	
	execute(command, rest);

}

function execute(command, data) {
	switch (command) {
		case "search":
			search(data);
			break;
		case "watch":
			watch(data);
			break;
		default:
			displayText(command + " " + data);
	}	
}

function search(str) {
	stripped = str.replace(/for */, "");
	name = stripped.substr(0, stripped.indexOf(' '));
	val = stripped.substr(stripped.indexOf(' ') + 1);
	var url  = nameToUrl(name, val);
	displayPage(url);
}

function watch(vidStr) {
	var url = nameToUrl("youtube", vidStr);
}

function nameToUrl(name, data) {
	search = encodeURI(data);
	switch (name.toLowerCase()) {
		case "google":
			//return "https://www.googleapis.com/customsearch/v1?q=" + search;
			//return "http://googlecustomsearch.appspot.com/elementv2/compact_v2.html?q=" + search;
			return "http://googlecustomsearch.appspot.com/elementv2/results-only_url_v2.html?q=" + search;
		case "wiki":
		case "wikipedia":
			return "http://en.wikipedia.org/wiki/" + search;
		case "youtube":
			return "https://www.youtube.com/results?search_query=" + search
		default:
			//displayText("Try again...");
			return "";
	}
};

function displayPage(url) {
	//window.location.href = 'http://www.google.com/search?site=&tbm=isch&q=' + text;
	//var url = "https://www.googleapis.com/customsearch/v1?q="+text+"&searchType=image&key=";
	//var url = "http://googlecustomsearch.appspot.com/elementv2/results-only_url_v2.html?q=" + text + "&webSearchResultSetSize=4";
	var display = document.getElementById("display");
	display.setAttribute("src", url);
};

function displayText(text) {
	//console.log(text);
	//document.getElementById("message").innerHTML = text;
	//window.castReceiverManager.setApplicationState(text);
};