from django.contrib import admin
from .models import User, Post, Follow

class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username')

class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'content', 'user')

class FollowAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'following')

admin.site.register(User, UserAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Follow, FollowAdmin)