from sqlalchemy.exc import IntegrityError
import pytest
from api.DAO.authDAO import createUser, findUserByUsername
from api.metier.models import DbUser
from flask_bcrypt import (  # type: ignore
    check_password_hash
)


class TestAuthDAO():
    def test_find_user_by_username(
        self, db_session, existing_user
    ):
        # when
        user = findUserByUsername(db_session, existing_user.username)
        # then
        assert user.username == existing_user.username
        assert check_password_hash(
            user.password, existing_user.password) == True

    def test_create_user(
        self, db_session, valid_user
    ):
        # given
        rowsBeforeCreate = db_session.query(DbUser.id).count()
        # when
        createUser(db_session, valid_user)
        # then
        rowsAfterCreate = db_session.query(DbUser.id).count()
        db_session.rollback()

        assert rowsAfterCreate == (rowsBeforeCreate + 1)

    @pytest.mark.xfail(raises=IntegrityError)
    def test_create_existing_user(
        self, db_session, existing_user
    ):
        # when
        createUser(db_session, existing_user)
        # then
        with pytest.raises(IntegrityError):
            db_session.commit()
