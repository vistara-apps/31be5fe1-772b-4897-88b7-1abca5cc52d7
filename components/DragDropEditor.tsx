'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Play, Download } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ClipCard } from './ClipCard';
import { motion } from 'framer-motion';

interface SelectedClip {
  id: string;
  title: string;
  type: 'audio' | 'video';
  position: number;
}

export function DragDropEditor() {
  const [selectedClips, setSelectedClips] = useState<SelectedClip[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Handle file drop logic here
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeClip = (clipId: string) => {
    setSelectedClips(clips => clips.filter(clip => clip.id !== clipId));
  };

  const processRemix = async () => {
    setIsProcessing(true);
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      <Card className="p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Drag an drop video</h2>
          <p className="text-white/80">
            Drag and drop audio or video directly clips
          </p>
          <p className="text-white/60 text-sm">
            Featuring files for all sorts of royality inside moon
          </p>
          <p className="text-white/60 text-sm">
            None pixels and sizes of the editing payload
          </p>
          <p className="text-white/80 mt-2">
            Formats: mp4/mov/avi/mp3/wav
          </p>
        </div>

        <div
          className="border-2 border-dashed border-white/30 rounded-lg p-12 text-center hover:border-blue-500 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Upload className="w-12 h-12 text-white/60 mx-auto mb-4" />
          <p className="text-white/80 mb-2">Drop your files here or</p>
          <Button variant="secondary">Browse Files</Button>
        </div>

        <div className="flex gap-4 mt-6">
          <Button className="flex-1">
            <span className="mr-2">🎬</span>
            Super Maker
          </Button>
          <Button variant="secondary" className="flex-1">
            <span className="mr-2">🤖</span>
            AI Annotate
          </Button>
        </div>
      </Card>

      {selectedClips.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Selected Clips</h3>
          <div className="space-y-3">
            {selectedClips.map((clip) => (
              <motion.div
                key={clip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 glass rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    clip.type === 'video' ? 'bg-purple-600' : 'bg-blue-600'
                  }`}>
                    {clip.type === 'video' ? '🎬' : '🎵'}
                  </div>
                  <div>
                    <p className="text-white font-medium">{clip.title}</p>
                    <p className="text-white/60 text-sm capitalize">{clip.type}</p>
                  </div>
                </div>
                <Button variant="icon" onClick={() => removeClip(clip.id)}>
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={processRemix} disabled={isProcessing} className="flex-1">
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Create Remix
                </>
              )}
            </Button>
            <Button variant="secondary">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
