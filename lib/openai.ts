import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
});

export interface ContentSuggestion {
  title: string;
  description: string;
  type: 'audio' | 'video';
  tags: string[];
  mood: string;
  genre?: string;
  duration?: string;
  relevanceScore: number;
}

export interface RemixIdea {
  concept: string;
  description: string;
  suggestedClips: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: string;
  tags: string[];
}

export async function generateContentSuggestions(
  query: string, 
  type?: 'audio' | 'video' | 'both',
  mood?: string,
  genre?: string
): Promise<ContentSuggestion[]> {
  try {
    const systemPrompt = `You are an AI assistant specialized in music and video content curation for remixing. 
    You understand audio/video production, genres, moods, and what content works well together for remixes.
    Always respond with valid JSON containing an array of content suggestions.`;

    const userPrompt = `Generate 5-8 content suggestions for remixing based on:
    - Query: "${query}"
    - Type: ${type || 'both'}
    - Mood: ${mood || 'any'}
    - Genre: ${genre || 'any'}
    
    Return a JSON array of objects with: title, description, type, tags, mood, genre, duration, relevanceScore (0-1)`;

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) return [];

    try {
      const suggestions = JSON.parse(response);
      return Array.isArray(suggestions) ? suggestions : [];
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return generateFallbackSuggestions(query, type);
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return generateFallbackSuggestions(query, type);
  }
}

export async function generateRemixIdeas(
  selectedClips: string[],
  userPreferences?: {
    style?: string;
    mood?: string;
    duration?: string;
  }
): Promise<RemixIdea[]> {
  try {
    const systemPrompt = `You are a creative AI assistant that helps users create amazing remixes. 
    You understand music theory, video editing, and how different content can be combined creatively.
    Always respond with valid JSON.`;

    const userPrompt = `Generate 3-5 creative remix ideas using these clips: ${selectedClips.join(', ')}
    
    User preferences:
    - Style: ${userPreferences?.style || 'any'}
    - Mood: ${userPreferences?.mood || 'any'}
    - Duration: ${userPreferences?.duration || 'any'}
    
    Return a JSON array with: concept, description, suggestedClips, difficulty, estimatedDuration, tags`;

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 800,
      temperature: 0.8,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) return [];

    try {
      const ideas = JSON.parse(response);
      return Array.isArray(ideas) ? ideas : [];
    } catch (parseError) {
      console.error('Failed to parse remix ideas:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error generating remix ideas:', error);
    return [];
  }
}

export async function analyzeContentCompatibility(
  clips: Array<{ title: string; type: 'audio' | 'video'; metadata?: any }>
): Promise<{
  compatibility: number; // 0-1 score
  suggestions: string[];
  warnings: string[];
  recommendedOrder: number[];
}> {
  try {
    const systemPrompt = `You are an AI expert in audio/video production and remixing. 
    Analyze content compatibility for remixing and provide actionable feedback.
    Always respond with valid JSON.`;

    const userPrompt = `Analyze these clips for remix compatibility:
    ${clips.map((clip, i) => `${i + 1}. ${clip.title} (${clip.type})`).join('\n')}
    
    Return JSON with: compatibility (0-1), suggestions (array), warnings (array), recommendedOrder (array of indices)`;

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 600,
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      return {
        compatibility: 0.5,
        suggestions: ['Unable to analyze compatibility'],
        warnings: [],
        recommendedOrder: clips.map((_, i) => i)
      };
    }

    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse compatibility analysis:', parseError);
      return {
        compatibility: 0.5,
        suggestions: ['Analysis unavailable'],
        warnings: [],
        recommendedOrder: clips.map((_, i) => i)
      };
    }
  } catch (error) {
    console.error('Error analyzing compatibility:', error);
    return {
      compatibility: 0.5,
      suggestions: ['Analysis failed'],
      warnings: ['Unable to analyze content compatibility'],
      recommendedOrder: clips.map((_, i) => i)
    };
  }
}

export async function generateRemixTitle(
  originalTitles: string[],
  style?: string,
  mood?: string
): Promise<string[]> {
  try {
    const systemPrompt = `You are a creative AI that generates catchy, original titles for music and video remixes.
    Create titles that are engaging, memorable, and reflect the content being remixed.`;

    const userPrompt = `Generate 5 creative remix titles based on:
    - Original content: ${originalTitles.join(', ')}
    - Style: ${style || 'any'}
    - Mood: ${mood || 'any'}
    
    Return only the titles, one per line, without numbering.`;

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 200,
      temperature: 0.9,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) return [`Remix of ${originalTitles[0] || 'Unknown'}`];

    return response
      .split('\n')
      .map(title => title.trim())
      .filter(title => title.length > 0)
      .slice(0, 5);
  } catch (error) {
    console.error('Error generating remix titles:', error);
    return [`Remix of ${originalTitles[0] || 'Unknown'}`];
  }
}

export async function generateContentTags(
  title: string,
  description: string,
  type: 'audio' | 'video'
): Promise<string[]> {
  try {
    const systemPrompt = `You are an AI that generates relevant tags for audio and video content.
    Generate tags that help with discovery, categorization, and remixing.`;

    const userPrompt = `Generate 8-12 relevant tags for this ${type} content:
    Title: "${title}"
    Description: "${description}"
    
    Return only the tags, separated by commas, without additional text.`;

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 150,
      temperature: 0.5,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) return [type, 'remix', 'content'];

    return response
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0)
      .slice(0, 12);
  } catch (error) {
    console.error('Error generating tags:', error);
    return [type, 'remix', 'content'];
  }
}

// Fallback suggestions when OpenAI is unavailable
function generateFallbackSuggestions(
  query: string, 
  type?: 'audio' | 'video' | 'both'
): ContentSuggestion[] {
  const audioSuggestions: ContentSuggestion[] = [
    {
      title: "Upbeat Electronic Loop",
      description: "High-energy electronic beat perfect for remixing",
      type: "audio",
      tags: ["electronic", "upbeat", "loop", "dance"],
      mood: "energetic",
      genre: "electronic",
      duration: "2:30",
      relevanceScore: 0.8
    },
    {
      title: "Ambient Piano Melody",
      description: "Peaceful piano melody with ambient textures",
      type: "audio",
      tags: ["piano", "ambient", "peaceful", "melody"],
      mood: "calm",
      genre: "ambient",
      duration: "3:15",
      relevanceScore: 0.7
    }
  ];

  const videoSuggestions: ContentSuggestion[] = [
    {
      title: "Urban Cityscape Timelapse",
      description: "Dynamic city footage with moving traffic and lights",
      type: "video",
      tags: ["urban", "city", "timelapse", "dynamic"],
      mood: "energetic",
      duration: "1:45",
      relevanceScore: 0.8
    },
    {
      title: "Nature Documentary Clip",
      description: "Beautiful nature footage with wildlife",
      type: "video",
      tags: ["nature", "wildlife", "documentary", "peaceful"],
      mood: "calm",
      duration: "2:20",
      relevanceScore: 0.7
    }
  ];

  if (type === 'audio') return audioSuggestions;
  if (type === 'video') return videoSuggestions;
  return [...audioSuggestions, ...videoSuggestions];
}

// Utility functions
export const aiUtils = {
  filterSuggestionsByRelevance(
    suggestions: ContentSuggestion[], 
    minScore: number = 0.6
  ): ContentSuggestion[] {
    return suggestions
      .filter(s => s.relevanceScore >= minScore)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  },

  groupSuggestionsByType(
    suggestions: ContentSuggestion[]
  ): { audio: ContentSuggestion[]; video: ContentSuggestion[] } {
    return {
      audio: suggestions.filter(s => s.type === 'audio'),
      video: suggestions.filter(s => s.type === 'video')
    };
  },

  extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 10);
  },

  calculateContentSimilarity(
    content1: ContentSuggestion,
    content2: ContentSuggestion
  ): number {
    const tags1 = new Set(content1.tags);
    const tags2 = new Set(content2.tags);
    const intersection = new Set([...tags1].filter(x => tags2.has(x)));
    const union = new Set([...tags1, ...tags2]);
    
    return intersection.size / union.size;
  }
};
