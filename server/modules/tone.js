//Tone Module
//analyzes text and gives comprehensive emotion/sentiment quantities

var ToneAnalyzerV3 = require('../node_modules/watson-developer-cloud/tone-analyzer/v3');
var Keys = require('../keys.json');

var toneAnalyzer = new ToneAnalyzerV3({
  version: '2017-09-21',
  iam_apikey: Keys.watson,
  url: 'https://gateway.watsonplatform.net/tone-analyzer/api'
});

function GetTones(text, callback){
    var toneParams = {
        tone_input: { 'text': text },
        content_type: 'application/json'
    };

    toneAnalyzer.tone(toneParams, function (error, toneAnalysis) {
        if (error) {
            console.log(error);
            callback({});
        } else { 
            callback(toneAnalysis);
        }
    });
}


//set up the module util functions
module.exports = {
    GetTones: GetTones
}