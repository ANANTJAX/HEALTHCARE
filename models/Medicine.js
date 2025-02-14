const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    genericName: {
        type: String,
        required: true,
        index: true
    },
    brandNames: [{
        type: String,
        required: true
    }],
    therapeuticUse: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Pain Relief', 'Diabetes', 'Hypertension', 'Depression', 'Antibiotics', 
               'Heart', 'Allergies', 'Asthma', 'GERD', 'Vitamins']
    },
    requiresPrescription: {
        type: Boolean,
        default: false
    },
    price: {
        type: Number,
        required: true
    },
    image: String,
    description: String,
    sideEffects: [String],
    dosage: String,
    manufacturer: String
});

// Add search index
medicineSchema.index({ 
    genericName: 'text', 
    'brandNames': 'text', 
    therapeuticUse: 'text' 
});

module.exports = mongoose.model('Medicine', medicineSchema); 