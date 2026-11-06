
import express from 'express';
import { createDemoOrder, getDemoOrders } from '../controllers/demoCheckoutController.js';
import {
    optionalCustomerLogin,
    requireCustomerLogin
} from '../middleware/customerAuthMiddleware.js';

const router = express.Router();

router.get('/', requireCustomerLogin, getDemoOrders);
router.post('/', optionalCustomerLogin, createDemoOrder);

export default router;
