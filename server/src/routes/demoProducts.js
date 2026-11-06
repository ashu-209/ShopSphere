
import express from 'express';
import products from '../data/products.js';

const router = express.Router();

// GET all products with optional search and filters
router.get('/', (req, res) => {
    const search = String(req.query.search || '').trim().toLowerCase();
    const category = String(req.query.category || '').trim();
    const minRating = Number(req.query.minRating ?? 0);

    if (!Number.isFinite(minRating) || minRating < 0 || minRating > 5) {
        return res.status(400).json({
            success: false,
            message: 'minRating must be between 0 and 5'
        });
    }

    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            product.name.toLowerCase().includes(search) ||
            product.category.toLowerCase().includes(search) ||
            product.description.toLowerCase().includes(search);

        const matchesCategory =
            !category || category.toLowerCase() === 'all' ||
            product.category.toLowerCase() === category.toLowerCase();

        const matchesRating = product.rating >= minRating;

        return matchesSearch && matchesCategory && matchesRating;
    });

    res.status(200).json({
        success: true,
        count: filteredProducts.length,
        products: filteredProducts
    });
});

// GET a single product by ID
router.get('/:id', (req, res) => {
    const product = products.find(
        item => item._id === req.params.id
    );

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    res.status(200).json({
        success: true,
        product
    });
});

export default router;
