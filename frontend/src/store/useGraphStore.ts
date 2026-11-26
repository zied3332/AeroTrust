
import { create } from 'zustand'

import type { EntityType } from '../types/aviation'

// ========================================
// NAVIGATION TYPES
// ========================================

export interface EntityNavigationRequest {
  entityId: string
  entityType: EntityType
  requestId: number
}

// ========================================
// GRAPH STORE TYPES
// ========================================

interface GraphStore {
  // Category visibility

  hiddenCategories: EntityType[]

  toggleCategory: (category: EntityType) => void

  hideCategory: (category: EntityType) => void

  showCategory: (category: EntityType) => void

  hideAllCategories: () => void

  showAllCategories: () => void

  resetFilters: () => void

  // Entity navigation

  navigationRequest: EntityNavigationRequest | null

  navigationSequence: number

  navigateToEntity: (
    entityId: string,
    entityType: EntityType,
  ) => void

  clearNavigationRequest: () => void
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
  // ======================================
  // CATEGORY VISIBILITY
  // ======================================

  hiddenCategories: [],

  toggleCategory: (category) =>
    set((state) => ({
      hiddenCategories:
        state.hiddenCategories.includes(category)
          ? state.hiddenCategories.filter(
              (item) => item !== category,
            )
          : [...state.hiddenCategories, category],
    })),

  hideCategory: (category) =>
    set((state) => ({
      hiddenCategories:
        state.hiddenCategories.includes(category)
          ? state.hiddenCategories
          : [...state.hiddenCategories, category],
    })),

  showCategory: (category) =>
    set((state) => ({
      hiddenCategories:
        state.hiddenCategories.filter(
          (item) => item !== category,
        ),
    })),

  hideAllCategories: () =>
    set({
      hiddenCategories: [...ALL_CATEGORIES],
    }),

  showAllCategories: () =>
    set({
      hiddenCategories: [],
    }),

  resetFilters: () =>
    set({
      hiddenCategories: [],
    }),

  // ======================================
  // ENTITY NAVIGATION
  // ======================================

  navigationRequest: null,

  navigationSequence: 0,

  navigateToEntity: (entityId, entityType) =>
    set((state) => {
      const requestId =
        state.navigationSequence + 1

      return {
        // Automatically enable the category
        // of the requested entity.

        hiddenCategories:
          state.hiddenCategories.includes(entityType)
            ? state.hiddenCategories.filter(
                (category) =>
                  category !== entityType,
              )
            : state.hiddenCategories,

        // Generate a unique navigation request.

        navigationSequence: requestId,

        navigationRequest: {
          entityId,
          entityType,
          requestId,
        },
      }
    }),

  clearNavigationRequest: () =>
    set({
      navigationRequest: null,
    }),
}))
