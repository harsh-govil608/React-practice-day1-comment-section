import { Router } from 'express';
import {
    getComments,
    postComment,
    postReply,
    likeComment,
    likeReply
} from '../controllers/commentController.js';
import {
    validateCommentBody,
    validateReplyBody,
    validateLikeBody
} from '../middlewares/validateComment.js';

const router = Router();

// GET /api/comments - Get all comments
router.get('/', getComments);

// POST /api/comments - Create a new comment
router.post('/', validateCommentBody, postComment);

// POST /api/comments/:id/reply - Add a reply to a comment
router.post('/:id/reply', validateReplyBody, postReply);

// POST /api/comments/:id/like - Toggle like on a comment
router.post('/:id/like', validateLikeBody, likeComment);

// POST /api/comments/:commentId/reply/:replyId/like - Toggle like on a reply
router.post('/:commentId/reply/:replyId/like', validateLikeBody, likeReply);

export default router;
