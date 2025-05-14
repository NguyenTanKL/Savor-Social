import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, Button, Rating, Box, Stack, TextField, IconButton, Typography, Popover } from "@mui/material";
import MapIcon from '@mui/icons-material/Map';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import "./Post.css";
import Card from "@mui/material/Card";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import TelegramIcon from "@mui/icons-material/Telegram";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
import RoomIcon from "@mui/icons-material/Room";
import SendIcon from "@mui/icons-material/Send";
import Grid from "@mui/material/Grid";
import Modal from "../../components/Modal";
import usePostInteractions from "../../components/hooks/usePostInteractions";
import axios from "axios";
import ShareModal from "../../components/ShareModal/ShareModal";
import parseContent from "../../components/post/ParsedContent";
import moment from "moment/moment";
import { toggleFollow, checkFollow } from "../../api";
import { updateUser } from "../../redux/Reducer/userSlice";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import PostOptionsDialog from "../../components/post/PostOptionsDialog";
import { BACKENDURL } from "../../utils/const";
const VOUCHER_API_URL = `${BACKENDURL}/api/vouchers`;

function Post({
  user,
  postID,
  postComment,
  images,
  likes,
  content,
  tags,
  taggedUsers,
  rating,
  address,
  timestamp,
  is_voucher,
  is_ad,
  isSelected,
  onSelect,
  ad_id,
  voucher_id
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.user);
  const posts = useSelector((state) => state.posts.recommendedPosts || []);
  const postInfo = posts.find((post) => post._id === postID);
  const currentUserId = currentUser?._id;
  const username = currentUser?.username || "Unknown";
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [voucherData, setVoucherData] = useState(null);
  const [current, setCurrent] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isUserSelected, setIsUserSelected] = useState(false);
  const {
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
  } = usePostInteractions(postID, likes, currentUserId);
  const commentInputRef = useRef(null);
  const nextImage = () => setCurrent((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);

  useEffect(() => {
    if (is_voucher) {
      axios.get(`${BACKENDURL}/api/vouchers/voucher_detail/${voucher_id}`)
        .then(res => {
          console.log("Dữ liệu voucher từ API:", res.data);
          setVoucherData(res.data);
        })
        .catch(err => console.error("Lỗi khi lấy thông tin voucher:", err));
    }
  }, [is_voucher, voucher_id]);

  useEffect(() => {
    if (user && currentUserId) {
      axios.get(`${BACKENDURL}/api/userRoutes/${user}`)
        .then(res => {
          console.log("Dữ liệu user nhận được:", res.data);
          setUserData(res.data);
        })
        .catch(err => {
          console.error("Lỗi khi lấy dữ liệu user:", err);
          console.log("Lỗi chi tiết:", err.response?.data);
        });

      const fetchFollowStatus = async () => {
        try {
          const status = await checkFollow(user);
          setIsFollowing(status);
        } catch (error) {
          console.error("Lỗi khi kiểm tra trạng thái follow:", error);
        }
      };
      fetchFollowStatus();
    }
  }, [user, currentUserId]);

  useEffect(() => {
    const checkIfSelected = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BACKENDURL}/api/posts/favourite-locations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const favouriteLocations = response.data;
        const isSelected = favouriteLocations.some(loc => loc.postId === postID);
        setIsUserSelected(isSelected);
      } catch (error) {
        console.error('Error checking favourite status:', error);
      }
    };
    checkIfSelected();
  }, [postID]);

  useEffect(() => {
    console.log("Posts state:", posts);
    if (!postInfo && postID) {
      const fetchPost = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(`${BACKENDURL}/api/posts/info/${postID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Fetched post:", response.data);
        } catch (error) {
          console.error("Error fetching post:", error);
        }
      };
      fetchPost();
    }
  }, [postID, posts, postInfo]);

  const usernameOfPost = userData?.username || "Unknown";

  const handleFollow = async () => {
    try {
      const newStatus = await toggleFollow(user, isFollowing);
      setIsFollowing(!isFollowing);
      dispatch(updateUser(newStatus.user));
    } catch (error) {
      console.error("Lỗi khi follow user:", error);
      alert("Failed to follow user");
    }
  };

  const handleOpenShareModal = () => {
    setShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setShareModalOpen(false);
  };

  const handleOpenPostDetail = () => {
    navigate(`/post/${postID}`);
  };

  const [voucherSelected, setVoucherSelected] = useState(null);
  const userId = currentUserId;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`${BACKENDURL}/api/posts/info/${postID}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("Voucher:", response.data);
        setVoucherSelected(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchPost();
  }, [postID]);

  const handleSelect = async () => {
    if (!voucherSelected || !voucherSelected.voucher_id) {
      alert("Voucher data is not available.");
      return;
    }
    try {
      console.log("Voucher selected:", voucherSelected.voucher_id);
      const response = await axios.post(`${VOUCHER_API_URL}/${userId}/collect/${voucherSelected.voucher_id}`);
      if (response.status === 200) {
        alert("Voucher selected successfully!");
      }
    } catch (error) {
      console.error("Error collected voucher:", error.response?.data || error.message);
      alert("Failed to collect voucher");
    }
  };

  const handleCommentKeyDown = (e) => {
    if (e.key === "Enter" && commentText.trim() && !loading) {
      handleCreateComment(username);
      setCommentText("");
    }
  };

  const handleOpenEmojiPicker = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseEmojiPicker = () => {
    setAnchorEl(null);
  };

  const handleEmojiSelect = (emoji) => {
    setCommentText((prev) => prev + emoji.native);
    handleCloseEmojiPicker();
  };

  const openEmojiPicker = Boolean(anchorEl);
  const handleUsernameClick = () => {
    if (user) {
      navigate(`/profile/${user}`);
    }
  };

  const handleSelectMap = async () => {
    try {
      const token = localStorage.getItem('token');
      const coordinates = postInfo?.location?.coordinates || {};
      if (!coordinates.lat || !coordinates.lng) {
        alert("This post does not have valid coordinates to select.");
        return;
      }

      const response = await axios.put(
        `${BACKENDURL}/api/posts/${postID}/select`,
        { coordinates },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        setIsUserSelected(!isUserSelected);
        if (onSelect) onSelect();
      }
    } catch (error) {
      console.error('Error updating post selection:', error.response?.data || error.message);
      alert('Failed to update selection');
    }
  };

  const handleShowDirections = () => {
    if (!postInfo || !postInfo.location?.coordinates) {
      alert("This post does not have location coordinates to show directions.");
      return;
    }
    const { lat, lng } = postInfo.location.coordinates;
    if (onSelect) {
      onSelect({ action: "showDirections", coordinates: { lat, lng }, postId: postID });
    }
  };

  // Common footer component for all posts (including comments, tags, and post detail)
  const renderPostFooter = () => (
    <div className="post__footer">
      <div className="post_footerIcons">
        <div className="post__iconsMain">
          {liked ? (
            <FavoriteIcon className="postIcon liked" onClick={handleLike} color="error" />
          ) : (
            <FavoriteBorderIcon className="postIcon" onClick={handleLike} />
          )}
          <ChatBubbleOutlineIcon className="postIcon" onClick={handleOpenPostDetail} />
          <TelegramIcon className="postIcon" onClick={handleOpenShareModal} />
        </div>
        <div className="post_iconSave">
          {isUserSelected ? (
            <MapIcon className="postIcon selected" onClick={handleSelectMap} color="error" />
          ) : (
            <MapOutlinedIcon className="postIcon" onClick={handleSelectMap} />
          )}
          {isSelected ? (
            <RoomIcon className="postIcon selected" onClick={handleShowDirections} color="error" />
          ) : (
            <FmdGoodOutlinedIcon className="postIcon" onClick={handleShowDirections} />
          )}
          {isSaved ? (
            <BookmarkIcon className="postIcon" onClick={handleSavePost} color="primary" />
          ) : (
            <BookmarkBorderIcon className="postIcon" onClick={handleSavePost} />
          )}
        </div>
      </div>
      <span className="post_likes">{likeCount} likes</span>
      <br />
      {rating ? (
        <Stack direction={"row"}>
          <Typography variant="body2" color="text.secondary">
            Rate: {rating}
          </Typography>
          <Rating
            value={rating}
            max={5}
            precision={0.5}
            readOnly
            size="small"
          />
        </Stack>
      ) : (
        <></>
      )}
      <Box sx={{ mt: 1, mb: 1 }}></Box>
      <div className="post__caption">
        <span onClick={handleUsernameClick} style={{ cursor: "pointer" }}>{usernameOfPost} </span>
        {parseContent(content, taggedUsers)}
        <br />
      </div>
      <div className="post__comment">
        <span onClick={handleOpenPostDetail} style={{ cursor: "pointer" }}>
          View all {postComment?.length || 0} comments
        </span>
        <Stack direction="row" sx={{ alignItems: "center", gap: 1, width: "100%" }}>
          <TextField
            inputRef={commentInputRef}
            fullWidth
            variant="standard"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleCommentKeyDown}
            InputProps={{
              disableUnderline: true,
              style: { fontSize: 15 },
            }}
          />
          <IconButton onClick={handleOpenEmojiPicker} sx={{ color: "#rgb(0, 0, 0)" }}>
            <EmojiEmotionsOutlinedIcon sx={{ fontSize: 20 }} />
          </IconButton>
          {commentText.trim() && (
            <IconButton
              onClick={() => {
                handleCreateComment(username);
                setCommentText("");
              }}
              disabled={loading}
              sx={{ color: commentText.trim() ? "#0095f6" : "#b2dffc" }}
            >
              <SendIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
        </Stack>
        <Popover
          open={openEmojiPicker}
          anchorEl={anchorEl}
          onClose={handleCloseEmojiPicker}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <Picker data={data} onEmojiSelect={handleEmojiSelect} />
        </Popover>
      </div>
    </div>
  );

  // Common location display for all posts (including name and address)
  const renderLocation = () => (
    <div className="post__address">
      <FmdGoodOutlinedIcon className="postIcon" color="action" />
      <span>
        {postInfo?.location?.name ? `${postInfo.location.name} - ` : ""}
        {postInfo?.location?.address || address || "Unknown location"}
      </span>
    </div>
  );

  // Common header for all posts
  const renderHeader = () => (
    <div className="post__header">
      <div className="post__headerAuthor">
        <Avatar src={userData?.avatar}>?</Avatar>
        <Typography sx={{ ml: 1, cursor: "pointer" }} onClick={handleUsernameClick}>
          {usernameOfPost}
        </Typography>
        <Typography>
          • {moment(timestamp).fromNow()}
          {is_ad && " • Advertisement"}
        </Typography>
        {currentUserId !== user && !isFollowing && (
          <Typography
            variant="body2"
            className="follow-text"
            onClick={handleFollow}
            sx={{ color: "#0095f6", cursor: "pointer", ml: 1 }}
          >
            Follow
          </Typography>
        )}
      </div>
      <MoreHorizIcon sx={{ cursor: "pointer" }} onClick={() => setDialogOpen(true)} />
    </div>
  );

  // Common image display for all posts
  const renderImages = () => (
    <div className="post__image" style={{ position: "relative" }}>
      {images.length > 0 && (
        <img
          src={images[current]}
          alt={`post-img-${current}`}
          style={{ width: "100%", borderRadius: "10px" }}
        />
      )}
      {images.length > 1 && (
        <>
          <button onClick={prevImage} className="nav-button left">◀</button>
          <button onClick={nextImage} className="nav-button right">▶</button>
        </>
      )}
    </div>
  );

  if (is_voucher && is_ad) {
    return (
      <div className="post">
        {renderHeader()}
        {renderLocation()}
        {renderImages()}
        <div>
          <Card elevation={3} style={{ maxWidth: 600, margin: 'auto' }}>
            <Grid container>
              <Grid
                item
                xs={8}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '16px',
                }}
              >
                <Typography
                  variant="h4"
                  style={{
                    fontFamily: 'Rochester, Arial, sans-serif',
                    fontWeight: 500,
                    marginBottom: 8,
                  }}
                  className="rochester"
                >
                  Voucher
                </Typography>
                <Typography variant="body1">{voucherData?.name}</Typography>
                <Typography variant="body2">
                  Ngày hết hạn: <span style={{ fontWeight: "bold" }}>{new Date(voucherData?.expire_day).toLocaleDateString()}</span>
                </Typography>
                <Typography variant="body2">
                  Số lượng còn: <span style={{ fontWeight: "bold" }}>{voucherData?.in_stock}</span>
                </Typography>
              </Grid>
              <Grid
                item
                xs={4}
                style={{
                  backgroundColor: '#2196F3',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Button
                  variant="text"
                  style={{
                    backgroundColor: '#2196F3',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '20px',
                  }}
                  onClick={handleSelect}
                >
                  Nhận
                </Button>
              </Grid>
            </Grid>
          </Card>
        </div>
        {renderPostFooter()}
        <ShareModal postId={postID} open={shareModalOpen} onClose={handleCloseShareModal} />
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          user={user}
          postImage={images[0]}
          likes={likes}
          caption={content}
          address={postInfo?.location?.address || address}
          timestamp={timestamp}
        />
        <PostOptionsDialog
          user={user}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          postInfo={postInfo}
          onDelete={() => navigate(-1)}
          isFollowing={isFollowing}
        />
      </div>
    );
  } else if (is_voucher && !is_ad) {
    return (
      <div className="post">
        {renderHeader()}
        {renderLocation()}
        {renderImages()}
        <div>
          <Card elevation={3} style={{ maxWidth: 600, margin: 'auto', minHeight: "80px" }}>
            <Grid container>
              <Grid
                item
                xs={8}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '16px',
                }}
              >
                <Typography
                  variant="h4"
                  style={{
                    fontFamily: 'Rochester, Arial, sans-serif',
                    fontWeight: 500,
                    marginBottom: 8,
                  }}
                  className="rochester"
                >
                  Voucher
                </Typography>
                <Typography variant="body1">{voucherData?.name}</Typography>
                <Typography variant="body2">
                  Ngày hết hạn: <span style={{ fontWeight: "bold" }}>{new Date(voucherData?.expire_day).toLocaleDateString()}</span>
                </Typography>
                <Typography variant="body2">
                  Số lượng còn: <span style={{ fontWeight: "bold" }}>{voucherData?.in_stock}</span>
                </Typography>
              </Grid>
              <Grid
                item
                xs={4}
                style={{
                  backgroundColor: '#2196F3',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Button
                  variant="text"
                  style={{
                    backgroundColor: '#2196F3',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '20px',
                    width: "100%",
                    height: "100%"
                  }}
                  onClick={handleSelect}
                >
                  Nhận
                </Button>
              </Grid>
            </Grid>
          </Card>
        </div>
        {renderPostFooter()}
        <ShareModal postId={postID} open={shareModalOpen} onClose={handleCloseShareModal} />
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          user={user}
          postImage={images[0]}
          likes={likes}
          caption={content}
          address={postInfo?.location?.address || address}
          timestamp={timestamp}
        />
        <PostOptionsDialog
          user={user}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          postInfo={postInfo}
          onDelete={() => navigate(-1)}
          isFollowing={isFollowing}
        />
      </div>
    );
  } else if (!is_voucher && is_ad) {
    return (
      <div className="post">
        {renderHeader()}
        {renderLocation()}
        {renderImages()}
        {renderPostFooter()}
        <ShareModal postId={postID} open={shareModalOpen} onClose={handleCloseShareModal} />
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          user={user}
          postImage={images[0]}
          likes={likes}
          caption={content}
          address={postInfo?.location?.address || address}
          timestamp={timestamp}
        />
        <PostOptionsDialog
          user={user}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          postInfo={postInfo}
          onDelete={() => navigate(-1)}
          isFollowing={isFollowing}
        />
      </div>
    );
  } else {
    return (
      <div className="post">
        {renderHeader()}
        {renderLocation()}
        {renderImages()}
        {renderPostFooter()}
        <ShareModal postId={postID} open={shareModalOpen} onClose={handleCloseShareModal} />
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          user={user}
          postImage={images[0]}
          likes={likes}
          caption={content}
          address={postInfo?.location?.address || address}
          timestamp={timestamp}
        />
        <PostOptionsDialog
          user={user}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          postInfo={postInfo}
          onDelete={() => navigate(-1)}
          isFollowing={isFollowing}
        />
      </div>
    );
  }
}

export default Post;