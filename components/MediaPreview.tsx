'use client';

import { Play, Pause, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface MediaPreviewProps {
  variant: 'audio' | 'video';
  src?: string;
  title: string;
  duration?: string;
}

export function MediaPreview({ variant, src, title, duration }: MediaPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Card className="p-4">
      <div className="flex items-center space-x-4">
        <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
          variant === 'video' ? 'bg-purple-600' : 'bg-blue-600'
        }`}>
          {variant === 'video' ? (
            <div className="text-2xl">🎬</div>
          ) : (
            <Volume2 className="w-8 h-8 text-white" />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-white">{title}</h3>
          {duration && (
            <p className="text-sm text-white/60">{duration}</p>
          )}
        </div>
        
        <Button variant="icon" onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
      </div>
      
      {variant === 'audio' && (
        <div className="mt-4">
          <div className="w-full h-1 bg-white/20 rounded-full">
            <div className="w-1/3 h-1 bg-blue-500 rounded-full"></div>
          </div>
        </div>
      )}
    </Card>
  );
}
