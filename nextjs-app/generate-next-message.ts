/*
This file use a large language model (LLM) (for example, Gemini) to generate the AI assistant's next response
to a user's message in a conversation.
*/

import { Content } from "@google-cloud/vertexai";
import { activePrompt } from "./active-prompt";
import { Message } from "./conversation";
import { fetchResponseFromGemini } from "./gemini";
import { getProductsRelatedToText } from "./related-products";

async function buildContentsToSendToGemini(messages: Message[]): Promise<Content[]> {
  let content: Content[] = [];
  for (const message of messages) {
    const role = message.isByBot ? "ASSISTANT" : "USER";
    content.push({ role, parts: [{ text: message.text }] });
  }
  return content;
}

async function buildStringListingRelatedProducts(messages: Message[]): Promise<string> {
  const latestMessage = messages[messages.length - 1].text;
  let string = `You may find the following list of products related to the user's query useful:`;
  const relatedProducts = await getProductsRelatedToText(latestMessage);
  if (relatedProducts.length === 0) {
    return '';
  }
  // Exclude IDs and any other potentially noisy and/or sensitive fields from Product objects
  const cleanedProductObjects = relatedProducts.map(product => {
    return {
      name: product.name,
      price: product.price,
      description: product.description,
    };
  });
  return string + `\n${JSON.stringify(cleanedProductObjects)}\n`;
}

async function generateNextMessageUsingGemini(messages: Message[]) {
  const contents = await buildContentsToSendToGemini(messages);
  let systemInstruction = activePrompt.systemInstructions;
  try {
    const relatedProductsString = await buildStringListingRelatedProducts(messages);
    systemInstruction += relatedProductsString;
  } catch (error) {
    console.warn(`Failed to include list of related products in system instruction sent to Gemini.`);
  }
  const responseFromGemini = await fetchResponseFromGemini(systemInstruction, contents);
  return responseFromGemini;
}

export { generateNextMessageUsingGemini };
