const express = require("express")
const {getTags, addTag} = require("../controllers/tagController.js")
const userAuth = require("../middlewares/authMiddleware.js")
const router = express.Router();
router.get('/',userAuth,getTags);
router.post('/',userAuth, addTag);
module.exports =  router;