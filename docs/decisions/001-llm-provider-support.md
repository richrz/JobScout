# ADR 001: LLM Provider Support

**Status**: Accepted  
**Date**: 2025-12-12  
**Author**: Development Team

## Context

The application requires integration with various LLM providers for resume generation and other AI-powered features. Different users have access to different LLM providers, and the system needs to support:

1. Multiple mainstream providers (OpenAI, Anthropic, Google Gemini)
2. Aggregator services (OpenRouter)
3. Enterprise deployments (Azure OpenAI)
4. Custom/compatible endpoints (z.ai, local Ollama)
5. Dynamic model discovery from custom endpoints

## Decision

We will implement a multi-provider LLM abstraction layer with the following design:

### Supported Providers (December 2025)

| Provider | Status | Notes |
|----------|--------|-------|
| **OpenAI** | ✅ Supported | Uses `OPENAI_API_KEY` env var |
| **Anthropic** | ✅ Supported | Supports custom endpoints (z.ai) via `ANTHROPIC_BASE_URL` |
| **Google Gemini** | ✅ Supported | Uses `GOOGLE_API_KEY` (same as Maps key works) |
| **OpenRouter** | ✅ Supported | Explicit Authorization header required |
| **Custom (OpenAI-Compatible)** | ✅ Supported | Sends both `Authorization: Bearer` and `x-api-key` headers |
| **Azure OpenAI** | ⚠️ Not Tested | Requires manual deployment creation in Azure Portal |
| **Ollama** | ⚠️ Local Only | Requires Ollama server running locally |

### Known Issues & Workarounds

1. **Azure OpenAI**: The `deskwiseio` Azure account has no GPT model deployments. The `jbs-rg-resource` account has Claude models but is AIServices type, not OpenAI type. Users must create model deployments manually.

2. **z.ai Endpoints**:
   - Anthropic-compatible: `https://api.z.ai/api/anthropic`
   - OpenAI-compatible (coding): `https://api.z.ai/api/coding/paas/v4/`
   - Uses API key format: `{uuid}.{token}`

3. **OpenRouter**: LangChain's OpenAI client didn't properly pass the API key for non-OpenAI endpoints. Fixed by explicitly adding `Authorization: Bearer` header in `defaultHeaders`.

4. **Custom provider auth**: Some endpoints expect `Authorization: Bearer`, others expect `x-api-key`. We send both for maximum compatibility.

### Model Lists

Model lists are hardcoded for offline access but can be dynamically fetched from endpoints that support `/v1/models` (OpenAI) or `/models` (Ollama) APIs.

Default models are updated to December 2025 versions:
- OpenAI: GPT-5.2, GPT-5, o3-mini
- Anthropic: Claude Opus 4.5, Sonnet 4.5, Haiku 4.5
- Gemini: Gemini 3 Pro Preview, 2.5 Pro/Flash
- Ollama: Llama 4, DeepSeek R1, Qwen 3

## Consequences

### Positive
- Users can use any LLM provider they have access to
- Dynamic model fetching reduces maintenance burden
- Custom endpoint support enables enterprise/private deployments
- Single codebase supports diverse deployment scenarios

### Negative
- Azure OpenAI requires manual testing when deployments exist
- Some providers may require specific auth header configurations
- Model lists may become outdated; dynamic fetching is recommended

## Related Files
- `/job-search-platform/src/lib/llm.ts` - Provider implementations
- `/job-search-platform/src/types/llm.ts` - Type definitions
- `/job-search-platform/src/components/settings/LLMSettings.tsx` - UI
- `/job-search-platform/.env` - API keys and endpoints
