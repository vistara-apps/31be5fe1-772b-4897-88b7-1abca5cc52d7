'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { DragDropEditor } from '@/components/DragDropEditor';
import { ContentLibrary } from '@/components/ContentLibrary';
import { RoyaltyChart } from '@/components/RoyaltyChart';
import { Card } from '@/components/ui/Card';

const mockAnalyticsData = [
  { month: 'Jan', earnings: 120 },
  { month: 'Feb', earnings: 180 },
  { month: 'Mar', earnings: 350 },
  { month: 'Apr', earnings: 280 },
  { month: 'May', earnings: 420 },
  { month: 'Jun', earnings: 520 },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard />;
      case 'editor':
        return <DragDropEditor />;
      case 'library':
        return <ContentLibrary />;
      case 'analytics':
        return (
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-bold text-white mb-6">Analytics Overview</h2>
              <RoyaltyChart data={mockAnalyticsData} variant="line" />
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Monthly Breakdown</h3>
              <RoyaltyChart data={mockAnalyticsData} variant="bar" />
            </Card>
          </div>
        );
      case 'settings':
        return (
          <Card>
            <h2 className="text-xl font-bold text-white mb-6">Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">Display Name</label>
                <input className="input" placeholder="Your display name" />
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-2">Royalty Split %</label>
                <input className="input" type="number" placeholder="50" />
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-2">Auto-distribute</label>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-white/80 text-sm">Enable automatic royalty distribution</span>
                </div>
              </div>
            </div>
          </Card>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
