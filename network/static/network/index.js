document.addEventListener('DOMContentLoaded', 
    function () {
        // Declare DOM objects to be used
        const followBtn = document.querySelector('button'); // Follow button in profile page. Used to follow/unfollow user
        const editLink = document.querySelectorAll('.edit'); // Link used for editing a post
        const hearts = document.querySelectorAll('.bi-heart'); // Empty hearts to indicate that a post is not liked by a user
        const filledHearts = document.querySelectorAll('.bi-heart-fill'); // Filled hearts to indicate that a post is liked by a user
        const userNav = document.querySelector('#user-nav'); // Nav link for logged user to indicate that user is authenticated

        // If no user is logged skip running the script
        if (!userNav ) {
            return;
        }

        // csrf token declaration used for POST/PUT methods
        const csrftoken = userNav.dataset.csrftoken;

        // Format each heart and filled heart to determine their onclick, onmouseover and onmouseout behaviour
        hearts.forEach(heart => setHeartStyle(heart));
        filledHearts.forEach(filledHeart => setHeartStyle(filledHeart));
        
        // Format each edit link to determine their onclick, onmouseover and onmouseout behaviour
        if(editLink) {
            editLink.forEach(link => {
                link.addEventListener('click', () => editPost(link.parentNode));
            })
        }

        // Create the onclick event for button used to follow/unfollow a user when on a user profile page
        if (followBtn) {
            followBtn.addEventListener('click', () => toggleFollowBtn())
        }

        // Function used to style hearts based on their class
        function setHeartStyle(heart) {

            // When a heart is not filled (post not liked)
            if (heart.className === 'bi bi-heart h6'){
                // Fill heart and add a pointer onmouseover
                heart.addEventListener('mouseover', () => {
                    heart.className = 'bi bi-heart-fill h6';
                    heart.style.cursor = 'pointer';
                })
                // Bring the heart to original state onmouseout
                heart.addEventListener('mouseout', () => {
                    heart.className = 'bi bi-heart h6';
                })
                // Run updateLikes function when the heart is clicked to add a like to the post
                heart.addEventListener('click', () => {
                    updateLikes(heart.parentNode, 'like', csrftoken);
                })
            // When a heart is filled (post liked)
            } else {
                // Empty heart and add a pointer onmouseover
                heart.addEventListener('mouseover', () => {
                    heart.className = 'bi bi-heart h6';
                    heart.style.cursor = 'pointer';
                })
                // Bring the heart to original state onmouseout
                heart.addEventListener('mouseout', () => {
                    heart.className = 'bi bi-heart-fill h6';
                })
                // Run updateLikes function when the heart is clicked remove like from the post
                heart.addEventListener('click', () => {
                    updateLikes(heart.parentNode, 'unlike', csrftoken);
                })
            }
        }
        // Function used to set behaviour when an edit link is clicked
        function editPost(blockQuote) {
            // DOM elements declarations
            const divCardBody = blockQuote.parentNode // Parent div containing the post
            const editForm = document.createElement('div'); // Create an edit form to change post content
            const postContent = blockQuote.dataset.postContent; // Original post content
            const postId = blockQuote.dataset.postId; // Post id in database

            // Set editForm parameters and styling
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

            blockQuote.style.display = 'none'; // Hide original post content
            divCardBody.appendChild(editForm); // Append newly created editForm to parent div
            
            // Declare post and cancel buttons to determine their behaviour when clicked
            const postBtn = document.querySelector('#post');
            const cancelBtn = document.querySelector('#cancel');
            
            // When cancel button is clicked
            cancelBtn.onclick = function() {
                editForm.remove(); // Delete form
                blockQuote.style.display = 'block'; // Display original post    
            }
            
            // When post button is clicked
            postBtn.onclick = function () {
                // Update database content through edit_post
                fetch(`/edit_post`, {
                    method: 'PUT',
                    headers: {'X-CSRFToken': csrftoken},
                    body: JSON.stringify({
                        postId: postId,
                        postContent: document.querySelector('#new-post-content').value
                    })})
                .then(response => response.json())
                .then(post => {
                    // If a post is returned
                    if (post){
                        blockQuote.dataset.postContent = post.content; // Update post content in object's dataset
                        
                        blockQuote.querySelector('.post-text').innerHTML = post.content; // Update post content on page
                        blockQuote.querySelector('footer').innerHTML = ` Posted on: ${post.timestamp} - Last Updated: ${post.last_update}`; // Add/update last updated text

                        editForm.remove(); // remove edit form
                        blockQuote.style.display = 'block'; // display post with new content                       
                } 
                });
            }
        }
        // Function used to toggle follow button on profile page
        function toggleFollowBtn() {
            // Update database with follow data through edit_follow
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
                // Change follow button style and following/follower info to reflect updated follow status
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
            });
        }
        // Function used to update post likes
        function updateLikes(heartParentNode, modification, csrftoken) {
            // Update database with likes data through edit_like
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
                    // Create a new heart based on like status
                    const heart = heartParentNode.querySelector('i');
                    const updatedHeart = heart.cloneNode(false);
                    // Update heart style based on like status
                    if (post.likers.includes(Number(heartParentNode.dataset.userId))){
                        updatedHeart.className = 'bi bi-heart-fill h6';
                    } else {
                        updatedHeart.className = 'bi bi-heart h6';
                    }
                    setHeartStyle(updatedHeart); // Update heart events based on like status
                    heartParentNode.querySelector('small').innerHTML = post.likes; // Update like count
                    heart.replaceWith(updatedHeart); // Replace old heart with new one
            });
        }
})
