
// routes/authRoutes.js
const express = require("express")
const {registerUser, loginUser, logoutUser, verifyEmail} = require("../controllers/authController.js")
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post('/verify-email', verifyEmail);
module.exports = router;
