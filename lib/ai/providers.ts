import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
  secureChatModel,
} from './models.test';
import { isTestEnvironment } from '../constants';

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'cloud-chat-model': chatModel,
        'cloud-chat-model-reasoning': reasoningModel,
        'cloud-title-model': titleModel,
        'cloud-artifact-model': artifactModel,
        'secure-chat-model': secureChatModel,
      },
    })
  : customProvider({
      languageModels: {
        'cloud-chat-model': openai('gpt-4.1-mini'),
        'cloud-chat-model-reasoning': wrapLanguageModel({
          model: google('gemini-2.5-pro'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'secure-chat-model': openai('gpt-4.1'),
        'cloud-title-model': openai('gpt-4.1-nano'),
        'cloud-artifact-model': openai('gpt-4.1-mini'),
      },
      imageModels: {
        'cloud-small-model': openai.imageModel('gpt-4o'),
      },
    });
