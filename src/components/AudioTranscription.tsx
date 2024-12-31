import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ApiKeyForm from "./ApiKeyForm";
import TranscriptionForm from "./TranscriptionForm";

const AudioTranscription = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [transcription, setTranscription] = useState<string>("");

  useEffect(() => {
    // On component mount, try to save the provided API key
    const saveInitialApiKey = async () => {
      try {
        const { error } = await supabase
          .from('api_keys')
          .insert([
            { key_name: 'google_speech', key_value: 'AIzaSyBo37RtCK2JQa6W6MyN8qN-ocvgShVLWDQ' }
          ]);

        if (!error) {
          setApiKey('AIzaSyBo37RtCK2JQa6W6MyN8qN-ocvgShVLWDQ');
          setShowApiKeyInput(false);
        }
      } catch (error) {
        console.error('Error saving initial API key:', error);
        fetchApiKey(); // Fallback to fetching existing key
      }
    };

    saveInitialApiKey();
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

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Audio Transcription</h1>
          <p className="text-muted-foreground">Upload an audio file to transcribe it to text</p>
        </div>

        {showApiKeyInput ? (
          <ApiKeyForm onApiKeySaved={(key) => {
            setApiKey(key);
            setShowApiKeyInput(false);
          }} />
        ) : (
          <TranscriptionForm 
            apiKey={apiKey}
            onTranscriptionComplete={setTranscription}
          />
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