
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const customersFile = path.join(__dirname, '../data/customers.json');

const readCustomers = () => {
    if (!fs.existsSync(customersFile)) {
        fs.writeFileSync(customersFile, '[]');
    }
    return JSON.parse(fs.readFileSync(customersFile, 'utf8'));
};

const saveCustomers = (customers) => {
    fs.writeFileSync(customersFile, JSON.stringify(customers, null, 2));
};

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return { salt, hash };
};

const verifyPassword = (password, salt, expectedHash) => {
    const { hash } = hashPassword(password, salt);
    return crypto.timingSafeEqual(
        Buffer.from(hash, 'hex'),
        Buffer.from(expectedHash, 'hex')
    );
};

export const registerCustomer = (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name?.trim() || !email?.trim() || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email and password are required.',
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least 8 characters.',
            });
        }

        const customers = readCustomers();
        const normalizedEmail = email.trim().toLowerCase();

        if (customers.some((customer) => customer.email === normalizedEmail)) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists.',
            });
        }

        const { salt, hash } = hashPassword(password);

        const customer = {
            id: crypto.randomUUID(),
            name: name.trim(),
            email: normalizedEmail,
            salt,
            passwordHash: hash,
            createdAt: new Date().toISOString(),
        };

        customers.push(customer);
        saveCustomers(customers);

        return res.status(201).json({
            success: true,
            message: 'Account created successfully.',
            customer: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
            },
        });
    } catch (error) {
        console.error('Customer registration error:', error);
        return res.status(500).json({
            success: false,
            message: 'Could not create account.',
        });
    }
};

export const loginCustomer = (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email?.trim() || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.',
            });
        }

        const customers = readCustomers();
        const customer = customers.find(
            (item) => item.email === email.trim().toLowerCase()
        );

        if (
            !customer ||
            !verifyPassword(password, customer.salt, customer.passwordHash)
        ) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }


        const token = jwt.sign(
            { id: customer.id },
            process.env.JWT_SECRET || 'shopsphere_dev_secret_change_this',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.cookie('customerToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            customer: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
            },
        });

    } catch (error) {
        console.error('Customer login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Could not log in.',
        });
    }
};
