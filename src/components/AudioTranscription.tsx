import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const AudioTranscription = () => {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('audio/')) {
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
    formData.append('file', file);

    try {
      const response = await fetch('https://speech.googleapis.com/v1/speech:recognize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      setTranscription(data.results?.[0]?.alternatives?.[0]?.transcript || 'No transcription available');
      
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
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Audio Transcription</h1>
          <p className="text-muted-foreground">Upload an audio file to transcribe it to text</p>
        </div>

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