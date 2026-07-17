export function mergeFavoriteIds(dbProductIds: string[], localFavoriteIds: string[]) {
  return Array.from(new Set([...dbProductIds, ...localFavoriteIds]));
}

export function getMissingFavoriteIds(combinedIds: string[], dbProductIds: string[]) {
  const dbProductIdSet = new Set(dbProductIds);

  return combinedIds.filter((id) => !dbProductIdSet.has(id));
}

export function filterValidFavoriteIds(ids: string[], validProductIds: Set<string>) {
  return ids.filter((id) => validProductIds.has(id));
}
