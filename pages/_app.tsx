/**
 * @file pages / _app.tsx
 */

import { SessionProvider } from 'next-auth/react';
import Layout from '@com/layout';
import { Quicksand } from 'next/font/google';
import '../styles.css';

const quicksandFont = Quicksand({
  weight: ['400', '600', '700'],
  subsets: ['latin']
});

const Application = ({ Component, pageProps: { session, ...pageProps } }) => {
  return (
    <SessionProvider session={session}>
      <main className={quicksandFont.className}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </main>
    </SessionProvider>
  )
};

export default Application;
