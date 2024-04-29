import pytest
from api.DAO.blogDAO import createPost, deletePost, findAllPosts, findPostById

from api.metier.models import DbPost


class TestPostDAO():
    def test_find_all_posts(
        self, db_session
    ):
        # when
        rows = len(findAllPosts(db_session))
        # then
        assert rows == 3

    def test_create_post(
        self, db_session, valid_post
    ):
        # given
        rowsBeforeCreate = db_session.query(DbPost.id).count()
        # when
        createPost(db_session, valid_post)
        # then
        rowsAfterCreate = db_session.query(DbPost.id).count()
        db_session.rollback()
        assert rowsAfterCreate == (rowsBeforeCreate + 1)

    def test_delete_post(
        self, db_session
    ):
        # given
        post = db_session.query(DbPost).filter_by(id=1).first()
        rowsBeforeDelete = db_session.query(DbPost.id).count()
        # when
        deletePost(db_session, post.id)
        # then
        rowsAfterDelete = db_session.query(DbPost.id).count()
        db_session.rollback()
        assert rowsAfterDelete == (rowsBeforeDelete - 1)

    @pytest.mark.xfail(raises=Exception)
    def test_no_delete_post(
        self, db_session
    ):
        rowsBeforeDelete = db_session.query(DbPost.id).count()
        # when
        deletePost(db_session, 4)
        # then
        rowsAfterDelete = db_session.query(DbPost.id).count()
        db_session.rollback()
        assert rowsAfterDelete == rowsBeforeDelete

    def test_find_post_by_id(
        self, db_session
    ):
        # when
        post = findPostById(db_session, 1)
        # then
        assert post.title == "Welcome !"
        assert post.body == "Here is my blog"

    @pytest.mark.xfail(raises=Exception)
    def test_no_find_post_by_id(
            self, db_session
    ):
        # given
        id = 4
        # when
        with pytest.raises(Exception):
            post = findPostById(db_session, id)
