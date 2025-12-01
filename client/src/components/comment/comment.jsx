import React, { useState, useEffect } from 'react';
import axios from "axios";
import './comment.css';

// Generate a unique visitor ID for this browser session
const getVisitorId = () => {
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
        visitorId = 'visitor_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('visitorId', visitorId);
    }
    return visitorId;
};

const Comment = () => {
    const [text, setText] = useState("");
    const [username, setUsername] = useState("");
    const [comments, setComments] = useState([]);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyingToUser, setReplyingToUser] = useState(null);
    const [replyText, setReplyText] = useState("");
    const visitorId = getVisitorId();

    // Fetch all comments from the server
    useEffect(() => {
        fetchComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchComments = () => {
        axios.get("/api/comments").then((response) => {
            const commentsWithLikeStatus = response.data.map(comment => ({
                ...comment,
                isLiked: comment.likedBy?.includes(visitorId) || false,
                replies: (comment.replies || []).map(reply => ({
                    ...reply,
                    isLiked: reply.likedBy?.includes(visitorId) || false
                }))
            }));
            setComments(commentsWithLikeStatus);
        });
    };

    // Handle submit comment
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        axios.post("/api/comments", { text, username: username || 'Anonymous' }).then((response) => {
            setComments([...comments, { ...response.data, isLiked: false, replies: [] }]);
            setText("");
        });
    };

    // Handle like toggle
    const handleLike = async (commentId) => {
        axios.post(`/api/comments/${commentId}/like`, { visitorId }).then((response) => {
            setComments(comments.map(comment =>
                comment.id === commentId
                    ? { ...comment, likes: response.data.likes, isLiked: response.data.isLiked }
                    : comment
            ));
        });
    };

    // Handle reply submit (can reply to comment or to another reply)
    const handleReplySubmit = async (commentId) => {
        if (!replyText.trim()) return;

        axios.post(`/api/comments/${commentId}/reply`, {
            text: replyText,
            username: username || 'Anonymous',
            replyToUser: replyingToUser
        }).then((response) => {
            setComments(comments.map(comment =>
                comment.id === commentId
                    ? {
                        ...comment,
                        replies: [...(comment.replies || []), { ...response.data, isLiked: false }]
                    }
                    : comment
            ));
            setReplyText("");
            setReplyingTo(null);
            setReplyingToUser(null);
        }).catch((error) => {
            console.error('Reply error:', error.response?.data || error.message);
        });
    };

    // Handle clicking reply on a reply
    const handleReplyToReply = (commentId, replyUsername) => {
        setReplyingTo(commentId);
        setReplyingToUser(replyUsername);
        setReplyText("");
    };

    // Handle reply like toggle
    const handleReplyLike = async (commentId, replyId) => {
        axios.post(`/api/comments/${commentId}/reply/${replyId}/like`, { visitorId }).then((response) => {
            setComments(comments.map(comment =>
                comment.id === commentId
                    ? {
                        ...comment,
                        replies: comment.replies.map(reply =>
                            reply.id === replyId
                                ? { ...reply, likes: response.data.likes, isLiked: response.data.isLiked }
                                : reply
                        )
                    }
                    : comment
            ));
        });
    };

    // Format timestamp
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className='comment-container'>
            <h2 className='comment-title'>Comments</h2>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className='comment-form'>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your name (optional)"
                    className='comment-input name-input'
                />
                <div className='comment-input-wrapper'>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Write a comment..."
                        className='comment-input'
                    />
                    <button type="submit" className='comment-submit' disabled={!text.trim()}>
                        Post
                    </button>
                </div>
            </form>

            {/* Comments List */}
            <div className='comments-list'>
                {comments.length === 0 ? (
                    <p className='no-comments'>No comments yet. Be the first to comment!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className='comment-item'>
                            <div className='comment-avatar'>
                                {(comment.username || 'A').charAt(0).toUpperCase()}
                            </div>
                            <div className='comment-content'>
                                <div className='comment-header'>
                                    <span className='comment-username'>{comment.username || 'Anonymous'}</span>
                                    <span className='comment-time'>{formatTime(comment.timestamp)}</span>
                                </div>
                                <p className='comment-text'>{comment.text}</p>
                                <div className='comment-actions'>
                                    <button
                                        className={`like-button ${comment.isLiked ? 'liked' : ''}`}
                                        onClick={() => handleLike(comment.id)}
                                    >
                                        {comment.isLiked ? '❤️' : '🤍'} {comment.likes || 0}
                                    </button>
                                    <button
                                        className='reply-button'
                                        onClick={() => {
                                            if (replyingTo === comment.id && !replyingToUser) {
                                                setReplyingTo(null);
                                            } else {
                                                setReplyingTo(comment.id);
                                                setReplyingToUser(null);
                                                setReplyText("");
                                            }
                                        }}
                                    >
                                        💬 Reply
                                    </button>
                                </div>

                                {/* Reply Input */}
                                {replyingTo === comment.id && (
                                    <div className='reply-form'>
                                        {replyingToUser && (
                                            <div className='replying-to-indicator'>
                                                Replying to <span className='replying-to-user'>@{replyingToUser}</span>
                                                <button
                                                    className='clear-reply-to'
                                                    onClick={() => setReplyingToUser(null)}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )}
                                        <input
                                            type="text"
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder={replyingToUser ? `Reply to @${replyingToUser}...` : "Write a reply..."}
                                            className='reply-input'
                                            autoFocus
                                        />
                                        <div className='reply-form-actions'>
                                            <button
                                                className='reply-cancel'
                                                onClick={() => {
                                                    setReplyingTo(null);
                                                    setReplyingToUser(null);
                                                    setReplyText("");
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                className='reply-submit'
                                                onClick={() => handleReplySubmit(comment.id)}
                                                disabled={!replyText.trim()}
                                            >
                                                Reply
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Replies List */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <div className='replies-list'>
                                        {comment.replies.map((reply) => (
                                            <div key={reply.id} className='reply-item'>
                                                <div className='reply-avatar'>
                                                    {(reply.username || 'A').charAt(0).toUpperCase()}
                                                </div>
                                                <div className='reply-content'>
                                                    <div className='reply-header'>
                                                        <span className='reply-username'>{reply.username || 'Anonymous'}</span>
                                                        <span className='reply-time'>{formatTime(reply.timestamp)}</span>
                                                    </div>
                                                    <p className='reply-text'>
                                                        {reply.replyToUser && (
                                                            <span className='mention'>@{reply.replyToUser} </span>
                                                        )}
                                                        {reply.text}
                                                    </p>
                                                    <div className='reply-actions'>
                                                        <button
                                                            className={`like-button small ${reply.isLiked ? 'liked' : ''}`}
                                                            onClick={() => handleReplyLike(comment.id, reply.id)}
                                                        >
                                                            {reply.isLiked ? '❤️' : '🤍'} {reply.likes || 0}
                                                        </button>
                                                        <button
                                                            className='reply-button small'
                                                            onClick={() => handleReplyToReply(comment.id, reply.username || 'Anonymous')}
                                                        >
                                                            💬 Reply
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Comment;
