// src/redux/slices/postSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createPost,
  getPosts,
  getRecommendedPosts,
  deletePost as deletePostApi,
  likePost as likePostApi,
  unlikePost as unlikePostApi,
  getComments,
  createComment,
  createReply,
  likeComment as likeCommentApi,
  unlikeComment as unlikeCommentApi,
  getPostById,
  updatePost as updatePostApi,
} from '../../api';

const initialState = {
  posts: [],
  recommendedPosts: [], 
  comments: {
    openComments: false,
    postId: '',
    commentList: [],
  },
  currentPost: null,
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
};

// Action bất đồng bộ: Tạo bài viết
export const createPostAsync = createAsyncThunk('posts/createPost', async (formData, { rejectWithValue }) => {
  try {
    const res = await createPost(formData);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to create post' });
  }
});
export const updatePostAsync = createAsyncThunk('posts/updatePost', async ({ postId, content, visibility }, { rejectWithValue }) => {
  try {
    const res = await updatePostApi(postId, { content, visibility });
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to update post' });
  }
});
export const getRecommendedPostsAsync = createAsyncThunk(
  'posts/getRecommendedPosts',
  async (page, { rejectWithValue }) => {
    try {
      console.log(`Fetching recommended posts, page: ${page}`);
      const res = await getRecommendedPosts({ params: { page } });
      return { data: res.data, page };
    } catch (error) {
      console.error('getRecommendedPostsAsync error:', error.response?.data);
      return rejectWithValue(error.response?.data || { message: 'Failed to get recommended posts' });
    }
  }
);
// Action bất đồng bộ: Lấy danh sách bài viết
export const getPostsAsync = createAsyncThunk('posts/getPosts', async (_, { rejectWithValue }) => {
  try {
    const res = await getPosts();
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to get posts' });
  }
});
export const getPostByIdAsync = createAsyncThunk('posts/getPostById', async (postId, { rejectWithValue }) => {
  try {
    const res = await getPostById(postId);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to get post by ID' });
  }
});
// Action bất đồng bộ: Xóa bài viết
export const deletePostAsync = createAsyncThunk('posts/deletePost', async ({ postId, userId }, { rejectWithValue }) => {
  try {
    await deletePostApi(postId, userId);
    return postId;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to delete post' });
  }
});

// Action bất đồng bộ: Thích bài viết
export const likePostAsync = createAsyncThunk('posts/likePost', async ({ postId, userId }, { rejectWithValue }) => {
  try {
    const res = await likePostApi(postId, userId);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to like post' });
  }
});

// Action bất đồng bộ: Bỏ thích bài viết
export const unlikePostAsync = createAsyncThunk('posts/unlikePost', async ({ postId, userId }, { rejectWithValue }) => {
  try {
    const res = await unlikePostApi(postId, userId);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to unlike post' });
  }
});

// Action bất đồng bộ: Lấy danh sách bình luận
export const getCommentsAsync = createAsyncThunk('posts/getComments', async (postId, { rejectWithValue }) => {
  try {
    const res = await getComments(postId);
    return { postId, comments: res.data };
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to get comments' });
  }
});

// Action bất đồng bộ: Tạo bình luận
export const createCommentAsync = createAsyncThunk('posts/createComment', async (commentData, { rejectWithValue }) => {
  try {
    const res = await createComment(commentData);
    return res.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to create comment' });
  }
});
export const createReplyAsync = createAsyncThunk(
  "posts/createReply",
  async (replyData, { rejectWithValue }) => {
    try {
      const response = await createReply(replyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
// Action bất đồng bộ: Thích bình luận hoặc reply
export const likeCommentAsync = createAsyncThunk(
  "posts/likeComment",
  async ({ commentId, replyId,userId }, { rejectWithValue }) => {
    try {
      const res = await likeCommentApi({ commentId,replyId, userId});
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to like comment' });
    }
  }
);

// Action bất đồng bộ: Bỏ thích bình luận hoặc reply
export const unlikeCommentAsync = createAsyncThunk(
  "posts/unlikeComment",
  async ({ commentId,replyId ,userId }, { rejectWithValue }) => {
    try {
      const res = await unlikeCommentApi({ commentId, replyId, userId });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to unlike comment' });
    }
  }
);
const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    setPost: (state, action) => {
      state.posts = action.payload;
    },
    updatePost: (state, action) => {
      const index = state.posts.findIndex((post) => post._id === action.payload._id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
      if (state.currentPost && state.currentPost._id === action.payload._id) {
        state.currentPost = action.payload;
      }
    },
    deletePost: (state, action) => {
      state.posts = state.posts.filter((post) => post._id !== action.payload);
    },
    likePost: (state, action) => {
      const index = state.posts.findIndex((post) => post._id === action.payload.postId);
      if (index !== -1) {
        state.posts[index].likes.push(action.payload.userId);
      }
      const recIndex = state.recommendedPosts.findIndex((post) => post._id === action.payload.postId);
      if (recIndex !== -1) {
        state.recommendedPosts[recIndex].likes.push(action.payload.userId);
      }
    },
    unlikePost: (state, action) => {
      const index = state.posts.findIndex((post) => post._id === action.payload.postId);
      if (index !== -1) {
        state.posts[index].likes = state.posts[index].likes.filter(
          (userId) => userId !== action.payload.userId
        );
      }
      const recIndex = state.recommendedPosts.findIndex((post) => post._id === action.payload.postId);
      if (recIndex !== -1) {
        state.recommendedPosts[recIndex].likes = state.recommendedPosts[recIndex].likes.filter(
          (userId) => userId !== action.payload.userId
        );
      }
    },
    toggleComments: (state, action) => {
      state.comments.openComments = action.payload.open;
      if (action.payload.postId) {
        state.comments.postId = action.payload.postId;
      }
      if (Array.isArray(action.payload.commentList)) {
        state.comments.commentList = action.payload.commentList;
      }
    },
    setComments: (state, action) => {
      state.comments.commentList = action.payload;
    },
    loadMorePosts: (state) => {
      state.page += 1;
    },
  },
  extraReducers: (builder) => {
    // Tạo bài viết
    builder
      .addCase(createPostAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPostAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(createPostAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Lấy danh sách bài viết
      .addCase(getPostsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPostsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(getPostsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getRecommendedPostsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // .addCase(getRecommendedPostsAsync.fulfilled, (state, action) => {
      //   state.recommendedPostsLoading = false;
      //   const { data, page } = action.payload;
      //   if (page === 1) {
      //     state.recommendedPosts = data.posts || [];
      //   } else {
      //     state.recommendedPosts = [...state.recommendedPosts, ...(data.posts || [])];
      //   }
      //   state.hasMore = data.hasMore !== undefined ? data.hasMore : data.posts.length >= 50;
      // })
      // .addCase(getRecommendedPostsAsync.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      // })
      .addCase(getRecommendedPostsAsync.fulfilled, (state, action) => {
        state.recommendedPostsLoading = false;
        const { data, page } = action.payload;
      
        // Đảm bảo data.posts là mảng rỗng nếu undefined
        const posts = data.posts || [];
      
        if (page === 1) {
          state.recommendedPosts = posts;
        } else {
          state.recommendedPosts = [...state.recommendedPosts, ...posts];
        }
        // Kiểm tra hasMore an toàn
        state.hasMore = data.hasMore !== undefined ? data.hasMore : posts.length >= 50;
      })
      .addCase(getRecommendedPostsAsync.rejected, (state, action) => {
        state.recommendedPostsLoading = false; // Đảm bảo loading được tắt
        state.error = action.payload;
        state.hasMore = false; // Đặt hasMore về false khi có lỗi
        // Không thay đổi state.recommendedPosts để giữ dữ liệu hiện tại hoặc đặt về mảng rỗng nếu cần
        // state.recommendedPosts = []; // (Tùy chọn) Xóa danh sách khi có lỗi
      })
      // Lấy bài viết theo ID
      .addCase(getPostByIdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPostByIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload; // Lưu bài viết chi tiết vào trạng thái
      })
      .addCase(getPostByIdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xóa bài viết
      .addCase(deletePostAsync.fulfilled, (state, action) => {
        state.posts = state.posts.filter((post) => post._id !== action.payload);
        state.recommendedPosts = state.recommendedPosts.filter((post) => post._id !== action.payload);
      })
      // Thích bài viết
      .addCase(likePostAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(likePostAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updatedPost = action.payload;
        const index = state.posts.findIndex((post) => post._id === updatedPost._id);
        if (index !== -1) {
          state.posts[index] = updatedPost;
        }
        const recIndex = state.recommendedPosts.findIndex((post) => post._id === updatedPost._id);
        if (recIndex !== -1) {
          state.recommendedPosts[recIndex] = updatedPost;
        }
      })
      .addCase(likePostAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Bỏ thích bài viết
      .addCase(unlikePostAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unlikePostAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updatedPost = action.payload;
        const index = state.posts.findIndex((post) => post._id === updatedPost._id);
        if (index !== -1) {
          state.posts[index] = updatedPost;
        }
        const recIndex = state.recommendedPosts.findIndex((post) => post._id === updatedPost._id);
        if (recIndex !== -1) {
          state.recommendedPosts[recIndex] = updatedPost;
        }
      })
      .addCase(unlikePostAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Lấy danh sách bình luận
      .addCase(getCommentsAsync.fulfilled, (state, action) => {
        const { comments } = action.payload;
        state.comments.commentList = comments;
      })
      // Tạo bình luận
      .addCase(createCommentAsync.fulfilled, (state, action) => {
        const newComment = action.payload;
        state.comments.commentList.unshift(newComment);
      })
      // Create Reply
      .addCase(createReplyAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReplyAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Cập nhật comment với replies mới
        const updatedComment = action.payload;
        const commentIndex = state.comments.commentList.findIndex(
          (c) => c._id === updatedComment._id
        );
        if (commentIndex !== -1) {
          state.comments.commentList[commentIndex] = updatedComment;
        }
        const recIndex = state.recommendedPosts.findIndex((post) => post._id === updatedComment._id);
        if (recIndex !== -1) {
          state.recommendedPosts[recIndex] = updatedComment;
        }
      })
      .addCase(createReplyAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create reply";
      })
      // Thích bình luận hoặc reply
      .addCase(likeCommentAsync.fulfilled, (state, action) => {
        const updatedComment = action.payload;
        const commentIndex = state.comments.commentList.findIndex(
          (c) => c._id === updatedComment._id
        );
        if (commentIndex !== -1) {
          state.comments.commentList[commentIndex] = updatedComment;
        }
        const recIndex = state.recommendedPosts.findIndex((post) => post._id === updatedComment._id);
        if (recIndex !== -1) {
          state.recommendedPosts[recIndex] = updatedComment;
        }
      })
      // Bỏ thích bình luận hoặc reply
      .addCase(unlikeCommentAsync.fulfilled, (state, action) => {
        const updatedComment = action.payload;
        const commentIndex = state.comments.commentList.findIndex(
          (c) => c._id === updatedComment._id
        );
        if (commentIndex !== -1) {
          state.comments.commentList[commentIndex] = updatedComment;
        }
      })
      .addCase(updatePostAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload; // Cập nhật currentPost với dữ liệu mới
        const index = state.posts.findIndex((post) => post._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        const recIndex = state.recommendedPosts.findIndex((post) => post._id === action.payload._id);
        if (recIndex !== -1) {
          state.recommendedPosts[recIndex] = action.payload;
        }
      });
  },
});

export const { setPost, deletePost, likePost, unlikePost, toggleComments, setComments, loadMorePosts } = postSlice.actions;
export default postSlice.reducer;