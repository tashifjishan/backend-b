const express = require("express");
const Blog = require("../model/blog.model");
const mongoose = require("mongoose");
const Comment = require("../model/Comment.model");
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");
const router = express.Router();

// create a blog post
router.post("/create-post", verifyToken, isAdmin, async (req, res) => {
  try {
    // console.log("Blog data from api", req.body);
    const newPost = new Blog({ ...req.body, author: req.userId });
    await newPost.save();
    res.status(201).send({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    console.error("Error creating post: ", error);
    res.status(500).send({ message: "Error creating post" });
  }
});

// get all blogs
router.get("/", async (req, res) => {
  try {
    const { search, category, location } = req.query;
    console.log(search);

    let query = {};
    if (search) {
      query = {
        ...query,
        $or: [
          { title: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } },
        ],
      };
    }

    if (category) {
      query = {
        ...query,
        category: category,
      };
    }
    if (location) {
      query = {
        ...query,
        location,
      };
    }
    const post = await Blog.find(query)
      .populate("author", "email")
      .sort({ createdAt: -1 });
    res.status(200).send(post);
  } catch (error) {
    console.error("Error creating post: ", error);
    res.status(500).send({ message: "Error creating post" });
  }
});

// get single blog by id
router.get("/:id", async (req, res) => {
  try {
    const postId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).send({ message: "Invalid post ID" });
    }

    const post = await Blog.findById(postId);
    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    // Fetch comments linked to this post
    const comments = await Comment.find({ postId }).populate(
      "user",
      "username email"
    );

    res.status(200).send({
      post,
      comments, // Will return an empty array if no comments exist
    });
  } catch (error) {
    console.error("Error Fetching single post: ", error);
    res.status(500).send({ message: "Error Fetching single post" });
  }
});

// Update a blog post
router.patch("/update-post/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const postId = req.params.id;
    const updatePost = await Blog.findByIdAndUpdate(
      postId,
      {
        ...req.body,
      },
      { new: true }
    );
    if (!updatePost) {
      return res.status(404).send({ message: "Post not found" });
    }
    res.status(200).send({
      message: "Post updated successfully",
      post: updatePost,
    });
  } catch (error) {
    console.error("Error Updating post: ", error);
    res.status(500).send({ message: "Error Updating post" });
  }
});

// Delete a Blog
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Blog.findByIdAndDelete(postId);
    if (!post) {
      return res.status(400).send({ message: "Post not found" });
    }
    // delete related comments
    await Comment.deleteMany({ postId: postId });
    res.status(200).send({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error Deleting post: ", error);
    res.status(500).send({ message: "Error Deleting post" });
  }
});

// Update user role
router.put("/users/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    // Validate the role
    if (!role || (role !== "admin" && role !== "user")) {
      return res.status(400).send({ message: "Invalid role provided" });
    }

    // Find and update the user's role
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true } // Return the updated user document
    );

    if (!updatedUser) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).send({
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).send({ message: "Error updating user role" });
  }
});

//  related Blog
router.get("/related/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send({ message: "Post id is required" });
    }
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(400).send({ message: "Post id is not found" });
    }
    const titleRegex = new RegExp(blog.title.split(" ").join("|"), "i");
    const relatedQuery = {
      _id: { $ne: id }, // exclude the current blog by id
      title: { $regex: titleRegex },
    };
    const relatedPost = await Blog.find(relatedQuery);
    res.status(200).send(relatedPost);
  } catch (error) {
    console.error("Error fetching related post: ", error);
    res.status(500).send({ message: "Error fetching related post" });
  }
});

module.exports = router;
