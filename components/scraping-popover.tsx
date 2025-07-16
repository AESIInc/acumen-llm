'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Checkbox } from './ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from './ui/tooltip';
import { GlobeIcon, ChevronDownIcon, InfoIcon } from './icons';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';

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

interface ScrapingPopoverProps {
  onScrape: (options: ScrapeOptions) => void;
  disabled?: boolean;
}

export function ScrapingPopover({ onScrape, disabled }: ScrapingPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'scrape' | 'crawl' | 'map' | 'search'
  >('scrape');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form state
  const [url, setUrl] = useState('');
  const [topic, setTopic] = useState('');
  const [formats, setFormats] = useState<Array<'markdown' | 'html' | 'json'>>([
    'markdown',
  ]);
  const [screenshot, setScreenshot] = useState<
    'none' | 'screenshot' | 'screenshot@fullPage'
  >('none');
  const [limit, setLimit] = useState(10);
  const [includeSelectors, setIncludeSelectors] = useState<string[]>([]);
  const [excludeSelectors, setExcludeSelectors] = useState<string[]>([]);
  const [newIncludeSelector, setNewIncludeSelector] = useState('');
  const [newExcludeSelector, setNewExcludeSelector] = useState('');
  const [disableCaching, setDisableCaching] = useState(false);

  const handleSubmit = () => {
    if (!url && activeTab !== 'search') {
      return;
    }
    if (activeTab === 'search' && !topic) {
      return;
    }

    onScrape({
      url,
      action: activeTab,
      topic: topic || undefined,
      formats,
      screenshot,
      limit,
      includeSelectors,
      excludeSelectors,
      maxAge: disableCaching ? 0 : 86400000, // 0 for no cache, 24 hours otherwise
    });

    // Reset form
    setUrl('');
    setTopic('');
    setFormats(['markdown']);
    setScreenshot('none');
    setLimit(10);
    setIncludeSelectors([]);
    setExcludeSelectors([]);
    setDisableCaching(false);
    setShowAdvanced(false);
    setIsOpen(false);
  };

  const addIncludeSelector = () => {
    if (newIncludeSelector.trim()) {
      setIncludeSelectors([...includeSelectors, newIncludeSelector.trim()]);
      setNewIncludeSelector('');
    }
  };

  const addExcludeSelector = () => {
    if (newExcludeSelector.trim()) {
      setExcludeSelectors([...excludeSelectors, newExcludeSelector.trim()]);
      setNewExcludeSelector('');
    }
  };

  const removeIncludeSelector = (index: number) => {
    setIncludeSelectors(includeSelectors.filter((_, i) => i !== index));
  };

  const removeExcludeSelector = (index: number) => {
    setExcludeSelectors(excludeSelectors.filter((_, i) => i !== index));
  };

  const toggleFormat = (format: 'markdown' | 'html' | 'json') => {
    setFormats((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format],
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-md rounded-bl-lg p-[7px] h-fit dark:border-zinc-700 hover:dark:bg-zinc-900 hover:bg-zinc-200"
          disabled={disabled}
        >
          <GlobeIcon size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Web Scraping</h3>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as any)}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="scrape">Scrape</TabsTrigger>
              <TabsTrigger value="crawl">Crawl</TabsTrigger>
              <TabsTrigger value="map">Map</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
            </TabsList>

            <TabsContent value="scrape" className="space-y-3">
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="crawl" className="space-y-3">
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="limit">Page Limit</Label>
                <Input
                  id="limit"
                  type="number"
                  min="1"
                  max="100"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                />
              </div>
            </TabsContent>

            <TabsContent value="map" className="space-y-3">
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="search" className="space-y-3">
              <div>
                <Label htmlFor="topic">Search Query</Label>
                <Input
                  id="topic"
                  placeholder="latest AI news"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="limit">Result Limit</Label>
                <Input
                  id="limit"
                  type="number"
                  min="1"
                  max="20"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Advanced Options Toggle */}
          <div className="border-t pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <div
                className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              >
                <ChevronDownIcon size={12} />
              </div>
              Advanced Options
            </Button>

            {showAdvanced && (
              <div className="space-y-3 mt-3">
                <div>
                  <Label>Output Formats</Label>
                  <div className="flex gap-2 mt-1">
                    {(['markdown', 'html', 'json'] as const).map((format) => (
                      <Button
                        key={format}
                        variant={
                          formats.includes(format) ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => toggleFormat(format)}
                      >
                        {format}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose how the scraped content should be formatted
                  </p>
                </div>

                <div>
                  <Label>Screenshot</Label>
                  <Select
                    value={screenshot}
                    onValueChange={(
                      value: 'none' | 'screenshot' | 'screenshot@fullPage',
                    ) => setScreenshot(value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="No screenshot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No screenshot</SelectItem>
                      <SelectItem value="screenshot">Screenshot</SelectItem>
                      <SelectItem value="screenshot@fullPage">
                        Full page screenshot
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Optionally capture a screenshot of the page
                  </p>
                </div>

                <div>
                  <Label>Include CSS Selectors</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="e.g., .content, #main"
                      value={newIncludeSelector}
                      onChange={(e) => setNewIncludeSelector(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addIncludeSelector();
                        }
                      }}
                    />
                    <Button size="sm" onClick={addIncludeSelector}>
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Only scrape content from these CSS selectors
                  </p>
                  {includeSelectors.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {includeSelectors.map((selector, index) => (
                        <Badge
                          key={`include-${selector}`}
                          variant="secondary"
                          className="text-xs"
                        >
                          {selector}
                          <X
                            size={12}
                            className="ml-1 cursor-pointer"
                            onClick={() => removeIncludeSelector(index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Exclude CSS Selectors</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="e.g., .ads, .sidebar"
                      value={newExcludeSelector}
                      onChange={(e) => setNewExcludeSelector(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addExcludeSelector();
                        }
                      }}
                    />
                    <Button size="sm" onClick={addExcludeSelector}>
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Skip content from these CSS selectors (e.g., ads,
                    navigation)
                  </p>
                  {excludeSelectors.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {excludeSelectors.map((selector, index) => (
                        <Badge
                          key={`exclude-${selector}`}
                          variant="secondary"
                          className="text-xs"
                        >
                          {selector}
                          <X
                            size={12}
                            className="ml-1 cursor-pointer"
                            onClick={() => removeExcludeSelector(index)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <Label>Caching</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-muted-foreground cursor-help">
                            <InfoIcon size={14} />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            By default, we cache scraped content for 24 hours to
                            speed up requests by 500%. Check &quot;Disable scrape
                            caching&quot; to always fetch fresh content (slower but
                            most current).
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="disable-caching"
                      checked={disableCaching}
                      onCheckedChange={(checked) =>
                        setDisableCaching(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="disable-caching"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Disable scrape caching
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {disableCaching
                      ? 'Will fetch fresh content (slower)'
                      : 'Will use cached content if available (faster)'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                (activeTab !== 'search' && !url) ||
                (activeTab === 'search' && !topic) ||
                formats.length === 0
              }
            >
              Add
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
