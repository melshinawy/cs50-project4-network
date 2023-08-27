
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("users/<str:username>", views.profile, name="profile"),
    path("get_posts/<str:users_posts>", views.get_posts, name="get_posts"),
    path("edit_post", views.edit_post, name="edit_post"),
    path("edit_follow", views.edit_follow, name="edit_follow"),
    path("edit_like", views.edit_like, name="edit_like"),
    path("following", views.following, name="following")
]
