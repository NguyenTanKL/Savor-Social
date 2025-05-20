const Tag = require("../../Backend/models/TagsModel")
// Lấy danh sách tất cả tag
const getTags = async (req, res) => {
    try {
      const tags = await Tag.find().lean();
      res.status(200).json(tags.map(tag => tag.name));
    } catch (error) {
      res.status(500).json({ message: "Failed to get tags", error: error.message });
    }
  };
  
  // Thêm tag mới
  const addTag = async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Tag name is required" });
      }
  
      // Kiểm tra và xử lý nếu name là mảng
      let normalizedTag;
      if (Array.isArray(name)) {
        if (name.length === 0) {
          return res.status(400).json({ message: "Tag name array cannot be empty" });
        }
        normalizedTag = name[0].toLowerCase().trim(); // Lấy phần tử đầu tiên nếu là mảng
        console.log("Nhận mảng, lấy phần tử đầu tiên:", normalizedTag);
      } else {
        normalizedTag = name.toLowerCase().trim();
      }
  
      const existingTag = await Tag.findOne({ name: normalizedTag });
      if (existingTag) {
        return res.status(200).json(existingTag.name); // Trả về tag hiện có
      }
  
      const newTag = new Tag({ name: normalizedTag });
      await newTag.save();
      res.status(201).json(newTag.name);
    } catch (error) {
      res.status(500).json({ message: "Failed to add tag", error: error.message });
    }
  };
  module.exports = { getTags, addTag };