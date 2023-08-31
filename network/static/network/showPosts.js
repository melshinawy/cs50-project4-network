document.addEventListener('DOMContentLoaded', function() {

    const divPosts = document.querySelector('#posts')
    const csrftoken = document.querySelector('#posts').dataset.csrftoken

    function editPost(postId, postContent) {
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
                method: 'PUT',
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
                setStyle();
            }

            })
        }
    } 

    function setStyle() {

        const postsEdit = document.querySelectorAll(".edit");
        const hearts = document.querySelectorAll(".bi-heart");
        const filledHearts = document.querySelectorAll(".bi-heart-fill");

        postsEdit.forEach(post => { 

            let postId = post.dataset.postId;
            let postContent = post.dataset.postContent

            post.style.color = 'blue';
            post.onmouseover = function() {
                this.style.textDecoration = 'underline';
                this.style.cursor = 'pointer';
            }

            post.onmouseout = function () {
                this.style.textDecoration = 'none';
            }

            post.addEventListener('click', () => editPost(postId, postContent));
        })

        hearts.forEach(heart => {
            heart.style.color = 'red';
            heart.onmouseover = function () {
                this.className = 'bi bi-heart-fill h6';
                this.style.cursor = 'pointer';
            }

            heart.onmouseout = function () {
                this.className = 'bi bi-heart h6';
            }

            heart.addEventListener('click', () => updateLikes(this, 'like'))
        })

        filledHearts.forEach(filledHeart => {
            filledHeart.style.color = 'red';
            filledHeart.onmouseover = function () {
                this.className = 'bi bi-heart h6';
                this.style.cursor = 'pointer';
            }

            filledHeart.onmouseout = function () {
                this.className = 'bi bi-heart-fill h6';
            }
            
            filledHeart.addEventListener('click', () => updateLikes(this, 'unlike'))
        })
    }
    
    function updateLikes(heart, modification) {
        fetch(`/edit_likes`, {
            method: 'PUT',
            headers: {'X-CSRFToken': csrftoken},
                body: JSON.stringify({
                    postId: heart.dataset.postId,
                    userId: userId,
                    modification: modification
                })
            })
            .then(response => response.json())
            .then(() => {
                modification === 'like' ? heart.className = 'bi bi-heart-fill h6': heart.className = 'bi bi-heart h6';
                setStyle();
        })
    }

    })