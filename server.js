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


app.get('/reset', function(req,res){
    socketUserMap = new Map();
    userIdSocketMap = new Map();
    newUserArray = new Array();
    leftUserArray = new Array();
    res.send("Reset complete!");
});

app.get('/users', function (req,res) {
    let users = Array.from(socketUserMap.values());
    // let usersJson = JSON.parse(JSON.stringify(users));
    let json = {
        'users' : users
    };
    let jsonString = JSON.stringify(json);
    res.send(jsonString);
})

app.get('/message', function(req,res){
    let receiver  = "1";
    let m = req.query.m;
    let message = {
        'message' : m,
        'type' : 'text',
        'time' : 256,
        'receiver' : '1',
        'sender' : 'server'
    };
    let stringified = JSON.stringify(message);
    if(userIdSocketMap.has(receiver)){
        userIdSocketMap.get(receiver).emit('message',stringified);
        res.send("Message sent");
    }else{
        res.send("User does not exist")
    }
});


let socketUserMap = new Map();
let userIdSocketMap = new Map();

let newUserArray = new Array();
let leftUserArray = new Array();

io.on('connection', function(socket){
    socket.on('join', function(data){
        if(!userIdSocketMap.has(data.id)){
            socketUserMap.set(socket, JSON.parse(data));
            userIdSocketMap.set(data.id,socket);
            newUserArray.push(data);
            let users = Array.from(socketUserMap.values());
            // let usersJson = JSON.parse(JSON.stringify(users));
            let json = {
                'users' : users
            };
            let jsonString = JSON.stringify(json);
            socket.emit('userList', jsonString);
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