const ForumPost = require("../models/forumPost.model");

exports.getPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find()
      .populate("author", "name")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res
      .status(500)
      .json({ message: "Error fetching posts", error: err.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await ForumPost.findById(postId)
      .populate("author", "name")
      .populate("replies.author", "name");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    console.error("Error fetching post:", err);
    res
      .status(500)
      .json({ message: "Error fetching post", error: err.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }
    const newPost = new ForumPost({
      author: req.user.userId,
      title,
      content,
    });
    await newPost.save();
    const populatedPost = await ForumPost.findById(newPost._id).populate(
      "author",
      "name"
    );
    res.status(201).json(populatedPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res
      .status(500)
      .json({ message: "Error creating post", error: err.message });
  }
};

exports.createReply = async (req, res) => {
  try {
    const { postId } = req.params;
    const reply = {
      author: req.user.userId,
      content: req.body.content,
    };
    const updatedPost = await ForumPost.findByIdAndUpdate(
      postId,
      { $push: { replies: reply } },
      { new: true }
    )
      .populate("replies.author", "name")
      .populate("author", "name");
    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    const populatedReply = updatedPost.replies[updatedPost.replies.length - 1];
    res.status(201).json(populatedReply);
  } catch (err) {
    console.error("Error creating reply:", err);
    res
      .status(500)
      .json({ message: "Error creating reply", error: err.message });
  }
};
