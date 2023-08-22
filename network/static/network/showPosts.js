document.addEventListener('DOMContentLoaded', function() {

    let divPosts = document.querySelector('#posts')
    
    fetch(`/get_posts/${divPosts.dataset.type}`)
    .then(response => response.json())
    .then(posts => {
        posts.forEach(post => {
            console.log(post.content)
            let divCard = document.createElement('div');
            let divCardHeader = document.createElement('div');
            let divCardBody = document.createElement('div');
            
            divCard.className = "card";
            divCardHeader.className = "card-header";
            divCardBody.className = "card-body";         

            divCardHeader.innerHTML = `<a href="/users/${post.poster}">${post.poster}</a>`;
            divCardBody.innerHTML = `
            <blockquote class="blockquote mb-0">                     
                <p class="post-text" id="edit-${post.id}">${post.content}<span class="float-right" id="edit">${post.poster === post.logged_user ? `<a href="#">Edit</a>`: ''}</span></p>
                <i class="bi bi-heart"></i>
                <small>${post.likes}</small>
                <footer class="footer">${post.timestamp}</footer>
            </blockquote>
            `
            
            divCard.appendChild(divCardHeader);
            divCard.appendChild(divCardBody);
            divPosts.appendChild(divCard);

        })
    })
})


function editPost(post_id) {
    post = document.querySelector(`#edit-${post_id}`)
    
}