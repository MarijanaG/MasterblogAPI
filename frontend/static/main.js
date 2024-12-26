// Function that runs once the window is fully loaded
window.onload = function() {
    // Attempt to retrieve the API base URL from the local storage
    var savedBaseUrl = localStorage.getItem('apiBaseUrl');
    // If a base URL is found in local storage, load the posts
    if (savedBaseUrl) {
        document.getElementById('api-base-url').value = savedBaseUrl;
        loadPosts();
    }
}

// Function to fetch all posts from the API and display them
function loadPosts() {
    var baseUrl = document.getElementById('api-base-url').value;

    if (!baseUrl) {
        alert('Please enter a valid API base URL.');
        return;
    }

    // Use Fetch API to fetch posts
    fetch(baseUrl + '/posts')
        .then(response => response.json())
        .then(data => {
            const postContainer = document.getElementById('post-container');
            postContainer.innerHTML = ''; // Clear the current posts

            data.forEach(post => {
                const postDiv = document.createElement('div');
                postDiv.className = 'post';
                postDiv.innerHTML = `
                    <h2>${post.title}</h2>
                    <p>${post.content}</p>
                    <button onclick="deletePost(${post.id})">Delete</button>
                `;
                postContainer.appendChild(postDiv);
            });
        })
        .catch(error => {
            console.error('Error loading posts:', error);
            alert('Failed to load posts.');
        });
}

// Function to add a new post to the blog
function addPost() {
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const baseUrl = document.getElementById('api-base-url').value;

    if (!title || !content) {
        alert('Please enter both a title and content for the post.');
        return;
    }

    // Prepare the data to be sent in the POST request
    const postData = {
        title: title,
        content: content
    };

    // Send POST request to add a new post
    fetch(baseUrl + '/posts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Post added successfully!');
            loadPosts(); // Reload posts after successful addition
        } else {
            alert('Failed to add post.');
        }
    })
    .catch(error => {
        console.error('Error adding post:', error);
        alert('Failed to add post.');
    });
}

// Function to delete a post
function deletePost(postId) {
    const baseUrl = document.getElementById('api-base-url').value;

    if (!baseUrl) {
        alert('Please enter a valid API base URL.');
        return;
    }

    // Send DELETE request to remove the post
    fetch(baseUrl + '/posts/' + postId, {
        method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            alert('Post deleted successfully!');
            loadPosts(); // Reload the posts after deletion
        } else {
            alert('Failed to delete post.');
        }
    })
    .catch(error => {
        console.error('Error deleting post:', error);
        alert('Error deleting post.');
    });
}