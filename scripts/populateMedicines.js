const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');

const medicines = [
    {
        genericName: 'Atorvastatin',
        brandNames: ['Lipitor'],
        therapeuticUse: 'Hyperlipidemia',
        category: 'Heart',
        price: 150,
        requiresPrescription: true,
        description: 'Used to treat high cholesterol and triglyceride levels.',
        sideEffects: ['Muscle pain', 'Liver problems', 'Digestive problems'],
        dosage: '10-80 mg once daily',
        manufacturer: 'Pfizer',
        image: '/images/medicines/lipitor.jpg'
    },
    {
        genericName: 'Metformin',
        brandNames: ['Glucophage'],
        therapeuticUse: 'Type 2 Diabetes',
        category: 'Diabetes',
        price: 120,
        requiresPrescription: true,
        description: 'Controls blood sugar levels in type 2 diabetes.',
        sideEffects: ['Nausea', 'Diarrhea', 'Loss of appetite'],
        dosage: '500-2000 mg daily',
        manufacturer: 'Bristol Myers Squibb',
        image: '/images/medicines/glucophage.jpg'
    },
    // Add more medicines from the list...
];

async function populateDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        await Medicine.deleteMany({}); // Clear existing medicines
        await Medicine.insertMany(medicines);
        console.log('Database populated successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error populating database:', error);
        process.exit(1);
    }
}

populateDatabase(); 