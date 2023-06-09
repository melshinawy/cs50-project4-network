document.addEventListener('DOMContentLoaded', function() {
    divCard = document.querySelector('#posts')

    fetch('get_posts/all')
    .then(response => response.json())
    .then(posts => {
        posts.forEach(post => {
            let divCardHeader = document.createElement('div');
            let divCardBody = document.createElement('div');

            divCardHeader.className = "card-header";
            divCardBody.className = "card-body";

            divCardHeader.innerHTML = `<a href="{% url 'profile' post.user.id %}">${post.poster}</a>`;
            divCardBody.innerHTML = `
            <blockquote class="blockquote mb-0">                     
                <p class="post-text">${post.content}<span class="float-right">${post.poster === post.logged_user ? 'Edit': ''}</span></p>
                <i class="bi bi-heart" style="color: red;"></i>
                <small>${post.likes}</small><span class="float-right"><footer class="footer">${post.timestamp}</footer></span>
            </blockquote>
            `
            divCard.appendChild(divCardHeader);
            divCard.appendChild(divCardBody);

        })
    })
})