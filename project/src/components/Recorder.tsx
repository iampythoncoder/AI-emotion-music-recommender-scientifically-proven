import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2 } from "lucide-react";

interface RecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  isProcessing: boolean;
}

const Recorder = ({ onRecordingComplete, isProcessing }: RecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(20).fill(0));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      stopRecording();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const visualize = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const bars = 20;
    const step = Math.floor(dataArray.length / bars);
    const newData = [];

    for (let i = 0; i < bars; i++) {
      newData.push(dataArray[i * step] / 255);
    }

    setVisualizerData(newData);
    animationRef.current = requestAnimationFrame(visualize);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      visualize();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        onRecordingComplete(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 0.1;
          if (newTime >= 3) {
            stopRecording();
            return 3;
          }
          return newTime;
        });
      }, 100);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please grant permission.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      setVisualizerData(new Array(20).fill(0));
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center items-end h-32 space-x-1">
          {visualizerData.map((value, index) => (
            <div
              key={index}
              className="w-3 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t transition-all duration-100"
              style={{
                height: `${Math.max(8, value * 120)}px`,
                opacity: isRecording ? 0.8 : 0.2,
              }}
            />
          ))}
        </div>
      </div>

      <div className="text-center">
        {isRecording && (
          <div className="text-2xl font-mono text-emerald-400 mb-4">
            {recordingTime.toFixed(1)}s / 3.0s
          </div>
        )}

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`
            group relative px-8 py-4 rounded-full font-semibold text-lg
            transition-all duration-300 transform hover:scale-105
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            ${
              isRecording
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
            }
          `}
        >
          <div className="flex items-center space-x-3">
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                <span>Processing...</span>
              </>
            ) : isRecording ? (
              <>
                <Square size={24} />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <Mic size={24} />
                <span>Start Recording</span>
              </>
            )}
          </div>
        </button>

        {!isRecording && !isProcessing && (
          <p className="mt-4 text-gray-400 text-sm">
            Click to record 3 seconds of your voice
          </p>
        )}
      </div>
    </div>
  );
};

export default Recorder;
