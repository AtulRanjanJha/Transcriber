import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ApiKeyFormProps {
  onApiKeySaved: (key: string) => void;
}

const ApiKeyForm = ({ onApiKeySaved }: ApiKeyFormProps) => {
  const [newApiKey, setNewApiKey] = useState("");
  const { toast } = useToast();

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

      onApiKeySaved(newApiKey);
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

  return (
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
  );
};

export default ApiKeyForm;