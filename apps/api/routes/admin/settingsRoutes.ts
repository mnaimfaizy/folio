import express, { Router } from 'express';
import { authenticate, isAdmin } from '../../middleware/auth';
import {
  getSettings,
  updateSettings,
  sendTestEmail,
} from '../../controllers/admin/settingsController';

/**
 * @swagger
 * tags:
 *   name: Admin Settings
 *   description: Site settings management (admin only)
 */

const router: Router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

/**
 * @swagger
 * /admin/settings:
 *   get:
 *     summary: Get all site settings
 *     tags: [Admin Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get('/', getSettings);

/**
 * @swagger
 * /admin/settings:
 *   put:
 *     summary: Update site settings
 *     tags: [Admin Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               show_about_page:
 *                 type: boolean
 *               show_contact_page:
 *                 type: boolean
 *               site_name:
 *                 type: string
 *               site_description:
 *                 type: string
 *               logo_url:
 *                 type: string
 *               favicon_url:
 *                 type: string
 *               seo_keywords:
 *                 type: string
 *               hero_title:
 *                 type: string
 *               hero_subtitle:
 *                 type: string
 *               hero_cta_text:
 *                 type: string
 *               hero_cta_link:
 *                 type: string
 *               hero_image_url:
 *                 type: string
 *               footer_text:
 *                 type: string
 *               footer_links:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                     url:
 *                       type: string
 *               social_links:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     platform:
 *                       type: string
 *                     url:
 *                       type: string
 *               contact_email:
 *                 type: string
 *               contact_phone:
 *                 type: string
 *               contact_address:
 *                 type: string
 *               contact_form_enabled:
 *                 type: boolean
 *               smtp_enabled:
 *                 type: boolean
 *               smtp_from_name:
 *                 type: string
 *               smtp_from_email:
 *                 type: string
 *               email_test_rate_limit:
 *                 type: integer
 *               mobile_app_enabled:
 *                 type: boolean
 *               mobile_api_base_url:
 *                 type: string
 *               mobile_app_store_url:
 *                 type: string
 *               mobile_play_store_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.put('/', updateSettings);

/**
 * @swagger
 * /admin/settings/test-email:
 *   post:
 *     summary: Send a test email to the current admin
 *     tags: [Admin Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test email sent successfully
 *       429:
 *         description: Rate limit exceeded
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.post('/test-email', sendTestEmail);

export default router;
