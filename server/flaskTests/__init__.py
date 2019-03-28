import os
from flask import Flask
from flask import jsonify
from flask_cors import CORS
from flaskTests.decorator import crossdomain
import json



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
        return 'flaks test server'

    return app