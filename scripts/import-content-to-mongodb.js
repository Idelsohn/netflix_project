const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import content data directly (copied from models/data.js)
const contentCatalog = [
    {
        id: 1,
        name: "Stranger Things",
        year: 2016,
        genres: ["Sci-Fi", "Horror", "Drama"],
        genre: "Sci-Fi",
        likes: 1250,
        type: "series",
        image: "../../images/titles_images/stranger-things-586a302a5290e.jpg"
    },
    {
        id: 2,
        name: "The Crown",
        year: 2016,
        genres: ["Drama", "Biography"],
        genre: "Drama",
        likes: 980,
        type: "series",
        image: "../../images/titles_images/the-crown-581d612a055cd.jpg"
    },
    {
        id: 3,
        name: "Black Mirror",
        year: 2011,
        genres: ["Sci-Fi", "Thriller", "Drama"],
        genre: "Sci-Fi",
        likes: 1150,
        type: "series",
        image: "../../images/titles_images/black-mirror-589ef336268de.jpg"
    },
    {
        id: 4,
        name: "The Irishman",
        year: 2019,
        genres: ["Crime", "Drama", "Biography"],
        genre: "Crime",
        likes: 850,
        type: "movie",
        image: "../../images/titles_images/the-irishman-5de1fdc43999d.jpg"
    },
    {
        id: 5,
        name: "Roma",
        year: 2018,
        genres: ["Drama", "Biography"],
        genre: "Drama",
        likes: 720,
        type: "movie",
        image: "../../images/titles_images/roma-5c1591a4551ed.jpg"
    },
    {
        id: 6,
        name: "Money Heist",
        year: 2017,
        genres: ["Crime", "Thriller", "Action"],
        genre: "Crime",
        likes: 1850,
        type: "series",
        image: "../../images/titles_images/la-casa-de-papel-5bdb348db30e4.jpg"
    },
    {
        id: 7,
        name: "Bird Box",
        year: 2018,
        genres: ["Horror", "Thriller", "Drama"],
        genre: "Horror",
        likes: 950,
        type: "movie",
        image: "../../images/titles_images/bird-box-5c2a740452911.jpg"
    },
    {
        id: 8,
        name: "Orange Is the New Black",
        year: 2013,
        genres: ["Comedy", "Drama", "Crime"],
        genre: "Comedy",
        likes: 1100,
        type: "series",
        image: "../../images/titles_images/orange-is-the-new-black-51e06e1e5eb29.jpg"
    },
    {
        id: 9,
        name: "The Platform",
        year: 2019,
        genres: ["Thriller", "Horror", "Sci-Fi"],
        genre: "Thriller",
        likes: 780,
        type: "movie",
        image: "../../images/titles_images/the-platform-602caa8f54888.jpg"
    },
    {
        id: 10,
        name: "Ozark",
        year: 2017,
        genres: ["Crime", "Drama", "Thriller"],
        genre: "Crime",
        likes: 1320,
        type: "series",
        image: "../../images/titles_images/ozark-59758728cf49f.jpg"
    },
    {
        id: 11,
        name: "The Witcher",
        year: 2019,
        genres: ["Fantasy", "Action", "Drama"],
        genre: "Fantasy",
        likes: 1650,
        type: "series",
        image: "../../images/titles_images/the-witcher-5d3339ee443f6.jpg"
    },
    {
        id: 12,
        name: "Squid Game",
        year: 2021,
        genres: ["Thriller", "Horror", "Drama"],
        genre: "Thriller",
        likes: 2100,
        type: "series",
        image: "../../images/titles_images/squid-game-6185b743943c8.jpg"
    },
    {
        id: 13,
        name: "Breaking Bad",
        year: 2008,
        genres: ["Crime", "Drama", "Thriller"],
        genre: "Crime",
        likes: 1890,
        type: "series",
        image: "../../images/titles_images/breaking-bad-4f2790a25f183.jpg"
    },
    {
        id: 14,
        name: "The Queen's Gambit",
        year: 2020,
        genres: ["Drama", "Biography"],
        genre: "Drama",
        likes: 1450,
        type: "series",
        image: "../../images/titles_images/the-queens-gambit-5fba235c776f0.jpg"
    },
    {
        id: 15,
        name: "Narcos",
        year: 2015,
        genres: ["Crime", "Drama", "Biography"],
        genre: "Crime",
        likes: 1280,
        type: "series",
        image: "../../images/titles_images/narcos-55d7e8d99c35c.jpg"
    },
    {
        id: 16,
        name: "Wednesday",
        year: 2022,
        genres: ["Comedy", "Horror", "Mystery"],
        genre: "Comedy",
        likes: 1750,
        type: "series",
        image: "../../images/titles_images/wednesday-637e6cd0d2db4.jpg"
    },
    {
        id: 17,
        name: "House of Cards",
        year: 2013,
        genres: ["Drama", "Thriller"],
        genre: "Drama",
        likes: 1200,
        type: "series",
        image: "../../images/titles_images/house-of-cards-2013-510ddbe01f963.jpg"
    },
    {
        id: 18,
        name: "Dark",
        year: 2017,
        genres: ["Sci-Fi", "Thriller", "Mystery"],
        genre: "Sci-Fi",
        likes: 1380,
        type: "series",
        image: "../../images/titles_images/dark-5a2a7712af6d1.jpg"
    },
    {
        id: 19,
        name: "Bridgerton",
        year: 2020,
        genres: ["Romance", "Drama"],
        genre: "Romance",
        likes: 1520,
        type: "series",
        image: "../../images/titles_images/bridgerton-600594f2a06c2.jpg"
    },
    {
        id: 20,
        name: "Lupin",
        year: 2021,
        genres: ["Crime", "Mystery", "Drama"],
        genre: "Crime",
        likes: 1180,
        type: "series",
        image: "../../images/titles_images/lupin-60c593cab8020.jpg"
    },
    {
        id: 21,
        name: "Red Notice",
        year: 2021,
        genres: ["Action", "Comedy", "Crime"],
        genre: "Action",
        likes: 890,
        type: "movie",
        image: "../../images/titles_images/red-notice-6178576c3367a.jpg"
    },
    {
        id: 22,
        name: "Don't Look Up",
        year: 2021,
        genres: ["Comedy", "Drama", "Sci-Fi"],
        genre: "Comedy",
        likes: 1050,
        type: "movie",
        image: "../../images/titles_images/dont-look-up-61cb662a7f558.jpg"
    },
    {
        id: 23,
        name: "The Adam Project",
        year: 2022,
        genres: ["Sci-Fi", "Action", "Comedy"],
        genre: "Sci-Fi",
        likes: 920,
        type: "movie",
        image: "../../images/titles_images/the-adam-project-622e2cf71cb45.jpg"
    },
    {
        id: 24,
        name: "Extraction",
        year: 2020,
        genres: ["Action", "Thriller"],
        genre: "Action",
        likes: 1150,
        type: "movie",
        image: "../../images/titles_images/extraction-5e954cf613701.jpg"
    },
    {
        id: 25,
        name: "The Gray Man",
        year: 2022,
        genres: ["Action", "Thriller"],
        genre: "Action",
        likes: 780,
        type: "movie",
        image: "../../images/titles_images/the-gray-man-62dc299ea5d03.jpg"
    },
    {
        id: 26,
        name: "Glass Onion",
        year: 2022,
        genres: ["Mystery", "Comedy", "Crime"],
        genre: "Mystery",
        likes: 1320,
        type: "movie",
        image: "../../images/titles_images/glass-onion-a-knives-out-mystery-63afda3632fb7.jpg"
    },
    {
        id: 27,
        name: "6 Underground",
        year: 2019,
        genres: ["Action", "Thriller"],
        genre: "Action",
        likes: 680,
        type: "movie",
        image: "../../images/titles_images/6-underground-5dd0c1532ca09.jpg"
    },
    {
        id: 28,
        name: "Enola Holmes",
        year: 2020,
        genres: ["Mystery", "Adventure", "Comedy"],
        genre: "Mystery",
        likes: 1080,
        type: "movie",
        image: "../../images/titles_images/enola-holmes-mysteries-5f4b712088383.jpg"
    },
    {
        id: 29,
        name: "The Kissing Booth",
        year: 2018,
        genres: ["Romance", "Comedy"],
        genre: "Romance",
        likes: 650,
        type: "movie",
        image: "../../images/titles_images/the-kissing-booth-5f28e8199b968.jpg"
    },
    {
        id: 30,
        name: "Triple Frontier",
        year: 2019,
        genres: ["Action", "Thriller", "Crime"],
        genre: "Action",
        likes: 750,
        type: "movie",
        image: "../../images/titles_images/triple-frontier-5c8ded7425b71.jpg"
    }
];

// Define Content Schema for content catalog
const contentSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    year: { type: Number, required: true },
    genres: { type: [String], required: true },
    genre: { type: String, required: true }, // Primary genre for backward compatibility
    likes: { type: Number, default: 0 },
    type: { type: String, enum: ['movie', 'series'], required: true },
    image: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Create Content model
const Content = mongoose.model('Content', contentSchema, 'content');

// Function to import ONLY content catalog
async function importContentCatalog() {
    try {
        console.log('📚 Importing content catalog to MongoDB...');
        
        // Clear existing content
        await Content.deleteMany({});
        console.log('🗑️  Cleared existing content catalog');
        
        let successCount = 0;
        const errors = [];
        
        for (const item of contentCatalog) {
            try {
                const content = new Content({
                    ...item,
                    created_at: new Date(),
                    updated_at: new Date()
                });
                await content.save();
                successCount++;
                
                // Show progress every 10 items
                if (successCount % 10 === 0) {
                    console.log(`📈 Progress: ${successCount}/${contentCatalog.length} content items imported`);
                }
            } catch (error) {
                errors.push({ item: item.name, error: error.message });
                console.log(`❌ Error importing "${item.name}": ${error.message}`);
            }
        }
        
        console.log(`✅ Content catalog imported: ${successCount}/${contentCatalog.length} items`);
        
        if (errors.length > 0) {
            console.log('\n❌ Import Errors:');
            errors.forEach((err, index) => {
                console.log(`${index + 1}. ${err.item}: ${err.error}`);
            });
        }
        
        return { successCount, errors, total: contentCatalog.length };
    } catch (error) {
        throw new Error(`Failed to import content catalog: ${error.message}`);
    }
}

// Main import function - imports ONLY content catalog
async function importContentToMongoDB() {
    try {
        console.log('🚀 Starting MongoDB content catalog import...');
        console.log(`📁 Database: ${process.env.MONGO_DB_NAME}`);
        console.log(`🔗 MongoDB Address: ${process.env.MONGO_ADDRESS}`);
        
        // Connect to MongoDB
        await mongoose.connect(
            `${process.env.MONGO_ADDRESS}/${process.env.MONGO_DB_NAME}`,
            { useNewUrlParser: true, useUnifiedTopology: true }
        );
        
        console.log('✅ Connected to MongoDB successfully');
        
        // Import content catalog only
        const contentResult = await importContentCatalog();
        
        // Verify import
        const totalContent = await Content.countDocuments();
        
        console.log('\n📋 Import Summary:');
        console.log(`📚 Content Catalog: ${contentResult.successCount}/${contentResult.total} items imported`);
        console.log(`🎯 Total content in database: ${totalContent}`);
        
        // Show sample data
        console.log('\n📄 Sample imported content:');
        const sampleContent = await Content.find().limit(5).select('name year type genres');
        sampleContent.forEach((item, index) => {
            console.log(`${index + 1}. ${item.name} (${item.year}) - ${item.type} - [${item.genres.join(', ')}]`);
        });
        
        console.log('\n✨ Collections status:');
        console.log('📚 content - ✅ IMPORTED (all movies and series catalog)');
        console.log('📹 videosources - ⚠️  DYNAMIC (will be created when users upload/watch videos)');
        console.log('⏱️ watchprogresses - ⚠️  DYNAMIC (will be created when users start watching)');
        console.log('💾 savedcontents - ⚠️  DYNAMIC (will be created when users like/save content)');
        
        console.log('\n🎉 Content catalog import completed successfully!');
        
        console.log('\n📋 Next Steps:');
        console.log('1. ✅ Content catalog ready in MongoDB');
        console.log('2. 🔗 Video sources will be added dynamically during video upload/play');
        console.log('3. 🔗 Watch progress will be saved automatically during video playback');
        console.log('4. 🔗 Saved content will be added when users like/bookmark content');
        console.log('5. 💻 Update frontend to use MongoDB APIs instead of localStorage');
        
        console.log('\n🛠️  Required implementations:');
        console.log('• Create saved content schema and service');
        console.log('• Update like buttons to call MongoDB API');
        console.log('• Ensure video sources are saved when content is played');
        console.log('• Update feed to load content from MongoDB');
        
    } catch (error) {
        console.error('💥 Error during import process:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('🔐 MongoDB connection closed');
        process.exit(0);
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\n⚠️  Process interrupted by user');
    await mongoose.connection.close();
    process.exit(0);
});

process.on('unhandledRejection', async (reason, promise) => {
    console.error('💥 Unhandled Promise Rejection:', reason);
    await mongoose.connection.close();
    process.exit(1);
});

// Export for potential reuse
module.exports = { 
    importContentToMongoDB, 
    Content,
    importContentCatalog
};

// Run the import if this file is executed directly
if (require.main === module) {
    importContentToMongoDB();
}