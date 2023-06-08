
// function createPost(posts) {
    let divCard = document.createElement('div');
    let divCardHeader = document.createElement('div');
    let divCardBody = document.createElement('div');

    divCard.className = "card";
    divCardHeader.className = "card-header";
    divCardBody.className = "card-body";

//     posts.forEach(post => {
//         let page = `
//         <div class="container-fluid">
//         <h2>All Posts</h2>`

//         {% if user.is_authenticated %}
//             <div class="card">
//                 <form action="{% url 'index' %}" method="post">
//                     {% csrf_token %}
//                     <div class="form-group" style="margin: 20px">
//                         <label for="new-post"><h5>New Post</h5></label><br>
//                         <textarea class="form-control mb-3" name="new-post"></textarea>
//                         <button class="btn btn-primary" type="submit">Post</button>
//                     </div>
//                 </form>
//             </div>
//         {% endif %}
    
//         <div class="card">
//             {% for post in posts reversed %}
//                 <div class="card-header">
//                     <a href="{% url 'profile' post.user.id %}">{{  post.user }}</a>
//                 </div>
//                 <div class="card-body">
//                     <blockquote class="blockquote mb-0">
//                         {% if user.id == post.user.id %}
//                             <a href="#"><h6 style="font-size: 12px; text-align: right;">Edit</h6></a>
//                         {% endif %}
//                         <p>{{  post.content }}</p>
//                         <i class="bi bi-heart" style="color: red;"></i>
//                         <small> {{ post.likes.count }}</small><br>
//                         <footer class="footer" style="font-size: 12px; text-align: right;">{{ post.timestamp }}</footer>
//                     </blockquote>
                    
//                 </div>
//                 {% endfor %}
//         </div>
//     </div>    
//   `
        
        
        
        
        
        
        
        
//     // let a = document.createElement('a');
//         // a.innerHTML = post.user;
//         // a.href = "{% url 'profile' post.user.id %}";

//         // divCardHeader.append(a)

//         // let blockQuote = document.createElement('blockquote');
//         // blockQuote.className = "blockquote mb-0";

//     })  

// }
