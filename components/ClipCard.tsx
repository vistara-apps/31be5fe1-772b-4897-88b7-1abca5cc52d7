'use client';

import { useState } from 'react';
import { Play, Pause, Plus, Check } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';

interface ClipCardProps {
  clip: {
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
    type: 'audio' | 'video';
    artist?: string;
  };
  variant?: 'selectable' | 'preview';
  isSelected?: boolean;
  onSelect?: (clipId: string) => void;
}

export function ClipCard({ clip, variant = 'selectable', isSelected, onSelect }: ClipCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSelect = () => {
    onSelect?.(clip.id);
  };

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-200 hover:scale-105',
      isSelected && 'ring-2 ring-blue-500'
    )}>
      <div className="relative">
        <div className="w-full h-32 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg mb-3 flex items-center justify-center">
          {clip.type === 'video' ? (
            <div className="text-4xl">🎬</div>
          ) : (
            <div className="text-4xl">🎵</div>
          )}
        </div>
        
        <div className="absolute top-2 right-2 flex space-x-2">
          <Button variant="icon" size="sm" onClick={handlePlay}>
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          {variant === 'selectable' && (
            <Button variant="icon" size="sm" onClick={handleSelect}>
              {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </Button>
          )}
        </div>
        
        <div className="absolute bottom-2 right-2">
          <span className="text-xs bg-black/50 px-2 py-1 rounded">
            {clip.duration}
          </span>
        </div>
      </div>
      
      <div>
        <h3 className="font-medium text-white truncate">{clip.title}</h3>
        {clip.artist && (
          <p className="text-sm text-white/60 truncate">{clip.artist}</p>
        )}
      </div>
    </Card>
  );
}
