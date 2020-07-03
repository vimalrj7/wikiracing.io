$(document).ready(function () {

    var timer = new easytimer.Timer();

    $('#timer .startButton').click(function () {
        socket.emit('starttimer')
        timer.start();
    });

    socket.on('starttimer', () => {
        timer.start()
    })

    $('#timer .stopButton').click(function () {
        socket.emit('stoptimer')
        timer.stop();
    });

    socket.on('stoptimer', () => {
        timer.stop()
    })

    $('#timer .resetButton').click(function () {
        timer.reset();
    });

    timer.addEventListener('secondsUpdated', function (e) {
        $('#timer .timer-val').html(timer.getTimeValues().toString());
    });

    timer.addEventListener('started', function (e) {
        $('#timer .timer-val').html(timer.getTimeValues().toString());
    });

    timer.addEventListener('reset', function (e) {
        $('#timer .timer-val').html(timer.getTimeValues().toString());
    });

});