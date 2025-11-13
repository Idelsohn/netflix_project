const ContentCatalog = require('../schemas/content_catalog_schema');

async function getAllContentCatalog() {
    const contentCatalog = await ContentCatalog.find({});
    return contentCatalog;
}

module.exports = {
    getAllContentCatalog
};