
//get node modules
const http = require('http');
const express = require('express');
const url = require('url');
const bodyparser = require('body-parser');
const fs = require('fs');
const uuid = require('uuid/v4');
const speech = require('@google-cloud/speech').v1p1beta1;
const speechClient = new speech.SpeechClient();
const requests = require('request');
const cors = require('cors');

//get custom modules
const Tone = require('./modules/tone.js');
const Db = require('./modules/database.js');
const bpmCalc = require('./modules/bpmCalc.js');

//express app 
var app = express();
app.use(bodyparser.json({limit: '50mb'}));
app.use(cors({credentials: true, origin: true}));

//setting up endpoints
//song information
//get song based on user raw rap audio (returns beat overlayed etc)
app.post('/GetSong', async function(req,res){
    //console.log(req.body);
    //console.log(req.body.song);
    const audio = {
        content:  req.body.song //fs.readFileSync("./tests/resources/RecordingMono2.wav").toString("base64"), //base 64 version of the song
    };
    const config = {
        encoding: 'LINEAR16',
        sampleRateHertz: 48000,
        languageCode: 'en-US',
        enableWordConfidence: true,
        enableWordTimeOffsets: true,
    };
    const request = {
        audio: audio,
        config: config,
    };

    //set up result variables
    var info = {
        "lyrics": "",
        "timing": [],
        "tones": [],
        "bpm": 90,
        "audio": audio
    };

    //using request information query google api
    const [response] = await speechClient.recognize(request)
    .then(data => {
        console.log("success!");
    })
    .catch(err => {
      console.error('ERROR:', err);
    });


    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    const confidence = response.results
      .map(result => result.alternatives[0].confidence)
      .join(`\n`);
    console.log(`Transcription: ${transcription} \n Confidence: ${confidence}`);
    info.lyrics = transcription;
    
    console.log(`\n\nWord-Level-Confidence:`);
    const words = response.results.map(result => result.alternatives[0]);
    words.forEach(word => {
        word.words.forEach(a => {
            const startSecs =
                `${a.startTime.seconds}` +
                `.` +
                a.startTime.nanos / 100000000;
            const endSecs =
                `${a.endTime.seconds}` +
                `.` +
                a.endTime.nanos / 100000000;            
            a.startTime = startSecs;
            a.endTime = endSecs;
            info.timing.push(a);
            console.log(a);
        });
    });

    //get bpm
    info.bpm = bpmCalc.getBPM(info.timing);

    Tone.GetTones(transcription, function(toneAnalysis){
        info.tones = toneAnalysis;
        console.log("\n\nTone Analysis:");
        console.log(toneAnalysis);

        //create request from requests module
        // requests.post({
        //     headers:{
        //         'content-type': 'application/json'
        //     },
        //     url: '',
        //     form:{

        //     }
        // });

        res.json(info);
    });
});


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
app.post('/song/create', function(req, res){
    const userId = req.body.userId;
    const songText = req.body.songText
    
    //query database to add the song
    Db.addSong(userId, songText); 
});

app.post('/song/getWordsAndBeat', function(req, res){

});

app.post('/EditSong', function(req, res){

});

app.listen(8000, ()=>{
    console.log('listening on 8000');
});

// const cleanup = require('./cleanup.js');
// cleanup.Cleanup(function(){
// 	console.log("cleaning up");
// 	database.closeDB();
// });
