
const { GoogleGenAI } = require("@google/genai");

// Use a global variable to keep track of the next API key to use.
// This provides a simple round-robin implementation for a serverless environment,
// distributing requests across available keys.
let nextKeyIndex = 0;
const MAX_ATTEMPTS = 5; // The total number of attempts before failing.

const PROMPT = `
Generate a short, direct, negative comment about a coffee shop experience. 
The comment can be regarding different coffee itens, such as latte, mocha, americano, chai latte. 
It can also be about cinnamon rolls, pies, croissants, sandwiches. 
It can also be regarding the place, such as the chairs, tables, temperature or other ambiance problems.
It can also be about customer service.
The tone should be similar to a tweet. The comment can include hashtags and/or emojis.
Do not wrap the response in markdown backticks.

Here are some examples of the desired style and content:
- "Worst coffee ever. Tasted like burnt, never coming back again. #burntcoffee"
- "The customer service is really bad in here. The attendant got my name wrong all times and also my order came incorrect as well."
- "I had to stay in line for almost an hour just to get my latte, and it wasn't worth it. #crowded"
- "My drink was cold and tasted like dirty water from the dishwasher. #gross"
- "This place is freezing! 🥶 Came here to warm up with a coffee, but I'm colder than I was outside. #coffeefail #badambiance"
- "The croissant was stale and the chai latte tasted like spiced water. What a disappointment. 😩"
- "Waited 20 minutes for a simple black coffee. The service is unbelievably slow. Not coming back on a work day. #slowservice"
- "The music is way too loud! Can't even have a conversation. It's a coffee shop, not a nightclub. 🔊"
`;

exports.generateComplaint = async (req, res) => {
  // Set CORS headers for preflight requests and main requests
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }

  // Only allow POST requests for the actual function execution
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const apiKeys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ].filter(key => key); // Filter out any undefined/empty keys

  const numKeys = apiKeys.length;
  if (numKeys === 0) {
    console.error("No GEMINI_API_KEY environment variables are set in the function's configuration.");
    return res.status(500).send({ error: 'Server configuration error: Missing API keys.' });
  }

  // Start with the next available API key from our round-robin sequence.
  let currentKeyIndex = nextKeyIndex;

  // Attempt to generate a complaint, retrying up to MAX_ATTEMPTS with different keys.
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const apiKey = apiKeys[currentKeyIndex];
    
    try {
      console.log(`Attempt ${attempt + 1}/${MAX_ATTEMPTS} using API key index ${currentKeyIndex}.`);
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: PROMPT,
      });

      // The .text accessor safely extracts the generated string.
      const complaint = response.text?.trim();
      nextKeyIndex = (currentKeyIndex + 1) % numKeys;
      // A successful response must contain a non-empty complaint string.
      if (complaint) {
        console.log(`Successfully generated complaint on attempt ${attempt + 1}.`);
        return res.status(200).send({ complaint });
      } else {
        // This handles cases where the API returns a 200 OK response but with empty content.
        console.warn(`Attempt ${attempt + 1} with key index ${currentKeyIndex} succeeded but returned an empty response. Retrying...`);
      }
    } catch (error) {
      // The SDK's generateContent method throws an error for failed API requests (e.g., non-200 responses).
      // By catching it, we allow the loop to continue and retry with the next key.
      console.warn(`Attempt ${attempt + 1} with key index ${currentKeyIndex} failed. Error: ${error.message}. Retrying...`);
    }

    // If the attempt fails (either by error or empty response), move to the next key for the next attempt.
    currentKeyIndex = (currentKeyIndex + 1) % numKeys;
  }

  // This part is reached only if all attempts have failed.
  console.error(`All ${MAX_ATTEMPTS} attempts failed to generate a valid complaint.`);
  return res.status(500).send({ error: `Failed to generate complaint after ${MAX_ATTEMPTS} retries.` });
};
