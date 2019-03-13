var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var MongoUrl = "mongodb://localhost:27017/mydb";
var client = new MongoClient(MongoUrl, {useNewUrlParser: true});

var dbo;

client.connect(function(err){
	//open database
	dbo = client.db("mydb");
});

//non profit information
function addUser(table, callback){

	dbo.collection("Users").insertOne(table, function(err, res){
		if(err){
            console.log(err);
            callback({});
        }else{
            callback(res);
        }
    });
}

//add song to user list
function addSong(userId, song, callback){
    console.log(dbo.collection("Users").find({"_id": userId}).toArray()[0]);
}

//utility
function closeDB(){
	client.close(); //close out the database
}

module.exports = {
    addUser: addUser,
	closeDB: closeDB,
};
