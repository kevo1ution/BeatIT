const recordAudio = () =>
  new Promise(async resolve => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.mimeType = "audio/wav"
    //console.log(mediaRecorder.audioChannels);
    // mediaRecorder.recorderType = StereoAudioRecorder;

    // audioRecorder.mimeType = 'audio/wav';
    mediaRecorder.audioChannels = 1;

    const audioChunks = [];

    mediaRecorder.addEventListener("dataavailable", event => {
      audioChunks.push(event.data);
    });

    const start = () => mediaRecorder.start();

    const stop = () =>
      new Promise(resolve => {
        mediaRecorder.addEventListener("stop", (d) => {
          const audioBlob = new Blob(audioChunks);
          audioBlob.type = "audio/wav";
          console.log(audioBlob);

          var reader = new FileReader();
          reader.readAsDataURL(audioBlob); 
          reader.onloadend = function() {
            base64data = reader.result;                
            split64 = base64data.split("data:application/octet-stream;base64,");
            bdata = split64[1]
            console.log(bdata);
            //send kevin
            var xhr = new XMLHttpRequest();
            var url = "http://ec2-52-43-103-97.us-west-2.compute.amazonaws.com:8000/GetSong";
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Access-Control-Allow-Origin", "http://ec2-52-43-103-97.us-west-2.compute.amazonaws.com:8000/GetSong");
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var json = JSON.parse(xhr.responseText);
                    //console.log(json.email + ", " + json.password);
                }
            };
            var data = JSON.stringify({"song": bdata});
            //console.log(data)
            xhr.send(data); 
          }
          

          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          const play = () => audio.play();
          resolve({ audioBlob, audioUrl, play });
        });

        mediaRecorder.stop();
      });

    resolve({ start, stop });
  });

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

const handleAction = async () => {
  const recorder = await recordAudio();
  const actionButton = document.getElementById('actionRecord');
  actionButton.disabled = true;
  recorder.start();
  await sleep(7000);
  const audio = await recorder.stop();
  audio.play();
  await sleep(7000);
  actionButton.disabled = false;
}

var x = document.getElementById("myAudio");

var controller = x.controller

controller.suspend()

function play(){
  controller.play()
}

function pause(){
  controller.pause()
}

