interface Conversation {
  messages: Message[];
}

interface Message {
  isByBot: boolean;
  text: string;
  createTime: number;
}

export type { Conversation, Message };
