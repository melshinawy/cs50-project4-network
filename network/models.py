from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

# Post table
class Post(models.Model):
    content = models.TextField() # Post content
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='posts') # Post owner
    timestamp = models.DateTimeField(auto_now_add=True) # Timestamp at which the post was created
    likes = models.ManyToManyField('User') # Users who like this post
    last_update = models.DateTimeField(null=True, blank=True) # Last time the post was updated (default is null)
    # Serialized post to be sent in a Json response
    def serialize(self):
        return {
            "id": self.id, # Post id
            "poster": self.user.username, # Post owner
            "poster_id": self.user.id, # Id of post owner
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M:%S %p"), # Timestamp at which the post was created
            "content": self.content, # Post content
            "likes": self.likes.count(), # Number of likes
            "likers": [user.id for user in self.likes.all()], # Users who like the post
            "last_update": None if self.last_update is None else self.last_update.strftime("%b %d %Y, %I:%M:%S %p") # Last time the post was updated
        }
# Table conataining which user follows which user
class Follow(models.Model):
    class Meta:
        unique_together = (('user', 'following'),) # Setting both entries as primary keys

    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='following') # Follower
    following = models.ForeignKey('User', on_delete=models.CASCADE, related_name='followers') # Following
