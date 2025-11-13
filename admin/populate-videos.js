/**
 * Script to populate video sources in MongoDB
 * 
 * This script helps you add video files from your local 'videos' folder to the database.
 * 
 * Usage:
 * 1. Place your video files in the 'videos' folder in the root directory
 * 2. Update the videoMappings array below with your video files
 * 3. Run: node admin/populate-videos.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import the VideoSources schema
const VideoSources = require('../models/schemas/video_sources_schema');

// Connect to MongoDB
mongoose.connect(
    process.env.MONGO_ADDRESS + "/" + process.env.MONGO_DB_NAME,
    { useNewUrlParser: true, useUnifiedTopology: true }
);

/**
 * VIDEO MAPPINGS
 * 
 * Map your video files to contentId from your content catalog.
 * 
 * Format:
 * {
 *   contentId: number,        // Must match a contentId in your content_catalog
 *   episodeId: number,        // Episode number (1 for movies, 1+ for series)
 *   filename: string,         // Exact filename in your videos folder (e.g., 'movie.mp4')
 *   quality: string,          // '360p', '480p', '720p', '1080p', '1440p', '4k'
 *   duration: number          // Duration in seconds (you can estimate or use a tool to get exact)
 * }
 */
const videoMappings = [
    // Example mappings - UPDATE THESE WITH YOUR ACTUAL FILES
    // { contentId: 1, episodeId: 1, filename: 'stranger-things-s01e01.mp4', quality: '1080p', duration: 3000 },
    // { contentId: 1, episodeId: 2, filename: 'stranger-things-s01e02.mp4', quality: '1080p', duration: 3000 },
    // { contentId: 2, episodeId: 1, filename: 'breaking-bad-s01e01.mp4', quality: '720p', duration: 2800 },
    
    // Add your 14 videos here:
    // { contentId: 1, episodeId: 1, filename: 'video1.mp4', quality: '1080p', duration: 3600 },
    // { contentId: 2, episodeId: 1, filename: 'video2.mp4', quality: '1080p', duration: 3600 },
    // ... add all 14 videos
];

async function populateVideos() {
    try {
        console.log('🎬 Starting video population...\n');

        if (videoMappings.length === 0) {
            console.log('⚠️  No video mappings found!');
            console.log('Please update the videoMappings array in this script with your video files.\n');
            process.exit(1);
        }

        let successCount = 0;
        let errorCount = 0;

        for (const mapping of videoMappings) {
            try {
                const { contentId, episodeId, filename, quality, duration } = mapping;

                // Check if video source already exists
                const existing = await VideoSources.findOne({
                    contentId,
                    episodeId,
                    videoUrl: `videos/${filename}`  // Relative path
                });

                if (existing) {
                    console.log(`⏭️  Skipping: ${filename} (already exists for contentId ${contentId}, episode ${episodeId})`);
                    continue;
                }

                // Create new video source with relative path
                const videoSource = new VideoSources({
                    contentId,
                    episodeId,
                    videoUrl: `videos/${filename}`,  // Relative path
                    sourceType: 'direct_mp4',
                    quality: quality || '720p',
                    duration: duration || 3600,
                    isActive: true,
                    metadata: {
                        title: `Episode ${episodeId}`,
                        description: `Video file: ${filename}`,
                        uploadDate: new Date()
                    }
                });

                await videoSource.save();
                successCount++;
                console.log(`✅ Added: ${filename} → contentId ${contentId}, episode ${episodeId}, quality ${quality}`);

            } catch (error) {
                errorCount++;
                console.error(`❌ Error adding ${mapping.filename}:`, error.message);
            }
        }

        console.log('\n📊 Summary:');
        console.log(`   ✅ Successfully added: ${successCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);
        console.log(`   ⏭️  Skipped (already exist): ${videoMappings.length - successCount - errorCount}`);
        console.log('\n✨ Done!\n');

    } catch (error) {
        console.error('❌ Fatal error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

// Run the population
populateVideos();