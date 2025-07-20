// app.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const moviesRoutes = require("./routes/movieRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Use the routes
app.use("/api/movies", moviesRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
