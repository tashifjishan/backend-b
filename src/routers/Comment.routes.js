// const Comment = require("../model/Comment.model");

const express = require("express");
const Comment = require("../model/Comment.model");

const router = express.Router();

// create a comment

router.post("/post-comment", async (req, res) => {
  try {
    console.log(req.body);
    const newComment = new Comment(req.body);
    await newComment.save();
    res
      .status(200)
      .send({ message: "Comment created successfully", comment: newComment });
  } catch (error) {
    console.error("An error occured while posting new comment", error);
    res
      .status(500)
      .send({ message: "An error occured while posting new comment" });
  }
});

//update a comment
router.put("/edit-comment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedComment = await Comment.findByIdAndUpdate(id, req.body, {
      new: true, // Returns the updated document
      runValidators: true, // Ensures validations are run
    });
    if (!updatedComment) {
      return res.status(404).send({ message: "Comment not found" });
    }
    res.status(200).send({
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    console.error("An error occured while Updating the comment", error);
    res
      .status(500)
      .send({ message: "An error occured while updating the comment" });
  }
});

//delete a comment
router.delete("/delete-comment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedComment = await Comment.findByIdAndDelete(id);
    if (!deletedComment) {
      return res.status(404).send({ message: "Comment not found" });
    }
    res.status(200).send({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("An error occured while deleting the comment", error);
    res
      .status(500)
      .send({ message: "An error occured while deleting the comment" });
  }
});

// get all comments count

router.get("/total-comments", async (req, res) => {
  try {
    const totalComment = await Comment.countDocuments({});
    res.status(200).send({ message: "Total comments count", totalComment });
  } catch (error) {
    console.error("An error occured while getting comment count", error);
    res
      .status(500)
      .send({ message: "An error occured while getting comment count" });
  }
});
module.exports = router;
