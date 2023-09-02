import json
from django.utils import timezone
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from .models import User, Post, Follow

from .models import User


def index(request):
    if request.method == 'GET':
        posts = Post.objects.all()
        serialized_posts = [post.serialize() for post in posts]

        p = Paginator(serialized_posts, 2)
        page = request.GET.get('page')
        paginated_posts = p.get_page(page)

        return render(request, "network/index.html", {
            'posts': paginated_posts
        })
        
    elif request.method == 'POST':
        new_post = Post(content=request.POST['new-post'], user=User.objects.get(pk=request.user.id))
        new_post.save()
        return HttpResponseRedirect(reverse('index'))
    else:
        return render(request, "network/error.html", {
            'message': 'Invalid request type.'
        })

@login_required
def following(request):
    if request.method != 'GET':
        return render(request, "network/error.html", {
            'message': 'Invalid request type.'
        })
    
    logged_user = User.objects.get(pk=request.user.id)
    users_followed = logged_user.following.all().values_list('following', flat=True)
    posts = Post.objects.all().filter(user__in=users_followed)

    serialized_posts = [post.serialize() for post in posts]

    return render(request,"network/following.html", {
        'posts': serialized_posts
    })

@login_required
def edit_post(request):
    if request.method != 'PUT':
        return JsonResponse({"error": "PUT request required."}, status=400)

    data = json.loads(request.body)
    post = Post.objects.get(pk=data['postId'])

    if post.user.id != request.user.id:
        return JsonResponse({"error": "Permission denied. User not authorized to edit this post"})
    
    post.content = data['postContent']
    post.last_update = timezone.now()
    post.save()

    serialized_post = post.serialize()
    serialized_post['logged_user'] = request.user.username

    return JsonResponse(serialized_post, safe=False)

@login_required
def edit_follow(request):
    if request.method != 'PUT':
        return JsonResponse({"error": "PUT request required."}, status=400)

    data = json.loads(request.body)
    user = User.objects.get(pk=request.user.id)
    
    try:
        following = User.objects.get(pk=data['followed'])
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."})

    if data['following']:
        new_follow = Follow.objects.create(user=user, following=following)
        new_follow.save()
        return JsonResponse({"message": "user followed."}, status=201)
    else:
        Follow.objects.all().filter(user=user, following=following).delete()
        return JsonResponse({"message": "user unfollowed"}, status=201)

    return JsonResponse({"message": "Follow status successfully updated."}, status=201)

@login_required
def edit_like(request):
    if request.method != 'PUT':
        return JsonResponse({"error": "PUT request required."}, status=400)
    
    data = json.loads(request.body)
    user = User.objects.get(pk=request.user.id)

    try:
        post = Post.objects.get(pk=data['postId'])
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=400)
    
    if data['modification'] == 'like':
        post.likes.add(user)
    elif data['modification'] == 'unlike':
        post.likes.remove(user)
    else:
        return JsonResponse({"error": "Invalid modification method."}, status=400)
    
    post.save()
    return JsonResponse(post.serialize(), safe=False)


def profile(request, username):

    if request.method != 'GET':
        pass
    # Create user object for requested profile
    profile = User.objects.get(username=username)
    # Get profile followers to check if the logged user is following requested profile
    profile_followers = profile.followers.all().values_list('user', flat=True)

    posts = Post.objects.all().filter(user=profile)
    serialized_posts = [post.serialize() for post in posts]
    
    # Render profile page
    return render(request, "network/profile.html", {
        'username': profile.username, # requested profile username
        'profile_id': profile.id, # profile id
        'num_followers': profile.followers.all().count(), # number of followers
        'num_following': profile.following.all().count(), # number of users followed
        'following': request.user.id in list(profile_followers), # check if logged user is following the requested profile
        'posts': serialized_posts
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
