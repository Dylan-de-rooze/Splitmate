import { useState, useEffect } from 'react'

const STORAGE_KEY = 'splitmate_v1'

const DEFAULT_DATA = {
  groups: [],
  version: 1
}

export function useStorage() {
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return DEFAULT_DATA
      const parsed = JSON.parse(raw)
      // Migration: ensure all expenses have splitWith as array of numbers
      if (parsed.groups) {
        parsed.groups = parsed.groups.map(g => ({
          ...g,
          members: g.members.map(m => ({ ...m, id: Number(m.id) })),
          expenses: g.expenses.map(e => ({
            ...e,
            paidBy: Number(e.paidBy),
            splitWith: e.splitWith.map(Number),
            amount: parseFloat(e.amount)
          }))
        }))
      }
      return parsed
    } catch {
      return DEFAULT_DATA
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.warn('Could not save to localStorage:', e)
    }
  }, [data])

  function setGroups(fn) {
    setData(prev => ({ ...prev, groups: typeof fn === 'function' ? fn(prev.groups) : fn }))
  }

  return { groups: data.groups, setGroups }
}
