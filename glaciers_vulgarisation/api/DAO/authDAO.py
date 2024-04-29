# ----------------------------------------------------------
#                       authDAO
# ----------------------------------------------------------


from ..metier.models import DbUser


def findUserByUsername(sa, username_data) -> DbUser:
    user = sa.query(DbUser).filter_by(
        username=username_data
    ).first()
    return user


def createUser(sa, user):
    sa.add(user)
