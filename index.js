var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ip = require('ip');
const readline = require('readline');
var idToBan = '';
var usrNum = 0;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
/*
inputs();

function inputs() {
    rl.question('', (answer) => {
        idToBan = answer;
        try {
            if (idToBan !== '') {
                var selectedSocket = io.to(idToBan);
                selectedSocket.disconnect();
                console.log('Kicked: ' + idToBan);
                inputs();
            }
        } catch (e) {
            console.log('Failed');
            inputs();
        }
    });
}*/



app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){


    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
        console.log(msg);
    });
    usrNum++;
    console.log('a user connected (' + usrNum + ')');
    socket.on('userAdd', function(name){
        socket.username = name;
        console.log(name + ' has joined the chat(' + socket.id + ')');
        socket.broadcast.emit('userAdded', {
            name: name,
            usrNum: usrNum
        });
    });

    socket.on('disconnect', () => {
        usrNum--;
        console.log('user disconnected (' + usrNum + ')');
        socket.broadcast.emit('userLeft', {
            name: socket.username,
            usrNum: usrNum
        });

    });

    socket.on('typing', (name) => {
        console.log(name + ' is typing');
        socket.broadcast.emit('typing', {

            name: name
        });
    });

    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing', {
            name: socket.username
        });
    });




});


http.listen(3000, function(){
    console.log('Listening on ' + ip.address() + ':3000');
});