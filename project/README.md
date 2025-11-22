# Emotion-Based Music Recommender

A full-stack web application that analyzes voice emotion from a 3-second audio recording and recommends matching Spotify playlists.

## Features

- **Voice Recording**: Record 3 seconds of audio with real-time waveform visualization
- **Emotion Detection**: Uses HuggingFace's `superb/hubert-large-superb-er` pretrained model for speech emotion recognition
- **Playlist Recommendations**: Fetches curated Spotify playlists that match the detected emotion
- **Modern UI**: Clean, dark-themed interface with smooth animations and transitions

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **MediaRecorder API** for audio recording
- **Web Audio API** for visualization

### Backend
- **FastAPI** for the REST API
- **PyTorch** and **Transformers** for ML inference
- **Torchaudio** for audio preprocessing
- **Spotipy** for Spotify API integration
- **Python 3.9+**

## Project Structure

```
/emotion-music-app
├── backend/
│   ├── app.py                 # FastAPI application with endpoints
│   ├── model.py               # Emotion detection model loader
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example          # Environment variables template
│   └── utils/
│       └── emotion_map.py    # Emotion to playlist mapping
├── src/
│   ├── App.tsx               # Main React component
│   ├── api.ts                # API client functions
│   ├── components/
│   │   ├── Recorder.tsx      # Voice recording component
│   │   └── Results.tsx       # Playlist display component
│   └── index.css             # Global styles
└── README.md
```

## Supported Emotions

The application detects and maps the following emotions to Spotify playlists:

- **Happy** → Happy Hits
- **Sad** → Sad Songs
- **Angry** → Angry Music
- **Calm** → Peaceful Piano
- **Energetic** → Beast Mode

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Spotify Developer Account

### 1. Get Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new application
3. Copy your **Client ID** and **Client Secret**

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your Spotify credentials
# SPOTIFY_CLIENT_ID=your_client_id_here
# SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

### 3. Frontend Setup

```bash
# From project root directory
npm install
```

## Running the Application

### Start Backend Server

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

The backend will start on `http://localhost:8000`

### Start Frontend Development Server

```bash
# From project root directory
npm run dev
```

The frontend will start on `http://localhost:5173`

## API Endpoints

### `POST /predict`

Analyzes audio file and returns detected emotion.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Audio file (WAV format recommended)

**Response:**
```json
{
  "emotion": "happy"
}
```

### `GET /playlist/{emotion}`

Fetches Spotify playlist for the given emotion.

**Request:**
- Method: `GET`
- Path Parameter: `emotion` (happy, sad, angry, calm, energetic)

**Response:**
```json
{
  "emotion": "happy",
  "playlist": {
    "name": "Happy Hits",
    "description": "Playlist description",
    "cover_image": "https://...",
    "url": "https://open.spotify.com/...",
    "tracks": [
      {
        "name": "Track Name",
        "artist": "Artist Name",
        "url": "https://open.spotify.com/track/...",
        "preview_url": "https://..."
      }
    ]
  }
}
```

## How It Works

1. **User records voice**: Click "Start Recording" to capture 3 seconds of audio
2. **Audio processing**: The audio blob is sent to the backend `/predict` endpoint
3. **Emotion detection**:
   - Audio is preprocessed (resampled to 16kHz, converted to mono)
   - Passed through HuggingFace's emotion recognition model
   - Model outputs predicted emotion label
4. **Playlist retrieval**: Frontend calls `/playlist/{emotion}` endpoint
5. **Display results**: Playlist cover, name, and top 5 tracks are displayed
6. **Listen**: User can click through to Spotify to play the full playlist

## Model Information

**Model**: `superb/hubert-large-superb-er`

This is a HuBERT (Hidden-Unit BERT) model fine-tuned for emotion recognition on speech. It's part of the SUPERB (Speech processing Universal PERformance Benchmark) suite.

- **Input**: 16kHz mono audio
- **Output**: Emotion classification (neutral, calm, happy, sad, angry, etc.)
- **Framework**: PyTorch + Transformers

## Development Notes

- The first model load may take time as it downloads the pretrained weights
- Audio files are temporarily stored during processing and immediately deleted
- CORS is enabled for local development
- The application uses the MediaRecorder API which requires HTTPS in production or localhost in development

## Troubleshooting

### Backend Issues

**Error: Spotify credentials not configured**
- Make sure you've created a `.env` file in the backend directory
- Verify your Spotify Client ID and Secret are correct

**Error: Model download fails**
- Ensure you have a stable internet connection
- The model is approximately 1.2GB and will be cached after first download

### Frontend Issues

**Error: Cannot access microphone**
- Grant microphone permissions in your browser
- Use HTTPS or localhost

**Error: Failed to connect to backend**
- Verify the backend is running on port 8000
- Check CORS settings if deploying to production

## License

MIT

## Credits

- Emotion Recognition Model: [HuggingFace SUPERB](https://huggingface.co/superb/hubert-large-superb-er)
- Spotify API: [Spotipy](https://spotipy.readthedocs.io/)
