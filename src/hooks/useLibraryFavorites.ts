import { useFavorites } from './useFavorites';

const STORAGE_KEY = 'daggerhub:library-favorites';

export function useLibraryFavorites() {
  return useFavorites(STORAGE_KEY);
}
