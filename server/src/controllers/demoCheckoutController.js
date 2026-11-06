
import { randomUUID } from 'crypto';
import products from '../data/products.js';
import orders, { saveOrders } from '../data/demoOrders.js';

export const createDemoOrder = (req, res) => {
    const { customerName, customerAddress, items } = req.body;

    if (
        typeof customerName !== 'string' ||
        !customerName.trim() ||
        typeof customerAddress !== 'string' ||
        !customerAddress.trim()
    ) {
        return res.status(400).json({
            success: false,
            message: 'Customer name and address are required.'
        });
    }

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Your order must contain at least one item.'
        });
    }

    const orderItems = [];
    let total = 0;

    for (const item of items) {
        const productId = item.productId;
        const quantity = Number(item.quantity);

        if (
            typeof productId !== 'string' ||
            !Number.isInteger(quantity) ||
            quantity < 1
        ) {
            return res.status(400).json({
                success: false,
                message: 'Each item needs a valid product ID and positive integer quantity.'
            });
        }

        const product = products.find(
            (entry) => entry._id === productId
        );

        if (!product) {
            return res.status(400).json({
                success: false,
                message: `Product ${productId} was not found.`
            });
        }

        const alreadyAdded = orderItems.find(
            (entry) => entry.productId === productId
        );

        const totalQuantity = quantity +
            (alreadyAdded ? alreadyAdded.quantity : 0);

        if (totalQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock for ${product.name}. Available: ${product.stock}.`
            });
        }

        if (alreadyAdded) {
            alreadyAdded.quantity = totalQuantity;
            alreadyAdded.subtotal = product.price * totalQuantity;
        } else {
            orderItems.push({
                productId: product._id,
                name: product.name,
                unitPrice: product.price,
                quantity,
                subtotal: product.price * quantity
            });
        }
    }

    total = orderItems.reduce(
        (sum, item) => sum + item.subtotal,
        0
    );

    const order = {
        orderId: randomUUID(),
        customerId: req.customer?.id || null,
        customerName: customerName.trim(),
        customerAddress: customerAddress.trim(),
        items: orderItems,
        total,
        status: 'placed',
        createdAt: new Date().toISOString()
    };

    orders.push(order);
    saveOrders();

    return res.status(201).json({
        success: true,
        message: 'Demo order placed successfully.',
        order
    });
};


export const getDemoOrders = (req, res) => {
    if (!req.customer) {
        return res.status(401).json({
            success: false,
            message: 'Please log in to view your order history.'
        });
    }

    const customerOrders = orders.filter(
        (order) => order.customerId === req.customer.id
    );

    return res.status(200).json({
        success: true,
        count: customerOrders.length,
        orders: customerOrders
    });
};

