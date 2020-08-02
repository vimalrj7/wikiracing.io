$(document).ready(function () {

    console.log('Ready')

    const { userName, roomCode } = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    });

    $("#display-room").text("Room Code: " + roomcode)

    var socket = io();

    var sid;

    socket.on('connect', () => {
        sid = socket.id;
    });

    socket.emit('join', { userName, roomCode })

    socket.on('updateUseWrs', function (userlist) {
        console.log(userlist)

        if (userlist[sid].admin == false) {
            $('#timer .startButton').hide()              // if you need admin somewhere else, set variable here instead, learn how to maake it global
        }

        $("#user-list").empty()
        Object.values(userlist).forEach(element => {
            $("#user-list").append('<li>' + element.username + '</li>')
        });
    });


    socket.on('message', function (msg) {
        $("#chat-messages").append('<li><i>' + msg + '</i></li>')
    });

    $("#sendchat").click(function () {
        const message = $("#chatmessage").val()
        $("chatmessage").val('').focus()                      //make send message function for better code
        socket.send(message)

    });

    $('#chatmessage').keydown(function (event) {
        var keypressed = event.keyCode || event.which;
        if (keypressed == 13) {
            $("#sendchat").click();
        }
    });



});