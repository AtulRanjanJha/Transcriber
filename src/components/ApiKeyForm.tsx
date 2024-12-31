import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const HARDCODED_API_KEY = "AIzaSyBo37RtCK2JQa6W6MyN8qN-ocvgShVLWDQ"; // Replace with your API key

const TranscriptionComponent = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState("");
  const { toast } = useToast();

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleTranscription = async () => {
    if (!HARDCODED_API_KEY.trim()) {
      toast({
        title: "API Key Missing",
        description: "Please provide a valid API key in the code.",
        variant: "destructive",
      });
      return;
    }
    if (!audioFile) {
      toast({
        title: "Audio File Required",
        description: "Please upload an audio file for transcription",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Processing", description: "Transcribing the audio..." });

    try {
      // Perform transcription using the Google Speech-to-Text API
      const response = await fetch("https://speech.googleapis.com/v1/speech:recognize", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HARDCODED_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          config: {
            encoding: "LINEAR16",
            sampleRateHertz: 16000,
            languageCode: "en-US",
          },
          audio: {
            content: await audioFile.arrayBuffer(), // Encode audio as base64
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to transcribe audio");
      }

      const data = await response.json();
      setTranscription(data.results.map((result: any) => result.alternatives[0].transcript).join(" "));
      toast({ title: "Success", description: "Transcription completed!" });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to transcribe the audio",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-semibold text-center mb-4">Google AI Transcription</h2>

      <h3 className="text-lg font-semibold text-center mb-4">Upload Audio for Transcription</h3>
      <Input
        type="file"
        accept="audio/*"
        onChange={handleAudioUpload}
        className="w-full"
      />
      <Button
        type="button"
        className="w-full mt-4"
        onClick={handleTranscription}
        disabled={!audioFile}
      >
        Transcribe Audio
      </Button>

      {transcription && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold">Transcription Result:</h4>
          <p className="text-sm text-gray-700 mt-2">{transcription}</p>
        </div>
      )}
    </div>
  );
};

export default TranscriptionComponent;
