// routes/moviesRoutes.js
const express = require("express");
const router = express.Router();
const { getTrendingMovies , 
        getMovieById , 
        getTrendingTVShows , 
        getTopRatedMovies ,
        getPopularMovies ,
        getNowPlayingMovies ,
        searchMovies
    } = require("../Controllers/movieController");

// Define the route
router.get("/trending", getTrendingMovies);

// routes/tvRoutes.js
router.get('/tv/trending', getTrendingTVShows);

router.get('/top-rated', getTopRatedMovies);

router.get('/popular', getPopularMovies);

router.get('/now-playing', getNowPlayingMovies);

router.get('/search', searchMovies);



router.get("/:id", getMovieById );

module.exports = router;
