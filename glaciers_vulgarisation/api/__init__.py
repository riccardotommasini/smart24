from flask import Flask
from flask_cors import CORS
from flask_restx import Api  # type: ignore



from .dash_app import create_dash_app
from .vulgarisation import create_vulgarisation_ns


def create_api() -> Api:

    api = Api(
        title='Api blog',
        version='1.0',
        description='Apis pour la vulgarisation scientifique',
    )

    api.add_namespace(create_vulgarisation_ns(), path='/vulgarisation')
    return api


def create_app(test_config: str = "") -> Flask:
    app = Flask(__name__, instance_relative_config=True)
    
    api = create_api()
    api.init_app(app)

    CORS(app, resources={r"/*": {"origins": "*"}})

    create_dash_app(app);
    
    return app
