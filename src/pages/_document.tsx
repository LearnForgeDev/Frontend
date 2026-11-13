import { Head, Html, Main, NextScript, type DocumentContext } from 'next/document';
import { DocumentHeadTags, documentGetInitialProps, type DocumentHeadTagsProps } from '@mui/material-nextjs/v16-pagesRouter';

export default function LearnForgeDocument(props: DocumentHeadTagsProps) {
  return <Html lang="ru">
    <Head>
      <DocumentHeadTags {...props} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@200..500&display=swap" rel="stylesheet" />
    </Head>
    <body><Main /><NextScript /></body>
  </Html>;
}

LearnForgeDocument.getInitialProps = (context: DocumentContext) => documentGetInitialProps(context);
