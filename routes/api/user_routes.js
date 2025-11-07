const express = require('express');
const router = express.Router();  // create a router instance
const userController = require('../../controllers/user_controller');

router.get('/all', userController.getAllUsers);
router.get('/:username', userController.getUser);
router.get('/:email', userController.getUserByEmail);
router.get('/me', userController.getCurrentUser);
router.post('/authenticate', userController.authenticateUser);
router.post('/create', userController.createUser);
router.put('/:username', userController.updateUser);
router.delete('/:username', userController.deleteUser);

module.exports = router;
