//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream;                      //stream from getUserMedia()
var recorder;                       //WebAudioRecorder object
var input;                          //MediaStreamAudioSourceNode  we'll be recording
var encodingType;                   //holds selected encoding for resulting audio (file)
var encodeAfterRecord = true;       // when to encode

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext; //new audio context to help us record

var encodingTypeSelect = document.getElementById("encodingTypeSelect");
var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);


function startRecording() {
    console.log("startRecording() called");

    /*
        Simple constraints object, for more advanced features see
        https://addpipe.com/blog/audio-constraints-getusermedia/
    */
    
    var constraints = { audio: true, video:false }

    /*
        We're using the standard promise based getUserMedia() 
        https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    */
var constraints = {
    audio: true,
    video: false
}
/* We're using the standard promise based getUserMedia() https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia */
navigator.mediaDevices.getUserMedia(constraints).then(
    function(stream) {
        __log("getUserMedia() success, stream created, initializing WebAudioRecorder...");
        //assign to gumStream for later use 
        gumStream = stream;
        /* use the stream */
        audioContext = new AudioContext();
        document.getElementById("formats").innerHTML="Format: 2 channel "+encodingTypeSelect.options[encodingTypeSelect.selectedIndex].value+" @ "+audioContext.sampleRate/1000+"kHz"

        input = audioContext.createMediaStreamSource(stream);

        //stop the input from playing back through the speakers 
        input.connect(audioContext.destination)
        //get the encoding 
        encodingType = encodingTypeSelect.options[encodingTypeSelect.selectedIndex].value;
        //disable the encoding selector 

        encodingTypeSelect.disabled = true;
        recorder = new WebAudioRecorder(input, {
          workerDir: "js/", // must end with slash
          encoding: encodingType,
          numChannels:2, //2 is the default, mp3 encoding supports only 2
          onEncoderLoading: function(recorder, encoding) {
            // show "loading encoder..." display
            __log("Loading "+encoding+" encoder...");
          },
          onEncoderLoaded: function(recorder, encoding) {
            // hide "loading encoder..." display
            __log(encoding+" encoder loaded");
          }
        });
        recorder.onComplete = function(recorder, blob) {
            __log("Encoding complete");
            createDownloadLink(blob, recorder.encoding);
            encodingTypeSelect.disabled = false;
            console.log(typeof(recorder.encoding));
        }
        recorder.setOptions({
            timeLimit: 120,
            encodeAfterRecord: encodeAfterRecord,
            ogg: {
                quality: 0.5
            },
            mp3: {
                bitRate: 160
            }
        });
        //start the recording process 
        recorder.startRecording();
        __log("Recording started");
    }).catch(function(err) { //enable the record button if getUSerMedia() fails 
        __log("failed");
        __log(err);
    recordButton.disabled = false;
    stopButton.disabled = true;
}); 
//disable the record button 
recordButton.disabled = true;
stopButton.disabled = false;
}

function stopRecording() {
    console.log("stopRecording() called");
    
    //stop microphone access
    gumStream.getAudioTracks()[0].stop();

    //disable the stop button
    stopButton.disabled = true;
    recordButton.disabled = false;
    
    //tell the recorder to finish the recording (stop recording + encode the recorded audio)
    recorder.finishRecording();

    __log('Recording stopped');
}

function createDownloadLink(blob, encoding) {
    var url = URL.createObjectURL(blob);
    var au = document.createElement('audio');
    var li = document.createElement('li');
    var link = document.createElement('a');
    //add controls to the "audio" element 
    au.controls = true;
    au.src = url; //link the a element to the blob 
    link.href = url;
    link.download = "audio"+ "." + encoding;

    link.innerHTML = link.download;
    //au is the wav file
    //add the new audio and a elements to the li element 
    li.appendChild(au);
    li.appendChild(link); //add the li element to the ordered list 
    recordingsList.appendChild(li);

    $(document).ready(function () {
        //var form = new FormData();
        //form.append('data', event.target.result);
        //form.append('breathe', 'b')
        //console.log(blob);
        $.ajax({    
            type: "POST",
            //enctype: 'multipart/form-data',
            contentType: false,
            processData: false,
            url: "http://127.0.0.1:5000/analyzeAudio/",
            data: blob
        }).done(function(data) {
          console.log(data);
        });
    });

}

var Messenger = function(el){
  'use strict';
  var m = this;
  
  m.init = function(){
    m.codeletters = "&#*+%?£@§$";
    m.message = 0;
    m.current_length = 0;
    m.fadeBuffer = false;
    m.messages = [
      'Want to make a rap song?',
      'Hit record and rap your lyrics.',
      'Let our AI do the work!',
      'Enjoy!.'
    ];
    
    setTimeout(m.animateIn, 100);
  };
  
  m.generateRandomString = function(length){
    var random_text = '';
    while(random_text.length < length){
      random_text += m.codeletters.charAt(Math.floor(Math.random()*m.codeletters.length));
    } 
    
    return random_text;
  };
  
  m.animateIn = function(){
    if(m.current_length < m.messages[m.message].length){
      m.current_length = m.current_length + 2;
      if(m.current_length > m.messages[m.message].length) {
        m.current_length = m.messages[m.message].length;
      }
      
      var message = m.generateRandomString(m.current_length);
      $(el).html(message);
      
      setTimeout(m.animateIn, 20);
    } else { 
      setTimeout(m.animateFadeBuffer, 20);
    }
  };
  
  m.animateFadeBuffer = function(){
    if(m.fadeBuffer === false){
      m.fadeBuffer = [];
      for(var i = 0; i < m.messages[m.message].length; i++){
        m.fadeBuffer.push({c: (Math.floor(Math.random()*12))+1, l: m.messages[m.message].charAt(i)});
      }
    }
    
    var do_cycles = false;
    var message = ''; 
    
    for(var i = 0; i < m.fadeBuffer.length; i++){
      var fader = m.fadeBuffer[i];
      if(fader.c > 0){
        do_cycles = true;
        fader.c--;
        message += m.codeletters.charAt(Math.floor(Math.random()*m.codeletters.length));
      } else {
        message += fader.l;
      }
    }
    
    $(el).html(message);
    
    if(do_cycles === true){
      setTimeout(m.animateFadeBuffer, 50);
    } else {
      setTimeout(m.cycleText, 2000);
    }
  };
  
  m.cycleText = function(){
    m.message = m.message + 1;
    if(m.message >= m.messages.length){
      m.message = 0;
    }
    
    m.current_length = 0;
    m.fadeBuffer = false;
    $(el).html('');
    
    setTimeout(m.animateIn, 200);
  };
  
  m.init();
}

console.clear();
var messenger = new Messenger($('#messenger'));




//helper function
function __log(e, data) {
    log.innerHTML += "\n" + e + " " + (data || '');
}