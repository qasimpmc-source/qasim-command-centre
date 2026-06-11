import { NextResponse } from 'next/server'

const FEEDS: Record<string, string> = {
  research: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
  politics: 'https://feeds.bbci.co.uk/news/politics/rss.xml',
  finance:  'https://feeds.bbci.co.uk/news/business/rss.xml',
}

async function fetchFeed(url: string) {
  try {
    const res = await fetch(url, { next: { revalidate: 300 }, headers: { 'User-Agent': 'Mozilla/5.0' } })
    const xml = await res.text()
    const items: { title: string; link: string; pubDate: string; description: string }[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match
    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1]
      const get = (tag: string) => {
        const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`))
        return m ? m[1].trim() : ''
      }
      items.push({
        title: get('title'),
        link: get('link') || block.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || '',
        pubDate: get('pubDate'),
        description: get('description').replace(/<[^>]+>/g, '').slice(0, 140),
      })
      if (items.length >= 4) break
    }
    return items
  } catch {
    return []
  }
}

export async function GET() {
  const [research, politics, finance] = await Promise.all([
    fetchFeed(FEEDS.research),
    fetchFeed(FEEDS.politics),
    fetchFeed(FEEDS.finance),
  ])
  return NextResponse.json({ research, politics, finance })
}
