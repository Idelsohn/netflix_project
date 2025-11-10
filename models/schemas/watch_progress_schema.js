const mongoose = require('mongoose');

const watchProgressSchema = new mongoose.Schema({
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
    episodeId: {
        type: Number,
        required: true,
        default: 1
    },
    currentTime: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    duration: {
        type: Number,
        required: true,
        min: 0
    },
    watchPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    completed: {
        type: Boolean,
        default: false
    },
    lastWatched: {
        type: Date,
        default: Date.now
    },
    deviceInfo: {
        type: String,
        default: 'unknown'
    }
}, {
    timestamps: true,
    indexes: [
        { userId: 1, profileId: 1, contentId: 1, episodeId: 1 },
        { userId: 1, profileId: 1, lastWatched: -1 },
        { contentId: 1, episodeId: 1 }
    ]
});

// Compound unique index to prevent duplicate progress entries
watchProgressSchema.index(
    { userId: 1, profileId: 1, contentId: 1, episodeId: 1 }, 
    { unique: true }
);

// Method to calculate watch percentage
watchProgressSchema.methods.calculateWatchPercentage = function() {
    if (this.duration > 0) {
        this.watchPercentage = Math.round((this.currentTime / this.duration) * 100);
        this.completed = this.watchPercentage >= 90; // Mark as completed at 90%
    }
    return this.watchPercentage;
};

// Static method to find user's progress for specific content
watchProgressSchema.statics.findUserProgress = function(userId, profileId, contentId, episodeId = 1) {
    return this.findOne({ 
        userId, 
        profileId, 
        contentId, 
        episodeId 
    });
};

// Static method to get recent watch history
watchProgressSchema.statics.getRecentHistory = function(userId, profileId, limit = 10) {
    return this.find({ 
        userId, 
        profileId,
        currentTime: { $gt: 120 } // Only show items watched for more than 2 minutes
    })
    .sort({ lastWatched: -1 })
    .limit(limit)
    .populate('contentId');
};

// Pre-save hook to update watch percentage and completion status
watchProgressSchema.pre('save', function(next) {
    this.calculateWatchPercentage();
    this.lastWatched = new Date();
    next();
});

const WatchProgress = mongoose.model('WatchProgress', watchProgressSchema);
module.exports = WatchProgress;