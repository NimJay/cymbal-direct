/*
This file interfaces with the Gemini (large language model) on Google Cloud.
*/

import { activePrompt } from "./active-prompt";
import { GenerateContentRequest, VertexAI, HarmBlockThreshold, SafetySetting, HarmCategory, IllegalArgumentError, Content, ToolConfig, Tool, Part, FunctionCall, FunctionCallPart, FunctionResponsePart } from '@google-cloud/vertexai';

const generationConfig = {
  temperature: 0.2, // Lower values = less creative, more predictable, more factually accurate
  topP: 0.2, // Lower values = less creative, more predictable, more factually accurate
  maxOutputTokens: 500,
};

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

async function fetchResponseFromGemini(
  systemInstruction: string,
  contents: Content[],
  tools: Tool[],
  toolConfig: ToolConfig,
  functionCallHandler: (functionCalls: FunctionCallPart[]) => Promise<FunctionResponsePart[]>,
): Promise<Part[]> {
  // The GOOGLE_CLOUD_PROJECT environment variable is automatically set by Google Cloud
  // for containers you run inside Cloud Run.
  const googleCloudProjectId = process.env.GOOGLE_CLOUD_PROJECT;
  try {
    const vertexAI = new VertexAI({ project: googleCloudProjectId, location: `us-central1` });
    const generativeModel = vertexAI.preview.getGenerativeModel({ model: `gemini-1.5-flash-001` });
    const request: GenerateContentRequest = {
      systemInstruction,
      contents,
      generationConfig,
      safetySettings,
      tools,
      toolConfig,
    };
    // Send request to Gemini
    console.log(`Sending message to Gemini containing ${contents} Contents.`);
    console.debug(`Sending message to Gemini Contents: ${JSON.stringify(contents)}`);
    const result = await generativeModel.generateContent(request);
    const candidates = result?.response?.candidates;
    console.log(`Got response from Gemini ${JSON.stringify(candidates[0].content)}`);
    if (Array.isArray(candidates)) {
      const parts = candidates[0].content.parts;
      const functionCallParts = parts.filter(part => part.functionCall);
      const hasFunctionCallPart = functionCallParts.length > 0;
      if (hasFunctionCallPart) {
        const functionResponseParts = await functionCallHandler(functionCallParts as FunctionCallPart[]);
        const newContents = [...contents]; // Shallow copy
        functionResponseParts.forEach((part, index) => {
          newContents.push({
            parts: [functionCallParts[index]],
            role: 'MODEL',
          });
          newContents.push({
            parts: [part],
            role: '',
          });
        });
        return fetchResponseFromGemini(
          systemInstruction,
          newContents,
          tools,
          toolConfig,
          functionCallHandler,
        );
      }
      return parts;
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
  return [];
}

export { fetchResponseFromGemini };
