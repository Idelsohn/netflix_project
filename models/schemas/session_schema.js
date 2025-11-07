const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    sessionId: {
        type: Number,
        required: true,
        unique: true
    },
    user: {
        type: String,
        required: true
    },
    expiryDate: {
        type: Date,
        default: Date.now() + 36000000 // 10 hours from creation
    }
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
