const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [Number] // [longitude, latitude]
    },
    contact: {
        phone: String,
        email: String
    },
    isOpen: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        default: 0
    },
    inventory: [{
        medicine: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Medicine'
        },
        quantity: Number,
        price: Number
    }]
});

storeSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Store', storeSchema); 