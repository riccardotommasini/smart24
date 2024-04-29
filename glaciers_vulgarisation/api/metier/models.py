from sqlalchemy import Column, ForeignKey, Integer, String, DateTime
from ..db import Base


class DbUser(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

    @property
    def as_json(self):
        return {
            'id': self.id,
            'username': self.username,
            'password': self.password,
        }


class DbPost(Base):
    __tablename__ = "post"
    id = Column(Integer, primary_key=True)
    author_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    created = Column(DateTime, nullable=False)
    title = Column(String, nullable=False)
    body = Column(String, nullable=False)

    @property
    def as_json(self):
        return [{
            'id': self.id,
            'author_id': self.author_id,
            'created': self.created,
            'title': self.title,
            'body': self.body,
        }]
