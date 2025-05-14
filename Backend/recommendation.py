import sys
import json
import re
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import tqdm

def clean_text(text):
    if not isinstance(text, str):
        return ""
    # Loại bỏ ObjectId
    text = re.sub(r'\b[a-f0-9]{24}\b', '', text)
    # Chuẩn hóa văn bản
    text = text.encode('utf-8').decode('utf-8', errors='ignore')
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def main():
    # Chuyển debug log sang stderr
    print("Reading input from stdin...", file=sys.stderr)
    
    # Đọc input từ stdin
    input_data = sys.stdin.read()
    print(f"Input data: {input_data[:100]}...", file=sys.stderr)
    
    try:
        data = json.loads(input_data)
    except json.JSONDecodeError as e:
        print(f"Error parsing input JSON: {e}", file=sys.stderr)
        sys.exit(1)

    posts = data.get("posts", [])
    user_document = data.get("user_document", "")
    following = set(data.get("following", []))  # Chuyển thành Set để kiểm tra nhanh
    
    if not posts:
        print("No posts provided", file=sys.stderr)
        print(json.dumps([]))
        return

    # Làm sạch dữ liệu
    post_data = []
    for post in posts:
        content = clean_text(post.get("content", ""))
        tags = clean_text(" ".join(post.get("tags", [])))
        combined = f"{content} {tags}".strip()
        if combined:
            post_data.append(combined)
    
    user_data = clean_text(user_document)
    print(f"User data after preprocessing: {user_data[:100]}...", file=sys.stderr)
    
    if not post_data or not user_data:
        print("No valid data after preprocessing", file=sys.stderr)
        print(json.dumps([]))
        return

# Tải mô hình với xử lý lỗi
    try:
        print("Loading SentenceTransformer model...", file=sys.stderr)
        model = SentenceTransformer('distiluse-base-multilingual-cased-v2')
        print("Model loaded successfully", file=sys.stderr)
    except Exception as e:
        print(f"Error loading model: {e}", file=sys.stderr)
        sys.exit(1)
    # Tạo embeddings
    print(f"Total documents for embedding: {len(post_data) + 1}", file=sys.stderr)
    all_texts = post_data + [user_data]
    
    # Tạo embeddings với progress bar
    embeddings = []
    for text in tqdm.tqdm(all_texts, desc="Batches", file=sys.stderr):
        embedding = model.encode(text, show_progress_bar=False)
        embeddings.append(embedding)
    
    embeddings = np.array(embeddings)
    print(f"Embedding shape: {embeddings.shape}", file=sys.stderr)
    
    # Tính cosine similarity
    user_embedding = embeddings[-1:]
    post_embeddings = embeddings[:-1]
    similarities = cosine_similarity(user_embedding, post_embeddings)[0]
    print(f"Similarities: {similarities[:5].tolist()}...", file=sys.stderr)
    
    # Tạo recommendations
    recommendations = []
    for post, sim in zip(posts, similarities):
        # Kiểm tra nếu bài viết từ người đang follow
        is_followed = post.get("userId", "") in following
        # Tăng similarity cho người follow
        adjusted_sim = sim + 0.2 if is_followed else sim
        # Bỏ qua ngưỡng cho người follow
        if is_followed or adjusted_sim > 0.3:  # Ngưỡng 0.3 cho bài viết không từ người follow
            recommendations.append({
                "postId": post["_id"],
                "similarity": float(min(adjusted_sim, 1.0)),  # Giới hạn similarity tối đa là 1.0
                "isFollowed": is_followed
            })
    
    # Sắp xếp theo similarity
    recommendations.sort(key=lambda x: x["similarity"], reverse=True)
    
    # In JSON output ra stdout
    print(json.dumps(recommendations))
    print(f"Recommendations generated: {len(recommendations)}", file=sys.stderr)

if __name__ == "__main__":
    main()