import os
from dotenv import load_dotenv
import pandas as pd
import numpy as np
from pymongo import MongoClient
from bson import ObjectId
from faker import Faker
from unidecode import unidecode
from typing import Literal

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

    posts['createdBy'] = posts['user_id'].map(lambda x: users.loc[users['user_id'] == x, '_id'].iloc[0])
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

def rate_post(metrics: pd.DataFrame, user_ids: list[str], metrics_id: str, rating: list[Literal['like', 'dislike', 'trust', 'untrust']]) -> pd.DataFrame:
    nb_ratings_cols = map(lambda x: f'nb{x.capitalize()}s', rating)
    ratings_by_cols = map(lambda x: f'{x}{'' if x.endswith('e') else 'e'}dBy', rating)

    for nb_col, by_col in zip(nb_ratings_cols, ratings_by_cols):
        for user_id in user_ids:
            if user_id not in metrics.loc[metrics['_id'] == metrics_id, by_col].iloc[0]:
                metrics.loc[metrics['_id'] == metrics_id, nb_col] += 1
                metrics.loc[metrics['_id'] == metrics_id, by_col] = metrics.loc[metrics['_id'] == metrics_id, by_col].apply(lambda x: x + [user_id])

    return metrics

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
        metrics = rate_post(metrics, new_users['_id'].tolist(), post['metrics'], ['like', 'trust'])

    for i, user in new_users.iterrows():
        user_posts_to_like = posts.sample(n=n_unique_likes, random_state=69)

        for j, post in user_posts_to_like.iterrows():
            metrics = rate_post(metrics, [user['_id']], post['metrics'], ['like', 'trust'])
            
    users = pd.concat([users, new_users], ignore_index=True)

    return users, posts, metrics

def load_fact_checks(users: pd.DataFrame, fact_checkers_path: str, fact_checked_posts_path: str, fact_check_messages: list[tuple[str, int]]) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    fact_checkers = pd.read_csv(fact_checkers_path)
    fact_checked_posts = pd.read_csv(fact_checked_posts_path)
    fact_check_messages = {grade: pd.read_csv(path) for grade, path in fact_check_messages}

    fact_checkers['_id'] = [ObjectId() for _ in range(len(fact_checkers))]
    fact_checkers['username'] = fact_checkers['name'].str.lower().apply(unidecode).str.replace('-', '') + np.random.randint(0, 1000, len(fact_checkers)).astype(str) + '_factchecker'
    fact_checkers['mail'] = fact_checkers['username'] + '@' + np.random.choice(['gmail.com', 'hotmail.com', 'yahoo.com'], len(fact_checkers))
    fact_checkers['passwordHash'] = '$2a$08$JWZhg3SHv7rZl7Kq/F.mHuRT1KezoqzfKql4NqKor24v3xFeQJc9.'
    fact_checkers['factChecker'] = True
    fact_checkers['nbFactChecked'] = 0
    fact_checkers['parameters'] = pd.Series([{'rateFactChecked': 0, 'rateDiversification': 0} for _ in range(len(fact_checkers))])
    fact_checkers['birthday'] = random_dates(pd.Timestamp('1950-01-01'), pd.Timestamp('2005-01-01'), len(fact_checkers))
    fact_checkers['follows'] = [[] for _ in range(len(fact_checkers))]
    fact_checkers['trustedUsers'] = [[] for _ in range(len(fact_checkers))]
    fact_checkers['untrustedUsers'] = [[] for _ in range(len(fact_checkers))]

    fact_checked_posts['_id'] = [ObjectId() for _ in range(len(fact_checked_posts))]
    fact_checked_posts['createdBy'] = users.sample(n=len(fact_checked_posts), random_state=69)['_id'].tolist()
    fact_checked_posts['date'] = random_dates(pd.Timestamp('2020-01-01'), pd.Timestamp('2024-05-01'), len(fact_checked_posts))
    fact_checked_posts['metrics'] = [ObjectId() for _ in range(len(fact_checked_posts))]
    fact_checked_posts = fact_checked_posts.rename(columns={'post': 'text'})

    fact_checked_metrics = fact_checked_posts[['metrics']].copy()
    fact_checked_metrics['nbLikes'] = 0
    fact_checked_metrics['nbDislikes'] = 0
    fact_checked_metrics['nbTrusts'] = 0
    fact_checked_metrics['nbUntrusts'] = 0
    fact_checked_metrics['nbComments'] = 0
    fact_checked_metrics['nbFactChecks'] = 0
    fact_checked_metrics['sharedBy'] = [[] for _ in range(len(fact_checked_metrics))]
    fact_checked_metrics['factChecks'] = [[] for _ in range(len(fact_checked_metrics))]
    fact_checked_metrics['likedBy'] = [[] for _ in range(len(fact_checked_metrics))]
    fact_checked_metrics['dislikedBy'] = [[] for _ in range(len(fact_checked_metrics))]
    fact_checked_metrics['trustedBy'] = [[] for _ in range(len(fact_checked_metrics))]
    fact_checked_metrics['untrustedBy'] = [[] for _ in range(len(fact_checked_metrics))]
    fact_checked_metrics = fact_checked_metrics.rename(columns={'metrics': '_id'})

    fact_checks = fact_checked_posts[['_id']].copy()
    fact_checks['grade'] = np.random.choice([0, 1, 2], len(fact_checks))
    fact_checks['comment'] = fact_checks['grade'].map(lambda x: fact_check_messages[x].sample(n=1, random_state=69)['message'].iloc[0])
    fact_checks['date'] = random_dates(pd.Timestamp('2020-01-01'), pd.Timestamp('2024-05-01'), len(fact_checks))
    fact_checks['emittedBy'] = np.random.choice(fact_checkers['_id'], len(fact_checks))
    fact_checks = fact_checks.rename(columns={'_id': 'postId'})
    fact_checks['_id'] = [ObjectId() for _ in range(len(fact_checks))]

    posts_with_two_fact_checks_fact_checks = fact_checks.sample(frac=0.5, random_state=69)
    posts_with_two_fact_checks_fact_checks['_id'] = [ObjectId() for _ in range(len(posts_with_two_fact_checks_fact_checks))]
    posts_with_two_fact_checks_fact_checks['new_grade'] = np.random.choice([0, 1, 2], len(posts_with_two_fact_checks_fact_checks))
    posts_with_two_fact_checks_fact_checks.loc[posts_with_two_fact_checks_fact_checks['new_grade'] == posts_with_two_fact_checks_fact_checks['grade'], 'new_grade'] = (posts_with_two_fact_checks_fact_checks['new_grade'] + 1) % 3
    posts_with_two_fact_checks_fact_checks['grade'] = posts_with_two_fact_checks_fact_checks['new_grade']
    posts_with_two_fact_checks_fact_checks = posts_with_two_fact_checks_fact_checks.drop(columns=['new_grade'])
    posts_with_two_fact_checks_fact_checks['comment'] = posts_with_two_fact_checks_fact_checks['grade'].map(lambda x: fact_check_messages[x].sample(n=1, random_state=69)['message'].iloc[0])
    posts_with_two_fact_checks_fact_checks['date'] = random_dates(pd.Timestamp('2020-01-01'), pd.Timestamp('2024-05-01'), len(posts_with_two_fact_checks_fact_checks))
    posts_with_two_fact_checks_fact_checks['emittedBy'] = np.random.choice(fact_checkers['_id'], len(posts_with_two_fact_checks_fact_checks))

    posts_with_three_fact_checks_fact_checks = posts_with_two_fact_checks_fact_checks.sample(frac=0.5, random_state=69)
    posts_with_three_fact_checks_fact_checks['_id'] = [ObjectId() for _ in range(len(posts_with_three_fact_checks_fact_checks))]
    posts_with_three_fact_checks_fact_checks['grade'] = np.random.choice([0, 1, 2], len(posts_with_three_fact_checks_fact_checks))
    posts_with_three_fact_checks_fact_checks['comment'] = posts_with_three_fact_checks_fact_checks['grade'].map(lambda x: fact_check_messages[x].sample(n=1, random_state=69)['message'].iloc[0])
    posts_with_three_fact_checks_fact_checks['date'] = random_dates(pd.Timestamp('2020-01-01'), pd.Timestamp('2024-05-01'), len(posts_with_three_fact_checks_fact_checks))
    posts_with_three_fact_checks_fact_checks['emittedBy'] = np.random.choice(fact_checkers['_id'], len(posts_with_three_fact_checks_fact_checks))

    fact_checks = pd.concat([fact_checks, posts_with_two_fact_checks_fact_checks], ignore_index=True)
    fact_checks = pd.concat([fact_checks, posts_with_three_fact_checks_fact_checks], ignore_index=True)

    fact_checked_metrics['factChecks'] = fact_checked_posts['_id'].map(lambda x: fact_checks.loc[fact_checks['postId'] == x, '_id'].tolist())
    fact_checked_metrics['nbFactChecks'] = fact_checked_metrics['factChecks'].map(len)
    
    return fact_checkers, fact_checked_posts, fact_checked_metrics, fact_checks

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

    fact_checkers, fact_checked_posts, fact_checked_metrics, fact_checks = load_fact_checks(
        users=users,
        fact_checkers_path=os.getenv('FACT_CHECKER_PATH'),
        fact_checked_posts_path=os.getenv('FACT_CHECKED_POSTS_PATH'),
        fact_check_messages=[
            (0, os.getenv('FACT_CHECK_MESSAGES_GRADE_0_PATH')),
            (1, os.getenv('FACT_CHECK_MESSAGES_GRADE_1_PATH')),
            (2, os.getenv('FACT_CHECK_MESSAGES_GRADE_2_PATH')),
        ],
    )

    users = pd.concat([users, fact_checkers], ignore_index=True)
    posts = pd.concat([posts, fact_checked_posts], ignore_index=True)
    metrics = pd.concat([metrics, fact_checked_metrics], ignore_index=True)

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

    print("🔄 Converting data...")
    posts_likes, posts_dislikes, posts_trusts, posts_untrusts = convert_to_pivot_tables(users, posts, metrics)

    users['posts'] = users['_id'].map(lambda _id: posts.loc[posts['createdBy'] == _id, '_id'].tolist())

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
    db.drop_collection('algo-suggestions')
    db.drop_collection('algo-confidences')
    db.drop_collection('algo-similars')
    db.drop_collection('fact-checks')

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

    db['fact-checks'].insert_many(fact_checks.to_dict(orient='records'))
    print(f"\t🔍 {len(fact_checks)} fact checks added")

    print("🎉 Database populated!")