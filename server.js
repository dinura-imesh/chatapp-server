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
        let id = data['id'];
        let isMale = data.isMale;
        let user =  new User(data['id'], data['name'], data['age'], isMale);
        socketUserMap.set(socket, user);
        userIdSocketMap.set(id,socket);
        newUserArray.push(id);
        socket.emit('e', {'data' : isMale});
    });
    socket.on('disconnect', function(){
        let user = socketUserMap.get(socket);
        userIdSocketMap.delete(user.id);

    });
});

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