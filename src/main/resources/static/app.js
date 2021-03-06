var stompClient = null;
var stompClientUrl = null;

function setConnected(connected) {
    $("#connect").prop("disabled", connected);
    $("#send").prop("disabled", !connected);
    $("#clear").prop("disabled", !connected);
    if (connected) {
        $("#conversation").show();
    }
    else {
        $("#conversation").hide();
    }
    $("#commands").html("");
}

function connect() {
	var gameCode = $('#gameId').val()
	var args = {
		gameCode: gameCode,
		name: $('#playerName').val()
	};
	$.post('/api/v1/player/add', args, function(data) {
		var errorMessage = data.error;
		if (errorMessage !== null) {
			showCommand(errorMessage);
			return;
		}
		var playerCode = data.result.playerCode;
		var subscribeUrl = '/topic/game/' + gameCode + '/player/' + playerCode;
		stompClientUrl = '/app/command/game/' + gameCode + '/player/' + playerCode;
		openSocket(subscribeUrl);
	});
}	

function openSocket(subscribeUrl) {
    var socket = new SockJS('/gs-guide-websocket');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        setConnected(true);
        console.log('Connected: ' + frame);
        stompClient.subscribe(subscribeUrl, function (message) {
        	console.log(message);
        	showCommand(message.body);
        });
    });
}

function disconnect() {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
    setConnected(false);
    console.log("Disconnected");
}

function sendName() {
    stompClient.send(stompClientUrl, 
    		{}, JSON.stringify({'type': 'MOVE'}));
}

function showCommand(message) {
    $("#commands").append("<tr><td>" + message + "</td></tr>");
}

function clearCommands() {
	$("#commands").html("");
}

$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $("#connect").click(function() { connect(); });
    $("#send").click(function() { sendName(); });
    $("#clear").click(function() { clearCommands(); });
});