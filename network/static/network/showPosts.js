document.addEventListener('DOMContentLoaded', function() {

    let divPosts = document.querySelector('#posts')
    fetch(`/get_posts/${divPosts.dataset.type}`)
    .then(response => response.json())
    .then(posts => {
        posts.forEach(post => createPost(post));
        let postsEdit = document.querySelectorAll(".edit");
        postsEdit.forEach(post => console.log(post))
        postsEdit.forEach((edit) => {
            let postId = edit.dataset.postId;
            let postContent = edit.dataset.postContent
            edit.addEventListener('click', () => editPost(postId, postContent));
    })
    })

    function editPost(postId, postContent) {
        const bllockQuote = document.querySelector(`#post-${postId}`);
        let divCardBody = document.querySelector(`#div-${postId}`);
        let editForm = document.createElement('div');
        bllockQuote.style.margin = 0;
        bllockQuote.style.padding = 0;
        editForm.className="card";
        editForm.style.margin = 0;
        editForm.style.padding = 0;
        editForm.innerHTML = 
        `
                    <form id="edit-post-form">
                        <div class="form-group">
                            <textarea class="form-control mb-3" name="new-post">${postContent}</textarea>
                            <button class="btn btn-primary" type="submit">Post</button>
                            <button class="btn btn-primary">Cancel</button>
                        </div>
                    </form>
        `
        bllockQuote.style.display = 'none';
        divCardBody.appendChild(editForm);    
    }
    
    function createPost(post) {
        let divCard = document.createElement('div');
        let divCardHeader = document.createElement('div');
        let divCardBody = document.createElement('div');
        
        divCard.className = "card";
        divCardHeader.className = "card-header";
        divCardBody.className = "card-body";
        divCardBody.id = `div-${post.id}`       

        divCardHeader.innerHTML = `<a href="/users/${post.poster}">${post.poster}</a>`;
        divCardBody.innerHTML = 
        `
        <blockquote class="blockquote mb-0" id="post-${post.id}">                     
            <p class="post-text">${post.content}
                <span class="float-right">
                    ${post.poster === post.logged_user ? `<a href="#" class="edit" data-post-id="${post.id}" data-post-content="${post.content}">Edit</a>`: ''}
                </span>
            </p>
            <i class="bi bi-heart"></i>
            <small>${post.likes}</small>
            <footer class="footer">${post.timestamp}</footer>
        </blockquote>
        `

        divCard.appendChild(divCardHeader);
        divCard.appendChild(divCardBody);
        divPosts.appendChild(divCard);
    }   
    
    
    })