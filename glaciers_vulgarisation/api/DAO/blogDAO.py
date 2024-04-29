# ----------------------------------------------------------
#                       blogDAO
# ----------------------------------------------------------


from ..metier.models import DbPost


def findAllPosts(sa) -> list[DbPost]:
    posts = sa.query(DbPost).order_by(DbPost.created.desc()).all()
    return posts


def createPost(sa, post):
    sa.add(post)


def deletePost(sa, post_id):
    sa.query(DbPost).filter_by(id=post_id).delete()


def findPostById(sa, post_id) -> DbPost:
    post = sa.query(DbPost).filter_by(id=post_id).first()
    if post == None:
        raise Exception('Post not found.', 404)
    return post
