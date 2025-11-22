import torch
import torchaudio
from transformers import AutoModelForAudioClassification, Wav2Vec2FeatureExtractor
from utils.emotion_map import HUBERT_LABEL_MAP
import os

class EmotionDetector:
    def __init__(self):
        self.model_name = "superb/hubert-large-superb-er"
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.feature_extractor = None

    def load_model(self):
        if self.model is None:
            print(f"Loading emotion recognition model: {self.model_name}")
            self.feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained(self.model_name)
            self.model = AutoModelForAudioClassification.from_pretrained(self.model_name)
            self.model.to(self.device)
            self.model.eval()
            print("Model loaded successfully")

    def preprocess_audio(self, audio_path: str):
        waveform, sample_rate = torchaudio.load(audio_path)

        if waveform.shape[0] > 1:
            waveform = torch.mean(waveform, dim=0, keepdim=True)

        if sample_rate != 16000:
            resampler = torchaudio.transforms.Resample(sample_rate, 16000)
            waveform = resampler(waveform)

        waveform = waveform.squeeze().numpy()

        return waveform

    def predict_emotion(self, audio_path: str) -> str:
        self.load_model()

        waveform = self.preprocess_audio(audio_path)

        inputs = self.feature_extractor(
            waveform,
            sampling_rate=16000,
            return_tensors="pt",
            padding=True
        )

        inputs = {key: val.to(self.device) for key, val in inputs.items()}

        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits

        predicted_id = torch.argmax(logits, dim=-1).item()

        emotion = HUBERT_LABEL_MAP.get(predicted_id, "neutral")

        if emotion == "neutral":
            emotion = "calm"

        print(f"Predicted emotion: {emotion}")
        return emotion

emotion_detector = EmotionDetector()
