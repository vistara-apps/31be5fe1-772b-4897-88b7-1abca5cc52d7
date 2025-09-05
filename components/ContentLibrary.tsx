'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { ClipCard } from './ClipCard';

interface Clip {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  type: 'audio' | 'video';
  artist?: string;
  source_url: string;
  metadata: any;
}

export function ContentLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClips, setSelectedClips] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'audio' | 'video'>('all');
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClips();
  }, []);

  const fetchClips = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/upload');
      if (response.ok) {
        const result = await response.json();
        const formattedClips = result.clips.map((clip: any) => ({
          id: clip.id,
          title: clip.title,
          thumbnail: clip.metadata.thumbnail || '',
          duration: clip.metadata.duration || '0:00',
          type: clip.metadata.type,
          artist: clip.metadata.artist || 'Unknown',
          source_url: clip.source_url,
          metadata: clip.metadata
        }));
        setClips(formattedClips);
      }
    } catch (error) {
      console.error('Error fetching clips:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClips = clips.filter(clip => {
    const matchesSearch = clip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         clip.artist?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || clip.type === filter;
    return matchesSearch && matchesFilter;
  });

  const handleClipSelect = (clipId: string) => {
    setSelectedClips(prev => 
      prev.includes(clipId) 
        ? prev.filter(id => id !== clipId)
        : [...prev, clipId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <Input
              placeholder="Search clips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'text-white/60'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('audio')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'audio' ? 'bg-blue-600 text-white' : 'text-white/60'
              }`}
            >
              Audio
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'video' ? 'bg-blue-600 text-white' : 'text-white/60'
              }`}
            >
              Video
            </button>
          </div>
          
          <Button variant="icon" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {selectedClips.length > 0 && (
        <div className="glass p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-white">
              {selectedClips.length} clip{selectedClips.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <Button size="sm">Add to Editor</Button>
              <Button variant="secondary" size="sm" onClick={() => setSelectedClips([])}>
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className={`grid gap-4 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {filteredClips.map((clip) => (
          <ClipCard
            key={clip.id}
            clip={clip}
            variant="selectable"
            isSelected={selectedClips.includes(clip.id)}
            onSelect={handleClipSelect}
          />
        ))}
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="text-white/60 mt-4">Loading clips...</p>
        </div>
      )}

      {!loading && filteredClips.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/60">No clips found matching your search.</p>
        </div>
      )}
    </div>
  );
}
