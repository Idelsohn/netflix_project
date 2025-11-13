const ContentCatalog = require('../schemas/content_catalog_schema');

async function getAllContentCatalog() {
    const contentCatalog = await ContentCatalog.find({});
    return contentCatalog;
}

async function updateLikesOfContent(id, updatedData){
    return await ContentCatalog.updateOne(
        { id }, 
        { $set: updatedData }
    );
}

module.exports = {
    getAllContentCatalog,
    updateLikesOfContent
};