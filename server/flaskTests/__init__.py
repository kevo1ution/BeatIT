import os
from flask import (Flask, request)
from flask import jsonify
from flask_cors import CORS
from flaskTests.decorator import crossdomain
import json
import base64 #put in analyzeaudio
import wave #put in analyzeaudio


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    CORS(app)
    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)


    from . import analyzeAudio
    app.register_blueprint(analyzeAudio.bp)

    @app.route('/', methods=['GET', 'POST'])
    @crossdomain(origin='*')
    def hello():
        if request.method=='POST':
            print('post method')
        #    audio = request.data
        #    blob = open(audio).read()

        return 'flask test server'
    return app
