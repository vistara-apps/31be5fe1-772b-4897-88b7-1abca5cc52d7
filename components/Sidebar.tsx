'use client';

import { useState } from 'react';
import { Home, Video, Music, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'editor', icon: Video, label: 'Editor' },
    { id: 'library', icon: Music, label: 'Library' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-16 glass border-r border-white/10 flex flex-col items-center py-6 space-y-6">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-lg">R</span>
      </div>
      
      <div className="flex flex-col space-y-4">
        {menuItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
              activeTab === id 
                ? 'bg-blue-600 text-white' 
                : 'text-white/60 hover:text-white hover:bg-white/10'
            )}
            title={label}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>
    </div>
  );
}
