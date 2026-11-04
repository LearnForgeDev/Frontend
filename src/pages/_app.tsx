import '@/Services/Lessons/LessonIdPage.css';
import '@/Services/Lessons/LessonsMainPage.css';
import '@/Services/Lessons/components/LessonItem/LessonItem.css';
import '@/Services/Lessons/components/TextEditor/lexicalEditorTheme.css';
import '@/Services/Lessons/components/TextEditorComponents/nodes/fileNode.css';
import '@/Services/Lessons/components/TextEditorComponents/nodes/graphNode.css';
import '@/Services/Lessons/components/TextEditorComponents/nodes/imageNode.css';
import '@/Services/Lessons/components/TextEditorComponents/plugins/Controls.css';
import '@/Services/Lessons/components/TextEditorComponents/plugins/katexEquationModal.css';
import '@/Services/Lessons/components/TextEditorComponents/ui/EquationEditor.css';
import '@/Services/Lessons/components/TextEditorComponents/ui/Toolbar.css';
import '@/Services/Lessons/components/TextEditorComponents/ui/modals/FloatingLinkEditor.css';
import '@/Services/Lessons/components/TextEditorComponents/ui/modals/InsertImageModal.css';
import '@/Services/Lessons/components/TextEditorComponents/ui/modals/InsertVideoModal.css';
import '@/Services/Lessons/components/TextEditorComponents/ui/modals/KatexEquationModal.css';
import '@/Services/Lessons/styles.css';
import 'katex/dist/katex.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import Head from 'next/head';
import { AppCacheProvider } from '@mui/material-nextjs/v16-pagesRouter';
import { CssBaseline, ThemeProvider } from '@mui/material';
import AppGlobalStyles from '@/Assets/globalStyles';
import { theme } from '@/Assets/theme';
import ErrorBoundary from '@/Assets/Components/ErrorBoundary/ErrorBoundary';
import SessionQueryProvider from '@/Storage/QueryContext/SessionQueryProvider';
import { UserProvider } from '@/Storage/UserContext/UserContext';
import NextRouterBridge from '@/Router/NextRouterBridge';
import { restoreSavedNotifications } from '@/Storage/globalNotificationStore';

export default function LearnForgeApp(props: AppProps<{ initialPath?: string }>) {
  const { Component, pageProps, router } = props;
  useEffect(restoreSavedNotifications, []);
  return <AppCacheProvider {...props}>
    <Head>
      <title>LearnForge</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/brand-mark.png" />
    </Head>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppGlobalStyles />
      <ErrorBoundary>
        <NextRouterBridge initialPath={pageProps.initialPath ?? router.asPath}>
          <SessionQueryProvider>
            <UserProvider><Component {...pageProps} /></UserProvider>
          </SessionQueryProvider>
        </NextRouterBridge>
      </ErrorBoundary>
    </ThemeProvider>
  </AppCacheProvider>;
}
