'use client';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState } from 'react';
import type { Vote } from '@/lib/db/schema';
import { DocumentToolCall, DocumentToolResult } from './document';
import { PencilEditIcon, SparklesIcon } from './icons';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { PreviewAttachment } from './preview-attachment';
import { Weather } from './weather';
import { ScrapingMessage } from './scraping-message';
import equal from 'fast-deep-equal';
import { cn, sanitizeText } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { MessageEditor } from './message-editor';
import { DocumentPreview } from './document-preview';
import { MessageReasoning } from './message-reasoning';
import { ScrollArea } from './ui/scroll-area';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { ChatMessage } from '@/lib/types';
import { useDataStream } from './data-stream-provider';
import {
  AITool,
  AIToolHeader,
  AIToolContent,
  AIToolParameters,
  AIToolResult,
  type AIToolStatus,
} from './ui/kibo-ui/ai/tool';
import { ScreenshotPreview } from './screenshot-preview';

// Type narrowing is handled by TypeScript's control flow analysis
// The AI SDK provides proper discriminated unions for tool calls

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  regenerate,
  isReadonly,
  requiresScrollPadding,
}: {
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
  regenerate: UseChatHelpers<ChatMessage>['regenerate'];
  isReadonly: boolean;
  requiresScrollPadding: boolean;
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  const attachmentsFromMessage = message.parts.filter(
    (part) => part.type === 'file',
  );

  useDataStream();

  // Collect tool results for display at the bottom
  const toolResults: JSX.Element[] = [];
  const screenshotPreviews: JSX.Element[] = [];

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="w-full mx-auto max-w-5xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
            },
          )}
        >
          {message.role === 'assistant' && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div
            className={cn('flex flex-col gap-4 w-full', {
              'min-h-96': message.role === 'assistant' && requiresScrollPadding,
            })}
          >
            {attachmentsFromMessage.length > 0 && (
              <div
                data-testid={`message-attachments`}
                className="flex flex-row justify-end gap-2"
              >
                {attachmentsFromMessage.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={{
                      name: attachment.filename ?? 'file',
                      contentType: attachment.mediaType,
                      url: attachment.url,
                    }}
                  />
                ))}
              </div>
            )}

            {message.parts?.map((part, index) => {
              const { type } = part;
              const key = `message-${message.id}-part-${index}`;

              if (type === 'reasoning' && part.text?.trim().length > 0) {
                return (
                  <MessageReasoning
                    key={key}
                    isLoading={isLoading}
                    reasoning={part.text}
                  />
                );
              }

              if (type === 'text') {
                if (mode === 'view') {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      {message.role === 'user' && !isReadonly && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              data-testid="message-edit-button"
                              variant="ghost"
                              className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                              onClick={() => {
                                setMode('edit');
                              }}
                            >
                              <PencilEditIcon />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit message</TooltipContent>
                        </Tooltip>
                      )}

                      <div
                        data-testid="message-content"
                        className={cn('flex flex-col gap-4', {
                          'bg-primary text-primary-foreground px-3 py-2 rounded-xl':
                            message.role === 'user',
                        })}
                      >
                        {message.role === 'user' ? (
                          <ScrapingMessage text={sanitizeText(part.text)} />
                        ) : (
                          <Markdown>
                            {sanitizeText(
                              part.text.replace(
                                /\n\n\*\*Screenshot Preview:\*\*\n\n\[\!\[Screenshot[^\]]*\]\([^)]+\)\]\([^)]+\)\n\n\*Click the image above to view the full screenshot in a new tab\*/g,
                                '',
                              ),
                            )}
                          </Markdown>
                        )}
                      </div>
                    </div>
                  );
                }

                if (mode === 'edit') {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      <div className="size-8" />

                      <MessageEditor
                        key={message.id}
                        message={message}
                        setMode={setMode}
                        setMessages={setMessages}
                        regenerate={regenerate}
                      />
                    </div>
                  );
                }
              }

              if (type === 'tool-getWeather') {
                const { toolCallId, state } = part;

                if (state === 'input-available') {
                  return (
                    <div key={toolCallId} className="skeleton">
                      <Weather />
                    </div>
                  );
                }

                if (state === 'output-available') {
                  const { output } = part;
                  return (
                    <div key={toolCallId}>
                      <Weather weatherAtLocation={output} />
                    </div>
                  );
                }
              }

              if (type === 'tool-createDocument') {
                const { toolCallId, state } = part;

                if (state === 'input-available') {
                  const { input } = part;
                  return (
                    <div key={toolCallId}>
                      <DocumentPreview isReadonly={isReadonly} args={input} />
                    </div>
                  );
                }

                if (state === 'output-available') {
                  const { output } = part;

                  if ('error' in output) {
                    return (
                      <div
                        key={toolCallId}
                        className="text-red-500 p-2 border rounded"
                      >
                        Error: {String(output.error)}
                      </div>
                    );
                  }

                  return (
                    <div key={toolCallId}>
                      <DocumentPreview
                        isReadonly={isReadonly}
                        result={output}
                      />
                    </div>
                  );
                }
              }

              if (type === 'tool-updateDocument') {
                const { toolCallId, state } = part;

                if (state === 'input-available') {
                  const { input } = part;

                  return (
                    <div key={toolCallId}>
                      <DocumentToolCall
                        type="update"
                        args={input}
                        isReadonly={isReadonly}
                      />
                    </div>
                  );
                }

                if (state === 'output-available') {
                  const { output } = part;

                  if ('error' in output) {
                    return (
                      <div
                        key={toolCallId}
                        className="text-red-500 p-2 border rounded"
                      >
                        Error: {String(output.error)}
                      </div>
                    );
                  }

                  return (
                    <div key={toolCallId}>
                      <DocumentToolResult
                        type="update"
                        result={output}
                        isReadonly={isReadonly}
                      />
                    </div>
                  );
                }
              }

              if (type === 'tool-requestSuggestions') {
                const { toolCallId, state } = part;

                if (state === 'input-available') {
                  const { input } = part;
                  return (
                    <div key={toolCallId}>
                      <DocumentToolCall
                        type="request-suggestions"
                        args={input}
                        isReadonly={isReadonly}
                      />
                    </div>
                  );
                }

                if (state === 'output-available') {
                  const { output } = part;

                  if ('error' in output) {
                    return (
                      <div
                        key={toolCallId}
                        className="text-red-500 p-2 border rounded"
                      >
                        Error: {String(output.error)}
                      </div>
                    );
                  }

                  return (
                    <div key={toolCallId}>
                      <DocumentToolResult
                        type="request-suggestions"
                        result={output}
                        isReadonly={isReadonly}
                      />
                    </div>
                  );
                }
              }

              if (type === 'tool-getScrape') {
                const { toolCallId, state } = part;

                if (state === 'input-available') {
                  const { input } = part as any; // Type assertion to handle discriminated union
                  return (
                    <div
                      key={toolCallId}
                      className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800"
                    >
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm font-medium mb-2">
                        <div className="size-4 bg-blue-500 rounded-full animate-pulse" />
                        Scraping{' '}
                        {input?.action === 'search'
                          ? `search results for "${input.topic}"`
                          : `content from ${input?.url}`}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        {input?.action} • {input?.formats?.join(', ')} •{' '}
                        {input?.screenshot !== 'none'
                          ? 'with screenshot'
                          : 'no screenshot'}
                      </div>
                    </div>
                  );
                }

                if (state === 'output-available') {
                  const { output } = part as any; // Type assertion to handle discriminated union

                  if (
                    output &&
                    typeof output === 'object' &&
                    'error' in output
                  ) {
                    return (
                      <div
                        key={toolCallId}
                        className="text-red-500 p-3 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950"
                      >
                        <div className="font-medium mb-1">Scraping Error</div>
                        <div className="text-sm">{String(output.error)}</div>
                      </div>
                    );
                  }

                  // Extract screenshot URL from the output
                  const outputStr = String(output);
                  const screenshotMatch = outputStr.match(
                    /!\[Screenshot[^\]]*\]\(([^)]+)\)/,
                  );
                  const screenshotUrl = screenshotMatch
                    ? screenshotMatch[1]
                    : null;

                  // Remove screenshot markdown from the main content for the tool result
                  const contentWithoutScreenshot = outputStr.replace(
                    /\n\n\*\*Screenshot Preview:\*\*\n\n\[\!\[Screenshot[^\]]*\]\([^)]+\)\]\([^)]+\)\n\n\*Click the image above to view the full screenshot in a new tab\*/,
                    '',
                  );

                  // Add tool result to be shown at bottom
                  toolResults.push(
                    <AITool key={`tool-${toolCallId}`} defaultOpen={false}>
                      <AIToolHeader
                        status="completed"
                        name="Web Scraping"
                        description="View detailed scraping results"
                      />
                      <AIToolContent>
                        <AIToolParameters
                          parameters={{
                            url: (part as any).input?.url || 'N/A',
                            action: (part as any).input?.action || 'scrape',
                            formats: (part as any).input?.formats || [
                              'markdown',
                            ],
                            screenshot:
                              (part as any).input?.screenshot || 'none',
                            maxAge: (part as any).input?.maxAge || 86400000,
                          }}
                        />
                        <AIToolResult
                          result={
                            <ScrollArea className="h-[800px] w-full">
                              <div className="prose prose-sm max-w-none dark:prose-invert pr-4">
                                <Markdown>{contentWithoutScreenshot}</Markdown>
                              </div>
                            </ScrollArea>
                          }
                        />
                      </AIToolContent>
                    </AITool>,
                  );

                  // Don't return anything here - we'll show the results at the bottom
                  return null;
                }
              }
            })}

            {/* Show screenshot previews after main content */}
            {screenshotPreviews.length > 0 && (
              <div className="space-y-4">{screenshotPreviews}</div>
            )}

            {/* Show tool results at the bottom for assistant messages */}
            {message.role === 'assistant' && toolResults.length > 0 && (
              <div className="space-y-4 mt-4">{toolResults}</div>
            )}

            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.id !== nextProps.message.id) return false;
    if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding)
      return false;
    if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return false;
  },
);

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-4 group/message min-h-96"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
          {
            'group-data-[role=user]/message:bg-muted': true,
          },
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Hmm...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
