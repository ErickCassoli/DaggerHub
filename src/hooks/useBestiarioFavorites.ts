import { useFavorites } from './useFavorites';

const STORAGE_KEY = 'daggerhub:bestiario-favorites';

export function useBestiarioFavorites() {
  return useFavorites(STORAGE_KEY);
}
