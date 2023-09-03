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

# View for 'all posts'
def index(request):
    # If request method is GET
    if request.method == 'GET':
        posts = Post.objects.all().order_by("-timestamp") # Get all posts ordered by timestamp descending (new to old)
        paginated_posts = normalize_posts(request, posts) # Serialize and paginate posts
        # Render index.html with normalized posts
        return render(request, "network/index.html", {
            'posts': paginated_posts
        })
    # If request method is POST then user created a new post    
    elif request.method == 'POST':
        new_post = Post(content=request.POST['new-post'], user=User.objects.get(pk=request.user.id)) # Create new post
        new_post.save() # save post
        return HttpResponseRedirect(reverse('index')) # Redirect to index
    # Otherwise return an error
    else: 
        return render(request, "network/error.html", {
            'message': 'Invalid request type.'
        })
# Function used to serialize and paginate posts
def normalize_posts(request, posts):
    # Serialize posts
    serialized_posts = [post.serialize() for post in posts]
    # Paginate posts
    p = Paginator(serialized_posts, 10)
    page = request.GET.get('page')
    paginated_posts = p.get_page(page)
    # Return normalized posts
    return paginated_posts 

# View for 'following'
@login_required
def following(request):
    # URL accepts only GET method. Otherwise return an error
    if request.method != 'GET':
        return render(request, "network/error.html", {
            'message': 'Invalid request type.'
        })
    
    logged_user = User.objects.get(pk=request.user.id) # Get logged user
    users_followed = logged_user.following.all().values_list('following', flat=True) # Get a list of users_followed
    posts = Post.objects.all().filter(user__in=users_followed).order_by("-timestamp") # Get posts having users followed as posters
    paginated_posts = normalize_posts(request, posts) # Normalize posts
    # Render following.html with normalized posts
    return render(request,"network/following.html", {
        'posts': paginated_posts
    })

# Edit posts
@login_required
def edit_post(request):
    # URL accepts only PUT method. Otherwise return an error
    if request.method != 'PUT':
        return JsonResponse({"error": "PUT request required."}, status=400)
    # Create post to be edited
    data = json.loads(request.body)
    post = Post.objects.get(pk=data['postId'])
    # Check if the user attempting to edit the post is the one who owns it. Otherwise return an error
    if post.user.id != request.user.id:
        return JsonResponse({"error": "Permission denied. User not authorized to edit this post"})
    # Edit post in database
    post.content = data['postContent'] # Update post content
    post.last_update = timezone.now() # Update the 'last updated' field
    post.save() # Save post

    serialized_post = post.serialize() # Serialize post
    # Return a Json response with the new post state
    return JsonResponse(serialized_post, safe=False)

# Function used to edit user follow status
@login_required
def edit_follow(request):
    # URL accepts only PUT method. Otherwise return an error
    if request.method != 'PUT':
        return JsonResponse({"error": "PUT request required."}, status=400)

    data = json.loads(request.body) # Load data
    user = User.objects.get(pk=request.user.id) # Get logged user object
    # Get followed user object
    try:
        following = User.objects.get(pk=data['followed'])
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."})
    # Check update type
    if data['following']:
        # Create a new follow entry and update response message if a follow is requested
        new_follow = Follow.objects.create(user=user, following=following)
        new_follow.save()
        message = "user followed."
    else:
        # Delete follow entry and update response message if an unfollow is requested
        Follow.objects.all().filter(user=user, following=following).delete()
        message = "user unfollowed"
    # Retun a Json response with OK status
    return JsonResponse({"message": message}, status=201)

# Function used to edit likes
@login_required
def edit_like(request):
    # URL accepts only PUT method. Otherwise return an error
    if request.method != 'PUT':
        return JsonResponse({"error": "PUT request required."}, status=400)
    
    data = json.loads(request.body) # Load data
    user = User.objects.get(pk=request.user.id) # Get user object for logged user
    # Get post object
    try:
        post = Post.objects.get(pk=data['postId'])
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=400)
    # Update likes based on requested modification
    if data['modification'] == 'like':
        post.likes.add(user)
    elif data['modification'] == 'unlike':
        post.likes.remove(user)
    else:
        # Return an error if wrong update type is requested
        return JsonResponse({"error": "Invalid modification method."}, status=400)
    
    post.save() # Save post
    # Return a Json response with serialized post
    return JsonResponse(post.serialize(), safe=False)


def profile(request, username):
    # URL accepts only PUT method. Otherwise return an error
    if request.method != 'GET':
        return render(request, "network/error.html", {
            'message': 'Invalid request type.'
        })
    profile = User.objects.get(username=username) # Create user object for requested profile
    profile_followers = profile.followers.all().values_list('user', flat=True) # Get profile followers to check if the logged user is following requested profile
    posts = Post.objects.all().filter(user=profile).order_by("-timestamp") # Get posts by user
    paginated_posts = normalize_posts(request, posts) # Normalize posts
    
    # Render profile page
    return render(request, "network/profile.html", {
        'username': profile.username, # requested profile username
        'profile_id': profile.id, # profile id
        'num_followers': profile.followers.all().count(), # number of followers
        'num_following': profile.following.all().count(), # number of users followed
        'following': request.user.id in list(profile_followers), # check if logged user is following the requested profile
        'posts': paginated_posts
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
