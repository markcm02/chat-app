$(function () {
    var TYPING_TIMER_LENGTH = 2000; //thresh hold for how long after a user stopped pressing keys until the server says stopped typing
    var lastTypingTime;
    var typing = false;
    var connected = false;
    var $window = $(window);

    $("#chat").hide();

    var name = "";
    var socket = io();

    //data from the initial login page
    $('#username').submit(function () {
        name = $('#name').val();  //sets name value
        $("#chat").show(); //switches to chat menu
        $("#login").hide(); //hides the login screen
        socket.emit('userAdd', name); //tells the server to add user and sets username
        connected = true; //user is logged in
        return false;
    });
    $('#sendMessages').submit(function(){ //when the user sends a message
        str = $('#m').val(); //creates temp val
        str = str.replace(/\s+/g, ''); //removes all whitespace from the message
        if (str === '') { //checks if the message has any characters (empty message spam protecc)
            //The message is spam
            $('#m').val(''); //resets message bar to blank
            socket.emit('stop typing'); //tells the server that the user has stopped typing (as they has sent a message)
            typing = false; //client side stopped typing
        } else { //the message has data
            socket.emit('chat message', name + ': ' + $('#m').val()); //sends the name of the user and the message to the server
            $('#m').val(''); //sets message bar to blank
            socket.emit('stop typing'); //tells the server that the user has stopped typing (as they has sent a message)
            typing = false; //client side stopped typing
        }
        return false;
    });

    $window.keydown(event => { //If the user has pressed a key
        if (!(event.ctrlKey || event.metaKey || event.altKey)) { //if that key isn't ctrl or alt
            updateTyping(); //run function
        }
    });

    //Broadcasts user joined message
    socket.on('userAdded', (data) => { //if the server says a user has joined
        $('#messages').append($('<li>').text('System: ' + data.name + ' has joined. ' + data.usrNum + ' users online.')); //send message in client html with username and num of current users
    });

    socket.on('userLeft', (data) => { //when the server says a user has disconnected
        $('#messages').append($('<li>').text('System: ' + data.name + ' has left. ' + data.usrNum + ' user/s online.')); //send message in client html with username and users left
    });

    const updateTyping = () => {
        if (connected) { //if the user has logged in (make sure that typing message isn't sent when a user is logging in
            if (!typing) { //if the user isn't already typing
                typing = true; //then the user is typing
                socket.emit('typing', name); //tell the server the user is typing
            }
            lastTypingTime = (new Date()).getTime(); //sets the time at which a user was last typing

            setTimeout(() => { //typing timeout
                var typingTimer = (new Date()).getTime();
                var timeDiff = typingTimer - lastTypingTime;
                if (timeDiff >= TYPING_TIMER_LENGTH && typing) { //if the user has stopped typing after the thresh hold
                    socket.emit('stop typing'); //tells the server the user has stopped typing
                    typing = false; //client side user stopped typing
                }
            }, TYPING_TIMER_LENGTH);
        }
    }

    socket.on('stop typing', (data) => { //when the server says a user has stopped typing
        //console.log(data.name + ' yesnt typing');
        document.getElementById("types").textContent=""; //clears the user is typing field
    });

    socket.on('typing', (data) => { //when the server says a user is typing
        //console.log(data.name + ' is typing');
        document.getElementById("types").textContent = data.name + " is typing..."; //tells the user another user is typing
    });



    socket.on('chat message', function(msg){ //when that server says a user has sent a message
        $('#messages').append($('<li>').text(msg)); //adds the message to the list of messages
        document.getElementById("marker").scrollIntoView(); //scroll the messages list into view
    });
});