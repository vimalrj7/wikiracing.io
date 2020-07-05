$(document).ready(function () {

    console.log('Ready')

    const { username, roomcode } = Qs.parse(location.search, {
        ignoreQueryPrefix: true
    });

    $("#display-room").text("Room Code: " + roomcode)

    var socket = io();

    var sid;

    socket.on('connect', () => {
        sid = socket.id;
    });

    socket.emit('join', { username, roomcode })

    socket.on('userlist', function (userlist) {
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

    $("#startpage").hide()


    //timer

    var timer = new easytimer.Timer();

    $('#timer .startButton').click(function () {
        socket.emit('starttimer')
        timer.start();
        $("#startpage").show();
    });

    socket.on('starttimer', () => {
        timer.start()
        $("#startpage").show();
    })

    $('#timer .stopButton').click(function () {
        socket.emit('stoptimer')
        timer.stop();
    });

    socket.on('stoptimer', (user) => {
        timer.stop()
        $('#timer').html('<h3>'+user.username+' won!</h3>')
    })

    timer.addEventListener('secondsUpdated', function (e) {
        $('#timer .timer-val').html(timer.getTimeValues().toString());
    });

    timer.addEventListener('started', function (e) {
        $('#timer .timer-val').html(timer.getTimeValues().toString());
    });


});