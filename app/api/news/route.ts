import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://feeds.bbci.co.uk/news/rss.xml', {
      next: { revalidate: 300 },
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
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
        description: get('description').replace(/<[^>]+>/g, '').slice(0, 160),
      })
      if (items.length >= 9) break
    }
    return NextResponse.json(items)
  } catch {
    return NextResponse.json([])
  }
}
