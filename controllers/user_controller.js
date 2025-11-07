const userService = require('../models/services/user_service');
const sessionService = require('../models/services/session_service');
const bcrypt = require('bcrypt');

async function getAllUsers(req, res) {
    try {
        const sessionId = req.cookies.sessionId;
        if (!sessionId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const session = await sessionService.getSessionById(sessionId);
        if (!session) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const username = session.user;
        if (!username) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const users = await userService.getAllUsers();
        res.status(200).json(users); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getUser(req, res) {
    try {
        const user = await userService.getUser(req.params.username);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getUserByEmail(req, res) {
    try {
        const user = await userService.getUserByEmail(req.params.email);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getCurrentUser(req, res) {
    try {
        const sessionId = req.cookies.sessionId;
        if (!sessionId) {
            return res.status(401).json({ error: 'user unauthorized' });
        }
        const session = await sessionService.getSessionById(sessionId);
        if (!session) {
            return res.status(401).json({ error: 'user unauthorized' });
        }
        const username = session.user;
        if (!username) {
            return res.status(401).json({ error: 'user unauthorized' });
        }
        const user = await userService.getUser(username);
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function authenticateUser(req, res) {
    try {
        const user = await userService.getUser(req.body.username);
        let isMatch = false;
        if (user && user.password && req.body && req.body.password) {
            isMatch = await bcrypt.compare(req.body.password, user.password);
        }
        else {
            res.status(401).json({ error: 'Authentication failed' });
        }
        if (isMatch) {
            const session = await sessionService.createSession(user.username);
            res.cookie('sessionId', session.sessionId, {
                sameSite: 'none', // to allow cross-site cookies
                secure: true  // to ensure cookies are only sent over HTTPS
            });
            res.status(200).json({ success: true, message: 'Authentication successful' });
        } 
        else {
            res.status(401).json({ error: 'Authentication failed' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function createUser(req, res) {
    try {
        const isUsernameExist = await userService.getUser(req.body.username);
        if (isUsernameExist) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        const isEmailExist = await userService.getUserByEmail(req.body.email);
        if (isEmailExist) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        const saltRounds = 10; // number of salt rounds for bcrypt hashing
        if (!req.body.password) {
            return res.status(400).json({ error: 'Password is required' });
        }
        req.body.password = await bcrypt.hash(req.body.password, saltRounds);
        await userService.createUser(req.body);
        res.status(200).json({ success: true, message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateUser(req, res) {
    try {
        const user = await userService.updateUser(req.params.username, req.body);
        res.status(200).json(user); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deleteUser(req, res) {
    try {
        await userService.deleteUser(req.params.username);
        res.status(200).json({ message: 'User deleted' }); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { 
    getAllUsers,
    getUser, 
    getUserByEmail,
    getCurrentUser, 
    authenticateUser, 
    createUser,
    updateUser,
    deleteUser
};
