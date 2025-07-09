'use client';

import { Badge } from './ui/badge';
import { GlobeIcon } from './icons';
import { Markdown } from './markdown';

interface ScrapingMessageProps {
  text: string;
}

interface ParsedScrapingMessage {
  userText: string;
  scrapingInfo: {
    url: string;
    action: string;
    topic?: string;
    formats: string[];
    screenshot: string;
    limit: number;
    includeSelectors: string[];
    excludeSelectors: string[];
    maxAge: number;
  } | null;
}

export function ScrapingMessage({ text }: ScrapingMessageProps) {
  const parseScrapingMessage = (text: string): ParsedScrapingMessage => {
    // Check if this is a scraping message
    const scrapingMatch = text.match(
      /Please use the getScrape tool with these parameters:/,
    );

    if (!scrapingMatch) {
      return { userText: text, scrapingInfo: null };
    }

    // Extract the user's original text (before the scraping instructions)
    const beforeScraping = text.split(
      'Please use the getScrape tool with these parameters:',
    )[0];
    const userTextMatch = beforeScraping.match(/^(.+?)\n\n(.+?)\n\n$/s);

    let actionDescription = '';
    let userText = '';

    if (userTextMatch) {
      actionDescription = userTextMatch[1].trim();
      userText = userTextMatch[2].trim();
    } else {
      // Fallback: try to extract just the user text
      const lines = beforeScraping.trim().split('\n');
      if (lines.length >= 2) {
        actionDescription = lines[0];
        userText = lines.slice(1).join('\n').trim();
      } else {
        userText = beforeScraping.trim();
      }
    }

    // Extract scraping parameters
    const urlMatch = text.match(/- URL: (.+)/);
    const actionMatch = text.match(/- Action: (.+)/);
    const topicMatch = text.match(/- Topic: (.+)/);
    const formatsMatch = text.match(/- Formats: (.+)/);
    const screenshotMatch = text.match(/- Screenshot: (.+)/);
    const limitMatch = text.match(/- Limit: (.+)/);
    const includeSelectorMatch = text.match(/- Include selectors: (.+)/);
    const excludeSelectorMatch = text.match(/- Exclude selectors: (.+)/);
    const maxAgeMatch = text.match(/- Max Age: (\d+) ms/);

    const scrapingInfo = {
      url: urlMatch?.[1] || '',
      action: actionMatch?.[1] || 'scrape',
      topic: topicMatch?.[1] !== 'N/A' ? topicMatch?.[1] : undefined,
      formats: formatsMatch?.[1]?.split(', ') || ['markdown'],
      screenshot: screenshotMatch?.[1] || 'none',
      limit: Number.parseInt(limitMatch?.[1] || '10', 10),
      includeSelectors:
        includeSelectorMatch?.[1] !== 'None'
          ? includeSelectorMatch?.[1]?.split(', ') || []
          : [],
      excludeSelectors:
        excludeSelectorMatch?.[1] !== 'None'
          ? excludeSelectorMatch?.[1]?.split(', ') || []
          : [],
      maxAge: Number.parseInt(maxAgeMatch?.[1] || '86400000', 10),
    };

    return {
      userText,
      scrapingInfo,
    };
  };

  const { userText, scrapingInfo } = parseScrapingMessage(text);

  if (!scrapingInfo) {
    return <Markdown>{text}</Markdown>;
  }

  const formatActionText = (info: typeof scrapingInfo) => {
    if (!info) return '';

    const parts = [info.action];

    if (info.screenshot !== 'none') {
      parts.push('with screenshot');
    }

    if (info.formats.length > 0 && !info.formats.includes('markdown')) {
      parts.push(`as ${info.formats.join(', ')}`);
    }

    if (info.limit !== 10) {
      parts.push(`(limit: ${info.limit})`);
    }

    return parts.join(' ');
  };

  const displayUrl =
    scrapingInfo.action === 'search'
      ? `Search: ${scrapingInfo.topic}`
      : scrapingInfo.url;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant="secondary"
          className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        >
          <GlobeIcon size={12} />
          <span className="truncate max-w-[200px]">{displayUrl}</span>
        </Badge>
        <span className="text-sm text-muted-foreground">
          {formatActionText(scrapingInfo)}
        </span>
      </div>

      <div>
        <Markdown>{userText}</Markdown>
      </div>
    </div>
  );
}
