$(function () {
    var TYPING_TIMER_LENGTH = 2000;
    var lastTypingTime;
    var typing = false;
    var connected = false;
    var $window = $(window);

    $("#chat").hide();
    var name = "";
    var socket = io();
    $('#username').submit(function () {
        name = $('#name').val();
        $("#chat").show();
        $("#login").hide();
        socket.emit('userAdd', name);
        connected = true;
        return false;
    });
    $('#sendMessages').submit(function(){
        str = $('#m').val();
        str = str.replace(/\s+/g, '');
        if (str === '') {
            $('#m').val('');
            socket.emit('stop typing');
            typing = false;
        } else {
            socket.emit('chat message', name + ': ' + $('#m').val());
            $('#m').val('');
            socket.emit('stop typing');
            typing = false;
        }
        return false;
    });

    $window.keydown(event => {
        // Auto-focus the current input when a key is typed
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            updateTyping();
        }
    });

    //Broadcasts user joined message
    socket.on('userAdded', (data) => {
        $('#messages').append($('<li>').text('System: ' + data.name + ' has joined. ' + data.usrNum + ' users online.'));
    });

    socket.on('userLeft', (data) => {
        $('#messages').append($('<li>').text('System: ' + data.name + ' has left. ' + data.usrNum + ' user/s online.'));
    });

    const updateTyping = () => {
        if (connected) {
            if (!typing) {
                typing = true;
                socket.emit('typing', name);
            }
            lastTypingTime = (new Date()).getTime();

            setTimeout(() => {
                var typingTimer = (new Date()).getTime();
                var timeDiff = typingTimer - lastTypingTime;
                if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                    socket.emit('stop typing');
                    typing = false;
                }
            }, TYPING_TIMER_LENGTH);
        }
    }

    socket.on('typing', (data) => {
        //user is typing
        console.log(data.name + ' is typing');
        document.getElementById("types").textContent = data.name + " is typing...";
    });

    socket.on('stop typing', (data) => {
        //user has stopped typing
        console.log(data.name + ' yesnt typing');
        document.getElementById("types").textContent="";
    });

    socket.on('chat message', function(msg){
        $('#messages').append($('<li>').text(msg));
        document.getElementById("marker").scrollIntoView();
    });
    // socket.on('connected', function () {
    //
    // })

});