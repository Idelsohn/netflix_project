const mongoose = require('mongoose');

const videoSourcesSchema = new mongoose.Schema({
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
    videoUrl: {
        type: String,
        required: true,
        trim: true
    },
    sourceType: {
        type: String,
        required: true,
        enum: ['youtube', 'vimeo', 'direct_mp4', 'google_cloud'],
        default: 'google_cloud'
    },
    videoId: {
        type: String,
        required: false,
        trim: true
    },
    quality: {
        type: String,
        enum: ['360p', '480p', '720p', '1080p', '1440p', '4k'],
        default: '720p'
    },
    duration: {
        type: Number,
        required: true,
        min: 0
    },
    thumbnailUrl: {
        type: String,
        required: false,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    metadata: {
        title: String,
        description: String,
        uploadDate: Date,
        tags: [String]
    },
    apiResponse: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true,
    indexes: [
        { contentId: 1, episodeId: 1 },
        { sourceType: 1, isActive: 1 },
        { videoId: 1 }
    ]
});

// Compound index for quick lookups
videoSourcesSchema.index(
    { contentId: 1, episodeId: 1, sourceType: 1 }
);

// Method to extract video ID from URL
videoSourcesSchema.methods.extractVideoId = function() {
    let videoId = null;
    
    switch (this.sourceType) {
        case 'youtube':
            const youtubeMatch = this.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
            videoId = youtubeMatch ? youtubeMatch[1] : null;
            break;
            
        case 'vimeo':
            const vimeoMatch = this.videoUrl.match(/vimeo\.com\/([0-9]+)/);
            videoId = vimeoMatch ? vimeoMatch[1] : null;
            break;
            
        case 'direct_mp4':
        case 'google_cloud':
            videoId = this.videoUrl.split('/').pop().split('.')[0];
            break;
    }
    
    if (videoId && !this.videoId) {
        this.videoId = videoId;
    }
    
    return videoId;
};

// Method to generate embed URL
videoSourcesSchema.methods.getEmbedUrl = function() {
    switch (this.sourceType) {
        case 'youtube':
            const youtubeId = this.videoId || this.extractVideoId();
            return `https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&origin=${process.env.CLIENT_URL || 'http://localhost:5500'}`;
            
        case 'vimeo':
            const vimeoId = this.videoId || this.extractVideoId();
            return `https://player.vimeo.com/video/${vimeoId}?api=1&player_id=vimeo_player`;
            
        case 'direct_mp4':
        case 'google_cloud':
        default:
            return this.videoUrl;
    }
};

// Method to validate video URL format
videoSourcesSchema.methods.validateUrl = function() {
    const urlPatterns = {
        youtube: /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/).+$/,
        vimeo: /^(https?:\/\/)?(www\.)?vimeo\.com\/[0-9]+$/,
        direct_mp4: /^https?:\/\/.+\.(mp4|webm|ogg)(\?.*)?$/i,
        google_cloud: /^https:\/\/commondatastorage\.googleapis\.com\/.+$/
    };
    
    const pattern = urlPatterns[this.sourceType];
    return pattern ? pattern.test(this.videoUrl) : false;
};

// Static method to find active videos for content
videoSourcesSchema.statics.findActiveVideos = function(contentId, episodeId = null) {
    const query = { contentId, isActive: true };
    if (episodeId !== null) {
        query.episodeId = episodeId;
    }
    return this.find(query).sort({ quality: -1, createdAt: -1 });
};

// Static method to find best quality video
videoSourcesSchema.statics.findBestQuality = function(contentId, episodeId = 1) {
    const qualityOrder = ['4k', '1440p', '1080p', '720p', '480p', '360p'];
    
    return this.findOne({
        contentId,
        episodeId,
        isActive: true,
        quality: { $in: qualityOrder }
    }).sort({
        quality: qualityOrder.map((q, i) => ({ [q]: i + 1 })).reduce((a, b) => ({ ...a, ...b }), {})
    });
};

// Pre-save hook to extract video ID and validate URL
videoSourcesSchema.pre('save', function(next) {
    // Extract video ID if not provided
    if (!this.videoId) {
        this.extractVideoId();
    }
    
    // Validate URL format
    if (!this.validateUrl()) {
        return next(new Error(`Invalid URL format for source type: ${this.sourceType}`));
    }
    
    next();
});

// Pre-save hook to generate thumbnail URL if not provided
videoSourcesSchema.pre('save', function(next) {
    if (!this.thumbnailUrl && this.videoId) {
        switch (this.sourceType) {
            case 'youtube':
                this.thumbnailUrl = `https://img.youtube.com/vi/${this.videoId}/hqdefault.jpg`;
                break;
            case 'vimeo':
                // Vimeo thumbnail will need to be fetched via API
                this.thumbnailUrl = `https://vumbnail.com/${this.videoId}.jpg`;
                break;
        }
    }
    next();
});

const VideoSources = mongoose.model('VideoSources', videoSourcesSchema);
module.exports = VideoSources;