// controllers/moviesController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");  
const axios = require("axios");
dotenv.config();


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


exports.getRecommendedMovies = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    console.log("✨ [Controller] Gemini recommendation for:", query);

    // Build Gemini prompt
    const GeminiQuery =
      "Act as a movie Recommendation System and suggest some movies for the query : " +
      query +
      ". Only give me names of 5 movies, comma separated like the example result given ahead." +
      " Example: <movie_name1>, <movie_name2>, <movie_name3>, <movie_name4>, <movie_name5>";

    // Call Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(GeminiQuery);

    const rawText =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const movieNames = rawText
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    console.log("✅ Gemini suggested:", movieNames);

    // For each movie name, perform a search (returning an array of results)
    const movies = await Promise.all(
      movieNames.map(async (name) => {
        try {
          // Use Trakt's search to get multiple results
          const traktRes = await axios.get(`https://api.trakt.tv/search/movie`, {
            headers: {
              "Content-Type": "application/json",
              "trakt-api-version": "2",
              "trakt-api-key": process.env.TRAKT_CLIENT_ID,
            },
            params: { query: name, limit: 5 }, // fetch up to 5 search results
          });

          if (!traktRes.data || traktRes.data.length === 0) {
            return [];
          }

          // For each result, try to enrich with OMDb
          const enrichedResults = await Promise.all(
            traktRes.data.map(async (result) => {
              const m = result.movie;
              if (!m?.ids?.imdb) {
                return {
                  id: m.ids?.trakt || null,
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
              } catch (innerErr) {
                console.error("🔥 OMDb enrich failed for:", m.title, innerErr.message);
                return {
                  id: m.ids?.trakt || null,
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

          // console.log(`✅ Enriched ${enrichedResults.length} results for:`, name);

          return enrichedResults; // returns an array
        } catch (err) {
          console.error("🔥 Search failed for:", name, err.message);
          return [];
        }
      })
    );

    res.json({ movieNames, movies }); // movies is now an array of arrays
  } catch (err) {
    console.error("🔥 [Controller] Gemini error:", err.message);
    res.status(500).json({
      error: "Failed to get Gemini recommendations",
      details: err.message,
    });
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
