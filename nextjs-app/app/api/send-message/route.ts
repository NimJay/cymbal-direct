/*
This file implements the API endpoint used to create a new message inside a conversation.
*/

import { randomUUID } from "crypto";
import { activePrompt } from "../../../active-prompt";
import { Conversation } from "../../../conversation";
import { getById } from "../../../database";
import { generateNextMessageUsingGemini } from "../../../gemini";

export async function POST(request: Request) {
  const { conversationId, messageText } = await request.json() as { conversationId: string; messageText: string };
  // We have not implemented proper validation of the request body
  // because the primary purpose of this app is to serve as a demo for Google Cloud.
  let conversation: Conversation;
  if (conversationId) {
    conversation = await getById("Conversation", conversationId) as Conversation;
    if (!conversation) {
      return new Response("Invalid conversation ID.", { status: 400 });
    }
  } else {
    conversation = constructNewConversation();
  }
  const newMessage = {
    isByBot: false,
    text: messageText,
    createTime: new Date().getTime(),
  };
  conversation.messages.push(newMessage);
  const responseFromLlm = await generateNextMessageUsingGemini(conversation.messages);
  const responseFromBot = {
    text: responseFromLlm,
    isByBot: true,
  };
  return new Response(JSON.stringify({
    message: newMessage,
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
