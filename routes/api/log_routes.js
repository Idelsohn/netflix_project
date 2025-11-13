const express = require('express');
const router = express.Router();  // create a router instance
const logController = require('../../controllers/log_controller');

router.post('/create', logController.createLog); // Create a new log

module.exports = router;
