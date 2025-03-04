const express = require("express");

const app = express();

let server = app.listen(process.env.PORT, function(){
    console.log("Server started!");
});

const io = require("socket.io")(server);

app.get('/', function(req,res){
    res.send("server is running!");
}); 

let socketUserMap = new Map();
let userIdSocketMap = new Map();

let newUserArray = new Array();
let leftUserArray = new Array();

io.on('connection', function(socket){
    socket.on('join', function(data){
        let parsed = JSON.parse(data);
        if(!userIdSocketMap.has(parsed.id)){
            socketUserMap.set(socket, parsed);
            userIdSocketMap.set(parsed.id,socket);
            newUserArray.push(parsed);
            let users = Array.from(socketUserMap.values());
            let json = {
                'users' : users
            };
            let jsonString = JSON.stringify(json);
            socket.emit('userList', jsonString);
        }else{
            socket.emit('userList' , 'already joined!');
        }
    });
    socket.on('disconnect', function(){
        if(socketUserMap.has(socket)){
            let user = socketUserMap.get(socket);
            userIdSocketMap.delete(user.id);
            socketUserMap.delete(socket);
        
            if(newUserArray.includes(user)){
                newUserArray = arrayRemove(newUserArray, user);
            }
            leftUserArray.push(user);
        }
    });
    socket.on('leave', function(){
        if(socketUserMap.has(socket)){
            let user = socketUserMap.get(socket);
            userIdSocketMap.delete(user.id);
            socketUserMap.delete(socket);
        
            if(newUserArray.includes(user)){
                newUserArray = arrayRemove(newUserArray, user);
            }
            leftUserArray.push(user);
        }
    });
    socket.on('sendMessage', function(message){
        let parsed = JSON.parse(message);
        let receiver = parsed.receiver;
        if(userIdSocketMap.has(receiver)){
            userIdSocketMap.get(receiver).emit('message', message);
        }
    });
});

setInterval(() => {
    if(newUserArray.length > 0 || leftUserArray > 0){
    let newJson = JSON.stringify(newUserArray);
    let leftJson = JSON.stringify(leftUserArray);
    let json = {
        'newUsers' : newUserArray,
        'leftUsers' : leftUserArray
    };

    let jsonString = JSON.stringify(json);

    io.emit('broadcast', jsonString);
    newUserArray = new Array();
    leftUserArray = new Array();
}
}, 5000);

function arrayRemove(arr, value) {
    console.log(arr.length);
    let position = arr.indexOf(value);
    arr.splice(position,1);
    console.log(arr.length);
    let f = arr.filter(function (e) {
        return e != null;
    });
    return f;
}