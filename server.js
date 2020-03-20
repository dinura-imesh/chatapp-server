const express = require("express");
const bodyParser = require("body-parser");
let User = require("./user");

const app = express();

let server = app.listen(process.env.PORT, function(){
    console.log("Server started!");
    let user = new User('asd','ad','asd',123,true);
});

const io = require("socket.io")(server);

app.get('/', function(req,res){
    res.send("server is running!");
    console.log("A");
});

io.on('connection', function(socket){
    socket.on('data', function(data){
        let user =  new User(data['id'], data['name'], data['age'], data['isMale']);
        socket.emit('name', {"name" : user.name, "age": user.age, "isMale": user.isMale, "id": user.id});
    });
});