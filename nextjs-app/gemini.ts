/*
This file interfaces with the Gemini (large language model) on Google Cloud.
*/

import { activePrompt } from "./active-prompt";
import { Message } from "./conversation";
import { GenerateContentRequest, VertexAI, HarmBlockThreshold, SafetySetting, HarmCategory, IllegalArgumentError } from '@google-cloud/vertexai';

const generationConfig = {
  temperature: 0.2, // Lower values = less creative, more predictable, more factually accurate
  topP: 0.2, // Lower values = less creative, more predictable, more factually accurate
  maxOutputTokens: 500,
};

function buildContentToSendToGemini(messages: Message[]): string {
  let prompt = `${activePrompt.systemInstructions}`;
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
  const prompt = buildContentToSendToGemini(messages);
  const responseFromGemini = await fetchResponseFromGemini(prompt);
  return responseFromGemini;
}

async function fetchResponseFromGemini(prompt: string): Promise<string> {
  // The GOOGLE_CLOUD_PROJECT environment variable is automatically set by Google Cloud
  // for containers you run inside Cloud Run.
  const googleCloudProjectId = process.env.GOOGLE_CLOUD_PROJECT;
  try {
    const vertexAI = new VertexAI({ project: googleCloudProjectId, location: `us-central1` });
    const generativeModel = vertexAI.preview.getGenerativeModel({ model: `gemini-1.5-flash-001` });
    const request: GenerateContentRequest = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    };
    // Send request to Gemini
    console.debug(`Sending message to Gemini:\n ${prompt}`);
    const result = await generativeModel.generateContent(request);
    if (result && result.response && result.response.candidates && result.response.candidates[0]) {
      const parts = result.response.candidates[0].content.parts;
      const part = parts[parts.length - 1];
      if (part) {
        return part.text || "";
      }
    }
  } catch (error) {
    if (error instanceof IllegalArgumentError) {
      console.error(
        `\nAn error occured.`
        + `\nIf you're running this app on your local machine, this error likely means you need to run:`
        + `\n\texport GOOGLE_CLOUD_PROJECT=my-project-id`
        + `\nReplace my-project-id with your Google Cloud project ID. For more info, see https://cloud.google.com/resource-manager/docs/creating-managing-projects.`
        + `\n`
      );
    }
    throw error;
  }
  return "";
}

export { generateNextMessageUsingGemini };
