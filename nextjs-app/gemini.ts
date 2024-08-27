/*
This file interfaces with the Gemini (large language model) on Google Cloud.
*/

import { Message } from "./conversation";
import { GenerateContentRequest, VertexAI, HarmBlockThreshold, SafetySetting, HarmCategory } from '@google-cloud/vertexai';

const generationConfig = {
  temperature: 0.2, // Lower values = less creative, more predictable, more factually accurate
  topP: 0.2, // Lower values = less creative, more predictable, more factually accurate
  maxOutputTokens: 500,
};

function buildPromptToSendToGemini(messages: Message[]): string {
  let prompt = `
You are a helpful assistant (chat bot) for Cymbal Direct.

About Cymbal Direct
Cymbal Direct is an online direct-to-consumer footwear and apparel retailer headquartered in Chicago.
Founded in 2008, Cymbal Direct (originally 'Antern') is a fair trade and B Corp certified sustainability-focused company that works with cotton farmers to reinvest in their communities.
In 2010, as Cymbal Group began focusing on digitally-savvy businesses that appealed to a younger demographic of shoppers, the holding company acquired Antern and renamed it Cymbal Direct. In 2019, Cymbal Direct reported an annual revenue of $7 million and employed a total of 32 employees.
Cymbal Direct is a digitally native retailer.

Do not include website links.

Provide the next message in this sequence of messages.`;
  for (const message of messages) {
    prompt += `<start_of_turn>${message.isByBot ? "Assistant" : "Customer"}\n`;
    prompt += `${message.text}<end_of_turn>`;
  }
  prompt += `<start_of_turn>Assistant`;
  return prompt;
}

const safetySettings: SafetySetting[] = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

async function generateNextMessageUsingGemini(messages: Message[]) {
  const prompt = buildPromptToSendToGemini(messages);
  const responseFromGemini = await fetchResponseFromGemini(prompt);
  return responseFromGemini;
}

async function fetchResponseFromGemini(prompt: string): Promise<string> {
  // The GOOGLE_CLOUD_PROJECT environment variable is automatically set by Google Cloud
  // for containers you run inside Cloud Run.
  const googleCloudProjectId = process.env.GOOGLE_CLOUD_PROJECT;
  const vertexAI = new VertexAI({ project: googleCloudProjectId, location: `us-central1` });
  const generativeModel = vertexAI.preview.getGenerativeModel({ model: `gemini-1.5-flash-001` });
  const request: GenerateContentRequest = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig,
    safetySettings,
  };
  console.debug(`Sending message to Gemini:\n ${prompt}`);
  const result = await generativeModel.generateContent(request);
  if (result && result.response && result.response.candidates && result.response.candidates[0]) {
    const parts = result.response.candidates[0].content.parts;
    const part = parts[parts.length - 1];
    if (part) {
      return part.text || "";
    }
  }
  return "";
}

export { generateNextMessageUsingGemini };
