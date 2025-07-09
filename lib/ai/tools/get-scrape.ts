import { createAITools } from '@tooly/firecrawl';
import { tool } from 'ai';
import { z } from 'zod';

function formatScrapingResult(
  result: any,
  screenshot: string,
  originalUrl: string,
) {
  if (!result) return result;

  // Debug logging
  console.log('Firecrawl result structure:', JSON.stringify(result, null, 2));
  console.log('Screenshot setting:', screenshot);

  // Handle different response structures
  let content = '';
  let screenshotUrl = '';

  // Extract content and screenshot from the result
  if (typeof result === 'string') {
    content = result;
  } else if (result.data) {
    // Handle Firecrawl API response structure
    if (Array.isArray(result.data)) {
      // Handle array of results (crawl/search)
      content = result.data
        .map((item: any) => {
          if (item.content) return item.content;
          if (item.markdown) return item.markdown;
          return JSON.stringify(item, null, 2);
        })
        .join('\n\n---\n\n');

      // Get screenshot from first item if available
      if (result.data[0]?.screenshot) {
        screenshotUrl = result.data[0].screenshot;
      }
    } else {
      // Single result from Firecrawl API
      if (result.data.markdown) {
        content = result.data.markdown;
      } else if (result.data.html) {
        content = result.data.html;
      } else {
        content = JSON.stringify(result.data, null, 2);
      }

      // Extract screenshot from the data object
      if (result.data.screenshot) {
        screenshotUrl = result.data.screenshot;
      }
    }
  } else if (result.content) {
    content = result.content;
  } else if (result.markdown) {
    content = result.markdown;
  } else {
    content = JSON.stringify(result, null, 2);
  }

  // Extract screenshot URL from various possible locations (fallback)
  if (!screenshotUrl) {
    if (result.screenshot) {
      screenshotUrl = result.screenshot;
    } else if (result.metadata?.screenshot) {
      screenshotUrl = result.metadata.screenshot;
    } else if (result.images?.length > 0) {
      screenshotUrl = result.images[0];
    } else if (result.data?.actions?.screenshots?.length > 0) {
      screenshotUrl = result.data.actions.screenshots[0];
    }
  }

  // Debug logging for screenshot URL
  console.log('Found screenshot URL:', screenshotUrl);
  console.log('Screenshot setting check:', screenshot !== 'none');

  // Format the response with clickable screenshot if available
  if (screenshot !== 'none' && screenshotUrl) {
    const screenshotPreview = `\n\n**Screenshot Preview:**\n\n[![Screenshot of ${originalUrl}](${screenshotUrl})](${screenshotUrl})\n\n*Click the image above to view the full screenshot in a new tab*`;
    console.log('Adding screenshot preview to response');
    return content + screenshotPreview;
  }

  console.log(
    'No screenshot added - screenshot setting:',
    screenshot,
    'screenshotUrl:',
    screenshotUrl,
  );
  return content;
}

export const getScrape = tool({
  description: 'Scrape website content from a provided URL',
  inputSchema: z.object({
    url: z.string().url(),
    action: z.enum(['scrape', 'crawl', 'map', 'search']).default('scrape'),
    topic: z.string().optional(),
    formats: z
      .array(z.enum(['markdown', 'html', 'json']))
      .optional()
      .default(['markdown']),
    screenshot: z
      .enum(['none', 'screenshot', 'screenshot@fullPage'])
      .default('none'),
    limit: z.number().optional().default(10),
    includeSelectors: z.array(z.string()).optional(),
    excludeSelectors: z.array(z.string()).optional(),
    maxAge: z.number().optional().default(86400000), // 24 hours in milliseconds
  }),
  execute: async ({
    url,
    action,
    topic,
    formats,
    screenshot,
    limit,
    includeSelectors,
    excludeSelectors,
    maxAge,
  }) => {
    const apiKey = process.env.FIRECRAWL_API_KEY;

    if (!apiKey) {
      throw new Error('FIRECRAWL_API_KEY environment variable is required');
    }

    const tools = createAITools(apiKey);

    // Combine formats with screenshot if specified
    const finalFormats =
      screenshot !== 'none'
        ? [...(formats || ['markdown']), screenshot]
        : formats || ['markdown'];

    try {
      let result: any;

      switch (action) {
        case 'scrape':
          result = await tools.scrapeUrl.execute({
            url,
            formats: finalFormats,
            includeSelectors,
            excludeSelectors,
            maxAge,
          });
          break;

        case 'crawl':
          result = await tools.crawlUrl.execute({
            url,
            limit,
            scrapeOptions: {
              formats: finalFormats,
              includeSelectors,
              excludeSelectors,
              maxAge,
            },
          });
          break;

        case 'map':
          result = await tools.mapUrl.execute({
            url,
            maxAge,
          });
          break;

        case 'search':
          if (!topic) {
            throw new Error('Topic is required for search action');
          }
          result = await tools.search.execute({
            query: topic,
            limit,
            maxAge,
          });
          break;

        default:
          throw new Error(`Unsupported action: ${action}`);
      }

      // Format the response to include clickable screenshot previews
      const displayUrl =
        action === 'search' ? `Search: ${topic || ''}` : url || '';
      //@ts-ignore
      return formatScrapingResult(result, screenshot, displayUrl);
    } catch (error) {
      console.error('Firecrawl API error:', error);
      throw new Error(
        `Failed to ${action} URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  },
});
