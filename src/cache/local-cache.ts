import NodeCache from 'node-cache'

export const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 })

export function getFromCache(key: string) {
  const data = cache.get(key)
  if (data) console.log(`⚡ Cache hit → ${key}`)
  return data
}

export function saveToCache(key: string, data: any) {
  console.log(`💾 Cache save → ${key}`)
  cache.set(key, data)
}
