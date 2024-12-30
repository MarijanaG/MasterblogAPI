// Function that runs once the window is fully loaded
window.onload = function() {
    // Attempt to retrieve the API base URL from the local storage
    var savedBaseUrl = localStorage.getItem('apiBaseUrl');
    // If a base URL is found in local storage, load the posts
    if (savedBaseUrl) {
        document.getElementById('api-base-url').value = savedBaseUrl;
        loadPosts();  // Call loadPosts to display the posts on page load
    }
}

// Function to fetch all the posts from the API and display them on the page
function loadPosts() {
    // Retrieve the base URL from the input field and save it to local storage
    var baseUrl = document.getElementById('api-base-url').value;
    localStorage.setItem('apiBaseUrl', baseUrl);  // Save the base URL for future use

    // Use the Fetch API to send a GET request to the /posts endpoint
    fetch(baseUrl + '/posts')
        .then(response => response.json())  // Parse the JSON data from the response
        .then(data => {
            const posts = data.posts;  // Extract posts array from the response
            const postContainer = document.getElementById('post-container');
            postContainer.innerHTML = '';  // Clear out the post container first

            // For each post in the response, create a new post element and add it to the page
            posts.forEach(post => {
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
            console.error('Error loading posts:', error);  // If an error occurs, log it to the console
            alert('Failed to load posts. Please try again later.');
        });
}

// Function to send a POST request to the API to add a new post
function addPost() {
    // Retrieve the values from the input fields
    var baseUrl = document.getElementById('api-base-url').value;
    var postTitle = document.getElementById('post-title').value;
    var postContent = document.getElementById('post-content').value;

    // Check if title and content are provided
    if (!postTitle || !postContent) {
        alert('Please enter both title and content.');
        return;
    }

    // Use the Fetch API to send a POST request to the /posts endpoint
    fetch(baseUrl + '/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: postTitle, content: postContent })  // Send the post data
    })
    .then(response => response.json())  // Parse the JSON data from the response
    .then(post => {
        console.log('Post added:', post);
        loadPosts();  // Reload the posts after adding a new one
    })
    .catch(error => {
        console.error('Error adding post:', error);  // If an error occurs, log it to the console
        alert('Failed to add post. Please try again later.');
    });
}

// Function to send a DELETE request to the API to delete a post
function deletePost(postId) {
    var baseUrl = document.getElementById('api-base-url').value;

    // Use the Fetch API to send a DELETE request to the specific post's endpoint
    fetch(baseUrl + '/posts/' + postId, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            console.log('Post deleted:', postId);
            loadPosts();  // Reload the posts after deleting one
        } else {
            alert('Failed to delete post. Please try again later.');
        }
    })
    .catch(error => {
        console.error('Error deleting post:', error);  // If an error occurs, log it to the console
        alert('Failed to delete post. Please try again later.');
    });
}
