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
        default: Date.now() + 86400000 // 1 day from the time of creation
    }
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
