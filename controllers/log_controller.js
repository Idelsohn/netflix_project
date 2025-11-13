const logService = require('../models/services/log_service');

async function createLog(req, res) {
    try {
        await logService.createLog(req.body);
        res.status(200).json({ success: true, message: 'Log added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    createLog
};