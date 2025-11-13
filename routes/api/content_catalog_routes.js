const express = require('express');
const router = express.Router();  // create a router instance
const contentCatalogController = require('../../controllers/content_catalog_controller');

router.get('/all', contentCatalogController.getAllContentCatalog);
// router.post('/create', contentCatalogController.createContent);
router.put('/update-likes', contentCatalogController.updateLikesOfContent);
// router.delete('/delete', contentCatalogController.deleteContent);

module.exports = router;
