
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const customersFile = path.join(__dirname, '../data/customers.json');

export const requireCustomerLogin = (req, res, next) => {
    try {
        const token = req.cookies?.customerToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Please log in to continue.',
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'shopsphere_dev_secret_change_this'
        );

        const customers = JSON.parse(
            fs.readFileSync(customersFile, 'utf8')
        );

        const customer = customers.find((item) => item.id === decoded.id);

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Customer account not found.',
            });
        }

        req.customer = {
            id: customer.id,
            name: customer.name,
            email: customer.email,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Your login session is invalid or expired. Please log in again.',
        });
    }
};

export const optionalCustomerLogin = (req, res, next) => {
    try {
        const token = req.cookies?.customerToken;

        if (!token) {
            req.customer = null;
            return next();
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'shopsphere_dev_secret_change_this'
        );

        const customers = JSON.parse(
            fs.readFileSync(customersFile, 'utf8')
        );

        const customer = customers.find(
            (item) => item.id === decoded.id
        );

        req.customer = customer
            ? {
                id: customer.id,
                name: customer.name,
                email: customer.email,
            }
            : null;

        return next();
    } catch (error) {
        req.customer = null;
        return next();
    }
};

