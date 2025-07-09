import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { google } from '@ai-sdk/google';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { isTestEnvironment } from '../constants';

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'secure-model-lite': google('gemini-2.5-flash'),
        'secure-model-pro': google('gemini-2.5-pro'),
        'cloud-model-gemini-flash': google('gemini-2.5-flash'),
        'cloud-model-gemini-pro': google('gemini-2.5-pro'),
        'title-model': google('gemini-2.5-flash'),
        'artifact-model': google('gemini-2.5-flash'),
      },
    });
