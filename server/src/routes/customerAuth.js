
import express from 'express';
import {
    registerCustomer,
    loginCustomer,
} from '../controllers/customerAuthController.js';
import { requireCustomerLogin } from '../middleware/customerAuthMiddleware.js';

const router = express.Router();

router.post('/signup', registerCustomer);
router.post('/login', loginCustomer);

router.get('/me', requireCustomerLogin, (req, res) => {
    res.json({
        success: true,
        customer: req.customer,
    });
});

router.post('/logout', (req, res) => {
    res.clearCookie('customerToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });

    res.json({
        success: true,
        message: 'Logged out successfully.',
    });
});

export default router;
