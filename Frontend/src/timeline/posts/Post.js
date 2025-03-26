import React, { useState } from "react";
import { Avatar, IconButton } from "@mui/material";
import "./Post.css";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import Telegram from "@mui/icons-material/Telegram";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import SentimentSatisfiedOutlinedIcon from "@mui/icons-material/SentimentSatisfiedOutlined";
import Grid from "@mui/material/Grid";
import ShareModal from "../../components/ShareModal/ShareModal";
import Button from "@mui/material/Button";

function Post({ user, postImage, likes, caption, address, timestamp, is_voucher, is_ad }) {
  const [open, setOpen] = useState(false);

  const renderPostIcons = () => (
    <div className="post_footerIcons">
      <div className="post__iconsMain">
        <FavoriteBorderIcon className="postIcon" />
        <ChatBubbleOutlineIcon className="postIcon" />
        <Telegram className="postIcon" onClick={() => setOpen(true)} style={{ cursor: "pointer" }} />
      </div>
      <div className="post_iconSave">
        <MapOutlinedIcon className="postIcon" />
        <FmdGoodOutlinedIcon className="postIcon" />
        <BookmarkBorderIcon className="postIcon" />
      </div>
    </div>
  );

  const renderPostFooter = () => (
    <div className="post__footer">
      {renderPostIcons()}
      <span className="post_likes">{likes} likes</span>
      <br />
      <div className="post__caption">
        <span>{user} </span> {caption}
      </div>
      <div className="post__comment">
        <span>View all 13,384 comments</span>
        <div className="comment">
          <input placeholder="Add a comment…" />
          <SentimentSatisfiedOutlinedIcon className="postIcon" color="disabled" />
        </div>
      </div>
    </div>
  );

  const renderVoucherCard = () => (
    <div>
      <Card elevation={3} style={{ maxWidth: 600, margin: "auto", minHeight: "80px" }}>
        <Grid container>
          <Grid
            item
            xs={8}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "16px",
            }}
          >
            <Typography
              variant="h4"
              style={{
                fontFamily: "Rochester, Arial, sans-serif",
                fontWeight: 500,
                marginBottom: 8,
              }}
              className="rochester"
            >
              Voucher
            </Typography>
            <Typography variant="body1">Giảm 50% với tất cả món gà</Typography>
            <Typography variant="body2">
              Ngày hết hạn: <span style={{ fontWeight: "bold" }}>31/01/2025</span>
            </Typography>
            <Typography variant="body2">
              Số lượng còn: <span style={{ fontWeight: "bold" }}>36</span>
            </Typography>
          </Grid>
          <Grid
            item
            xs={4}
            style={{
              backgroundColor: "#2196F3",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              variant="text"
              style={{
                backgroundColor: "#2196F3",
                color: "white",
                fontWeight: "bold",
                fontSize: "20px",
                width: "100%",
                height: "100%",
              }}
            >
              Nhận
            </Button>
          </Grid>
        </Grid>
      </Card>
    </div>
  );

  if (is_voucher && is_ad) {
    return (
      <div className="post">
        <div className="post__header">
          <div className="post__headerAuthor">
            <Avatar>{user.charAt(1).toUpperCase()}</Avatar>
            {user} <span> • {timestamp} • Advertisement</span>
          </div>
          <MoreHorizIcon />
        </div>
        <div className="post__address">
          <FmdGoodOutlinedIcon className="postIcon" color="action" />
          <span>{address}</span>
        </div>
        <div className="post__image">
          <img src={postImage} alt="" />
        </div>
        {renderVoucherCard()}
        {renderPostFooter()}
        <ShareModal open={open} onClose={() => setOpen(false)} />
      </div>
    );
  } else if (is_voucher && !is_ad) {
    return (
      <div className="post">
        <div className="post__header">
          <div className="post__headerAuthor">
            <Avatar>{user.charAt(1).toUpperCase()}</Avatar>
            {user} <span> • {timestamp}</span>
          </div>
          <MoreHorizIcon />
        </div>
        <div className="post__address">
          <FmdGoodOutlinedIcon className="postIcon" color="action" />
          <span>{address}</span>
        </div>
        <div className="post__image">
          <img src={postImage} alt="" />
        </div>
        {renderVoucherCard()}
        {renderPostFooter()}
        <ShareModal open={open} onClose={() => setOpen(false)} />
      </div>
    );
  } else if (!is_voucher && is_ad) {
    return (
      <div className="post">
        <div className="post__header">
          <div className="post__headerAuthor">
            <Avatar>{user.charAt(1).toUpperCase()}</Avatar>
            {user} <span> • {timestamp} • Advertisement</span>
            <br />
          </div>
          <MoreHorizIcon />
        </div>
        <div className="post__address">
          <FmdGoodOutlinedIcon className="postIcon" color="action" />
          <span>{address}</span>
        </div>
        <div className="post__image">
          <img src={postImage} alt="" />
        </div>
        {renderPostFooter()}
        <ShareModal open={open} onClose={() => setOpen(false)} />
      </div>
    );
  } else {
    return (
      <div className="post">
        <div className="post__header">
          <div className="post__headerAuthor">
            <Avatar>{user.charAt(1).toUpperCase()}</Avatar>
            {user} <span> • {timestamp}</span>
          </div>
          <MoreHorizIcon />
        </div>
        <div className="post__address">
          <FmdGoodOutlinedIcon className="postIcon" color="action" />
          <span>{address}</span>
        </div>
        <div className="post__image">
          <img src={postImage} alt="" />
        </div>
        {renderPostFooter()}
        <ShareModal open={open} onClose={() => setOpen(false)} />
      </div>
    );
  }
}

export default Post;