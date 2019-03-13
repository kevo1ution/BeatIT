async function main(){
const fs = require('fs');

// Imports the Google Cloud client library
const speech = require('@google-cloud/speech').v1p1beta1;

// Creates a client
const client = new speech.SpeechClient();

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
const fileName = './resources/RecordingMono2.wav';

const config = {
  encoding: `LINEAR16`,
  sampleRateHertz: 48000,
  languageCode: `en-US`,
  enableWordConfidence: true,
  enableWordTimeOffsets: true,
};

const audio = {
  content: fs.readFileSync(fileName).toString('base64'),
};

const request = {
  config: config,
  audio: audio,
};

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
words[0].words.forEach(a => {
    console.log(a);
//  console.log(` word: ${a.word}, confidence: ${a.confidence}`);
});
}
main();