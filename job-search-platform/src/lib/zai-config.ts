import '@/lib/load-root-env';

const DEFAULT_ZAI_ENDPOINT = 'https://api.z.ai/api/coding/paas/v4/';
const DEFAULT_ZAI_MODEL = 'glm-5';

export function getResolvedZAIConfig() {
  const apiKey =
    process.env.JOBSCOUT_ZAI_API_KEY ||
    process.env.API_KEY ||
    process.env.ZAI_API_KEY ||
    '';

  const apiEndpoint =
    process.env.JOBSCOUT_ZAI_API_ENDPOINT ||
    process.env.ZAI_API_ENDPOINT ||
    DEFAULT_ZAI_ENDPOINT;

  const model =
    process.env.JOBSCOUT_ZAI_MODEL ||
    process.env.ZAI_MODEL ||
    DEFAULT_ZAI_MODEL;

  return {
    apiKey,
    apiEndpoint,
    model,
  };
}

export function hasResolvedZAIConfig() {
  return Boolean(getResolvedZAIConfig().apiKey);
}
