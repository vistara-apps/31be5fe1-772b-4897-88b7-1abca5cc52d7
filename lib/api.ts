import { supabase } from './supabase';

// Types for API responses
export interface Clip {
  id: string;
  title: string;
  source_url: string;
  metadata: {
    duration: string;
    type: 'audio' | 'video';
    artist?: string;
    thumbnail?: string;
    tags?: string[];
  };
  owner_address: string;
  story_protocol_id: string;
}

export interface Remix {
  id: string;
  creator_id: string;
  original_clip_ids: string[];
  output_url: string;
  story_protocol_tx_hash: string;
  created_at: string;
}

export interface RoyaltyDistribution {
  id: string;
  remix_id: string;
  original_owner_address: string;
  amount: number;
  timestamp: string;
}

// API functions for clips
export const clipAPI = {
  async getAll(): Promise<Clip[]> {
    const { data, error } = await supabase
      .from('clips')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async search(query: string, type?: 'audio' | 'video'): Promise<Clip[]> {
    let queryBuilder = supabase
      .from('clips')
      .select('*')
      .or(`metadata->>title.ilike.%${query}%,metadata->>artist.ilike.%${query}%`);
    
    if (type) {
      queryBuilder = queryBuilder.eq('metadata->>type', type);
    }
    
    const { data, error } = await queryBuilder.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(clip: Omit<Clip, 'id'>): Promise<Clip> {
    const { data, error } = await supabase
      .from('clips')
      .insert({
        source_url: clip.source_url,
        metadata: clip.metadata,
        owner_address: clip.owner_address,
        story_protocol_id: clip.story_protocol_id
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// API functions for remixes
export const remixAPI = {
  async getAll(): Promise<Remix[]> {
    const { data, error } = await supabase
      .from('remixes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByCreator(creatorId: string): Promise<Remix[]> {
    const { data, error } = await supabase
      .from('remixes')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(remix: Omit<Remix, 'id' | 'created_at'>): Promise<Remix> {
    const { data, error } = await supabase
      .from('remixes')
      .insert({
        creator_id: remix.creator_id,
        original_clip_ids: remix.original_clip_ids,
        output_url: remix.output_url,
        story_protocol_tx_hash: remix.story_protocol_tx_hash
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// API functions for royalty distributions
export const royaltyAPI = {
  async getByRemix(remixId: string): Promise<RoyaltyDistribution[]> {
    const { data, error } = await supabase
      .from('royalty_distributions')
      .select('*')
      .eq('remix_id', remixId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(distribution: Omit<RoyaltyDistribution, 'id' | 'timestamp'>): Promise<RoyaltyDistribution> {
    const { data, error } = await supabase
      .from('royalty_distributions')
      .insert({
        remix_id: distribution.remix_id,
        original_owner_address: distribution.original_owner_address,
        amount: distribution.amount
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getEarnings(ownerAddress: string): Promise<{ total: number; distributions: RoyaltyDistribution[] }> {
    const { data, error } = await supabase
      .from('royalty_distributions')
      .select('*')
      .eq('original_owner_address', ownerAddress)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    const distributions = data || [];
    const total = distributions.reduce((sum, dist) => sum + dist.amount, 0);
    
    return { total, distributions };
  }
};

// User API functions
export const userAPI = {
  async create(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .insert({ user_id: userId })
      .select()
      .single();
    
    if (error && error.code !== '23505') { // Ignore duplicate key errors
      throw error;
    }
  },

  async exists(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select('user_id')
      .eq('user_id', userId)
      .single();
    
    return !error && !!data;
  }
};
