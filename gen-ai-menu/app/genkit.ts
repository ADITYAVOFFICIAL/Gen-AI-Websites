'use server'

import * as z from 'zod';

// Import the Genkit core libraries and plugins.
import { generate } from '@genkit-ai/ai';
import { configureGenkit } from '@genkit-ai/core';
import { defineFlow, runFlow } from '@genkit-ai/flow';
import { googleAI } from '@genkit-ai/googleai';

// Import models from the Google AI plugin. The Google AI API provides access to
// several generative models. Here, we import Gemini 1.5 Flash.
import { gemini15Pro } from '@genkit-ai/googleai';

configureGenkit({
  plugins: [
    // Load the Google AI plugin. You can optionally specify your API key
    // by passing in a config object; if you don't, the Google AI plugin uses
    // the value from the GOOGLE_GENAI_API_KEY environment variable, which is
    // the recommended practice.
    googleAI(),
  ],
  // Log debug output to tbe console.
  logLevel: "debug",
  // Perform OpenTelemetry instrumentation and enable trace collection.
  enableTracingAndMetrics: true,
});

// Define a simple flow that prompts an LLM to generate menu suggestions.
const menuSuggestionFlow = defineFlow(
  {
    name: 'menuSuggestionFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (subject) => {
    // Construct a request and send it to the model API.
    const llmResponse = await generate({
      prompt: `Suggest items for the menu of a ${subject} themed restaurant. Include:
  - Starters (e.g., soups, salads, finger foods)
  - Appetizers (e.g., dips, small plates)
  - Main courses (e.g., meat, vegetarian, seafood options)
  - Side dishes (e.g., vegetables, bread, rice)
  - Drinks (e.g., soft drinks, cocktails, mocktails, wines)
  - Desserts (e.g., cakes, pastries, ice creams, traditional sweets)
  - Specialty items (e.g., signature dishes, chef specials)
  - Breakfast options (if applicable)
  - Kids’ menu (if applicable)
  Only list the names of the dishes in an ordered format and nothing else.If the user gives bad input like offensive words,irrelevant queries or other inappropriate content, please just say Bad choice for restaurant theme.`,
      model: gemini15Pro,
      config: {
        temperature: 1,
      },
    });

    // Handle the response from the model API. In this sample, we just
    // convert it to a string, but more complicated flows might coerce the
    // response into structured output or chain the response into another
    // LLM call, etc.
    return llmResponse.text();
  }
);

export async function callMenuSuggestionFlow(theme: string) {
  const flowResponse = await runFlow(menuSuggestionFlow, theme);
  console.log(flowResponse);
  return flowResponse;
}
