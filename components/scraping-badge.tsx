'use client';

import { Badge } from './ui/badge';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import {
  Glimpse,
  GlimpseContent,
  GlimpseDescription,
  GlimpseImage,
  GlimpseTitle,
  GlimpseTrigger,
} from './ui/kibo-ui/glimpse';

interface ScrapeOptions {
  url: string;
  action: 'scrape' | 'crawl' | 'map' | 'search';
  topic?: string;
  formats: Array<'markdown' | 'html' | 'json'>;
  screenshot: 'none' | 'screenshot' | 'screenshot@fullPage';
  limit: number;
  includeSelectors: string[];
  excludeSelectors: string[];
  maxAge: number;
}

interface ScrapingBadgeProps {
  options: ScrapeOptions;
  onRemove: () => void;
}

interface OGData {
  title: string | null;
  description: string | null;
  image: string | null;
}

export function ScrapingBadge({ options, onRemove }: ScrapingBadgeProps) {
  const [ogData, setOgData] = useState<OGData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOGData = async () => {
      if (options.action === 'search' || !options.url) return;

      setLoading(true);
      try {
        // Simple client-side OG data fetching
        const response = await fetch(
          `/api/og?url=${encodeURIComponent(options.url)}`,
        );
        if (response.ok) {
          const data = await response.json();
          setOgData(data);
        }
      } catch (error) {
        console.error('Failed to fetch OG data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOGData();
  }, [options.url, options.action]);

  const truncateUrl = (url: string, maxLength = 30) => {
    if (url.length <= maxLength) return url;
    return `${url.substring(0, maxLength)}...`;
  };

  const formatOptionsText = (options: ScrapeOptions) => {
    const parts: string[] = [options.action];

    if (options.screenshot !== 'none') {
      parts.push('with screenshot');
    }

    if (options.formats.length > 0 && !options.formats.includes('markdown')) {
      parts.push(`as ${options.formats.join(', ')}`);
    }

    if (options.limit !== 10) {
      parts.push(`(limit: ${options.limit})`);
    }

    return parts.join(' ');
  };

  const badgeContent = (
    <Badge
      variant="secondary"
      className="flex items-center gap-1 max-w-fit bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800"
    >
      <span className="truncate">
        {options.action === 'search'
          ? `Search: ${options.topic}`
          : truncateUrl(options.url)}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-4 w-4 p-0 hover:bg-blue-300 dark:hover:bg-blue-700"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <X size={12} />
      </Button>
    </Badge>
  );

  // For search action or if no URL, just show the badge without glimpse
  if (options.action === 'search' || !options.url) {
    return badgeContent;
  }

  return (
    <Glimpse closeDelay={0} openDelay={200}>
      <GlimpseTrigger asChild>{badgeContent}</GlimpseTrigger>
      <GlimpseContent className="w-80">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          </div>
        ) : ogData ? (
          <>
            {ogData.image && <GlimpseImage src={ogData.image} />}
            <GlimpseTitle>{ogData.title || options.url}</GlimpseTitle>
            <GlimpseDescription>
              {ogData.description ||
                `Will ${formatOptionsText(options)} this page`}
            </GlimpseDescription>
          </>
        ) : (
          <>
            <GlimpseTitle>{options.url}</GlimpseTitle>
            <GlimpseDescription>
              Will {formatOptionsText(options)} this page
            </GlimpseDescription>
          </>
        )}
      </GlimpseContent>
    </Glimpse>
  );
}
