import os
from dotenv import load_dotenv
import pandas as pd
import numpy as np
from pymongo import MongoClient, collection
from bson import ObjectId
from faker import Faker
from unidecode import unidecode

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

def create_new_users(users: pd.DataFrame, posts: pd.DataFrame, metrics: pd.DataFrame, n: int, n_shared_likes: int, n_unique_likes: int, faker: Faker):
    new_users = pd.DataFrame(columns=users.columns)

    new_users['_id'] = [ObjectId() for _ in range(n)]

    new_users['user_id'] = -1
    new_users['credibility'] = -1
    new_users['integrity'] = -1

    new_users['name'] = [faker.name() for i in range(len(users), len(users) + n)]
    new_users['surname'] = new_users['name'].str.split().str[-1]
    new_users['name'] = new_users['name'].str.split().str[0] + ' (Fake)'
    new_users['username'] = new_users['name'].str.lower().apply(unidecode).str.replace('-', '') + np.random.randint(0, 1000, n).astype(str) + '_fake'
    new_users['mail'] = new_users['username'] + '@' + np.random.choice(['gmail.com', 'hotmail.com', 'yahoo.com'], n)

    new_users['birthday'] = random_dates(pd.Timestamp('1950-01-01'), pd.Timestamp('2005-01-01'), n)
    new_users['passwordHash'] = '$2a$08$JWZhg3SHv7rZl7Kq/F.mHuRT1KezoqzfKql4NqKor24v3xFeQJc9.'
    new_users['factChecker'] = False
    new_users['nbFactChecked'] = 0
    new_users['organization'] = None
    new_users['parameters'] = pd.Series([{'rateFactChecked': 0, 'rateDiversification': 0} for _ in range(n)])

    new_users['totalPosts'] = 0
    new_users['posts'] = [[] for _ in range(n)]
    new_users['follows'] = [[] for _ in range(n)]
    new_users['trustedUsers'] = [[] for _ in range(n)]
    new_users['untrustedUsers'] = [[] for _ in range(n)]

    posts_to_like = posts.sample(n=n_shared_likes, random_state=69)

    for i, post in posts_to_like.iterrows():
        metrics.loc[metrics['_id'] == post['metrics'], 'nbLikes'] += n
        metrics.loc[metrics['_id'] == post['metrics'], 'nbTrusts'] += n
        metrics.loc[metrics['_id'] == post['metrics'], 'likedBy'] = metrics.loc[metrics['_id'] == post['metrics'], 'likedBy'].apply(lambda x: x + [new_users['_id'].iloc[0]])
        metrics.loc[metrics['_id'] == post['metrics'], 'trustedBy'] = metrics.loc[metrics['_id'] == post['metrics'], 'trustedBy'].apply(lambda x: x + [new_users['_id'].iloc[0]])
    
    for i, user in new_users.iterrows():
        user_posts_to_like = posts.sample(n=n_unique_likes, random_state=69)

        for j, post in user_posts_to_like.iterrows():
            metrics.loc[metrics['_id'] == post['metrics'], 'nbLikes'] += 1
            metrics.loc[metrics['_id'] == post['metrics'], 'nbTrusts'] += 1
            metrics.loc[metrics['_id'] == post['metrics'], 'likedBy'] = metrics.loc[metrics['_id'] == post['metrics'], 'likedBy'].apply(lambda x: x + [user['_id']])
            metrics.loc[metrics['_id'] == post['metrics'], 'trustedBy'] = metrics.loc[metrics['_id'] == post['metrics'], 'trustedBy'].apply(lambda x: x + [user['_id']])

    users = pd.concat([users, new_users], ignore_index=True)

    return users, posts, metrics

def convert_to_pivot_tables(users: pd.DataFrame, posts: pd.DataFrame, metrics: pd.DataFrame):
    posts_metrics = pd.merge(
        left=posts,
        right=metrics,
        left_on='metrics',
        right_on='_id',
        how='inner',
    )[['_id_x', 'likedBy', 'dislikedBy', 'trustedBy', 'untrustedBy']].rename(columns={'_id_x': 'item'})

    posts_likes = posts_metrics[['item', 'likedBy']].explode('likedBy').rename(columns={'likedBy': 'user'}).dropna()
    posts_dislikes = posts_metrics[['item', 'dislikedBy']].explode('dislikedBy').rename(columns={'dislikedBy': 'user'}).dropna()
    posts_trusts = posts_metrics[['item', 'trustedBy']].explode('trustedBy').rename(columns={'trustedBy': 'user'}).dropna()
    posts_untrusts = posts_metrics[['item', 'untrustedBy']].explode('untrustedBy').rename(columns={'untrustedBy': 'user'}).dropna()

    return posts_likes, posts_dislikes, posts_trusts, posts_untrusts

if __name__ == "__main__":
    print("🚀 Starting database populate...")

    np.random.seed(69)
    Faker.seed(69)
    fake = Faker(locale=['fr-FR', 'fr-CA'])

    load_dotenv()

    print("📚 Loading data...")

    users = load_users(path=os.getenv('USERS_DATA'))
    posts, metrics = load_posts(path=os.getenv('POSTS_DATA'), users=users)

    print("🔄 Converting data...")
    posts_likes, posts_dislikes, posts_trusts, posts_untrusts = convert_to_pivot_tables(users, posts, metrics)

    print("🔨 Creating fake users...")
    users, posts, metrics = create_new_users(
        users,
        posts,
        metrics,
        n=5,
        n_shared_likes=8,
        n_unique_likes=2,
        faker=fake,
    )
    users['posts'] = users['_id'].map(lambda _id: posts.loc[posts['createBy'] == _id, '_id'].tolist())

    client = MongoClient(os.getenv('MONGO_URI'))
    db = client['smart']

    print("🗑️ Dropping collections...")

    db.drop_collection('users')
    db.drop_collection('posts')
    db.drop_collection('metrics')
    db.drop_collection('ratings-likes')
    db.drop_collection('ratings-dislikes')
    db.drop_collection('ratings-trust')
    db.drop_collection('ratings-untrust')

    print("📦 Populating database...")

    db['users'].insert_many(users.to_dict(orient='records'))
    print(f"\t👥 {len(users)} users added")

    db['posts'].insert_many(posts.to_dict(orient='records'))
    print(f"\t📰 {len(posts)} posts added")

    db['metrics'].insert_many(metrics.to_dict(orient='records'))
    print(f"\t📊 {len(metrics)} metrics added")

    db['ratings-likes'].insert_many(posts_likes.to_dict(orient='records'))
    print(f"\t👍 {len(posts_likes)} likes added")

    db['ratings-dislikes'].insert_many(posts_dislikes.to_dict(orient='records'))
    print(f"\t👎 {len(posts_dislikes)} dislikes added")

    db['ratings-trust'].insert_many(posts_trusts.to_dict(orient='records'))
    print(f"\t👍 {len(posts_trusts)} trusts added")

    db['ratings-untrust'].insert_many(posts_untrusts.to_dict(orient='records'))
    print(f"\t👎 {len(posts_untrusts)} untrusts added")

    print("🎉 Database populated!")