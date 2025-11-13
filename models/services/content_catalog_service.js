const ContentCatalog = require('../schemas/content_catalog_schema');

async function getAllContentCatalog() {
    const contentCatalog = await ContentCatalog.find({});
    return contentCatalog;
}

async function createContent(data) {
    const content = new ContentCatalog(data);
    return await content.save();
}

async function updateLikesOfContent(id, updatedData){
    return await ContentCatalog.updateOne(
        { id }, 
        { $set: updatedData }
    );
}

async function deleteContent(id) {
    return await ContentCatalog.findOneAndDelete({ id });
}

module.exports = {
    getAllContentCatalog,
    createContent,
    updateLikesOfContent,
    deleteContent
};