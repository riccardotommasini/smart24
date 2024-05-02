import os
from dotenv import load_dotenv
import pandas as pd
import numpy as np
from pymongo import MongoClient, collection
from bson import ObjectId

def parse_str_list(series: pd.Series) -> pd.Series:
    return series.str.strip('[]').str.split()

def parse_str_list_int(series: pd.Series) -> pd.Series:
    return parse_str_list(series).map(lambda x: [int(i) for i in x])

def convert_user_id_list_to_object_id(series: pd.Series, users: pd.DataFrame) -> ObjectId:
    return series.map(lambda x: [users.loc[users['user_id'] == i, '_id'].iloc[0] for i in x])

def random_dates(start, end, n=10):

    start_u = start.value//10**9
    end_u = end.value//10**9

    return pd.to_datetime(np.random.randint(start_u, end_u, size=n), unit='s')

def load_users(path: str):
    users = pd.read_csv(path)

    users['_id'] = [ObjectId() for _ in range(len(users))]
    users['follows'] = parse_str_list_int(users['follows'])
    users['trustedUsers'] = parse_str_list_int(users['trustedUsers'])
    users['untrustedUsers'] = parse_str_list_int(users['distrustedUsers'])
    users = users.drop(columns=['distrustedUsers'])

    users['surname'] = users['name'].str.split().str[-1]
    users['name'] = users['name'].str.split().str[0]

    users['mail'] = users['email']
    users = users.drop(columns=['email'])

    # Hash of password "12345"
    users['passwordHash'] = '$2a$08$JWZhg3SHv7rZl7Kq/F.mHuRT1KezoqzfKql4NqKor24v3xFeQJc9.'

    users['factChecker'] = False
    users['nbFactChecked'] = 0
    users['organization'] = None

    users['parameters'] = pd.Series([{'rateFactChecked': 0, 'rateDiversification': 0} for _ in range(len(users))])

    users['follows'] = convert_user_id_list_to_object_id(users['follows'], users)
    users['trustedUsers'] = convert_user_id_list_to_object_id(users['trustedUsers'], users)
    users['untrustedUsers'] = convert_user_id_list_to_object_id(users['untrustedUsers'], users)

    users['posts'] = [[] for _ in range(len(users))]

    return users

def load_posts(path: str, users: pd.DataFrame):
    posts = pd.read_csv(path)

    posts['_id'] = [ObjectId() for _ in range(len(posts))]
    posts['metrics'] = [ObjectId() for _ in range(len(posts))]

    posts['post_tags'] = parse_str_list(posts['post_tags'])
    posts['text'] = posts['post_tags'].str.join(' ')
    posts = posts.drop(columns=['post_tags'])

    posts['date'] = random_dates(pd.Timestamp('2020-01-01'), pd.Timestamp('2024-05-01'), len(posts))

    posts['createBy'] = posts['user_id'].map(lambda x: users.loc[users['user_id'] == x, '_id'].iloc[0])
    posts = posts.drop(columns=['user_id'])

    posts['likedBy'] = convert_user_id_list_to_object_id(parse_str_list_int(posts['likedBy']), users)
    posts['dislikedBy'] = convert_user_id_list_to_object_id(parse_str_list_int(posts['dislikedBy']), users)
    posts['trustedBy'] = convert_user_id_list_to_object_id(parse_str_list_int(posts['trustedBy']), users)
    posts['untrustedBy'] = convert_user_id_list_to_object_id(parse_str_list_int(posts['distrustedBy']), users)
    posts = posts.drop(columns=['distrustedBy'])

    metrics = posts[['metrics', 'likedBy', 'dislikedBy', 'trustedBy', 'untrustedBy']].copy()
    metrics = metrics.rename(columns={'metrics': '_id'})
    metrics['nbLikes'] = metrics['likedBy'].str.len()
    metrics['nbDislikes'] = metrics['dislikedBy'].str.len()
    metrics['nbTrusts'] = metrics['trustedBy'].str.len()
    metrics['nbUntrusts'] = metrics['untrustedBy'].str.len()
    metrics['nbComments'] = 0
    metrics['nbFactChecks'] = 0
    metrics['sharedBy'] = [[] for _ in range(len(metrics))]
    metrics['factChecks'] = [[] for _ in range(len(metrics))]

    posts = posts.drop(columns=['likedBy', 'dislikedBy', 'trustedBy', 'untrustedBy'])

    return posts, metrics

def populate_users_db(users: pd.DataFrame, collection: collection.Collection):
    print(users.iloc[0])
    pass

if __name__ == "__main__":
    print("🚀 Starting database populate...")

    np.random.seed(69)
    load_dotenv()

    print("📚 Loading data...")

    users = load_users(path=os.getenv('USERS_DATA'))
    posts, metrics = load_posts(path=os.getenv('POSTS_DATA'), users=users)

    users['posts'] = users['_id'].map(lambda _id: posts.loc[posts['createBy'] == _id, '_id'].tolist())


    client = MongoClient(os.getenv('MONGO_URI'))
    db = client['smart']

    print("🗑️ Dropping collections...")

    db.drop_collection('users')
    db.drop_collection('posts')
    db.drop_collection('metrics')

    print("📦 Populating database...")

    db['users'].insert_many(users.to_dict(orient='records'))
    print(f"\t👥 {len(users)} users added")

    db['posts'].insert_many(posts.to_dict(orient='records'))
    print(f"\t📰 {len(posts)} posts added")

    db['metrics'].insert_many(metrics.to_dict(orient='records'))
    print(f"\t📊 {len(metrics)} metrics added")

    print("🎉 Database populated!")