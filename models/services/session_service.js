const Session = require('../schemas/session_schema');

// Get session by sessionId
async function getSessionById(sessionId) {
    const session = await Session.findOne({ sessionId });
    return session;
}

// Get latest session by username
async function getSessionByUsername(username) {
    const session = await Session.findOne({ user: username }).sort({ expiryDate: -1 });
    return session;
}

// Create session
async function createSession(username) {
    const maxSessionId = await Session.findOne().sort({ sessionId: -1 }); // Get the session with the highest sessionId
    const session = new Session({ 
        sessionId: maxSessionId ? parseInt(maxSessionId.sessionId) + 1 : 1, 
        user: username, 
        expiryDate: Date.now() + 36000000 
    });
    return await session.save();
}

module.exports = {
    getSessionById,
    getSessionByUsername,
    createSession
}; 
