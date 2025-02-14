const express = require('express');
const router = express.Router();
const Store = require('../models/Store');

// Get nearby stores
router.get('/nearby', async (req, res) => {
    try {
        const { lat, lng, maxDistance = 5000 } = req.query;

        const stores = await Store.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(maxDistance)
                }
            }
        });

        res.json(stores);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get store inventory
router.get('/:storeId/inventory', async (req, res) => {
    try {
        const store = await Store.findById(req.params.storeId)
            .populate('inventory.medicine');
        res.json(store.inventory);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router; 