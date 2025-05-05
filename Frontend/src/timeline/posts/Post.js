import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, Button, Rating, Box, Chip, Stack, TextField, IconButton, Typography, Popover } from "@mui/material";
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
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import SendIcon from "@mui/icons-material/Send";
import Grid from "@mui/material/Grid";
import Modal from "../../components/Modal";
import RoomIcon from "@mui/icons-material/Room";
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
const VOUCHER_API_URL = "http://localhost:5000/api/vouchers";

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
  const posts = useSelector((state) => state.posts.posts || []);
  const postInfo = posts.find((post) => post._id === postID);
  const currentUserId = currentUser?._id;
  const username = currentUser?.username || "Unknown";
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [voucherData, setVoucherData] = useState(null);
  const [current, setCurrent] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // State cho Popover
  const [dialogOpen, setDialogOpen] = useState(false);
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
      axios.get(`http://localhost:5000/api/vouchers/voucher_detail/${voucher_id}`)
        .then(res => {
          console.log("Dữ liệu voucher từ API:", res.data);
          setVoucherData(res.data);
        })
        .catch(err => console.error("Lỗi khi lấy thông tin voucher:", err));
    }
  }, [is_voucher, voucher_id]);

  useEffect(() => {
    if (user && currentUserId) {
      // Lấy thông tin user
      axios.get(`http://localhost:5000/api/userRoutes/${user}`)
        .then(res => {
          console.log("Dữ liệu user nhận được:", res.data);
          setUserData(res.data);
        })
        .catch(err => {
          console.error("Lỗi khi lấy dữ liệu user:", err);
          console.log("Lỗi chi tiết:", err.response?.data);
        });

      // Kiểm tra trạng thái follow
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
        const response = await axios.get(`http://localhost:5000/api/posts/info/${postID}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("voucher:", response.data);
        setVoucherSelected(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchPost();
  }, [postID]);

  const handleSelect = async () => {
    try {
      console.log("Voucher selected:", voucherSelected.voucher_id);
      const response = await axios.post(`${VOUCHER_API_URL}/${userId}/collect/${voucherSelected.voucher_id}`);
      if (response.status === 200) {
        alert("Voucher selected successfully!");
      }
    } catch (error) {
      console.error("Error collected voucher:", error);
      alert("Failed to collect voucher");
    }
  };

  const handleCommentKeyDown = (e) => {
    if (e.key === "Enter" && commentText.trim() && !loading) {
      handleCreateComment(username);
      setCommentText("");
    }
  };
  // Xử lý mở/đóng emoji picker
  const handleOpenEmojiPicker = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseEmojiPicker = () => {
    setAnchorEl(null);
  };

  // Xử lý chọn emoji
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
  if (is_voucher && is_ad) {
    return (
      <div className="post">
        <div className="post__header">
          <div className="post__headerAuthor">
            <Avatar src={userData?.avatar}>?</Avatar>
            <span>{usernameOfPost}</span>
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
            <span> • {moment(timestamp).fromNow()} • Advertisement</span>
          </div>
          <MoreHorizIcon />
        </div>
        <div className="post__address">
          <FmdGoodOutlinedIcon className="postIcon" color="action" />
          <span>{address}</span>
        </div>
        <div className="post__image" style={{ position: "relative" }}>
          <img
            src={images[current]}
            alt={`post-img-${current}`}
            style={{ width: "100%", borderRadius: "10px" }}
          />
          {images.length > 1 && (
            <>
              <button onClick={prevImage} className="nav-button left">◀</button>
              <button onClick={nextImage} className="nav-button right">▶</button>
            </>
          )}
        </div>
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
                <Typography variant="body2">Ngày hết hạn: <span style={{ fontWeight: "bold" }}>{new Date(voucherData?.expire_day).toLocaleDateString()}</span></Typography>
                <Typography variant="body2">Số lượng còn: <span style={{ fontWeight: "bold" }}>{voucherData?.in_stock}</span></Typography>
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
        <div className="post__footer">
          <div className="post_footerIcons">
            <div className="post__iconsMain">
              {liked ? (
                <FavoriteIcon className="postIcon liked" onClick={handleLike} color="error" />
              ) : (
                <FavoriteBorderIcon className="postIcon" onClick={handleLike} />
              )}
              <ChatBubbleOutlineIcon className="postIcon" />
              <TelegramIcon className="postIcon" />
            </div>
            <div className="post_iconSave">
              <MapOutlinedIcon className="postIcon" />
              {isSelected ? (
                <RoomIcon className="postIcon selected" onClick={onSelect} color="error" />
              ) : (
                <FmdGoodOutlinedIcon className="postIcon" onClick={onSelect} />
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
          <div className="post__caption">
            <span>{usernameOfPost} </span> {content}
          </div>
          <div className="post__comment">
            <span onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>View all 13,384 comments</span>
            {open && <Modal
              open={open}
              onClose={() => setOpen(false)}
              user={user}
              postImage={images[0]}
              likes={likes}
              caption={content}
              address={address}
              timestamp={timestamp}
            />}
            <div className="comment">
              <Stack direction="row" sx={{ alignItems: "center", gap: 1, width: "100%" }}>
                <Avatar src={currentUser?.avatar || ""} sx={{ width: 32, height: 32 }} />
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
                    style: { fontSize: 14 },
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      padding: "0 8px",
                    },
                  }}
                />
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
            </div>
          </div>
        </div>
      </div>
    );
  } else if (is_voucher && !is_ad) {
    return (
      <div className="post">
        <div className="post__header">
          <div className="post__headerAuthor">
            <Avatar src={userData?.avatar}>?</Avatar>
            <span>{usernameOfPost}</span>
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
            <span> • {moment(timestamp).fromNow()}</span>
          </div>
          <MoreHorizIcon />
        </div>
        <div className="post__address">
          <FmdGoodOutlinedIcon className="postIcon" color="action" />
          <span>{address}</span>
        </div>
        <div className="post__image" style={{ position: "relative" }}>
          <img
            src={images[current]}
            alt={`post-img-${current}`}
            style={{ width: "100%", borderRadius: "10px" }}
          />
          {images.length > 1 && (
            <>
              <button onClick={prevImage} className="nav-button left">◀</button>
              <button onClick={nextImage} className="nav-button right">▶</button>
            </>
          )}
        </div>
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
                <Typography variant="body2">Ngày hết hạn: <span style={{ fontWeight: "bold" }}>{new Date(voucherData?.expire_day).toLocaleDateString()}</span></Typography>
                <Typography variant="body2">Số lượng còn: <span style={{ fontWeight: "bold" }}>{voucherData?.in_stock}</span></Typography>
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
        <div className="post__footer">
          <div className="post_footerIcons">
            <div className="post__iconsMain">
              {liked ? (
                <FavoriteIcon className="postIcon liked" onClick={handleLike} color="error" />
              ) : (
                <FavoriteBorderIcon className="postIcon" onClick={handleLike} />
              )}
              <TelegramIcon className="postIcon" />
            </div>
            <div className="post_iconSave">
              <MapOutlinedIcon className="postIcon" />
              {isSelected ? (
                <RoomIcon className="postIcon selected" onClick={onSelect} color="error" />
              ) : (
                <FmdGoodOutlinedIcon className="postIcon" onClick={onSelect} />
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
          <div className="post__caption">
            <span>{usernameOfPost} </span> {content}
          </div>
          {/* <div className="post__comment">
            <span onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>View all 13,384 comments</span>
            {open && <Modal
              open={open}
              onClose={() => setOpen(false)}
              user={user}
              postImage={images[0]}
              likes={likes}
              caption={content}
              address={address}
              timestamp={timestamp}
            />}
            <div className="comment">
              <Stack direction="row" sx={{ alignItems: "center", gap: 1, width: "100%" }}>
                <Avatar src={currentUser?.avatar || ""} sx={{ width: 32, height: 32 }} />
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
                    style: { fontSize: 14 },
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      padding: "0 8px",
                    },
                  }}
                />
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
            </div>
          </div> */}
        </div>
      </div>
    );
  } else if (!is_voucher && is_ad) {
    return (
      <div className="post">
        <div className="post__header">
          <div className="post__headerAuthor">
            <Avatar src={userData?.avatar}>?</Avatar>
            <span>{usernameOfPost}</span>
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
            <span> • {moment(timestamp).fromNow()} • Advertisement</span>
            <br />
          </div>
          <MoreHorizIcon />
        </div>
        <div className="post__address">
          <FmdGoodOutlinedIcon className="postIcon" color="action" />
          <span>{address}</span>
        </div>
        <div className="post__image" style={{ position: "relative" }}>
          <img
            src={images[current]}
            alt={`post-img-${current}`}
            style={{ width: "100%", borderRadius: "10px" }}
          />
          {images.length > 1 && (
            <>
              <button onClick={prevImage} className="nav-button left">◀</button>
              <button onClick={nextImage} className="nav-button right">▶</button>
            </>
          )}
        </div>
        <div className="post__footer">
          <div className="post_footerIcons">
            <div className="post__iconsMain">
              {liked ? (
                <FavoriteIcon className="postIcon liked" onClick={handleLike} color="error" />
              ) : (
                <FavoriteBorderIcon className="postIcon" onClick={handleLike} />
              )}
              <ChatBubbleOutlineIcon className="postIcon" />
              <TelegramIcon className="postIcon" />
            </div>
            <div className="post_iconSave">
              <MapOutlinedIcon className="postIcon" />
              {isSelected ? (
                <RoomIcon className="postIcon selected" onClick={onSelect} color="error" />
              ) : (
                <FmdGoodOutlinedIcon className="postIcon" onClick={onSelect} />
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
          <div className="post__caption">
            <span>{usernameOfPost} </span> {content}
          </div>
          <div className="post__comment">
            <span onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>View all 13,384 comments</span>
            {open && <Modal
              open={open}
              onClose={() => setOpen(false)}
              user={user}
              postImage={images[0]}
              likes={likes}
              caption={content}
              address={address}
              timestamp={timestamp}
            />}
            <div className="comment">
              <Stack direction="row" sx={{ alignItems: "center", gap: 1, width: "100%" }}>
                <Avatar src={currentUser?.avatar || ""} sx={{ width: 32, height: 32 }} />
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
                    style: { fontSize: 14 },
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      padding: "0 8px",
                    },
                  }}
                />
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
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="post">
        <div className="post__header">
          <div className="post__headerAuthor">
            <Avatar src={userData?.avatar}>?</Avatar>
            <Typography sx ={{ml:1, cursor:"pointer"}} onClick={handleUsernameClick}>
                {usernameOfPost}
            </Typography>
            <Typography> • {moment(timestamp).fromNow()}</Typography>
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
        <div className="post__address">
          <FmdGoodOutlinedIcon className="postIcon" color="action" />
          <span>{address}</span>
        </div>
        <div className="post__image">
          <img src={images} alt="" />
        </div>
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
              <MapOutlinedIcon className="postIcon" />
              {isSelected ? (
                <RoomIcon className="postIcon selected" onClick={onSelect} color="error" />
              ) : (
                <FmdGoodOutlinedIcon className="postIcon" onClick={onSelect} />
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
            <span onClick={handleUsernameClick} style={{cursor:"pointer"}}>{usernameOfPost} </span>
            {parseContent(content, taggedUsers)}
            <br />
          </div>
          <div className="post__comment">
            <span onClick={handleOpenPostDetail} style={{ cursor: "pointer" }}>
              View all {postComment?.length} comments
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
        <br />
        <ShareModal postId={postID} open={shareModalOpen} onClose={handleCloseShareModal} />
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