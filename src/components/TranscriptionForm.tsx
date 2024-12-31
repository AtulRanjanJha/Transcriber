import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface TranscriptionFormProps {
  onTranscriptionComplete: (text: string) => void;
}

const TranscriptionForm = ({ onTranscriptionComplete }: TranscriptionFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Hardcoded API key
  const apiKey = "AIzaSyBo37RtCK2JQa6W6MyN8qN-ocvgShVLWDQ";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("audio/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an audio file",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleTranscribe = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an audio file to transcribe",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "https://speech.googleapis.com/v1/speech:recognize",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const data = await response.json();
      const transcriptionText =
        data.results?.[0]?.alternatives?.[0]?.transcript ||
        "No transcription available";
      onTranscriptionComplete(transcriptionText);

      toast({
        title: "Success",
        description: "Audio transcription completed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to transcribe audio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="cursor-pointer"
        />
        {file && (
          <p className="text-sm text-muted-foreground">
            Selected file: {file.name}
          </p>
        )}
      </div>

      <Button
        onClick={handleTranscribe}
        disabled={!file || isLoading}
        className="w-full sm:w-auto"
      >
        {isLoading ? "Transcribing..." : "Transcribe Audio"}
      </Button>
    </div>
  );
};

export default TranscriptionForm;
