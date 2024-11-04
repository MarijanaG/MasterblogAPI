from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)
limiter = Limiter(app=app, key_func=get_remote_address)
CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5001"}})

POSTS = [
    {"id": 1, "title": "First post", "content": "This is the first post."},
    {"id": 2, "title": "Second post", "content": "This is the second post."},
]

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": str(error)}), 404

@app.errorhandler(429)
def ratelimit_error(error):
    return jsonify({"error": str(error)}), 429

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({"error": str(error)}), 405

@app.route("/")
def home():
    return "Welcome to the Masterblog API"

@app.route('/api/posts', methods=['GET'])
@limiter.limit("30 per minute")
def get_posts():
    """
    Endpoint to retrieve all posts, with optional sorting by title or content.
    Returns a JSON array of posts sorted based on query parameters.
    """
    sort_field = request.args.get("sort")
    sort_direction = request.args.get("direction", "asc").lower()

    # validate sorting parameters
    if sort_field and sort_field not in ["title", "content"]:
        return jsonify({"error": "Sort field must be either 'title' or 'content'."}), 400
    if sort_direction not in ["asc", "desc"]:
        return jsonify({"error": "Sort direction must be either 'asc' or 'desc'."}), 400

    # Sorting logic
    sorted(
        POSTS,
        key=lambda post: post.get(sort_field, "").lower() if sort_field else None,
        reverse=(sort_direction == "desc")
    ) if sort_field else POSTS

    # Sorting logic
    sorted_posts = sorted(
        POSTS,
        key=lambda post: post.get(sort_field, "").lower() if sort_field else None,
        reverse=(sort_direction == "desc")
    ) if sort_field else POSTS

    # Pagination parameters
    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 5))
        assert page > 0 and limit > 0
    except (ValueError, AssertionError):
        return jsonify({"error": "Page and limit must be positive integers."}), 400

    # Pagination logic
    start_index = (page - 1) * limit
    end_index = start_index + limit
    paginated_posts = sorted_posts[start_index:end_index]

    # Metadata for pagination
    response = {
        "total_posts": len(POSTS),
        "page": page,
        "limit": limit,
        "total_pages": (len(POSTS) + limit - 1) // limit,
        "posts": paginated_posts
    }

    return jsonify(response), 200

@app.route("/api/posts", methods=["POST"])
def add_post():
    data = request.get_json()

    if not data or "title" not in data or "content" not in data:
        return jsonify({"error": "Both 'title' and 'content' are required"}), 400

    new_id = max(post["id"] for post in POSTS) + 1 if POSTS else 1

    new_post = {
        "id": new_id,
        "title": data["title"],
        "content": data["content"],
    }
    POSTS.append(new_post)
    return jsonify(new_post), 201


@app.route('/api/posts/<int:id>', methods=["DELETE"])
def delete_post(id):
    post = next((post for post in POSTS if post["id"] == id), None)

    if post:
        POSTS.remove(post)
        return jsonify({"message": f"Post with id {id} has been deleted successfully."}), 200
    else:
        return jsonify({"error": "Post not found"}), 404

@app.route('/api/posts/<int:id>', methods=["PUT"])
def update_post(id):
    post = next((post for post in POSTS if post["id"] == id), None)

    if not post:
        return jsonify({"error": "Post not found"}), 404

    data = request.get_json()

    if "title" in data:
        post["title"] = data["title"]
    if "content" in data:
        post["content"] = data["content"]

    return jsonify(post), 200

@app.route('/api/posts/search', methods=["GET"])
def search_posts():
    title_query = request.args.get("title", "").lower()
    content_query = request.args.get("content", "").lower()

    matching_posts = []
    for post in POSTS:
        post_title_lower = post["title"].lower()
        post_content_lower = post["content"].lower()

        title_match = title_query in post_title_lower if title_query else True
        content_match = content_query in post_content_lower if content_query else True

        if title_match and content_match:
            matching_posts.append(post)

    return jsonify(matching_posts), 200

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5002, debug=True)