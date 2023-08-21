from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from .models import User, Post, Following

from .models import User


def index(request):
    if request.method == 'GET':
        return render(request, "network/index.html")
    elif request.method == 'POST':
        new_post = Post(content=request.POST['new-post'], user=User.objects.get(pk=request.user.id))
        new_post.save()
        return HttpResponseRedirect(reverse('index'))

def following(request):
    if request.method == 'GET':
        return render(request,"network/following.html")
    else:
        return render(request, "network/error.html", {
            'message': 'Invalid request type.'
        })

def get_posts(request, users_posts):
    if request.method == 'GET':
        if users_posts == 'all':
            posts = Post.objects.all()
        elif users_posts == 'following':
            logged_user = User.objects.get(pk=request.user.id)
            users_followed = logged_user.following.all().values_list('following', flat=True)
            posts = Post.objects.all().filter(user__in=users_followed)
        elif users_posts[:4] == 'user':
            requested_user = User.objects.get(pk=int(users_posts[5:]))
            posts = Post.objects.all().filter(user=requested_user)
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

    # Create user object for requested profile
    profile = User.objects.get(username=username)
    # Get profile followers to check if the logged user is following requested profile
    profile_followers = profile.followers.all().values_list('user', flat=True)
    
    # Render profile page
    return render(request, "network/profile.html", {
        'username': profile.username, # requested profile username
        'profile_id': profile.id, # profile id
        'num_followers': profile.followers.all().count(), # number of followers
        'num_following': profile.following.all().count(), # number of users followed
        'following': request.user.id in list(profile_followers) # check if logged user is following the requested profile
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
