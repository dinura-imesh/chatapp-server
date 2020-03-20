const express = require("express");
const bodyParser = require("body-parser");

const app = express();

let server = app.listen(process.env.PORT, function(){
    console.log("Server started!");
    var json = {
        'name' : 'dinura',
        'age' : 15,
        'isMale' : true
      };
    let d = JSON.stringify(json);

    let a = JSON.parse(d);
    console.log(a);
    console.log(a['name']);
});

const io = require("socket.io")(server);

app.get('/', function(req,res){
    res.send("server is running!");
});

io.on('connection', function(socket){
    socket.on('data', function(data){
        
        let d = data.toString();
        let map = JSON.parse(d);
        socket.emit('name', {"name" : map['name']});
    });
});