import express, { Router } from 'express';
import { getPublicSettings } from '../controllers/admin/settingsController';

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Public site settings
 */

const router: Router = express.Router();

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Get public site settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Public settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 settings:
 *                   type: object
 *                   properties:
 *                     show_about_page:
 *                       type: boolean
 *                     show_contact_page:
 *                       type: boolean
 *                     site_name:
 *                       type: string
 *                     site_description:
 *                       type: string
 *                     logo_url:
 *                       type: string
 *                     favicon_url:
 *                       type: string
 *                     seo_keywords:
 *                       type: string
 *                     hero_title:
 *                       type: string
 *                     hero_subtitle:
 *                       type: string
 *                     hero_cta_text:
 *                       type: string
 *                     hero_cta_link:
 *                       type: string
 *                     hero_image_url:
 *                       type: string
 *                     footer_text:
 *                       type: string
 *                     footer_links:
 *                       type: array
 *                     social_links:
 *                       type: array
 *                     contact_email:
 *                       type: string
 *                     contact_phone:
 *                       type: string
 *                     contact_address:
 *                       type: string
 *                     contact_form_enabled:
 *                       type: boolean
 *                     loans_enabled:
 *                       type: boolean
 *                     max_concurrent_loans:
 *                       type: integer
 *                     default_loan_duration_days:
 *                       type: integer
 *                     mobile_app_enabled:
 *                       type: boolean
 *                     mobile_app_store_url:
 *                       type: string
 *                     mobile_play_store_url:
 *                       type: string
 */
router.get('/', getPublicSettings);

export default router;
