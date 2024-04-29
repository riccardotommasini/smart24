import os
from flask import Flask
from flask_cors import CORS
from flask_restx import Api  # type: ignore
from sqlalchemy import Engine
from werkzeug.middleware.profiler import ProfilerMiddleware

from .db import init_app, set_engine
from .blog import create_blog_ns


def create_api(engine: Engine) -> Api:

    api = Api(
        title='Api blog',
        version='1.0',
        description='Apis pour gérer le blog',
    )

    api.add_namespace(create_blog_ns(engine), path='/blog')
    return api


def create_app(test_config: str = "") -> Flask:
    # create and configure the app

    db_type = "sqlite:///"
    if (test_config == ""):
        db_folder = 'flaskr.sqlite'
    else:
        db_folder = 'dbTest.sqlite'
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        DATABASE=os.path.join(app.instance_path, db_folder),
    )
    db_folder = "instance/" + db_folder
    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        pass

    engine = set_engine(db_type + db_folder)
    api = create_api(engine)
    api.init_app(app)
    init_app(app)

    CORS(app, resources={r"/*": {"origins": "*"}})
    # app.wsgi_app = ProfilerMiddleware(app.wsgi_app, profile_dir='./profs')
    return app

