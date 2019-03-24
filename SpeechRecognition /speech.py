import speech_recognition as sr

r = sr.Recognizer()


with sr.Microphone() as source:
    print("speak now : ")
    audio = r.record(source, duration = 10)
    
    try:
        text = r.recognize_google(audio)
        print("you said :{} ".format(text))
    except:
        print("didnt recognize")

#def recognize_speech(wavefile):
#    with wavefile as source:
#    print("listening : ")
#    audio = r.record(source, offset=1)
#    
#    try:
#        text = r.recognize_google(audio)
#        print("you said :{} ".format(text))
#    except:
#        print("didnt recognize")
