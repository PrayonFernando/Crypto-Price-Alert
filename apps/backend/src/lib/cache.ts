export class TTLCache<K, V> {
  private ttl: number;
  private map = new Map<K, { value: V; expires: number }>();
  constructor(ttlMs: number) {
    this.ttl = ttlMs;
  }
  get(key: K): V | undefined {
    const hit = this.map.get(key);
    if (!hit) return;
    if (Date.now() > hit.expires) {
      this.map.delete(key);
      return;
    }
    return hit.value;
  }
  set(key: K, value: V) {
    this.map.set(key, { value, expires: Date.now() + this.ttl });
  }
}
