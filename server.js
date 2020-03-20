const express = require("express");
const bodyParser = require("body-parser");

const app = express();

let server = app.listen(process.env.PORT, function(){
    console.log("Server started!");
});

const io = require("socket.io")(server);

app.get('/', function(req,res){
    res.send("server is running!");
});

io.on('connection', function(socket){
    socket.on('data', function(data){
        // let map = JSON.parse(data);

        let name = typeof data;
        socket.emit('name', {"name" : name});
    });
});