'use client';

import { Card } from './ui/Card';
import { RoyaltyChart } from './RoyaltyChart';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, Users, Music, Play } from 'lucide-react';

const mockEarningsData = [
  { month: 'Jan', earnings: 120 },
  { month: 'Feb', earnings: 180 },
  { month: 'Mar', earnings: 350 },
  { month: 'Apr', earnings: 280 },
  { month: 'May', earnings: 420 },
  { month: 'Jun', earnings: 380 },
];

const mockRoyaltyData = [
  { month: 'Jul', earnings: 200 },
  { month: 'Aug', earnings: 280 },
  { month: 'Sep', earnings: 420 },
  { month: 'Oct', earnings: 350 },
  { month: 'Nov', earnings: 480 },
  { month: 'Dec', earnings: 520 },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm">Drag or drop on</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(233)}</p>
              <p className="text-white/60 text-sm flex items-center mt-2">
                <Users className="w-4 h-4 mr-1" />
                Existing 'ven Sansi so alive
              </p>
              <p className="text-white/60 text-sm">Consumer Inc Maps</p>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-blue-500/20 rounded-full"></div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600/20 to-blue-600/20">
          <div className="flex items-center justify-between mb-4">
            <Play className="w-8 h-8 text-white" />
            <span className="text-2xl font-bold text-white">57</span>
          </div>
          <p className="text-white/80 text-sm mb-2">Even like</p>
          <p className="text-white/80 text-sm">Even More</p>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-orange-500"></div>
              <div>
                <p className="text-xs text-white">Chärtä</p>
                <div className="w-20 h-1 bg-white/20 rounded-full">
                  <div className="w-3/4 h-1 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm">Ever FC Devices</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(1786)} <span className="text-sm font-normal">each</span></p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 mt-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500"></div>
            <div className="flex-1">
              <div className="w-full h-2 bg-white/20 rounded-full">
                <div className="w-2/3 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Royalty distribution</h3>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <RoyaltyChart data={mockEarningsData} variant="line" />
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Royalty distribution</h3>
            <span className="text-sm text-white/60">£££,000</span>
          </div>
          <RoyaltyChart data={mockRoyaltyData} variant="bar" />
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Recent Remixes</h3>
        <div className="space-y-3">
          {[
            { title: 'Summer Vibes Remix', artist: 'AI Generated', earnings: 45.50 },
            { title: 'Bass Drop Mix', artist: 'Community Track', earnings: 32.80 },
            { title: 'Chill Lofi Edit', artist: 'Licensed Content', earnings: 28.90 },
          ].map((remix, index) => (
            <div key={index} className="flex items-center justify-between p-3 glass rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">{remix.title}</p>
                  <p className="text-white/60 text-sm">{remix.artist}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">{formatCurrency(remix.earnings)}</p>
                <p className="text-green-400 text-sm">+12%</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
