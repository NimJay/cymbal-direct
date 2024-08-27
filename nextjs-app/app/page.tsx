'use client';

import '../styles/global.css';
import styles from './page.module.css';
import Head from 'next/head';
import ChatbotSection from "../components/chatbox-section";

export default function HomePage() {
  return (
    <div className={styles.homePage}>
      <Head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet" />
      </Head>
      <header>
        <div>
          <img src="/cymbal-direct-logo.svg" alt="Cymbal Direct Logo" />
        </div>
      </header>
      <main>
        <ChatbotSection />
      </main>
    </div>
  );
}
