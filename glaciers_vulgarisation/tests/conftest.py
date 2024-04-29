import datetime
import pytest
from api import create_app

from api.db import init_db
from api.metier.models import DbPost, DbUser
from sqlalchemy.orm import Session

from initdbTest import initdbTest


@pytest.fixture
def client():
    app = create_app("test")
    with app.test_client() as client:
        yield client


@pytest.fixture()
def db_session(db_engine):
    session = Session(db_engine)
    yield session
    session.rollback()
    session.close()


@pytest.fixture()
def db_engine():
    return init_db("sqlite:///", "instance/dbTest.sqlite")


@pytest.fixture(scope="session")
def valid_user():
    valid_user = DbUser(
        username="Agatha",
        password="aChristie"
    )
    return valid_user


@pytest.fixture(scope="session")
def valid_post():
    date = datetime.datetime(2011, 11, 11, 11, 11, 11)
    valid_post = DbPost(author_id=3, created=date,
                        title='Test', body='Body of the test')
    return valid_post


@pytest.fixture(scope="session")
def existing_user():
    existing_user = DbUser(
        username="Emile",
        password="eZola"
    )
    return existing_user


@pytest.fixture(autouse=True)
def rebootdbTest():
    initdbTest()
