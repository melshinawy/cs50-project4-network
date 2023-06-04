function createPost(posts) {
    let divCard = document.createElement('div');
    let divCardHeader = document.createElement('div');
    let divCardBody = document.createElement('div');

    divCard.className = "card";
    divCardHeader.className = "card-header";
    divCardBody.className = "card-body";

    posts.forEach(post => {
        let a = document.createElement('a');
        a.innerHTML = post.user;
        a.href = "{% url 'profile' post.user.id %}";

        divCardHeader.append(a)

        let blockQuote = document.createElement('blockquote');
        blockQuote.className = "blockquote mb-0";

    })  

}
