const contentCatalogService = require('../models/services/content_catalog_service');

async function getAllContentCatalog(req, res) {
    try {
        const contentCatalog = await contentCatalogService.getAllContentCatalog();
        res.status(200).json(contentCatalog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getAllContentCatalog
};