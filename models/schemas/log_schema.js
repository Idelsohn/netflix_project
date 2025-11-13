const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    }
}, {
    timestamps: true // adds createdAt, updatedAt
});

const Log = mongoose.model('Log', logSchema);
module.exports = Log;
