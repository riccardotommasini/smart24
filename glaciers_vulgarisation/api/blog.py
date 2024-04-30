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


def create_blog_ns(engine: Engine) -> Namespace:

    api = Namespace('post', description='Posts related operations')

    postModel = api.model(
        'postModel',
        {
            'title': fields.String(required=True, description='The post title'),
            'body': fields.String(required=True, description='The post body'),
        }
    )

    postComplete = api.model(
        'postComplete',
        {
            'id': fields.Integer(required=True, description='The post identifier'),
            'title': fields.String(required=True, description='The post title'),
            'body': fields.String(required=True, description='The post body'),
            'created': fields.String(required=True, description='The post creation date'),
        }
    )

    @api.route('/')
    class MainPage(Resource):

        # ------------------ GET ------------------
        @api.doc('web-page')
        def get(self):
            html_content = render_template('index.html')
            response = make_response(html_content)
            response.headers['Content-Type'] = 'text/html'
            return response

    #     # ------------------ POST ------------------

    #     @api.doc('add_post')
    #     @api.expect(postModel, validate=True)
    #     def post(self) -> Response:
    #         jsondata = request.get_json()
    #         title_data = jsondata['title']
    #         body_data = jsondata['body']
    #         try:
    #             newPost(engine, title_data, body_data)
    #             response = make_response("", 204)
    #         except Exception as ex:
    #             response = make_response(ex.args)
    #         return response

    # @api.route('/<post_id>')
    # @api.param("post_id", "The post identifier")
    # class UpdatePost(Resource):

        # # ------------------ PATCH ------------------
        # @api.doc('patch_post')
        # @api.expect(postModel, validate=True)
        # def patch(self, post_id: int) -> Response:
        #     jsondata = request.get_json()
        #     title_data = jsondata['title']
        #     body_data = jsondata['body']
        #     try:
        #         updatePost(engine, post_id, title_data, body_data)
        #         response = make_response("", 204)
        #     except Exception as ex:
        #         response = make_response(ex.args)
        #     return response

    # ------------------ DELETE ------------------

        # @api.doc('delete_post')
        # @api.response(204, "Post Deleted")
        # def delete(self, post_id: int) -> Response:
        #     removePost(engine, post_id)
        #     return make_response("", 204)

    return api
