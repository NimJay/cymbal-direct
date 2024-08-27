'use client';

import { useEffect, useState } from "react";
import styles from './chatbox-section.module.css';

interface Message {
  isByBot: boolean;
  text: string;
}

function MessageLi({ message }: { message: Message }) {
  return (
    <li className={message.isByBot ? styles.isByBot : ''}>
      {message.text}
    </li>
  );
}

export default function ChatbotSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState<boolean>(true);
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
      body: JSON.stringify({ conversationId: 'Placeholder', messageText }),
    });
    try {
      const response = await responseAsJson.json();
      if (!response.responseFromBot) {
        setErrorMessage("Oh no! Something went wrong.");
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

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await fetch('/api/conversation');
        if (!response.ok) {
          throw new Error('Failed to fetch conversation');
        }
        const { conversations } = await response.json();
        console.log(conversations);
        setMessages(conversations[0].messages);
      } catch (err) {
        setErrorMessage((err as Error).message || 'An unknown error occurred');
      } finally {
        setIsLoadingInitialData(false);
      }
    };
    fetchConversation();
  }, []);

  if (isLoadingInitialData) {
    return (
      <section className={styles.chatboxSection}>Loading chat...</section>
    );
  }

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
