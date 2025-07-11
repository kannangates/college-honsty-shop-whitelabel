import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const WhitelabelConfig = () => {
  const [jsonContent, setJsonContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch the whitelabel.json file from the public directory
    fetch('/whitelabel.json')
      .then((res) => res.json())
      .then((data) => setJsonContent(JSON.stringify(data, null, 2)))
      .catch(() => setJsonContent('// Failed to load whitelabel.json'));
  }, []);

  const handleSave = () => {
    // Placeholder: Saving will require backend/edge function
    toast({
      title: 'Not Implemented',
      description: 'Saving changes will be available soon.',
      variant: 'destructive',
    });
  };

  return (
    <div className="space-y-4 text-sm">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800 text-lg">Edit Whitelabel Config</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            className="w-full font-mono text-xs min-h-[400px]"
            value={jsonContent}
            onChange={e => setJsonContent(e.target.value)}
            spellCheck={false}
            disabled={!isEditing}
          />
          <div className="flex gap-2 mt-4">
            <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
            <Button onClick={handleSave} disabled={!isEditing} className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhitelabelConfig; 