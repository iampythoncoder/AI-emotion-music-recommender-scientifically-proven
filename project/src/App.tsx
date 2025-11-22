import { useState } from "react";
import { Music2 } from "lucide-react";
import Recorder from "./components/Recorder";
import Results from "./components/Results";
import { predictEmotion, getPlaylist, PlaylistResponse } from "./api";

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<PlaylistResponse["playlist"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);
    setEmotion(null);
    setPlaylist(null);

    try {
      const emotionResult = await predictEmotion(audioBlob);
      setEmotion(emotionResult.emotion);

      const playlistResult = await getPlaylist(emotionResult.emotion);
      setPlaylist(playlistResult.playlist);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setEmotion(null);
    setPlaylist(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Music2 className="text-emerald-400" size={48} />
            <h1 className="text-5xl font-bold text-white">
              Emotion Music Recommender
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Speak for 3 seconds and get a playlist matching your emotion
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-300 text-center">{error}</p>
          </div>
        )}

        {!emotion ? (
          <Recorder
            onRecordingComplete={handleRecordingComplete}
            isProcessing={isProcessing}
          />
        ) : (
          <div className="space-y-8">
            <Results emotion={emotion} playlist={playlist} />
            <div className="text-center">
              <button
                onClick={handleReset}
                className="
                  px-6 py-3 rounded-lg
                  bg-gray-700 hover:bg-gray-600
                  text-white font-semibold
                  transition-colors duration-300
                "
              >
                Record Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
