/*
This file implements the API endpoint used to create a new message inside a conversation.
*/

import { Conversation, Message } from "../../../conversation";
import { getAll } from "../../../database";
import { generateNextMessageUsingGemini } from "../../../gemini";

export async function POST(request: Request) {
  const { conversationId, messageText } = await request.json() as { conversationId: string; messageText: string };
  // We have not implemented proper validation of the request body
  // because the primary purpose of this app is to serve as a demo for Google Cloud.
  const conversations = await getAll("conversation"); // TODO: Use conversationId.
  if (!conversations || !conversations[0]) {
    return new Response("Invalid conversation ID.", { status: 400 });
  }
  const conversation = conversations[0] as Conversation;
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
  return new Response(JSON.stringify({ message: { text: messageText }, responseFromBot }));
}
