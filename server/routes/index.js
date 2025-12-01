import { Router } from 'express';
import commentRoutes from './commentRoutes.js';

const router = Router();

// Mount comment routes
router.use('/comments', commentRoutes);

export default router;
