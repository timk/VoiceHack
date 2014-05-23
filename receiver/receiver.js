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
    var idx = (0 < text.indexOf(' ')) ? text.indexOf(' ') : text.length ;
    var command = text.substr(0, idx);
    var rest = text.substr(idx + 1);
     
    execute(command, rest);
 
}
 
var command = "";
var engine = "";
 
function execute(command, data) {
	console.log("Command: " + command);
	
    switch (command.substr(0, 3)) {
        case "sea":
            command = "search";
            searchCommand(data);
            break;
        case "wat":
            command = "watch";
            watchCommand(data);
            break;
        case "wea":
            command = "weather";
            weatherCommand();
            break;
        case "def":
            command = "define";
            lookupCommand(data);
            break;
        case "luc":
            command = "lucky";
            luckyCommand(data);
            break;
        default:
            displayText("undefined: " + " " + data);
    }   
}
 
function searchCommand(str) {
    var stripped = str.replace(/for */, "");
    var name = stripped.substr(0, stripped.indexOf(' '));
    var val = stripped.substr(stripped.indexOf(' ') + 1);
    var url  = nameToUrl(name, val);
    displayPage(url, val);
}
 
function luckyCommand(str) {
    var url = nameToUrl("lucky", str);
    displayPage(url, str);
}
 
function watchCommand(vidStr) {
    var url = nameToUrl("youtube", vidStr);
    displayPage(url, vidStr);
}
 
function weatherCommand() {
    var url = nameToUrl("yrno", "");
    displayPage(url, "Stockholm, Sweden");
}
 
function lookupCommand(phrase) {
	var arr = phrase.split(' ');
	var word = arr[0];
    //var word = (0 < phrase.indexOf(' ')) ? phrase.substring(phrase.indexOf(' '), phrase.length) : phrase ;
    var url = nameToUrl("dictionary", word);
    displayPage(url, word);
}
 
function nameToUrl(name, data) {
    switch (name.substr(0,3).toLowerCase()) {
    	case "goo":
        	engine = "google";
        	//return "https://www.googleapis.com/customsearch/v1?q=" + search;
        	//return "http://googlecustomsearch.appspot.com/elementv2/compact_v2.html?q=" + search;
        	return "https://www.googleapis.com/customsearch/v1?key=AIzaSyBgIJy3VuroeXgk9isnO7Y0ZsgeiJp896o&cx=017576662512468239146:omuauf_lfve&q=" + data.replace(/ /g, "+");
    	case "luc":
    		engine = "lucky";
    		return "https://www.googleapis.com/customsearch/v1?key=AIzaSyBgIJy3VuroeXgk9isnO7Y0ZsgeiJp896o&cx=017576662512468239146:omuauf_lfve&q=" + data.replace(/ /g, "+");
        case "wik":
            engine = "wikipedia";
            return "http://en.wikipedia.org/wiki/" + data.replace(/ /g, "_");
        case "you":
            engine = "youtube";
            return "https://gdata.youtube.com/feeds/api/videos?alt=json&q=" + data.replace(/ /g, "+");
        case "dic":
            engine = "dictionary";
            return "http://dictionary.reference.com/browse/" + data;
        case "yrn":
            engine = "yr";
            return "http://www.yr.no/place/Sweden/Stockholm/Stockholm/";
        default:
            //displayText("Try again...");
            return "";
    }
};
 
function displayPage(url, query) {
    //window.location.href = 'http://www.google.com/search?site=&tbm=isch&q=' + text;
    //var url = "https://www.googleapis.com/customsearch/v1?q="+text+"&searchType=image&key=";
    //var url = "http://googlecustomsearch.appspot.com/elementv2/results-only_url_v2.html?q=" + text + "&webSearchResultSetSize=4";
     
    if(engine == "google")
    {
        $.get(url, function(data) {
            console.log("Load was performed.");
            //console.log(data.queries.request);
            var output = "<div id=\"display\" class=\"google\">";
            $.each(data.items, function(key, value) {
                var mime = (value["mime"] == "application/pdf") ? "<span>[pdf]</span>" : "" ;
                output += "<div class=\"list_title\"><a href=\"" + value['link'] + "\">" + value['title'] + "</a> " + mime + "</div>";
                output += "<div class=\"list_snippet\">" + value['snippet'] + "</div>";
            });
            output += "</div>";
             
            $("#query").html(engine + ": " + query);
            $("#frame").html(output);
        });
    }
    else if(engine == "lucky")
    {
        $.get(url, function(data) {
            console.log("Load was performed.");
            $.each(data.items, function(key, value) {
            	if(value["mime"] != "application/pdf")
	            {
            		console.log(value['link']);
	            
            		$("#query").html(engine + ": " + query);
	            	$("#frame").html("<iframe id=\"display\" class=\"iframe\" src=\"" + value['link'] + "\"></iframe>");
	            	return;
	            }
            });
        });
    }
    else if(engine == "youtube")
    {
    	$.get(url, function(data) {
            console.log("Load was performed.");
            //console.log(data);
            
            var videoId = data.feed.entry[0].id["$t"].split('/');
            videoId = videoId[videoId.length-1];
            
            url = "http://www.youtube.com/embed/" + videoId + "?autoplay=1";
            
            $("#query").html(engine + ": " + query);
            $("#frame").html("<iframe id=\"display\" class=\"iframe\" src=\"" + url + "\"></iframe>");
        });
    	
        $("#query").html(engine + ": " + query);
        $("#frame").html("<iframe id=\"display\" class=\"iframe\" src=\"" + url + "\"></iframe>");
    }
    else
    {
        $("#query").html(engine + ": " + query);
        $("#frame").html("<iframe id=\"display\" class=\"iframe\" src=\"" + url + "\"></iframe>");
    }
};
 
function displayText(text) {
    //console.log(text);
    //document.getElementById("message").innerHTML = text;
    //window.castReceiverManager.setApplicationState(text);
};