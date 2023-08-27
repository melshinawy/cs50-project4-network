from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Post(models.Model):
    content = models.TextField()
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='posts')
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField('User')
    last_update = models.DateTimeField(null=True, blank=True)

    def serialize(self):
        return {
            "id": self.id,
            "poster": self.user.username,
            "poster_id": self.user.id,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "content": self.content,
            "likes": self.likes.count(),
            "likers": self.likes.all(),
            "last_update": None if self.last_update is None else self.last_update.strftime("%b %d %Y, %I:%M %p")
        }

class Follow(models.Model):
    class Meta:
        unique_together = (('user', 'following'),)

    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey('User', on_delete=models.CASCADE, related_name='followers')
