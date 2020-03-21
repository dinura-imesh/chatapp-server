const express = require("express");
const bodyParser = require("body-parser");
let User = require("./user");

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
        if(!userIdSocketMap.has(data.id)){
            socketUserMap.set(socket, data);
            userIdSocketMap.set(data.id,socket);
            newUserArray.push(data);
            let users = Array.from(socketUserMap.values());
            let usersJson = JSON.stringify(users);
            let json = {
                "users" : usersJson
            };
            socket.emit('userList', json);
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
    socket.on('sendMessage', function(message){
        let receiver = message.receiver;
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
        'newUsers' : newJson,
        'leftUsers' : leftJson
    };
    io.emit('broadcast', json);    
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

//join, userlistupdate(one even with two arrays//joined//leaved),  message