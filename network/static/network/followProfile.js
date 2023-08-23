document.addEventListener('DOMContentLoaded', 
    function () {

        const followBtn = document.querySelector('button')

        followBtn.addEventListener('click', () => toggleFollowBtn())
        function toggleFollowBtn() {
            
            fetch(`/edit_follow`, {
                method: 'POST',
                headers: {'X-CSRFToken': followBtn.dataset.csrftoken},
                body: JSON.stringify({
                    followed: followBtn.dataset.user,
                    following: followBtn.id === 'follow'
                })
            })
            .then(response => response.json())
            .then(result => {
                console.log(result)
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
})