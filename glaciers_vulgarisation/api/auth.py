from flask import (
    make_response, request, session, Response
)
from flask_jwt_extended import create_access_token
from flask_restx import (  # type: ignore
    Namespace, fields, Resource
)
from sqlalchemy import Engine

from .metier.services import (
    loginUser, registrationUser
)


def create_auth_ns(engine: Engine) -> Namespace:
    api = Namespace('user', description='User related operations')

    user = api.model(
        'user',
        {
            'username': fields.String(required=True, description='Username of the user'),
            'password': fields.String(required=True, description='Password of the user'),
        }
    )

    @api.route('/registration')
    class Registration(Resource):
        @api.doc('inscription_user')
        @api.expect(user, validate=True)
        def post(self) -> Response:
            jsondata = request.get_json()
            username_data = jsondata['username']
            password_data = jsondata['password']
            try:
                registrationUser(engine, username_data, password_data)
                state = make_response("", 204)
            except ValueError as ve:
                state = make_response(ve.args)
            except Exception as ex:
                state = make_response(ex.args)
            return state

    @api.route('/connexion')
    class Connexion(Resource):
        @api.doc('connexion_user')
        @api.expect(user, validate=True)
        def post(self) -> Response:
            jsondata = request.get_json()
            username_data = jsondata['username']
            password_data = jsondata['password']
            try:
                user = loginUser(engine, username_data, password_data)
                session.clear()
                session['user_id'] = user.id
                access_token = create_access_token(identity=user.id)
                state = make_response(access_token, 200)
            except ValueError as ve:
                state = make_response(ve.args)
            except Exception as ex:
                state = make_response(ex.args)
            return state

    @api.route('/deconnexion')
    class Deconnexion(Resource):
        @api.doc('deconnexion_user')
        def get(self) -> Response:
            session.clear()
            return make_response("", 204)

    return api
