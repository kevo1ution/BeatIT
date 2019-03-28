from flaskTests.decorator import crossdomain
import base64
from flask import (
    Blueprint, request
)
import speech_recognition as sr
import soundfile as sf
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
    return('This is the analyze')

