from flask import (
    make_response, request, Response, render_template
)
from flask_restx import (  # type: ignore
    Namespace, fields, Resource
)
from sqlalchemy import Engine

# from api.metier.models import DbPost

# from .metier.services import (
#     getPosts, newPost, removePost, updatePost
# )

# ----------------------------------------------------------
#                       Namespace
# ----------------------------------------------------------


def create_vulgarisation_ns() -> Namespace:

    api = Namespace('glacier-vulgarisation', description='Vulgarisation sur la fonte des glaciers')

    @api.route('/')
    class MainPage(Resource):

        # ------------------ GET ------------------
        @api.doc('web-page')
        def get(self):
            html_content = render_template('index.html')
            response = make_response(html_content)
            response.headers['Content-Type'] = 'text/html'
            return response

    return api
