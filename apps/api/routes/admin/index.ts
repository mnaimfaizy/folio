import express, { Router } from 'express';
import authorRoutes from './authorRoutes';
import bookRoutes from './bookRoutes';
import loanRoutes from './loanRoutes';
import requestRoutes from './requestRoutes';
import reviewRoutes from './reviewRoutes';
import userRoutes from './userRoutes';
import settingsRoutes from './settingsRoutes';

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative operations for the library API
 */

const router: Router = express.Router();

// Mount admin sub-routes
router.use('/users', userRoutes);
router.use('/books', bookRoutes);
router.use('/authors', authorRoutes);
router.use('/reviews', reviewRoutes);
router.use('/settings', settingsRoutes);
router.use('/loans', loanRoutes);
router.use('/requests', requestRoutes);

// We'll add more admin routes here as we expand functionality
// Example: router.use("/stats", statsRoutes);

export default router;
