
import { create } from 'zustand'

import type { EntityType } from '../types/aviation'

// ========================================
// GRAPH STORE TYPES
// ========================================

interface GraphStore {
  hiddenCategories: EntityType[]

  toggleCategory: (category: EntityType) => void

  hideCategory: (category: EntityType) => void

  showCategory: (category: EntityType) => void

  hideAllCategories: () => void

  showAllCategories: () => void

  resetFilters: () => void
}

// ========================================
// AVAILABLE ENTITY CATEGORIES
// ========================================

const ALL_CATEGORIES: EntityType[] = [
  'aircraft',
  'engines',
  'components',
  'manufacturers',
  'airlines',
  'facilities',
  'inspections',
  'passports',
  'ledger',
]

// ========================================
// GLOBAL GRAPH STORE
// ========================================

export const useGraphStore = create<GraphStore>((set) => ({
  // All categories are enabled initially.

  hiddenCategories: [],

  // Toggle category visibility.

  toggleCategory: (category) =>
    set((state) => ({
      hiddenCategories:
        state.hiddenCategories.includes(category)
          ? state.hiddenCategories.filter(
              (item) => item !== category,
            )
          : [...state.hiddenCategories, category],
    })),

  // Hide a specific category.

  hideCategory: (category) =>
    set((state) => ({
      hiddenCategories:
        state.hiddenCategories.includes(category)
          ? state.hiddenCategories
          : [...state.hiddenCategories, category],
    })),

  // Show a specific category.

  showCategory: (category) =>
    set((state) => ({
      hiddenCategories:
        state.hiddenCategories.filter(
          (item) => item !== category,
        ),
    })),

  // Hide every category.

  hideAllCategories: () =>
    set({
      hiddenCategories: [...ALL_CATEGORIES],
    }),

  // Show every category.

  showAllCategories: () =>
    set({
      hiddenCategories: [],
    }),

  // Restore default visibility.

  resetFilters: () =>
    set({
      hiddenCategories: [],
    }),
}))
