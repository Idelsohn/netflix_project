// Content catalog - dummy data for movies and series
// Now supporting multiple genres per title for more realistic categorization
const contentCatalog = [
    {
        id: 1,
        name: "Stranger Things",
        year: 2016,
        genres: ["Sci-Fi", "Horror", "Drama"],
        genre: "Sci-Fi", // Primary genre for backward compatibility
        likes: 1250,
        type: "series",
        image: "images/titles_images/stranger-things-586a302a5290e.jpg"
    },
    {
        id: 2,
        name: "The Crown",
        year: 2016,
        genres: ["Drama", "Biography"],
        genre: "Drama",
        likes: 980,
        type: "series",
        image: "images/titles_images/the-crown-581d612a055cd.jpg"
    },
    {
        id: 3,
        name: "Black Mirror",
        year: 2011,
        genres: ["Sci-Fi", "Thriller", "Drama"],
        genre: "Sci-Fi",
        likes: 1150,
        type: "series",
        image: "images/titles_images/black-mirror-589ef336268de.jpg"
    },
    {
        id: 4,
        name: "The Irishman",
        year: 2019,
        genres: ["Crime", "Drama", "Biography"],
        genre: "Crime",
        likes: 850,
        type: "movie",
        image: "images/titles_images/the-irishman-5de1fdc43999d.jpg"
    },
    {
        id: 5,
        name: "Roma",
        year: 2018,
        genres: ["Drama", "Biography"],
        genre: "Drama",
        likes: 720,
        type: "movie",
        image: "images/titles_images/roma-5c1591a4551ed.jpg"
    },
    {
        id: 6,
        name: "Money Heist",
        year: 2017,
        genres: ["Crime", "Thriller", "Action"],
        genre: "Crime",
        likes: 1850,
        type: "series",
        image: "images/titles_images/la-casa-de-papel-5bdb348db30e4.jpg"
    },
    {
        id: 7,
        name: "Bird Box",
        year: 2018,
        genres: ["Horror", "Thriller", "Drama"],
        genre: "Horror",
        likes: 950,
        type: "movie",
        image: "images/titles_images/bird-box-5c2a740452911.jpg"
    },
    {
        id: 8,
        name: "Orange Is the New Black",
        year: 2013,
        genres: ["Comedy", "Drama", "Crime"],
        genre: "Comedy",
        likes: 1100,
        type: "series",
        image: "images/titles_images/orange-is-the-new-black-51e06e1e5eb29.jpg"
    },
    {
        id: 9,
        name: "The Platform",
        year: 2019,
        genres: ["Thriller", "Horror", "Sci-Fi"],
        genre: "Thriller",
        likes: 780,
        type: "movie",
        image: "images/titles_images/the-platform-602caa8f54888.jpg"
    },
    {
        id: 10,
        name: "Ozark",
        year: 2017,
        genres: ["Crime", "Drama", "Thriller"],
        genre: "Crime",
        likes: 1320,
        type: "series",
        image: "images/titles_images/ozark-59758728cf49f.jpg"
    },
    {
        id: 11,
        name: "The Witcher",
        year: 2019,
        genres: ["Fantasy", "Action", "Drama"],
        genre: "Fantasy",
        likes: 1650,
        type: "series",
        image: "images/titles_images/the-witcher-5d3339ee443f6.jpg"
    },
    {
        id: 12,
        name: "Squid Game",
        year: 2021,
        genres: ["Thriller", "Horror", "Drama"],
        genre: "Thriller",
        likes: 2100,
        type: "series",
        image: "images/titles_images/squid-game-6185b743943c8.jpg"
    },
    {
        id: 13,
        name: "Breaking Bad",
        year: 2008,
        genres: ["Crime", "Drama", "Thriller"],
        genre: "Crime",
        likes: 1890,
        type: "series",
        image: "images/titles_images/breaking-bad-4f2790a25f183.jpg"
    },
    {
        id: 14,
        name: "The Queen's Gambit",
        year: 2020,
        genres: ["Drama", "Biography"],
        genre: "Drama",
        likes: 1450,
        type: "series",
        image: "images/titles_images/the-queens-gambit-5fba235c776f0.jpg"
    },
    {
        id: 15,
        name: "Narcos",
        year: 2015,
        genres: ["Crime", "Drama", "Biography"],
        genre: "Crime",
        likes: 1280,
        type: "series",
        image: "images/titles_images/narcos-55d7e8d99c35c.jpg"
    },
    {
        id: 16,
        name: "Wednesday",
        year: 2022,
        genres: ["Comedy", "Horror", "Mystery"],
        genre: "Comedy",
        likes: 1750,
        type: "series",
        image: "images/titles_images/wednesday-637e6cd0d2db4.jpg"
    },
    {
        id: 17,
        name: "House of Cards",
        year: 2013,
        genres: ["Drama", "Thriller"],
        genre: "Drama",
        likes: 1200,
        type: "series",
        image: "images/titles_images/house-of-cards-2013-510ddbe01f963.jpg"
    },
    {
        id: 18,
        name: "Dark",
        year: 2017,
        genres: ["Sci-Fi", "Thriller", "Mystery"],
        genre: "Sci-Fi",
        likes: 1380,
        type: "series",
        image: "images/titles_images/dark-5a2a7712af6d1.jpg"
    },
    {
        id: 19,
        name: "Bridgerton",
        year: 2020,
        genres: ["Romance", "Drama"],
        genre: "Romance",
        likes: 1520,
        type: "series",
        image: "images/titles_images/bridgerton-600594f2a06c2.jpg"
    },
    {
        id: 20,
        name: "Lupin",
        year: 2021,
        genres: ["Crime", "Mystery", "Drama"],
        genre: "Crime",
        likes: 1180,
        type: "series",
        image: "images/titles_images/lupin-60c593cab8020.jpg"
    },
    {
        id: 21,
        name: "Red Notice",
        year: 2021,
        genres: ["Action", "Comedy", "Crime"],
        genre: "Action",
        likes: 890,
        type: "movie",
        image: "images/titles_images/red-notice-6178576c3367a.jpg"
    },
    {
        id: 22,
        name: "Don't Look Up",
        year: 2021,
        genres: ["Comedy", "Drama", "Sci-Fi"],
        genre: "Comedy",
        likes: 1050,
        type: "movie",
        image: "images/titles_images/dont-look-up-61cb662a7f558.jpg"
    },
    {
        id: 23,
        name: "The Adam Project",
        year: 2022,
        genres: ["Sci-Fi", "Action", "Comedy"],
        genre: "Sci-Fi",
        likes: 920,
        type: "movie",
        image: "images/titles_images/the-adam-project-622e2cf71cb45.jpg"
    },
    {
        id: 24,
        name: "Extraction",
        year: 2020,
        genres: ["Action", "Thriller"],
        genre: "Action",
        likes: 1150,
        type: "movie",
        image: "images/titles_images/extraction-5e954cf613701.jpg"
    },
    {
        id: 25,
        name: "The Gray Man",
        year: 2022,
        genres: ["Action", "Thriller"],
        genre: "Action",
        likes: 780,
        type: "movie",
        image: "images/titles_images/the-gray-man-62dc299ea5d03.jpg"
    },
    {
        id: 26,
        name: "Glass Onion",
        year: 2022,
        genres: ["Mystery", "Comedy", "Crime"],
        genre: "Mystery",
        likes: 1320,
        type: "movie",
        image: "images/titles_images/glass-onion-a-knives-out-mystery-63afda3632fb7.jpg"
    },
    {
        id: 27,
        name: "6 Underground",
        year: 2019,
        genres: ["Action", "Thriller"],
        genre: "Action",
        likes: 680,
        type: "movie",
        image: "images/titles_images/6-underground-5dd0c1532ca09.jpg"
    },
    {
        id: 28,
        name: "Enola Holmes",
        year: 2020,
        genres: ["Mystery", "Adventure", "Comedy"],
        genre: "Mystery",
        likes: 1080,
        type: "movie",
        image: "images/titles_images/enola-holmes-mysteries-5f4b712088383.jpg"
    },
    {
        id: 29,
        name: "The Kissing Booth",
        year: 2018,
        genres: ["Romance", "Comedy"],
        genre: "Romance",
        likes: 650,
        type: "movie",
        image: "images/titles_images/the-kissing-booth-5f28e8199b968.jpg"
    },
    {
        id: 30,
        name: "Triple Frontier",
        year: 2019,
        genres: ["Action", "Thriller", "Crime"],
        genre: "Action",
        likes: 750,
        type: "movie",
        image: "images/titles_images/triple-frontier-5c8ded7425b71.jpg"
    }
];

// Profiles data - predefined array as required
const profiles = [
    { 
        id: 1, 
        name: "Yahav", 
        image: "images/profile_pictures/profile picture 1.jfif"
    },
    { 
        id: 2, 
        name: "Nadav", 
        image: "images/profile_pictures/profile picture 2.jfif"
    },
    { 
        id: 3, 
        name: "Roe", 
        image: "images/profile_pictures/profile picture 3.jfif"
    },
    { 
        id: 4, 
        name: "Amit", 
        image: "images/profile_pictures/profile picture 4.jfif"
    },
    { 
        id: 5, 
        name: "Or", 
        image: "images/profile_pictures/profile picture 5.jfif"
    }
];