$(document).ready(function () {

    $("#username").hide()
    $("#roomcode").hide()


    $("#create").click(function () {
        const room_code = Math.floor((Math.random() * 1000) + 999)
        console.log(room_code)
        $("#join").hide();
        $("#create").animate({ width: '350px' });
        $("#username").show().focus()
        $("#roomcode").val(room_code)
        $("#create").click(function () {
            $("#form").submit();
        });
    });

    $("#join").click(function () {
        $("#create").hide();
        $("#join").animate({ width: '350px', left: '200px' });
        $("#username").show().focus()
        $("#roomcode").show()
        $("#join").click(function () {
            $("#form").submit();
        })
    });

    $(':input').keydown(function (event) {
        var keypressed = event.keyCode || event.which;
        if (keypressed == 13) {
            $(this).closest('form').submit();
        }   
    });

});
