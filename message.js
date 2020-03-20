module.exports = class Message{
    constructor(sender,receiver,id,timestamp,messageType,message){
        this.sender = sender;
        this.receiver = receiver;
        this.id = id;
        this.timestamp = timestamp;
        this.messageType = messageType;
        this.message = message;
    }

    toJson(){
        return JSON.stringify(this);
    }
}