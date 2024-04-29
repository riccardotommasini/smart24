import os
from flask import Flask
from sqlalchemy import Engine, create_engine

import click

# ----------- SQLAlchemy -----------

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


def set_engine(url: str) -> Engine:
    engine = create_engine(url)
    # Base.metadata.engine = engine
    return engine


# def close_db(e=None):
#     print("Close db")
#     try:
#         engine = Base.metadata.engine
#         engine.dispose()
#     except:
#         click.echo('Any engine to dispose')


def init_db(db_type: str, db_folder: str) -> Engine:
    engine = set_engine(db_type + db_folder)
    Base.metadata.create_all(engine)
    return engine


@click.command('init-db')
def init_db_command():
    # close_db()
    # Decommenter pour DROP AND CREATE
    # Base.metadata.drop_all(set_engine("sqlite:///instance/flaskr.sqlite"))
    if (os.path.exists("./instance") == False):
        os.mkdir("./instance")
    init_db("sqlite:///", "instance/flaskr.sqlite")
    click.echo('Initialized the database.')


def init_app(app: Flask):
    # app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
