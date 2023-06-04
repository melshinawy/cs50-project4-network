from django.contrib import admin
from .models import User, Post

class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username')

class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'content', 'user')

admin.site.register(User, UserAdmin)
admin.site.register(Post, PostAdmin)