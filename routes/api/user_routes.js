const express = require('express');
const router = express.Router();  // create a router instance
const userController = require('../../controllers/user_controller');

router.get('/all', userController.getAllUsers);
router.get('/:username', userController.getUser);
router.get('/:email', userController.getUserByEmail);
router.post('/me', userController.getCurrentUser);
router.post('/has-active-session', userController.hasActiveSession);
router.post('/authenticate', userController.authenticateUser);
router.post('/logout', userController.logoutUser);
router.post('/create', userController.createUser);
router.put('/:username', userController.updateUser);
router.delete('/:username', userController.deleteUser);

module.exports = router;
