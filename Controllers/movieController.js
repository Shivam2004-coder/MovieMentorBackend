// controllers/moviesController.js
const axios = require("axios");

exports.getTrendingMovies = async (req, res) => {
  try {
    console.log("🎬 [Controller] Fetching trending movies from Trakt...");

    // 🔥 Call Trakt API
    const traktRes = await axios.get("https://api.trakt.tv/movies/trending", {
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "trakt-api-key": process.env.TRAKT_CLIENT_ID,
      },
    });

    const traktData = traktRes.data; // Array of {watchers, movie}
    console.log(`✅ [Controller] Fetched ${traktData.length} movies from Trakt`);

    // ✨ Enrich each movie with OMDb details
    const enrichedMovies = await Promise.all(
      traktData.map(async (item) => {
        const m = item.movie;

        // If no imdb id, return minimal object
        if (!m.ids?.imdb) {
          return {
            id: m.ids?.trakt,
            title: m.title,
            year: m.year,
            overview: null,
            tagline: null,
            vote_average: null,
            runtime: null,
            release_date: null,
            poster: null,
          };
        }

        try {
          // 🔥 Call OMDb API
          const omdbRes = await axios.get(
            `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${m.ids.imdb}`
          );
          const omdb = omdbRes.data;

          return {
            id: m.ids.imdb,
            title: omdb.Title || m.title,
            year: omdb.Year || m.year,
            overview: omdb.Plot !== "N/A" ? omdb.Plot : null,
            tagline: omdb.Genre !== "N/A" ? omdb.Genre : null,
            vote_average: omdb.imdbRating !== "N/A" ? omdb.imdbRating : null,
            runtime: omdb.Runtime !== "N/A" ? omdb.Runtime : null,
            release_date: omdb.Released !== "N/A" ? omdb.Released : null,
            poster: omdb.Poster !== "N/A" ? omdb.Poster : null,
          };
        } catch (err) {
          console.error("🔥 [Controller] OMDb fetch failed for", m.title, err.message);
          return {
            id: m.ids?.imdb,
            title: m.title,
            year: m.year,
            overview: null,
            tagline: null,
            vote_average: null,
            runtime: null,
            release_date: null,
            poster: null,
          };
        }
      })
    );

    console.log(`✅ [Controller] Enriched ${enrichedMovies.length} movies`);
    res.json(enrichedMovies);
  } catch (err) {
    console.error("🔥 [Controller] Server error:", err.message);
    res.status(500).json({ error: "Failed to fetch movies", details: err.message });
  }
};

// controllers/tvController.js
exports.getTrendingTVShows = async (req, res) => {
  try {
    console.log("📺 [Controller] Fetching trending TV shows from Trakt...");
    const traktRes = await axios.get("https://api.trakt.tv/shows/trending", {
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "trakt-api-key": process.env.TRAKT_CLIENT_ID,
      },
    });

    const traktData = traktRes.data;
    const enrichedShows = await Promise.all(
      traktData.map(async (item) => {
        const s = item.show;
        if (!s.ids?.imdb) {
          return {
            id: s.ids?.trakt,
            title: s.title,
            year: s.year,
            overview: null,
            tagline: null,
            vote_average: null,
            runtime: null,
            release_date: null,
            poster: null,
          };
        }
        try {
          const omdbRes = await axios.get(
            `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${s.ids.imdb}`
          );
          const omdb = omdbRes.data;

          return {
            id: s.ids.imdb,
            title: omdb.Title || s.title,
            year: omdb.Year || s.year,
            overview: omdb.Plot !== "N/A" ? omdb.Plot : null,
            tagline: omdb.Genre !== "N/A" ? omdb.Genre : null,
            vote_average: omdb.imdbRating !== "N/A" ? omdb.imdbRating : null,
            runtime: omdb.Runtime !== "N/A" ? omdb.Runtime : null,
            release_date: omdb.Released !== "N/A" ? omdb.Released : null,
            poster: omdb.Poster !== "N/A" ? omdb.Poster : null,
          };
        } catch (err) {
          console.error("🔥 [Controller] OMDb fetch failed for", s.title, err.message);
          return {
            id: s.ids.imdb,
            title: s.title,
            year: s.year,
            overview: null,
            tagline: null,
            vote_average: null,
            runtime: null,
            release_date: null,
            poster: null,
          };
        }
      })
    );

    res.json(enrichedShows);
  } catch (err) {
    console.error("🔥 [Controller] Server error:", err.message);
    res.status(500).json({ error: "Failed to fetch TV shows", details: err.message });
  }
};


exports.getTopRatedMovies = async (req, res) => {
  try {
    console.log("🎥 [Controller] Fetching top-rated movies from Trakt (popular as base)...");

    // Fetch popular movies from Trakt
    const traktRes = await axios.get("https://api.trakt.tv/movies/popular", {
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "trakt-api-key": process.env.TRAKT_CLIENT_ID,
      },
      params: {
        page: 1,
        limit: 20, // adjust as you like
      },
    });

    const traktData = traktRes.data;
    console.log(`✅ [Controller] Fetched ${traktData.length} movies from Trakt`);

    // Enrich with OMDb
    const enrichedMovies = await Promise.all(
      traktData.map(async (m) => {
        if (!m.ids?.imdb) {
          return {
            id: m.ids?.trakt,
            title: m.title,
            year: m.year,
            overview: null,
            tagline: null,
            vote_average: null,
            runtime: null,
            release_date: null,
            poster: null,
          };
        }
        try {
          const omdbRes = await axios.get(
            `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${m.ids.imdb}`
          );
          const omdb = omdbRes.data;
          return {
            id: m.ids.imdb,
            title: omdb.Title || m.title,
            year: omdb.Year || m.year,
            overview: omdb.Plot !== "N/A" ? omdb.Plot : null,
            tagline: omdb.Genre !== "N/A" ? omdb.Genre : null,
            vote_average: omdb.imdbRating !== "N/A" ? omdb.imdbRating : null,
            runtime: omdb.Runtime !== "N/A" ? omdb.Runtime : null,
            release_date: omdb.Released !== "N/A" ? omdb.Released : null,
            poster: omdb.Poster !== "N/A" ? omdb.Poster : null,
          };
        } catch (err) {
          console.error("🔥 [Controller] OMDb fetch failed for", m.title, err.message);
          return {
            id: m.ids.imdb,
            title: m.title,
            year: m.year,
            overview: null,
            tagline: null,
            vote_average: null,
            runtime: null,
            release_date: null,
            poster: null,
          };
        }
      })
    );

    console.log(`✅ [Controller] Enriched ${enrichedMovies.length} top-rated movies`);
    res.json(enrichedMovies);
  } catch (err) {
    console.error("🔥 [Controller] Server error:", err.message);
    res.status(500).json({ error: "Failed to fetch top-rated movies", details: err.message });
  }
};

// controllers/moviesController.js
exports.getPopularMovies = async (req, res) => {
  try {
    console.log("🔥 [Controller] Fetching popular movies from Trakt...");

    const traktRes = await axios.get("https://api.trakt.tv/movies/popular", {
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "trakt-api-key": process.env.TRAKT_CLIENT_ID,
      },
      params: {
        page: 1,
        limit: 20,
      },
    });

    const traktData = traktRes.data;

    const enrichedMovies = await Promise.all(
      traktData.map(async (m) => {
        if (!m.ids?.imdb) {
          return {
            id: m.ids?.trakt,
            title: m.title,
            year: m.year,
            overview: null,
            tagline: null,
            vote_average: null,
            runtime: null,
            release_date: null,
            poster: null,
          };
        }
        try {
          const omdbRes = await axios.get(
            `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${m.ids.imdb}`
          );
          const omdb = omdbRes.data;
          return {
            id: m.ids.imdb,
            title: omdb.Title || m.title,
            year: omdb.Year || m.year,
            overview: omdb.Plot !== "N/A" ? omdb.Plot : null,
            tagline: omdb.Genre !== "N/A" ? omdb.Genre : null,
            vote_average: omdb.imdbRating !== "N/A" ? omdb.imdbRating : null,
            runtime: omdb.Runtime !== "N/A" ? omdb.Runtime : null,
            release_date: omdb.Released !== "N/A" ? omdb.Released : null,
            poster: omdb.Poster !== "N/A" ? omdb.Poster : null,
          };
        } catch (err) {
          console.error("🔥 [Controller] OMDb fetch failed for", m.title, err.message);
          return {
            id: m.ids.imdb,
            title: m.title,
            year: m.year,
            overview: null,
            tagline: null,
            vote_average: null,
            runtime: null,
            release_date: null,
            poster: null,
          };
        }
      })
    );

    res.json(enrichedMovies);
  } catch (err) {
    console.error("🔥 [Controller] Server error:", err.message);
    res.status(500).json({ error: "Failed to fetch popular movies", details: err.message });
  }
};

// controllers/moviesController.js
exports.getNowPlayingMovies = async (req, res) => {
  try {
    console.log("🎞 [Controller] Fetching anticipated (now-playing-like) movies from Trakt...");

    const traktRes = await axios.get("https://api.trakt.tv/movies/anticipated", {
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "trakt-api-key": process.env.TRAKT_CLIENT_ID,
      },
      params: {
        page: 1,
        limit: 20,
      },
    });

    const traktData = traktRes.data;

    const enrichedMovies = await Promise.all(
      traktData.map(async (item) => {
        const m = item.movie;
        if (!m.ids?.imdb) {
          return {
            id: m.ids?.trakt,
            title: m.title,
            year: m.year,
            overview: null,
            tagline: null,
            vote_average: null,
            runtime: null,
            release_date: null,
            poster: null,
          };
        }
        try {
          const omdbRes = await axios.get(
            `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${m.ids.imdb}`
          );
          const omdb = omdbRes.data;
          return {
            id: m.ids.imdb,
            title: omdb.Title || m.title,
            year: omdb.Year || m.year,
            overview: omdb.Plot !== "N/A" ? omdb.Plot : null,
            tagline: omdb.Genre !== "N/A" ? omdb.Genre : null,
            vote_average: omdb.imdbRating !== "N/A" ? omdb.imdbRating : null,
            runtime: omdb.Runtime !== "N/A" ? omdb.Runtime : null,
            release_date: omdb.Released !== "N/A" ? omdb.Released : null,
            poster: omdb.Poster !== "N/A" ? omdb.Poster : null,
          };
        } catch (err) {
          console.error("🔥 [Controller] OMDb fetch failed for", m.title, err.message);
          return {
            id: m.ids.imdb,
            title: m.title,
            year: m.year,
            overview: null,
            tagline: null,
            vote_average: null,
            runtime: null,
            release_date: null,
            poster: null,
          };
        }
      })
    );

    res.json(enrichedMovies);
  } catch (err) {
    console.error("🔥 [Controller] Server error:", err.message);
    res.status(500).json({ error: "Failed to fetch now-playing movies", details: err.message });
  }
};

// GET /api/movies/search?query=toy%20story
exports.searchMovies = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    console.log("🔎 [Controller] Searching movies for:", query);

    // Search on Trakt
    const traktRes = await axios.get(`https://api.trakt.tv/search/movie`, {
      headers: {
        "Content-Type": "application/json",
        "trakt-api-version": "2",
        "trakt-api-key": process.env.TRAKT_CLIENT_ID,
      },
      params: { query, limit: 5 },
    });

    const traktData = traktRes.data; // Array of { movie: {...}, type: "movie" }

    // Enrich each with OMDb
    const enrichedMovies = await Promise.all(
      traktData.map(async (item) => {
        const m = item.movie;
        if (!m.ids?.imdb) {
          return {
            id: m.ids?.trakt,
            title: m.title,
            year: m.year,
            overview: null,
            tagline: null,
            vote_average: null,
            runtime: null,
            release_date: null,
            poster: null,
          };
        }
        try {
          const omdbRes = await axios.get(
            `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${m.ids.imdb}`
          );
          const omdb = omdbRes.data;
          return {
            id: m.ids.imdb,
            title: omdb.Title || m.title,
            year: omdb.Year || m.year,
            overview: omdb.Plot !== "N/A" ? omdb.Plot : null,
            tagline: omdb.Genre !== "N/A" ? omdb.Genre : null,
            vote_average: omdb.imdbRating !== "N/A" ? omdb.imdbRating : null,
            runtime: omdb.Runtime !== "N/A" ? omdb.Runtime : null,
            release_date: omdb.Released !== "N/A" ? omdb.Released : null,
            poster: omdb.Poster !== "N/A" ? omdb.Poster : null,
          };
        } catch (err) {
          console.error("🔥 [Controller] OMDb fetch failed for", m.title, err.message);
          return {
            id: m.ids.imdb,
            title: m.title,
            year: m.year,
            overview: null,
            tagline: null,
            vote_average: null,
            runtime: null,
            release_date: null,
            poster: null,
          };
        }
      })
    );

    res.json(enrichedMovies);
  } catch (err) {
    console.error("🔥 [Controller] Search error:", err.message);
    res.status(500).json({ error: "Failed to search movies", details: err.message });
  }
};


exports.getMovieById = async (req, res) => {
  const { id } = req.params; // IMDb id like "tt26743210"
  try {
    console.log("🎬 [Controller] Fetching details for movie:", id);

    // 1️⃣ Fetch movie details from OMDb
    const omdbRes = await axios.get(
      `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${id}`
    );
    const omdb = omdbRes.data;

    if (omdb.Response === "False") {
      return res.status(404).json({ error: "Movie not found" });
    }

    // 2️⃣ Search for trailer on YouTube
    let trailerLink = null;
    try {
      const ytRes = await axios.get(
        `https://www.googleapis.com/youtube/v3/search`,
        {
          params: {
            part: "snippet",
            q: `${omdb.Title} official trailer`,
            key: process.env.YOUTUBE_API_KEY, // 👈 add this key in your .env
            maxResults: 1,
            type: "video",
            videoEmbeddable: true,
          },
        }
      );

      const trailerId = ytRes.data.items?.[0]?.id?.videoId;
      if (trailerId) {
        trailerLink = `https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=1&loop=1&playlist=${trailerId}&enablejsapi=1&playsinline=1`;
      }
    } catch (ytErr) {
      console.warn("⚠️ [Controller] YouTube trailer search failed:", ytErr.message);
      trailerLink = null; // fallback
    }

    // 3️⃣ Construct the movie object
    const movie = {
      id: id,
      title: omdb.Title,
      year: omdb.Year,
      overview: omdb.Plot !== "N/A" ? omdb.Plot : null,
      tagline: omdb.Genre !== "N/A" ? omdb.Genre : null,
      vote_average: omdb.imdbRating !== "N/A" ? omdb.imdbRating : null,
      runtime: omdb.Runtime !== "N/A" ? omdb.Runtime : null,
      release_date: omdb.Released !== "N/A" ? omdb.Released : null,
      poster: omdb.Poster !== "N/A" ? omdb.Poster : null,
      trailer: trailerLink, // ✅ added trailer
    };

    console.log("✅ [Controller] Sending movie details + trailer");
    res.json(movie);
  } catch (err) {
    console.error("🔥 [Controller] getMovieById error:", err.message);
    res.status(500).json({ error: "Failed to fetch movie", details: err.message });
  }
};
