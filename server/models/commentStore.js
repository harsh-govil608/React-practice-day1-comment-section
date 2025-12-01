// In-memory data store for comments
// In production, this would be replaced with a database model

const comments = [];

export const getAllComments = () => comments;

export const getCommentById = (id) => comments.find(c => c.id === parseInt(id));

export const createComment = (text, username) => {
    const newComment = {
        id: comments.length + 1,
        text,
        username: username || 'Anonymous',
        likes: 0,
        likedBy: [],
        replies: [],
        timestamp: new Date().toISOString()
    };
    comments.push(newComment);
    return newComment;
};

export const addReplyToComment = (commentId, text, username, replyToUser) => {
    const comment = getCommentById(commentId);
    if (!comment) return null;

    const newReply = {
        id: (comment.replies?.length || 0) + 1,
        text,
        username: username || 'Anonymous',
        replyToUser: replyToUser || null,
        likes: 0,
        likedBy: [],
        timestamp: new Date().toISOString()
    };

    comment.replies = comment.replies || [];
    comment.replies.push(newReply);
    return newReply;
};

export const toggleCommentLike = (commentId, visitorId) => {
    const comment = getCommentById(commentId);
    if (!comment) return null;

    const alreadyLiked = comment.likedBy.includes(visitorId);

    if (alreadyLiked) {
        comment.likedBy = comment.likedBy.filter(v => v !== visitorId);
        comment.likes--;
    } else {
        comment.likedBy.push(visitorId);
        comment.likes++;
    }

    return { ...comment, isLiked: !alreadyLiked };
};

export const toggleReplyLike = (commentId, replyId, visitorId) => {
    const comment = getCommentById(commentId);
    if (!comment) return { error: 'Comment not found' };

    const reply = comment.replies?.find(r => r.id === parseInt(replyId));
    if (!reply) return { error: 'Reply not found' };

    const alreadyLiked = reply.likedBy.includes(visitorId);

    if (alreadyLiked) {
        reply.likedBy = reply.likedBy.filter(v => v !== visitorId);
        reply.likes--;
    } else {
        reply.likedBy.push(visitorId);
        reply.likes++;
    }

    return { ...reply, isLiked: !alreadyLiked };
};

export default {
    getAllComments,
    getCommentById,
    createComment,
    addReplyToComment,
    toggleCommentLike,
    toggleReplyLike
};
