// Sample video content with episodes - dummy data for video player
const videoContent = [
    {
        contentId: 1, // Stranger Things
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        type: "series",
        currentSeason: 1,
        episodes: [
            {
                episodeId: 1,
                season: 1,
                episode: 1,
                title: "Chapter One: The Vanishing of Will Byers",
                duration: 2950, // 49:10 minutes in seconds
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                thumbnail: "../../images/titles_images/stranger-things-586a302a5290e.jpg"
            },
            {
                episodeId: 2,
                season: 1,
                episode: 2,
                title: "Chapter Two: The Weirdo on Maple Street",
                duration: 3360, // 56:00 minutes in seconds
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                thumbnail: "../../images/titles_images/stranger-things-586a302a5290e.jpg"
            },
            {
                episodeId: 3,
                season: 1,
                episode: 3,
                title: "Chapter Three: Holly, Jolly",
                duration: 3120, // 52:00 minutes in seconds
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                thumbnail: "../../images/titles_images/stranger-things-586a302a5290e.jpg"
            }
        ]
    },
    {
        contentId: 4, // The Irishman (movie)
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        type: "movie",
        episodes: [
            {
                episodeId: 1,
                season: 1,
                episode: 1,
                title: "The Irishman",
                duration: 12540, // 3:29:00 hours in seconds
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                thumbnail: "../../images/titles_images/the-irishman-5de1fdc43999d.jpg"
            }
        ]
    },
    {
        contentId: 6, // Money Heist
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        type: "series",
        currentSeason: 1,
        episodes: [
            {
                episodeId: 1,
                season: 1,
                episode: 1,
                title: "Efectuar lo acordado",
                duration: 4170, // 69:30 minutes in seconds
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                thumbnail: "../../images/titles_images/la-casa-de-papel-5bdb348db30e4.jpg"
            },
            {
                episodeId: 2,
                season: 1,
                episode: 2,
                title: "Imprudencias letales",
                duration: 3840, // 64:00 minutes in seconds
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                thumbnail: "../../images/titles_images/la-casa-de-papel-5bdb348db30e4.jpg"
            }
        ]
    }
];
