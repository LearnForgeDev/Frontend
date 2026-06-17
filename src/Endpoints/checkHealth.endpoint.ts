import config from '../config';

export const checkHealthEndpoint = async (): Promise<boolean> => {
  const response = await fetch(`${config.endpointUrl}/health`);
  return response.ok;
};

