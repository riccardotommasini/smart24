from unittest import mock

import pytest
from api.metier.models import DbPost


class TestBlog():
    def test_post_list_get(
        self, client
    ):
        response = client.get("/blog/")
        json_data = response.json
        assert len(json_data) == 3

    @mock.patch('flask_jwt_extended.view_decorators.verify_jwt_in_request')
    @mock.patch('api.blog.get_jwt_identity', return_value=1)
    def test_post_list_post(
        self, mock_jwt_identity, mock_jwt_required, client, valid_post, db_session
    ):
        client.post("/blog/", json={
            'title': valid_post.title, 'body': valid_post.body
        })
        assert db_session.query(DbPost.id).count() == 4

    @pytest.mark.xfail(raises=Exception)
    @mock.patch('flask_jwt_extended.view_decorators.verify_jwt_in_request')
    @mock.patch('api.blog.get_jwt_identity', return_value=1)
    def test_post_list_post_no_title(
        self, mock_jwt_identity, mock_jwt_required, client, valid_post, db_session
    ):
        response = client.post("/blog/", json={
            'title': "", 'body': valid_post.body
        })
        assert response.data == b'Title is required.'

    def test_update_post(
        self, client, db_session, valid_post
    ):
        with mock.patch('flask_jwt_extended.view_decorators.verify_jwt_in_request'):
            client.patch("/blog/1", json={
                'title': valid_post.title, 'body': valid_post.body
            })
        assert db_session.query(DbPost).filter_by(
            id=1).first().title == valid_post.title
        assert db_session.query(DbPost).filter_by(
            id=1).first().body == valid_post.body

    @pytest.mark.xfail(raises=Exception)
    def test_update_post_no_title(
        self, client, valid_post
    ):
        with mock.patch('flask_jwt_extended.view_decorators.verify_jwt_in_request'):
            response = client.patch("/blog/1", json={
                'title': "", 'body': valid_post.body
            })
        assert response.data == b'Title is required.'

    @mock.patch('flask_jwt_extended.view_decorators.verify_jwt_in_request')
    def test_delete_post(
        self, mock_jwt_required, client, db_session
    ):
        client.delete("/blog/1")
        assert db_session.query(DbPost.id).count() == 2
