const mongoose = require('mongoose');

const savedContentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    profileId: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    contentId: {
        type: Number,
        required: true,
        index: true
    },
    savedAt: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['liked', 'bookmarked', 'watchlist'],
        default: 'liked'
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
    indexes: [
        { userId: 1, profileId: 1 },
        { contentId: 1 },
        { userId: 1, profileId: 1, type: 1 },
        { savedAt: -1 }
    ]
});

// Compound unique index to prevent duplicate saved items
savedContentSchema.index(
    { userId: 1, profileId: 1, contentId: 1, type: 1 }, 
    { unique: true }
);

// Static method to find user's saved content
savedContentSchema.statics.findUserSavedContent = function(userId, profileId, type = null) {
    const query = { userId, profileId };
    if (type) {
        query.type = type;
    }
    return this.find(query).sort({ savedAt: -1 });
};

// Static method to check if content is saved by user
savedContentSchema.statics.isContentSaved = function(userId, profileId, contentId, type = 'liked') {
    return this.findOne({ userId, profileId, contentId, type });
};

// Static method to get user's liked content
savedContentSchema.statics.getUserLikedContent = function(userId, profileId) {
    return this.findUserSavedContent(userId, profileId, 'liked');
};

// Static method to get user's watchlist
savedContentSchema.statics.getUserWatchlist = function(userId, profileId) {
    return this.findUserSavedContent(userId, profileId, 'watchlist');
};

// Static method to get user's bookmarked content
savedContentSchema.statics.getUserBookmarkedContent = function(userId, profileId) {
    return this.findUserSavedContent(userId, profileId, 'bookmarked');
};

// Static method to toggle saved content
savedContentSchema.statics.toggleSavedContent = async function(userId, profileId, contentId, type = 'liked', notes = '') {
    const existingSave = await this.findOne({ userId, profileId, contentId, type });
    
    if (existingSave) {
        // Remove if exists
        await this.deleteOne({ _id: existingSave._id });
        return { action: 'removed', saved: false };
    } else {
        // Add if doesn't exist
        const newSave = new this({
            userId,
            profileId,
            contentId,
            type,
            notes,
            savedAt: new Date()
        });
        await newSave.save();
        return { action: 'added', saved: true, data: newSave };
    }
};

// Instance method to update notes
savedContentSchema.methods.updateNotes = function(notes) {
    this.notes = notes;
    return this.save();
};

const SavedContent = mongoose.model('SavedContent', savedContentSchema);
module.exports = SavedContent;