document.addEventListener('DOMContentLoaded', 
    function () {

        followBtn = document.querySelector('button')
        followBtn.addEventListener('click', () => toggleFollowBtn())

        function toggleFollowBtn() {
            fetch(`/edit_post`, {
                method: 'POST',
                body: JSON.stringify({
                    followed: followBtn.dataset.user,
                    following: followBtn.id === 'follow' ? false : true
                })
            })
            .then(response => response.json())

        if (followBtn.id === 'follow') {
            followBtn.id = 'unfollow';
        } else {
            followBtn.id = 'follow';
        }
        }
})