from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField('self', blank=True, null=True, related_name='followers')

class Post(models.Model):
    post = models.TextField()
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='posts')
    timestamp = models.DateTimeField(auto_now_add=True)
    Likes = models.ManyToManyField('User')