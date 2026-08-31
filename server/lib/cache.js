const store = new Map();

export function getCached(key) {
  return store.get(key) || null;
}

export function setCached(key, value) {
  store.set(key, value);
}