/*
This file implements the API endpoint used to create a new message inside a conversation.
*/

import { randomUUID } from "crypto";
import { activePrompt } from "../../../active-prompt";
import { Conversation } from "../../../conversation";
import { createDocument, getDocumentById, updateDocument } from "../../../database";
import { generateNextMessageUsingGemini } from "../../../generate-next-message";

export async function POST(request: Request) {
  const { conversationId, messageText } = await request.json() as { conversationId: string; messageText: string };
  // We have not implemented proper validation of the request body
  // because the primary purpose of this app is to serve as a demo for Google Cloud.

  // Get the existing Conversation or create a new Conversation
  let conversation: Conversation;
  if (conversationId) {
    conversation = await getDocumentById("Conversation", conversationId) as Conversation;
    if (!conversation) {
      return new Response("Invalid conversation ID.", { status: 400 });
    }
  } else {
    conversation = constructNewConversation();
  }

  // Add the user's new message
  const newMessageByUser = {
    isByBot: false,
    text: messageText,
    createTime: new Date().getTime(),
  };
  conversation.messages.push(newMessageByUser);

  // Generate a response using an LLM (large language model)
  const responseFromLlm = await generateNextMessageUsingGemini(conversation.messages);
  const responseFromBot = {
    text: responseFromLlm,
    isByBot: true,
    createTime: new Date().getTime(),
  };
  conversation.messages.push(responseFromBot);

  if (conversationId) {
    await updateDocument("Conversation", conversation);
  } else {
    await createDocument("Conversation", conversation);
  }
  return new Response(JSON.stringify({
    message: newMessageByUser,
    conversationId: conversation.id,
    responseFromBot,
  }));
}

function constructNewConversation(): Conversation {
  console.log("Constructing new conversation.");
  const conversation: Conversation = {
    id: randomUUID(),
    messages: [
      {
        text: activePrompt.firstMessageByBot,
        isByBot: true,
        createTime: new Date().getTime(),
      }
    ],
  };
  return conversation;
}
