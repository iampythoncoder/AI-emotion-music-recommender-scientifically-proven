import { ExternalLink, Music, Sparkles } from "lucide-react";
import { PlaylistResponse } from "../api";

interface ResultsProps {
  emotion: string;
  playlist: PlaylistResponse["playlist"] | null;
}

const Results = ({ emotion, playlist }: ResultsProps) => {
  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      happy: "from-yellow-400 to-orange-400",
      sad: "from-blue-400 to-blue-600",
      angry: "from-red-500 to-orange-600",
      calm: "from-teal-400 to-cyan-500",
      energetic: "from-pink-500 to-purple-600",
    };
    return colors[emotion] || "from-gray-400 to-gray-600";
  };

  const getEmotionEmoji = (emotion: string) => {
    const emojis: Record<string, string> = {
      happy: "😊",
      sad: "😢",
      angry: "😠",
      calm: "😌",
      energetic: "⚡",
    };
    return emojis[emotion] || "🎵";
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 mb-4">
          <Sparkles className="text-yellow-400" size={24} />
          <h2 className="text-xl text-gray-400">Detected Emotion</h2>
        </div>

        <div
          className={`
          inline-block px-12 py-6 rounded-2xl
          bg-gradient-to-r ${getEmotionColor(emotion)}
          text-white font-bold text-5xl
          shadow-2xl transform hover:scale-105 transition-transform
        `}
        >
          <div className="flex items-center space-x-4">
            <span className="text-6xl">{getEmotionEmoji(emotion)}</span>
            <span className="capitalize">{emotion}</span>
          </div>
        </div>
      </div>

      {playlist && (
        <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
          <div className="relative">
            {playlist.cover_image && (
              <div className="relative h-64 overflow-hidden">
                <img
                  src={playlist.cover_image}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-800 via-gray-800/50 to-transparent" />
              </div>
            )}

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {playlist.name}
                  </h3>
                  {playlist.description && (
                    <p className="text-gray-400 text-sm">{playlist.description}</p>
                  )}
                </div>
                <Music className="text-emerald-400" size={32} />
              </div>

              <a
                href={playlist.url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex items-center space-x-2 px-6 py-3 mb-6
                  bg-gradient-to-r from-emerald-500 to-teal-500
                  hover:from-emerald-600 hover:to-teal-600
                  text-white font-semibold rounded-lg
                  transition-all duration-300 transform hover:scale-105
                "
              >
                <span>Listen on Spotify</span>
                <ExternalLink size={18} />
              </a>

              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-300 mb-3">
                  Top Tracks
                </h4>
                {playlist.tracks.map((track, index) => (
                  <div
                    key={index}
                    className="
                      flex items-center justify-between p-4
                      bg-gray-700/50 hover:bg-gray-700
                      rounded-lg transition-colors
                      group
                    "
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-500 font-mono text-sm w-6">
                          {index + 1}.
                        </span>
                        <div>
                          <p className="text-white font-medium">{track.name}</p>
                          <p className="text-gray-400 text-sm">{track.artist}</p>
                        </div>
                      </div>
                    </div>
                    <a
                      href={track.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        opacity-0 group-hover:opacity-100
                        transition-opacity duration-200
                        text-emerald-400 hover:text-emerald-300
                      "
                    >
                      <ExternalLink size={18} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
