import os
import sqlite3
from api.db import Base, init_db
from sqlalchemy.orm import Session
import datetime
from api.metier.models import DbPost, DbUser
from flask_bcrypt import (  # type: ignore
    generate_password_hash
)


def initdbTest():
    print("-- Debug : Init database")
    if (os.path.exists("./instance") == False):
        os.mkdir("./instance")
    sqlite3.connect("instance/flaskr.sqlite")
    engine = init_db("sqlite:///", "instance/dbTest.sqlite")
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

    with Session(engine) as sa:
        user = DbUser(username='Emile',
                      password=generate_password_hash('eZola'))
        sa.add(user)
        user = DbUser(username='Camille',
                      password=generate_password_hash('cClaudel'))
        sa.add(user)
        user = DbUser(username='Victor',
                      password=generate_password_hash('vHugo'))
        sa.add(user)
        date = datetime.datetime(2020, 8, 12, 12, 42, 35)
        post = DbPost(author_id=1, created=date,
                      title='Welcome !', body='Here is my blog')
        sa.add(post)
        date = datetime.datetime(2021, 5, 4, 10, 52, 27)
        post = DbPost(author_id=2, created=date,
                      title='Kit-kat ?', body='Take a break, take a kit-kat ;)')
        sa.add(post)
        date = datetime.datetime.now()
        post = DbPost(author_id=3, created=date,
                      title='It is time', body='Here the date of the table creation')
        sa.add(post)
        sa.commit()


if __name__ == "__main__":
    initdbTest()
