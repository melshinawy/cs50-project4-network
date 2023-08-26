document.addEventListener('DOMContentLoaded', function() {

    const divPosts = document.querySelector('#posts')

    fetch(`/get_posts/${divPosts.dataset.type}`)
    .then(response => response.json())
    .then(posts => {
        posts.forEach(post => createPost(post));
        setEditStyle();
    })

    function editPost(postId, postContent, csrftoken) {
        let blockQuote = document.querySelector(`#post-${postId}`);
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
            fetch(`/edit_post`, {
                method: 'POST',
                headers: {'X-CSRFToken': csrftoken},
                body: JSON.stringify({
                    postId: postId,
                    postContent: document.querySelector('#new-post-content').value
                })})
            .then(response => response.json())
            .then(post => {
                console.log(post)
                if (post){
                    const newBlockQuote = createBlockQuote(post);
                    blockQuote.remove()               
                    editForm.remove();
                    divCardBody.appendChild(newBlockQuote)
                setEditStyle();
            }

            })
        }
    }
    
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
    
    function createBlockQuote(post) {
        let blockQuote = document.createElement('blockquote');

        blockQuote.className= "blockquote mb-0" 
        blockQuote.id=`post-${post.id}`

        blockQuote.innerHTML = `
            <p class="post-text">${post.content}
                <span class="float-right">
                    ${post.poster === post.logged_user ? `<a class="edit" data-post-id="${post.id}" data-post-content="${post.content}">Edit</a>`: ''}
                </span>
            </p>
            <i class="bi bi-heart h6"></i><h6 style="display: inline;"> ${post.likes}</h6>
            <footer class="footer">Posted on:${post.timestamp} ${post.last_update ? ` - Last updated: ${post.last_update}` : ''}</footer>
        `
        return blockQuote;
    }

    function setEditStyle() {
        let postsEdit = document.querySelectorAll(".edit");

        postsEdit.forEach(post => { 

            let postId = post.dataset.postId;
            let postContent = post.dataset.postContent

            post.style.color = "blue";
            post.onmouseover = function() {
                this.style.textDecoration = 'underline';
                this.style.cursor = 'pointer';
            }
            post.onmouseout = function () {
                this.style.textDecoration = 'none';
            }
            post.addEventListener('click', () => editPost(postId, postContent, document.querySelector('#posts').dataset.csrftoken));
        })
    }
    
    })