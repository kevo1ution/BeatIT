from flaskTests.decorator import crossdomain
import base64
from flask import (
    Blueprint, request
)
import speech_recognition as sr
import soundfile as sf
import unirest
r = sr.Recognizer()

bp = Blueprint('analyzeAudio', __name__, url_prefix='/analyzeAudio')

@bp.route('/', methods=['GET', 'POST', 'OPTIONS'])
@crossdomain(origin='*')
def analyzeAudio():
    with open('audio.wav', 'wb') as infile:
        infile.write(request.data)
    src = sr.AudioFile('audio.wav')
    f = sf.SoundFile('audio.wav')
    print('seconds = {}'.format(len(f) / f.samplerate))
    with src as source:
        audio = r.record(source)
        print(type(audio))
        try:
            text = r.recognize_google(audio)
            print("lyrics:{} ".format(text))
        except:
            print("didnt recognize")

    response = unirest.post("https://macgyverapi-song-tempo-detection-v1.p.rapidapi.com/",
      headers={
        "X-RapidAPI-Key": "cbd1fb4709mshcb495d0b31992eap1fd72djsn9fe476ae8d17",
        "Content-Type": "application/json"
      },
      params=("{\"id\":\"6t7s5d7t\",\"key\":\"free\",\"data\":{\"audio_file\":\"https://askmacgyver.com/test/Maroon-128.mp3\"}}")
    )
    return('This is the analyze')

