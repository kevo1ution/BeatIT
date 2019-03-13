async function main() {
    // Imports the Google Cloud client library
    const speech = require('../node_modules/@google-cloud/speech').v1p1beta1;
    const fs = require('fs');
  
    // Creates a client
    const client = new speech.SpeechClient();
  
    // The name of the audio file to transcribe
    const fileName = './resources/RecordingMono2.wav';

    // Reads a local audio file and converts it to base64
    const file = fs.readFileSync(fileName);
    const audioBytes = file.toString('base64');

    // The audio file's encoding, sample rate in hertz, and BCP-47 language code
    const audio = {
        content: audioBytes,
    };
    const config = {
        encoding: 'LINEAR16',
        sampleRateHertz: 48000,
        languageCode: 'en-US',
        enableWordConfidence: true,
    };
    const request = {
        audio: audio,
        config: config,
    };

    // Detects speech in the audio file
    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    const confidence = response.results
      .map(result => result.alternatives[0].confidence)
      .join(`\n`);
    console.log(`Transcription: ${transcription} \n Confidence: ${confidence}`);
    
    console.log(`Word-Level-Confidence:`);
    const words = response.results.map(result => result.alternatives[0]);
    words.forEach(word => {
        word.words.forEach(a => {
            console.log(` word: ${a.word}, confidence: ${a.confidence}`);
        });
    });
}
main().catch(console.error);