import { type NextRequest, NextResponse } from 'next/server';

const TITLE_REGEX = /<title[^>]*>([^<]+)<\/title>/;
const OG_TITLE_REGEX = /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/;
const DESCRIPTION_REGEX = /<meta[^>]*name="description"[^>]*content="([^"]+)"/;
const OG_DESCRIPTION_REGEX =
  /<meta[^>]*property="og:description"[^>]*content="([^"]+)"/;
const OG_IMAGE_REGEX = /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    const titleMatch = data.match(TITLE_REGEX) || data.match(OG_TITLE_REGEX);
    const descriptionMatch =
      data.match(DESCRIPTION_REGEX) || data.match(OG_DESCRIPTION_REGEX);
    const imageMatch = data.match(OG_IMAGE_REGEX);

    return NextResponse.json({
      title: titleMatch?.at(1) ?? null,
      description: descriptionMatch?.at(1) ?? null,
      image: imageMatch?.at(1) ?? null,
    });
  } catch (error) {
    console.error('Error fetching OG data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch OG data' },
      { status: 500 },
    );
  }
}
