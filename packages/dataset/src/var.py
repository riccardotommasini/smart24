import os

DATA_DIR = '../data/'
DATA_RAW_DIR = os.path.join(DATA_DIR, '01_raw/')
DATA_INTERMEDIATE_DIR = os.path.join(DATA_DIR, '02_intermediate/')
DATA_PRIMARY_DIR = os.path.join(DATA_DIR, '03_primary/')

TWITTER_DATA_DIR = os.path.join(DATA_RAW_DIR, 'twitter')

USERS_DATA = os.path.join(DATA_INTERMEDIATE_DIR, 'users.pkl')
RELATED_USERS_DATA = os.path.join(DATA_INTERMEDIATE_DIR, 'related_users.pkl')
FOLLOWERS_DATA = os.path.join(DATA_INTERMEDIATE_DIR, 'followers.pkl')
POSTS_DATA = os.path.join(DATA_INTERMEDIATE_DIR, 'posts.pkl')

USERS_DATA_CSV = os.path.join(DATA_PRIMARY_DIR, 'users.csv')
POSTS_DATA_CSV = os.path.join(DATA_PRIMARY_DIR, 'posts.csv')