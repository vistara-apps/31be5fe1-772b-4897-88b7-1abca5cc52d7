import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
});

export async function generateContentSuggestions(query: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "system",
          content: "You are an AI curator for RemixRite. Suggest relevant audio and video clips for remixing based on user queries. Return suggestions in a structured format."
        },
        {
          role: "user",
          content: `Suggest 5 relevant audio/video clips for remixing based on this query: ${query}`
        }
      ],
      max_tokens: 1000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating content suggestions:', error);
    return null;
  }
}
