document.addEventListener('DOMContentLoaded', function() {
    divPosts = document.querySelector('#posts')

    fetch('get_posts/all')
    .then(response => response.json())
    .then(posts => {
        posts.forEach(post => {
            let divCard = document.createElement('div');
            let divCardHeader = document.createElement('div');
            let divCardBody = document.createElement('div');
            
            divCard.className = "card";
            divCardHeader.className = "card-header";
            divCardBody.className = "card-body";         

            divCardHeader.innerHTML = `<a href="${post.poster}">${post.poster}</a>`;
            divCardBody.innerHTML = `
            <blockquote class="blockquote mb-0">                     
                <p class="post-text">${post.content}<span class="float-right" id="edit">${post.poster === post.logged_user ? '<a href="#">Edit</a>': ''}</span></p>
                <i class="bi bi-heart" style="color: red;"></i>
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