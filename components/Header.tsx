'use client';

import { Search, Bell, User } from 'lucide-react';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

export function Header() {
  return (
    <header className="h-16 glass border-b border-white/10 flex items-center justify-between px-6">
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">R</span>
          </div>
          <span className="text-xl font-bold text-white">RemixRite</span>
        </div>
        
        <nav className="hidden md:flex space-x-6">
          <a href="#" className="text-white hover:text-blue-400">RemixRite</a>
          <a href="#" className="text-white/60 hover:text-white">Collabor</a>
          <a href="#" className="text-white/60 hover:text-white">Masonic tiny-llogs</a>
          <a href="#" className="text-white/60 hover:text-white">Pouss</a>
        </nav>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
          <Input
            placeholder="Search..."
            className="pl-10 w-64"
          />
        </div>
        <Button variant="icon">
          <Bell className="w-5 h-5" />
        </Button>
        <ConnectWallet />
      </div>
    </header>
  );
}
