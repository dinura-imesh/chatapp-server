class User{
    constructor(id, name, age, isMale){
        this.id = id;
        this.name = name;
        this.age = age;
        this.isMale = isMale;
    }

    toJson(){
        return JSON.stringify(this);
    }
}