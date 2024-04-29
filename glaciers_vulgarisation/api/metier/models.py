from sqlalchemy import Column, ForeignKey, Integer, String, DateTime
from ..db import Base


class DbPost(Base):
    __tablename__ = "post"
    id = Column(Integer, primary_key=True)
    created = Column(DateTime, nullable=False)
    title = Column(String, nullable=False)
    body = Column(String, nullable=False)

    @property
    def as_json(self):
        return [{
            'id': self.id,
            'created': self.created,
            'title': self.title,
            'body': self.body,
        }]
