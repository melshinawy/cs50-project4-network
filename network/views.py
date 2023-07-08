from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from .models import User, Post

from .models import User


def index(request):
    if request.method == 'GET':
        return render(request, "network/index.html", {
            'posts': Post.objects.all()
        })
    elif request.method == 'POST':
        new_post = Post(content=request.POST['new-post'], user=User.objects.get(pk=request.user.id))
        new_post.save()
        return HttpResponseRedirect(reverse('index'))

def get_posts(request, users_posts):
    if request.method == 'GET':
        if users_posts == 'all':
            posts = Post.objects.all()
        elif users_posts == 'following':
            logged_user = User.objects.get(pk=request.user.id)
            posts = Posts.objects.all().filter(poster__in=logged_user.following.all())
        else:
            return render(request, "network/error.html", {
                'message': 'Invalid posts requested.'
            })
        
        posts = posts.order_by("-timestamp").all()
        serialized_posts = [post.serialize() for post in posts]

        for post in serialized_posts:
            post['logged_user'] = request.user.username

        return JsonResponse(serialized_posts, safe=False)
    else:
        return render(request, "network/error.html", {
            'message': 'Invalid request type.'
        })

def profile(request, username):
    user_profile = User.objects.get(username=username)
    return render(request, "network/profile.html", {
        'username': user_profile.username,
        'profile_id': user_profile.id,
        # 'following': request.user.id in user_profile.following,
        'num_followers': User.objects.filter(following=user_profile).count(),
        'num_following': user_profile.following.count(),
        'posts': Post.objects.filter(user=user_profile)
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
