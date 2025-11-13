const Log = require('../schemas/log_schema');

// Create a new Log
async function createLog(data) {
    const log = new Log(data);
    return await log.save();
}

module.exports = {
    createLog
};
