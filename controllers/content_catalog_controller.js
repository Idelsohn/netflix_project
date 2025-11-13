const contentCatalogService = require('../models/services/content_catalog_service');

async function getAllContentCatalog(req, res) {
    try {
        const contentCatalog = await contentCatalogService.getAllContentCatalog();
        res.status(200).json(contentCatalog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateLikesOfContent(req, res) {
    try {
        const { id, ...likesData } = req.body;
        const updatedContent = await contentCatalogService.updateLikesOfContent(id, likesData);
        if (!updatedContent) {
            return res.status(404).json({ message: 'content id ' + id + ' not found' });
        }
        res.status(200).json(updatedContent); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getAllContentCatalog,
    updateLikesOfContent
};