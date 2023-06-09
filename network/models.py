from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField('self', blank=True, null=True)

class Post(models.Model):
    content = models.TextField()
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='posts')
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField('User')

    def serialize(self):
        return {
            "id": self.id,
            "poster": self.user.username,
            "poster_id": self.user.id,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "content": self.content,
            "likes": self.likes.count()
        }