document.addEventListener('DOMContentLoaded', function() {

    const divPosts = document.querySelector('#posts')

    fetch(`/get_posts/${divPosts.dataset.type}`)
    .then(response => response.json())
    .then(posts => {
        posts.forEach(post => createPost(post));
    })

    function createPost(post) {
        let divCard = document.createElement('div');
        let divCardHeader = document.createElement('div');
        let divCardBody = document.createElement('div');
        
        divCard.className = "card";
        divCardHeader.className = "card-header";
        divCardBody.className = "card-body";
        divCardBody.id = `div-${post.id}`;     

        divCardHeader.innerHTML = `<a href="/users/${post.poster}">${post.poster}</a>`
        let blockQuote = createBlockQuote(post);
        divCardBody.appendChild(blockQuote); 

        divCard.appendChild(divCardHeader);
        divCard.appendChild(divCardBody);
        divPosts.appendChild(divCard);
    }

    function editPost(postId, postContent) {
        const blockQuote = document.querySelector(`#post-${postId}`);
        const divCardBody = document.querySelector(`#div-${postId}`);
        const editForm = document.createElement('div');

        editForm.className="card";
        editForm.innerHTML = 
        `
            <form id="edit-post-form">
                <div class="form-group">
                    <textarea class="form-control mb-3" id="new-post-content">${postContent}</textarea>
                    <button class="btn btn-primary" type = "reset" id="post">Post</button>
                    <button class="btn btn-primary" type="reset" id="cancel">Cancel</button>
                </div>
            </form>
        `
        blockQuote.style.display = 'none';
        divCardBody.appendChild(editForm);

        const postBtn = document.querySelector('#post');
        const cancelBtn = document.querySelector('#cancel');

        cancelBtn.onclick = function() {
            editForm.remove();
            blockQuote.style.display = 'block';    
        }

        postBtn.onclick = function () {
            fetch('/edit_post', {
                method: 'PUT',
                headers: {'X-CSRFToken': document.querySelector('#posts').dataset.csrftoken},
                body: JSON.stringify({
                    postId: postId,
                    postContent: document.querySelector('#new-post-content').value
                })
            })
            .then(response => response.json())
            .then(post => {
                if (post){              
                    editForm.remove();
                    reloadPost(post);
            }

            })
        }
    }

    function reloadPost(post) {
        
        const divCardBody = document.querySelector(`#div-${post.id}`);
        const blockQuote = document.querySelector(`#post-${post.id}`);
        blockQuote.remove();
        const newBlockQuote = createBlockQuote(post);              
        divCardBody.appendChild(newBlockQuote);
    }
    
    function updateLikes(postId, modification) {   
        fetch('/edit_like', {
            method: 'PUT',
            headers: {'X-CSRFToken': document.querySelector('#posts').dataset.csrftoken},
            body: JSON.stringify({
                postId: postId,
                modification: modification
            })
        })
        .then(response => response.json())
        .then(post => {
            reloadPost(post);
        })
    }
    
    function createBlockQuote(post) {
        const blockQuote = document.createElement('blockquote');

        blockQuote.className= "blockquote mb-0" 
        blockQuote.id=`post-${post.id}`

        const p = document.createElement('p');
        p.className = "post-text";
        p.innerHTML = post.content;

        if (post.poster === post.logged_user) {
            const editLink = createEditLink(post);
            p.appendChild(editLink)
        }

        const heart = createLikeHeart(post);

        const likes = document.createElement('h6');
        likes.style.display = "inline";
        likes.className = "likes-count";
        likes.innerHTML = post.likes;
        likes.style.marginLeft = "5px";

        const footer = document.createElement('footer');
        footer.className = "footer";
        footer.innerHTML = `Posted on: ${post.timestamp} ${post.last_update ? ` - Last updated: ${post.last_update}` : ''}`;

        blockQuote.appendChild(p);
        blockQuote.appendChild(heart);
        blockQuote.appendChild(likes);
        blockQuote.appendChild(footer);

        return blockQuote;
    }

    function createEditLink(post){
        const span = document.createElement('span');
            span.className = "float-right";

            const a = document.createElement('a');
            a.className = "edit";
            a.addEventListener('click', () => editPost(post.id, post.content));
            a.innerHTML = "Edit";
            a.style.color = "blue";
            a.onmouseover = function() {
                this.style.textDecoration = 'underline';
                this.style.cursor = 'pointer';
            }
            a.onmouseout = function () {
                this.style.textDecoration = 'none';
            }

            span.appendChild(a);
            return span;        
    }

    function createLikeHeart(post){
        const heart = document.createElement("i");
        heart.style.color = 'red';
        if (post.liked) {
            heart.className = "bi bi-heart-fill h6";
            heart.onmouseover = function () {
                this.className = 'bi bi-heart h6';
                this.style.cursor = 'pointer';
            }

            heart.onmouseout = function () {
                this.className = 'bi bi-heart-fill h6';
            }

            heart.addEventListener('click', () => updateLikes(post.id, 'unlike'));

        } else {
            heart.classList = "bi bi-heart h6"
            if (post.logged_user) {
            heart.onmouseover = function () {
                this.className = 'bi bi-heart-fill h6';
                this.style.cursor = 'pointer';
            }

            heart.onmouseout = function () {
                this.className = 'bi bi-heart h6';
            }
            heart.addEventListener('click', () => updateLikes(post.id, 'like'));

        }}
        return heart;
    }

    })