from flask import (
    make_response, request, Response
)
from flask_restx import (  # type: ignore
    Namespace, fields, Resource
)
from flask_jwt_extended import (
    get_jwt_identity, jwt_required
)
from sqlalchemy import Engine

from api.metier.models import DbPost

from .metier.services import (
    getPosts, newPost, removePost, updatePost
)

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
            'author_id': fields.Integer(required=True, description='The author identifier'),
            'created': fields.String(required=True, description='The post creation date'),
        }
    )

    @api.route('/')
    class PostList(Resource):

        # ------------------ GET ------------------
        @api.doc('list_posts')
        @api.marshal_list_with(postComplete)
        def get(self) -> list[DbPost]:
            posts = getPosts(engine)
            return posts

        # ------------------ POST ------------------

        @api.doc('add_post')
        @api.expect(postModel, validate=True)
        @api.doc(security="jsonWebToken")
        @jwt_required()
        def post(self) -> Response:
            jsondata = request.get_json()
            title_data = jsondata['title']
            body_data = jsondata['body']
            authorid_data = get_jwt_identity()
            try:
                newPost(engine, title_data, body_data, authorid_data)
                response = make_response("", 204)
            except Exception as ex:
                response = make_response(ex.args)
            return response

    @api.route('/<post_id>')
    @api.param("post_id", "The post identifier")
    class UpdatePost(Resource):

        # ------------------ PATCH ------------------
        @api.doc('patch_post')
        @api.expect(postModel, validate=True)
        @api.doc(security="jsonWebToken")
        @jwt_required()
        def patch(self, post_id: int) -> Response:
            jsondata = request.get_json()
            title_data = jsondata['title']
            body_data = jsondata['body']
            try:
                updatePost(engine, post_id, title_data, body_data)
                response = make_response("", 204)
            except Exception as ex:
                response = make_response(ex.args)
            return response

    # ------------------ DELETE ------------------

        @api.doc('delete_post')
        @api.response(204, "Post Deleted")
        @api.doc(security="jsonWebToken")
        @jwt_required()
        def delete(self, post_id: int) -> Response:
            removePost(engine, post_id)
            return make_response("", 204)

    return api
