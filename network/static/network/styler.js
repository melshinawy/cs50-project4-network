document.addEventListener('DOMContentLoaded', 
    function () {

        const followBtn = document.querySelector('button');
        const editLink = document.querySelectorAll('.edit');
        const hearts = document.querySelectorAll('.bi-heart');
        const filledHearts = document.querySelectorAll('.bi-heart-fill');
        const userNav = document.querySelector('#user-nav');

        if (!userNav ) {
            return;
        }

        const csrftoken = userNav.dataset.csrftoken;

        hearts.forEach(heart => setHeartStyle(heart));
        filledHearts.forEach(filledHeart => setHeartStyle(filledHeart));
        
        if(editLink) {
            editLink.forEach(link => {
                link.addEventListener('click', () => editPost(link.parentNode));
            })
        }

        if (followBtn) {
            followBtn.addEventListener('click', () => toggleFollowBtn())
        }

        function setHeartStyle(heart) {

            if (heart.className === 'bi bi-heart h6'){
                heart.addEventListener('mouseover', () => {
                    heart.className = 'bi bi-heart-fill h6';
                    heart.style.cursor = 'pointer';
                })

                heart.addEventListener('mouseout', () => {
                    heart.className = 'bi bi-heart h6';
                })

                heart.addEventListener('click', () => {
                    updateLikes(heart.parentNode, 'like', csrftoken);
                })
            } else {
                heart.addEventListener('mouseover', () => {
                    heart.className = 'bi bi-heart h6';
                    heart.style.cursor = 'pointer';
                })
    
                heart.addEventListener('mouseout', () => {
                    heart.className = 'bi bi-heart-fill h6';
                })
                
                heart.addEventListener('click', () => {
                    updateLikes(heart.parentNode, 'unlike', csrftoken);
                })
            }
        }
        
        function editPost(blockQuote) {
            const divCardBody = blockQuote.parentNode
            const editForm = document.createElement('div');
            const postContent = blockQuote.dataset.postContent;
            const postId = blockQuote.dataset.postId;
    
            editForm.className="card";
            editForm.innerHTML = 
            `
                <form id="edit-post-form">
                    <div class="form-group">
                        <textarea class="form-control mb-3" id="new-post-content">${postContent}</textarea>
                        <button class="btn btn-primary" type ="reset" id="post">Post</button>
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
                        
                        blockQuote.dataset.postContent = post.content;
                        
                        blockQuote.querySelector('.post-text').innerHTML = post.content;
                        blockQuote.querySelector('footer').innerHTML = ` Posted on: ${post.timestamp} - Last Updated: ${post.last_update}`;

                        editForm.remove();
                        blockQuote.style.display = 'block';
                        
                }
    
                })
            }
        }

        function toggleFollowBtn() {
            
            fetch(`/edit_follow`, {
                method: 'PUT',
                headers: {'X-CSRFToken': followBtn.dataset.csrftoken},
                body: JSON.stringify({
                    followed: followBtn.dataset.user,
                    following: followBtn.id === 'follow'
                })
            })
            .then(response => response.json())
            .then(result => {
                if (followBtn.id === 'follow') {
                    followBtn.id = 'unfollow';
                    followBtn.innerHTML = 'Unfollow';
                    followBtn.className = "btn btn-danger";
                    
                    let numFollowers = document.querySelector("#followers");
                    numFollowers.innerHTML = (parseInt(numFollowers.innerHTML) + 1).toString();
                } else {
                    followBtn.id = 'follow';
                    followBtn.innerHTML = 'Follow';
                    followBtn.className = "btn btn-success";
                    
                    let numFollowers = document.querySelector("#followers");
                    numFollowers.innerHTML = (parseInt(numFollowers.innerHTML) - 1).toString();
                }
            })
        }

        function updateLikes(heartParentNode, modification, csrftoken) {
            fetch(`/edit_like`, {
                method: 'PUT',
                headers: {'X-CSRFToken': csrftoken},
                    body: JSON.stringify({
                        postId: heartParentNode.dataset.postId,
                        modification: modification
                    })
                })
                .then(response => response.json())
                .then(post => {
                    const heart = heartParentNode.querySelector('i');
                    const updatedHeart = heart.cloneNode(false);
                    
                    if (post.likers.includes(Number(heartParentNode.dataset.userId))){
                        updatedHeart.className = 'bi bi-heart-fill h6';
                    } else {
                        updatedHeart.className = 'bi bi-heart h6';
                    }
                    setHeartStyle(updatedHeart);
                    heartParentNode.querySelector('small').innerHTML = post.likes;
                    heart.replaceWith(updatedHeart);               
            })
        }
})
