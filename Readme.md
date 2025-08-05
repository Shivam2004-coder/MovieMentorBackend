# 🎬 Movie-Mentor Backend

**Movie-Mentor Backend** is a Node.js and Express.js-powered REST API that provides movie and TV show data, including trending titles, top-rated lists, and personalized recommendations using AI. This backend is designed to serve data to the Movie-Mentor frontend application.

---

## 📁 Project Structure

movie-mentor-backend/
├── Controllers/
│ └── movieController.js
├── routes/
│ └── moviesRoutes.js
├── app.js
├── package.json
└── .env



---

## 🚀 Features

- 🔥 Fetch trending movies
- 📺 Fetch trending TV shows
- ⭐ Get top-rated movies
- 🎥 Browse popular movies
- 🎬 Discover now-playing movies
- 🤖 Get AI-based recommendations via Gemini
- 🎞️ Get detailed info about a specific movie by ID

---

## 🌐 API Endpoints

| Method | Route                 | Description                          |
|--------|-----------------------|--------------------------------------|
| GET    | `/trending`           | Get trending movies                  |
| GET    | `/tv/trending`        | Get trending TV shows                |
| GET    | `/top-rated`          | Get top-rated movies                 |
| GET    | `/popular`            | Get popular movies                   |
| GET    | `/now-playing`        | Get movies currently in theaters     |
| GET    | `/gemini/recommend`   | Get AI-powered recommended movies    |
| GET    | `/:id`                | Get detailed movie info by ID        |

---

## 🛠️ Technologies Used

- **Node.js**
- **Express.js**
- **TMDB API** – for movie and TV show data
- **Gemini (Google AI)** – for recommendation engine
- **dotenv** – for managing environment variables

---

## 🧠 Recommendation Engine
The route /gemini/recommend integrates Google Gemini API to provide smart recommendations based on genre, mood, or user input. Ensure that your Gemini API key has sufficient quota and permissions enabled.

## 📦 Installation & Setup

### 1. Clone the Repository

git clone https://github.com/your-username/movie-mentor-backend.git
cd movie-mentor-backend

### 2. Install Dependencies

Copy
Edit
npm install

### 3. Create Environment Variables
Create a .env file in the root folder and add your API keys:

- **PORT=5000**
- **TRAKT_CLIENT_ID=your_trakt_client_id**
- **TRAKT_CLIENT_SECRET=your_trakt_client_secret**
- **OMDB_API_KEY=your_omdb_api_key**
- **YOUTUBE_API_KEY=your_youtube_api_key**
- **GEMINI_API_KEY=your_gemini_api_key**

### 4. Run the Server

Copy
Edit
npm start
Server will run on: http://localhost:5000/

### 👤 Author
Made with 💻 by Shivam Vaishnav
Feel free to reach out for collaboration or feedback.

### 📄 License
This project is open-source and available under the [MIT License](https://opensource.org/licenses/MIT).
