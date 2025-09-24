import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Decode the URL
    const decodedUrl = decodeURIComponent(targetUrl);
    
    console.log('[Proxy] Fetching:', decodedUrl);

    const response = await fetch(decodedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DebtWise-AI/1.0)',
      },
    });

    if (!response.ok) {
      console.log('[Proxy] Response not OK:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data);
    } else if (contentType?.includes('audio') || contentType?.includes('video')) {
      // For media files, return the blob data
      const blob = await response.blob();
      return new NextResponse(blob, {
        headers: {
          'Content-Type': contentType || 'application/octet-stream',
          'Content-Length': blob.size.toString(),
        },
      });
    } else {
      // For other content, return as text
      const text = await response.text();
      return new NextResponse(text, {
        headers: {
          'Content-Type': contentType || 'text/plain',
        },
      });
    }

  } catch (error) {
    console.error('[Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}