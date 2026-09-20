export interface KnapsackItemDef {
  id: string
  nameKey: string
  icon: string
  weightRange: [number, number]
  valueRange: [number, number]
}

// A pool of thematically varied items. Weight/value ranges overlap on purpose so
// that no single item dominates by ratio alone — the generator further guards
// against trivial "best ratio wins" puzzles in algorithms/knapsack.ts.
export const KNAPSACK_ITEM_POOL: KnapsackItemDef[] = [
  { id: 'camera', nameKey: 'items.camera', icon: '📷', weightRange: [3, 6], valueRange: [7, 14] },
  { id: 'book', nameKey: 'items.book', icon: '📚', weightRange: [1, 3], valueRange: [2, 6] },
  { id: 'laptop', nameKey: 'items.laptop', icon: '💻', weightRange: [4, 7], valueRange: [10, 18] },
  { id: 'water', nameKey: 'items.water', icon: '💧', weightRange: [2, 4], valueRange: [3, 6] },
  { id: 'toy', nameKey: 'items.toy', icon: '🧸', weightRange: [1, 3], valueRange: [2, 5] },
  { id: 'watch', nameKey: 'items.watch', icon: '⌚', weightRange: [1, 2], valueRange: [5, 10] },
  { id: 'chocolate', nameKey: 'items.chocolate', icon: '🍫', weightRange: [1, 2], valueRange: [2, 4] },
  { id: 'telescope', nameKey: 'items.telescope', icon: '🔭', weightRange: [5, 8], valueRange: [9, 16] },
  { id: 'headphones', nameKey: 'items.headphones', icon: '🎧', weightRange: [1, 3], valueRange: [4, 9] },
  { id: 'compass', nameKey: 'items.compass', icon: '🧭', weightRange: [1, 2], valueRange: [3, 6] },
  { id: 'medicine', nameKey: 'items.medicine', icon: '💊', weightRange: [1, 2], valueRange: [4, 8] },
  { id: 'flashlight', nameKey: 'items.flashlight', icon: '🔦', weightRange: [2, 3], valueRange: [3, 7] },
  { id: 'tablet', nameKey: 'items.tablet', icon: '📱', weightRange: [2, 4], valueRange: [6, 12] },
  { id: 'jacket', nameKey: 'items.jacket', icon: '🧥', weightRange: [3, 5], valueRange: [4, 9] },
  { id: 'binoculars', nameKey: 'items.binoculars', icon: '🔍', weightRange: [2, 4], valueRange: [5, 10] },
  { id: 'battery', nameKey: 'items.battery', icon: '🔋', weightRange: [1, 3], valueRange: [3, 7] },
  { id: 'food', nameKey: 'items.food', icon: '🍱', weightRange: [2, 4], valueRange: [4, 8] },
  { id: 'map', nameKey: 'items.map', icon: '🗺️', weightRange: [1, 2], valueRange: [3, 6] },
  { id: 'rope', nameKey: 'items.rope', icon: '🪢', weightRange: [2, 5], valueRange: [3, 7] },
  { id: 'tent', nameKey: 'items.tent', icon: '⛺', weightRange: [6, 9], valueRange: [10, 17] },
]

export const KNAPSACK_LEVELS = [5, 7, 9, 12, 15] as const
