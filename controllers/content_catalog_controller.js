const contentCatalogService = require('../models/services/content_catalog_service');

async function getAllContentCatalog(req, res) {
    try {
        const contentCatalog = await contentCatalogService.getAllContentCatalog();
        res.status(200).json(contentCatalog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function createContent(req, res) {
    try {
        await contentCatalogService.createContent(req.body);
        res.status(200).json({ success: true, message: 'Content created successfully' });
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

async function deleteContent(req, res) {
    try {
        const deletedContent = await contentCatalogService.deleteContent(req.body.id);
        if (!deletedContent){
            return res.status(404).json({ message: 'Content ' + req.body.id + ' not found' });
        }
        res.status(200).json({ message: 'Content deleted' }); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getAllContentCatalog,
    createContent,
    updateLikesOfContent,
    deleteContent
};