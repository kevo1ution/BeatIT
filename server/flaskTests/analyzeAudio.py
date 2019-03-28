from flaskTests.decorator import crossdomain
import base64
from flask import (
    Blueprint, request
)
import speech_recognition as sr
r = sr.Recognizer()

bp = Blueprint('analyzeAudio', __name__, url_prefix='/analyzeAudio')

@bp.route('/', methods=['GET', 'POST', 'OPTIONS'])
@crossdomain(origin='*')
def analyzeAudio():
    #b64data = request.form['data'].split('base64,')[1]
    #binaryData = base64.b64decode(b64data)
    with open("demo.wav", 'r') as infile:
        for line in infile:
            print(line)
    return "ok"
    # with open("audio.wav", 'w') as file:
    #     file.write(binaryData)
    src = sr.AudioFile('audio.wav')
    with src as source:
        audio = r.record(source)
        print(type(audio))
        try:
            text = r.recognize_google(audio)
            print("you said :{} ".format(text))
        except:
            print("didnt recognize")
    return('This is the analyze')

