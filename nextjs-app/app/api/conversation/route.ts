import { getAll } from "../../../database";
import { Conversation } from "../../../conversation";

export async function GET(request: Request) {
  const conversations = await getAll("conversation") as Conversation[];
  return new Response(JSON.stringify({ conversations }));
}
