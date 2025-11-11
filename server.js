const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const userRoutes = require("./routes/api/user_routes.js");
const profileRoutes = require("./routes/api/profile_routes.js");
const videoRoutes = require("./routes/api/video_routes.js");
const savedContentRoutes = require("./routes/api/saved_content_routes.js");
// const contentCatalogRoutes = require("./routes/api/content_catalog_routes.js");

dotenv.config(); // load environment variables
const app = express(); // create express app

// ENABLE CORS (before routes)
app.use(
  cors({
    origin: "http://localhost:5500", // allow your frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// middleware
app.use(express.json()); // middleware to parse JSON bodies
app.use(cookieParser()); // enables req.cookies

// connect to MongoDB
mongoose.connect(
    process.env.MONGO_ADDRESS + "/" + process.env.MONGO_DB_NAME, 
    {useNewUrlParser: true, useUnifiedTopology: true}
);

// routes
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/saved-content", savedContentRoutes);
// app.use("/api/content-catalog", contentCatalogRoutes);

// start the server
const PORT = process.env.SERVER_PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
