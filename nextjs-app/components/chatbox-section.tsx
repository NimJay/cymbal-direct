'use client';

import { useState } from "react";
import styles from './chatbox-section.module.css';
import { Message } from "../conversation";
import { activePrompt } from "../active-prompt";

const FIRST_MESSAGE_BY_BOT: Message = {
  text: activePrompt.firstMessageByBot,
  isByBot: true,
  createTime: 0, // This Message object is never stored in the backend, so we use placeholder, 0
};

function MessageLi({ message }: { message: Message }) {
  return (
    <li className={message.isByBot ? styles.isByBot : ''}>
      {message.text}
    </li>
  );
}

export default function ChatbotSection() {
  // We'll only have a conversationId after the user sends their first message
  const [conversationId, setConversationId] = useState<string[]>();
  const [messages, setMessages] = useState<Message[]>([FIRST_MESSAGE_BY_BOT]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // We have a message already typed out for demo purposes
  const initialMessageText = "Do you have physical stores?";
  const [messageText, setMessageText] = useState<string>(initialMessageText);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !messageText.trim()) {
      return;
    }
    setErrorMessage("");
    setIsSubmitting(true);
    const responseAsJson = await fetch('/api/send-message', {
      method: 'POST',
      body: JSON.stringify({ conversationId, messageText }),
    });
    try {
      const response = await responseAsJson.json();
      if (!response.conversationId || !response.responseFromBot) {
        setErrorMessage("Oh no! Something went wrong.");
        return;
      }
      if (!conversationId) {
        // The user's first message (the backend has created a Conversation)
        setConversationId(response.conversationId);
      }
      messages.push(response.message);
      messages.push(response.responseFromBot);
      setMessageText('');
    } catch (err) {
      setErrorMessage("Oh no! Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const messagesLis = messages.map((message, index) => {
    return <MessageLi message={message} key={index} />;
  });

  return (
    <section className={styles.chatboxSection}>
      <ol>{messagesLis}</ol>
      <p className={styles.errorMessage}>{errorMessage}</p>
      <form onSubmit={onSubmit}>
        <textarea
          autoFocus
          value={messageText} onChange={(e) => setMessageText(e.target.value)}/>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send'}
        </button>
      </form>
    </section>
  );
}
