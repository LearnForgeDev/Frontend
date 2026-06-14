export default {
  endpointUrl: (import.meta.env.VITE_YENV === 'production' || import.meta.env.MODE === 'production')
    ? import.meta.env.VITE_PRODUCTION_SERVER_LINK || ""
    : import.meta.env.VITE_DEV_SERVER_LINK || "",
};
