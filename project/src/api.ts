const API_BASE_URL = "http://localhost:8000";

export interface EmotionResponse {
  emotion: string;
}

export interface Track {
  name: string;
  artist: string;
  url: string;
  preview_url: string | null;
}

export interface PlaylistResponse {
  emotion: string;
  playlist: {
    name: string;
    description: string;
    cover_image: string | null;
    url: string;
    tracks: Track[];
  };
}

export const predictEmotion = async (audioBlob: Blob): Promise<EmotionResponse> => {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.wav");

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to predict emotion: ${response.statusText}`);
  }

  return response.json();
};

export const getPlaylist = async (emotion: string): Promise<PlaylistResponse> => {
  const response = await fetch(`${API_BASE_URL}/playlist/${emotion}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch playlist: ${response.statusText}`);
  }

  return response.json();
};
