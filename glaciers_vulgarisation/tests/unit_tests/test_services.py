import pytest
from api.DAO.blogDAO import findPostById
from api.metier.models import DbUser
from api.metier.services import getPosts, loginUser, newPost, registrationUser, removePost, updatePost
from flask_bcrypt import check_password_hash # type: ignore


class TestServices():

    # --------------------------------------
    #              Registration
    # --------------------------------------
    def test_registration_user(
        self, db_engine, db_session, valid_user
    ):
        # given
        rowsBeforeCreate = db_session.query(DbUser.id).count()
        # when
        try:
            registrationUser(
                db_engine, valid_user.username, valid_user.password)
            # then
            response = ("", 204)

            rowsAfterCreate = db_session.query(DbUser.id).count()
        except:
            response = ("", 500)
        assert rowsAfterCreate == (rowsBeforeCreate + 1)
        assert response == ("", 204)

    @pytest.mark.xfail(raises=ValueError)
    def test_registration_user_no_username(
        self, db_engine, valid_user
    ):
        # when
        with pytest.raises(ValueError):
            registrationUser(
                db_engine, "", valid_user.password)

    @pytest.mark.xfail(raises=ValueError)
    def test_registration_user_no_password(
        self, db_engine, valid_user
    ):
        # when
        with pytest.raises(ValueError):
            registrationUser(
                db_engine, valid_user.username, "")

    @pytest.mark.xfail(raises=Exception)
    def test_registration_user_existing_user(
        self, db_engine, existing_user
    ):
        # when
        with pytest.raises(Exception):
            registrationUser(
                db_engine, existing_user.username, existing_user.password)

    # --------------------------------------
    #                 Login
    # --------------------------------------

    def test_login_user(
        self, db_engine, existing_user
    ):
        # when
        user = loginUser(db_engine, existing_user.username,
                         existing_user.password)
        assert user.username == existing_user.username
        assert check_password_hash(user.password, existing_user.password)

    @pytest.mark.xfail(raises=NameError)
    def test_login_user_not_found(
        self, db_engine, valid_user
    ):
        # when
        with pytest.raises(NameError):
            loginUser(db_engine, valid_user.username,
                      valid_user.password)

    @pytest.mark.xfail(raises=ValueError)
    def test_login_user_wrong_password(
        self, db_engine
    ):
        # given
        user = DbUser(username="Emile", password="WrongPassword")
        # when

        with pytest.raises(ValueError):
            loginUser(db_engine, user.username,
                      user.password)

    # --------------------------------------
    #                 Post
    # --------------------------------------

    def test_get_posts(
        self, db_engine
    ):
        # when
        posts = getPosts(db_engine)
        # then
        assert len(posts) == 3

    def test_remove_post(
        self, db_engine
    ):
        # when
        removePost(db_engine, 3)
        # then
        assert len(getPosts(db_engine)) == 2

    # --------------------------------------
    #                new Post
    # --------------------------------------

    def test_new_post(
        self, db_engine, valid_post
    ):
        # when
        newPost(db_engine, valid_post.title,
                valid_post.body, valid_post.author_id)

        # then
        assert len(getPosts(db_engine)) == 4

    @pytest.mark.xfail(raises=Exception)
    def test_new_post_no_title(
        self, db_engine, valid_post
    ):
        with pytest.raises(Exception):
            # when
            newPost(db_engine, "",
                    valid_post.body, valid_post.author_id)

    # --------------------------------------
    #              update Post
    # --------------------------------------

    def test_update_post(
        self, db_engine, valid_post, db_session
    ):
        # when
        updatePost(db_engine, 1, valid_post.title,
                   valid_post.body)
        # then
        post = findPostById(db_session, 1)
        assert post.title == 'Test'
        assert post.body == 'Body of the test'

    @pytest.mark.xfail(raises=Exception)
    def test_update_post_no_title(
        self, db_engine, valid_post
    ):
        # when
        with pytest.raises(Exception):
            updatePost(db_engine, 1, "",
                       valid_post.body)

    @pytest.mark.xfail(raises=Exception)
    def test_update_post_not_found(
        self, db_engine, valid_post
    ):
        # when
        with pytest.raises(Exception):
            updatePost(db_engine, 4, valid_post.title,
                       valid_post.body)
