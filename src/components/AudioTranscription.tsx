import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AudioTranscription = () => {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [newApiKey, setNewApiKey] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('key_value')
        .single();

      if (error) {
        console.error('Error fetching API key:', error);
        setShowApiKeyInput(true);
        return;
      }

      if (data) {
        setApiKey(data.key_value);
        setShowApiKeyInput(false);
      } else {
        setShowApiKeyInput(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setShowApiKeyInput(true);
    }
  };

  const saveApiKey = async () => {
    if (!newApiKey) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('api_keys')
        .insert([
          { key_name: 'google_speech', key_value: newApiKey }
        ]);

      if (error) throw error;

      setApiKey(newApiKey);
      setShowApiKeyInput(false);
      toast({
        title: "Success",
        description: "API key saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive",
      });
    }
  };

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

    if (!apiKey) {
      toast({
        title: "No API key",
        description: "Please save your API key first",
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
          'Authorization': `Bearer ${apiKey}`,
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

        {showApiKeyInput ? (
          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Input
                type="text"
                placeholder="Enter your Google Speech-to-Text API key"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                className="mb-2"
              />
              <Button onClick={saveApiKey}>Save API Key</Button>
            </div>
          </div>
        ) : (
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
        )}

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