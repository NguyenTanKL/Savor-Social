import React from 'react';
import { Link } from 'react-router-dom'; // Giả sử bạn dùng react-router để điều hướng

const parseContent = (content, taggedUsers) => {
  // Nếu không có nội dung, trả về chuỗi rỗng
  if (!content) return '';
  // Tạo một map từ userId sang username để tra cứu nhanh
  const userMap = taggedUsers.reduce((map, user) => {
    map[user._id] = user.username;
    return map;
  }, {});

  // Tách nội dung thành các phần (text, mention, hashtag)
  const parts = [];
  let lastIndex = 0;
  const regex = /(@\[([^\]]+)\]\(([^)]+)\))|(#[^\s#]+)/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const matchText = match[0];
    const startIndex = match.index;

    // Thêm phần text trước match (nếu có)
    if (startIndex > lastIndex) {
      parts.push(content.slice(lastIndex, startIndex));
    }

    if (matchText.startsWith('@')) {
      // Xử lý mention: @[username](id)
      const userId = match[3]; // ID từ mention
      const username = userMap[userId] || match[2]; // Lấy username từ taggedUsers, nếu không có thì dùng username trong mention
      parts.push(
        <Link
          key={`mention-${userId}-${startIndex}`}
          to={`/profile/${userId}`} // Điều hướng đến trang profile
          style={{ color: '#3897f0', textDecoration: 'none', fontWeight: 'bold' }}
        >
          @{username}
        </Link>
      );
    } else if (matchText.startsWith('#')) {
      // Xử lý hashtag: #tag
      const tag = matchText.slice(1);
      parts.push(
        <Link
          key={`hashtag-${tag}-${startIndex}`}
          to={`/explore/${tag}`} // Điều hướng đến trang tìm kiếm hashtag
          style={{ color: '#3897f0', textDecoration: 'none', fontWeight: 'bold' }}
        >
          #{tag}
        </Link>
      );
    }

    lastIndex = startIndex + matchText.length;
  }

  // Thêm phần text còn lại sau match cuối cùng (nếu có)
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts;
};

export default parseContent;