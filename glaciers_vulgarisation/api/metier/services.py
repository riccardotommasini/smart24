from datetime import datetime
from sqlite3 import IntegrityError
from sqlalchemy import Column, Engine, text
from sqlalchemy.orm import Session
from flask_bcrypt import (  # type: ignore
    generate_password_hash, check_password_hash
)
from ..DAO.authDAO import (
    createUser, findUserByUsername
)
from ..DAO.blogDAO import (
    createPost, deletePost, findAllPosts, findPostById
)


from .models import DbPost, DbUser

# ----------------------------------------------------------
#                       services
#                         Auth
# ----------------------------------------------------------


def registrationUser(engine: Engine, username: str, password: str):
    if not username:
        raise ValueError('Username is required.', 500)
    elif not password:
        raise ValueError('Password is required.', 500)
    try:
        password = generate_password_hash(password)
        user = DbUser(
            username=username,
            password=password
        )
# -----------------------------
        with Session(engine) as sa:  # Session sqlAlchemy
            createUser(sa, user)
            sa.commit()

# -----------------------------
    except IntegrityError:
        raise Exception("User  is already registered.", 500)


def loginUser(engine: Engine, username: str, password: str):
    # -----------------------------
    with Session(engine) as sa:  # Session sqlAlchemy
        user = findUserByUsername(sa, username)
    # -----------------------------
    if user is None:
        raise NameError('Incorrect username.', 500)
    elif not check_password_hash(user.password, password):
        raise ValueError('Incorrect password.', 500)
    return user


# ----------------------------------------------------------
#                       services
#                         Post
# ----------------------------------------------------------

def getPosts(engine: Engine) -> list[DbPost]:
    with Session(engine) as sa:  # Session sqlAlchemy
        posts = findAllPosts(sa)
    return posts


def removePost(engine: Engine, post_id: int):
    with Session(engine) as sa:  # Session sqlAlchemy
        deletePost(sa, post_id)
        sa.commit()


def newPost(engine: Engine, title: str, body: str, author_id: int):
    if not title:
        raise Exception('Title is required.', 500)

    post = DbPost(
        author_id=author_id,
        created=datetime.today(),
        title=title,
        body=body,
    )
    with Session(engine) as sa:  # Session sqlAlchemy
        createPost(sa, post)
        sa.commit()


def updatePost(engine: Engine, post_id: int, title: str, body: str):
    if not title:
        raise Exception('Title is required.', 500)

    with Session(engine) as sa:  # Session sqlAlchemy
        post = findPostById(sa, post_id)
        post.__setattr__("title", title)
        post.__setattr__("body", body)
        sa.commit()
