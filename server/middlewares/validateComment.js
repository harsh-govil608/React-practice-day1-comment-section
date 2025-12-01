// Validation middleware for comments

export const validateCommentBody = (req, res, next) => {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Comment text is required' });
    }

    next();
};

export const validateReplyBody = (req, res, next) => {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Reply text is required' });
    }

    next();
};

export const validateLikeBody = (req, res, next) => {
    const { visitorId } = req.body;

    if (!visitorId || typeof visitorId !== 'string') {
        return res.status(400).json({ error: 'Visitor ID is required' });
    }

    next();
};
