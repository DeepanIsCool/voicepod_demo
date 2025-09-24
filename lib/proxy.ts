import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: response.statusText });
    }

    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    const data = await response.arrayBuffer();
    res.status(200).send(Buffer.from(data));

  } catch (error) {
    console.error('[PROXY_ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch the requested resource' });
  }
}