from django.test import TestCase
import random
import time
from django.db import IntegrityError
from network.models import *    


# Create your tests here.

############################################################################
# Script used to populate database with the data that appears in the video #
############################################################################

# Create users
for i in range(10):
    username = f'user-{i+1}'
    password = username
    user = User.objects.create_user(username, username, password)
    user.save()
    print(f'{user.username} created')
users = User.objects.all()

# Create posts
for i in range(1,51):
    index = random.randint(0,9)
    p = Post.objects.create(user=users[index], content=f'This is post #{i}')
    p.save()
    time.sleep(random.randint(0,9))
    print(f'Post #{i} created')
posts = Post.objects.all()

# Create likes
for post in posts:
    likes = random.randint(0, len(users)-1)
    if likes == 0:
        continue

    for like in range(likes):
        user_idx = random.randint(0, len(users)-1)
        post.likes.add(users[user_idx])
        print(f'User {users[user_idx]} likes post #{post.id}')
    post.save()

# Create followers
for user in users:
    num_followers = random.randint(1,9)
    for i in range(num_followers):
        following_idx = random.randint(0, len(users)-1)
        following = users[following_idx]
        if following.id == user.id:
            continue
        try:
            new_follow = Follow.objects.create(user=following, following=user)
            new_follow.save()
            print(f'{following.username} is following {user.username}')
        except IntegrityError:
            continue