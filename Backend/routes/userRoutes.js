// routes/userRoutes.js
const express = require("express")
const { getAllUsers, getRestaurants, getNormalUsers, updateUser,followUser,getFollowedUsers, unfollowUser, getFollowing, searchUser, getUserById, getFollowers,checkFollowStatus, removeFollower } = require("../controllers/userController.js")
const userAuth = require("../middlewares/authMiddleware.js")

const router = express.Router();

router.get("/", getAllUsers);
router.get("/restaurants", getRestaurants);
router.get("/normal-users", getNormalUsers);
router.put("/update-user", userAuth, updateUser);
router.post("/follow/:id", userAuth, followUser);
router.get("/followed",userAuth,getFollowedUsers);
router.delete("/unfollow/:id",userAuth,unfollowUser);
router.get("/following/:userId", userAuth, getFollowing);
router.get("/follower/:userId", userAuth, getFollowers);
router.post("/search", searchUser);
router.get("/get-by-id/:userId", getUserById);
router.get("/check-follow/:id",userAuth,checkFollowStatus);
router.delete("/remove-follower/:followerId",userAuth,removeFollower);
module.exports =  router;
