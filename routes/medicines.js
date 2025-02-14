const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const Store = require('../models/Store');
const Order = require('../models/Order');

// Get all medicines
router.get('/', async (req, res) => {
    try {
        const medicines = await Medicine.find();
        res.json(medicines);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Search medicines
router.get('/search', async (req, res) => {
    try {
        const { query, category, location } = req.query;
        let searchQuery = {};

        if (query) {
            searchQuery.$or = [
                { genericName: { $regex: query, $options: 'i' } },
                { brandNames: { $regex: query, $options: 'i' } },
                { therapeuticUse: { $regex: query, $options: 'i' } }
            ];
        }

        if (category) {
            searchQuery.category = category;
        }

        const medicines = await Medicine.find(searchQuery);

        // If location provided, check availability in nearby stores
        if (location) {
            const { lat, lng } = JSON.parse(location);
            const nearbyStores = await Store.find({
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [lng, lat]
                        },
                        $maxDistance: 5000 // 5km radius
                    }
                }
            }).select('inventory');

            // Add availability information to medicines
            const medicinesWithAvailability = medicines.map(medicine => ({
                ...medicine.toObject(),
                availability: nearbyStores.filter(store => 
                    store.inventory.some(item => 
                        item.medicine.equals(medicine._id) && item.quantity > 0
                    )
                ).map(store => ({
                    storeId: store._id,
                    quantity: store.inventory.find(item => 
                        item.medicine.equals(medicine._id)
                    ).quantity
                }))
            }));

            return res.json(medicinesWithAvailability);
        }

        res.json(medicines);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get medicines by category
router.get('/category/:category', async (req, res) => {
    try {
        const medicines = await Medicine.find({ category: req.params.category });
        res.json(medicines);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create order
router.post('/order', async (req, res) => {
    try {
        const { 
            medicines, 
            storeId, 
            deliveryAddress, 
            paymentMethod,
            paymentDetails 
        } = req.body;

        // Validate medicine availability
        const store = await Store.findById(storeId);
        const unavailableMedicines = medicines.filter(med => {
            const inventoryItem = store.inventory.find(item => 
                item.medicine.equals(med.medicineId)
            );
            return !inventoryItem || inventoryItem.quantity < med.quantity;
        });

        if (unavailableMedicines.length > 0) {
            return res.status(400).json({
                message: 'Some medicines are not available',
                medicines: unavailableMedicines
            });
        }

        // Create order
        const order = new Order({
            store: storeId,
            medicines: medicines.map(med => ({
                medicine: med.medicineId,
                quantity: med.quantity,
                price: med.price
            })),
            deliveryAddress,
            paymentMethod,
            paymentDetails,
            status: 'pending'
        });

        await order.save();

        // Update store inventory
        medicines.forEach(async med => {
            await Store.updateOne(
                { 
                    _id: storeId,
                    'inventory.medicine': med.medicineId
                },
                {
                    $inc: {
                        'inventory.$.quantity': -med.quantity
                    }
                }
            );
        });

        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router; 