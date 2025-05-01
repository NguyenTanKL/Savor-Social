import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { likePostAsync, unlikePostAsync, getCommentsAsync, createCommentAsync } from "../../redux/Reducer/postSlice";
import axios from "axios";

function usePostInteractions(postId, initialLikes, currentUserId) {
  const dispatch = useDispatch();
  const [liked, setLiked] = useState(initialLikes?.includes(currentUserId) || false);
  const [likeCount, setLikeCount] = useState(initialLikes?.length || 0);
  const [isSaved, setIsSaved] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { comments, loading } = useSelector((state) => ({
    comments: state.posts?.comments || { commentList: [] },
    loading: state.posts?.loading || false,
  }));

  // Kiểm tra trạng thái "Like"
  useEffect(() => {
    setLiked(initialLikes?.includes(currentUserId) || false);
    setLikeCount(initialLikes?.length || 0);
  }, [initialLikes, currentUserId]);

  // Kiểm tra trạng thái "Save"
  useEffect(() => {
    if (currentUserId && postId) {
      axios
        .get(`http://localhost:5000/api/user/${currentUserId}/savedPosts`)
        .then((res) => {
          if (res.data.savedPosts.includes(postId)) {
            setIsSaved(true);
          }
        })
        .catch((err) => console.error("Lỗi khi kiểm tra saved post:", err));
    }
  }, [currentUserId, postId]);

  // Xử lý Like/Unlike
  const handleLike = () => {
    if (!postId || !currentUserId) {
      console.error("Missing required fields for liking post", { postId, userId: currentUserId });
      return;
    }

    const newLiked = !liked;
    const newLikeCount = newLiked ? likeCount + 1 : likeCount - 1;
    setLiked(newLiked);
    setLikeCount(newLikeCount);

    const action = newLiked
      ? dispatch(likePostAsync({ postId, userId: currentUserId }))
      : dispatch(unlikePostAsync({ postId, userId: currentUserId }));

    action.unwrap().catch((error) => {
      console.error("Failed to update like status:", error);
      setLiked(liked);
      setLikeCount(likeCount);
    });
  };

  // Xử lý Save/Unsave
  const handleSavePost = async () => {
    try {
      await axios.put(`http://localhost:5000/api/user/${currentUserId}/savePost/${postId}`, {
        userId: currentUserId,
        postId,
      });
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Lỗi khi lưu bài viết:", error);
    }
  };

  // Tải bình luận
  const loadComments = () => {
    if (postId) {
      dispatch(getCommentsAsync(postId));
    }
  };

  // Thêm bình luận mới
  const handleCreateComment = (username) => {
    if (!commentText.trim()) return;

    const commentData = {
      postId,
      userId: currentUserId,
      comment: commentText,
      from: username,
    };

    dispatch(createCommentAsync(commentData)).then(() => {
      setCommentText("");
      dispatch(getCommentsAsync(postId));
    });
  };

  return {
    liked,
    likeCount,
    isSaved,
    commentText,
    setCommentText,
    comments,
    loading,
    handleLike,
    handleSavePost,
    loadComments,
    handleCreateComment,
  };
}

export default usePostInteractions;