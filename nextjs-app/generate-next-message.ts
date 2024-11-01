/*
This file use a large language model (LLM) (for example, Gemini) to generate the AI assistant's next response
to a user's message in a conversation.
*/

import { Content } from "@google-cloud/vertexai";
import { activePrompt } from "./active-prompt";
import { Message } from "./conversation";
import { fetchResponseFromGemini } from "./gemini";

function buildContentToSendToGemini(messages: Message[]): Content[] {
  let content: Content[] = [];
  for (const message of messages) {
    const role = message.isByBot ? "model" : "user";
    content.push({ role, parts: [{ text: message.text }] });
  }
  return content;
}

async function generateNextMessageUsingGemini(messages: Message[]) {
  const contents = buildContentToSendToGemini(messages);
  const responseFromGemini = await fetchResponseFromGemini(activePrompt.systemInstructions, contents);
  return responseFromGemini;
}

export { generateNextMessageUsingGemini };
