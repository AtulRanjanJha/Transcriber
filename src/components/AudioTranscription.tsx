import { useState } from "react";
import TranscriptionComponent from "./ApiKeyInput"; // Import the updated TranscriptionComponent

const AudioTranscription = () => {
  const [transcription, setTranscription] = useState<string>("");

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Audio Transcription</h1>
          <p className="text-muted-foreground">Upload an audio file to transcribe it to text.</p>
        </div>

        {/* Render the Transcription Component */}
        <TranscriptionComponent 
          onTranscriptionComplete={setTranscription} 
        />

        {/* Display the transcription result if available */}
        {transcription && (
          <div className="p-4 border rounded-lg bg-muted">
            <h2 className="font-semibold mb-2">Transcription Result:</h2>
            <p className="whitespace-pre-wrap">{transcription}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioTranscription;
