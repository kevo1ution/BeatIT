
//get node modules
const http = require('http');
const express = require('express');
const url = require('url');
const bodyparser = require('body-parser');
const fs = require('fs');
const uuid = require('uuid/v4');

//get custom modules
const Tone = require('./modules/tone.js');
const Db = require('./modules/database.js');

//express app 
var app = express();
app.use(bodyparser.json({limit: '50mb'}));

//setting up endpoints
//get tonal information for lyric text
app.post('/ToneAnalysis', function(req, res){
    Tone.GetTones(req.body.song, function(toneAnalysis){
        res.json(toneAnalysis);
    });
});

//user/ profile information
app.post('/addUser', function(req,res){
    //create unique id
    var tempid = uuid();
    req.body._id = tempid;
    Db.addUser(req.body, function(table){
        res.json({"id": tempid});
    });
});

//editing and saving songs
app.post('/CreateSong', function(req, res){
    const userId = req.body.userId;
    const songText = req.body.songText
    
    //query database to add the song
    Db.addSong(userId, songText); 
});

app.post('/EditSong', function(req, res){

});

app.post('/GetSong', function(req,res){
    const userId = req.body.userId;

});

app.listen(8000, ()=>{
    console.log('listening on 8000');
});

// const cleanup = require('./cleanup.js');
// cleanup.Cleanup(function(){
// 	console.log("cleaning up");
// 	database.closeDB();
// });
