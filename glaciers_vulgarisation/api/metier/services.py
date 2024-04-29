from datetime import datetime
from sqlite3 import IntegrityError
from sqlalchemy import Column, Engine, text
from sqlalchemy.orm import Session
from ..DAO.blogDAO import (
    createPost, deletePost, findAllPosts, findPostById
)


from .models import DbPost


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


def newPost(engine: Engine, title: str, body: str):
    if not title:
        raise Exception('Title is required.', 500)

    post = DbPost(
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
