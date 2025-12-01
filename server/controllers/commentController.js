import {
    getAllComments,
    getCommentById,
    createComment,
    addReplyToComment,
    toggleCommentLike,
    toggleReplyLike
} from '../models/commentStore.js';

// @desc    Get all comments
// @route   GET /api/comments
export const getComments = (req, res) => {
    const comments = getAllComments();
    res.json(comments);
};

// @desc    Create a new comment
// @route   POST /api/comments
export const postComment = (req, res) => {
    const { text, username } = req.body;
    const newComment = createComment(text, username);
    res.status(201).json(newComment);
};

// @desc    Add a reply to a comment
// @route   POST /api/comments/:id/reply
export const postReply = (req, res) => {
    const { id } = req.params;
    const { text, username, replyToUser } = req.body;

    const comment = getCommentById(id);
    if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
    }

    const newReply = addReplyToComment(id, text, username, replyToUser);
    res.status(201).json(newReply);
};

// @desc    Toggle like on a comment
// @route   POST /api/comments/:id/like
export const likeComment = (req, res) => {
    const { id } = req.params;
    const { visitorId } = req.body;

    const result = toggleCommentLike(id, visitorId);
    if (!result) {
        return res.status(404).json({ error: 'Comment not found' });
    }

    res.json(result);
};

// @desc    Toggle like on a reply
// @route   POST /api/comments/:commentId/reply/:replyId/like
export const likeReply = (req, res) => {
    const { commentId, replyId } = req.params;
    const { visitorId } = req.body;

    const result = toggleReplyLike(commentId, replyId, visitorId);
    if (result.error) {
        return res.status(404).json({ error: result.error });
    }

    res.json(result);
};
