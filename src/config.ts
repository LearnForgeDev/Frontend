export default {
  endpointUrl: process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_PRODUCTION_SERVER_LINK || process.env.NEXT_PUBLIC_SERVER_LINK || ''
    : process.env.NEXT_PUBLIC_DEV_SERVER_LINK || process.env.NEXT_PUBLIC_SERVER_LINK || '',
  meetServerUrl: process.env.NEXT_PUBLIC_MEET_SERVER_LINK || '',
};
