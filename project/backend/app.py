from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from dotenv import load_dotenv
import os
import shutil
from pathlib import Path
from model import emotion_detector
from utils.emotion_map import EMOTION_TO_PLAYLIST

load_dotenv()

app = FastAPI(title="Emotion-Based Music Recommender API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("temp_audio")
UPLOAD_DIR.mkdir(exist_ok=True)

def get_spotify_client():
    client_id = os.getenv("SPOTIFY_CLIENT_ID")
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")

    if not client_id or not client_secret:
        raise HTTPException(
            status_code=500,
            detail="Spotify credentials not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET"
        )

    auth_manager = SpotifyClientCredentials(
        client_id=client_id,
        client_secret=client_secret
    )
    return spotipy.Spotify(auth_manager=auth_manager)

@app.get("/")
def root():
    return {
        "message": "Emotion-Based Music Recommender API",
        "endpoints": {
            "POST /predict": "Upload audio file to detect emotion",
            "GET /playlist/{emotion}": "Get Spotify playlist for emotion"
        }
    }

@app.post("/predict")
async def predict_emotion(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be an audio file")

    temp_file_path = UPLOAD_DIR / f"temp_{file.filename}"

    try:
        with temp_file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        emotion = emotion_detector.predict_emotion(str(temp_file_path))

        return {"emotion": emotion}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")

    finally:
        if temp_file_path.exists():
            temp_file_path.unlink()

@app.get("/playlist/{emotion}")
def get_playlist(emotion: str):
    emotion_lower = emotion.lower()

    if emotion_lower not in EMOTION_TO_PLAYLIST:
        raise HTTPException(
            status_code=400,
            detail=f"Emotion '{emotion}' not supported. Supported emotions: {list(EMOTION_TO_PLAYLIST.keys())}"
        )

    try:
        sp = get_spotify_client()

        playlist_data = EMOTION_TO_PLAYLIST[emotion_lower]
        playlist_id = playlist_data["id"]

        playlist = sp.playlist(playlist_id)

        tracks_data = []
        for item in playlist["tracks"]["items"][:5]:
            track = item["track"]
            if track:
                tracks_data.append({
                    "name": track["name"],
                    "artist": ", ".join([artist["name"] for artist in track["artists"]]),
                    "url": track["external_urls"]["spotify"],
                    "preview_url": track.get("preview_url")
                })

        return {
            "emotion": emotion_lower,
            "playlist": {
                "name": playlist["name"],
                "description": playlist.get("description", ""),
                "cover_image": playlist["images"][0]["url"] if playlist["images"] else None,
                "url": playlist["external_urls"]["spotify"],
                "tracks": tracks_data
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching playlist: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
