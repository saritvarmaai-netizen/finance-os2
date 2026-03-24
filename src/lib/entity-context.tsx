'use client'

import React, { createContext, useContext, useState } from 'react'
import type { Entity, EntityContextType } from './types'

const EntityContext = createContext<EntityContextType>({
  activeEntities: ['personal', 'huf', 'firm'],
  toggleEntity: () => {},
  isActive: () => true,
})

export function EntityProvider({ children }: { children: React.ReactNode }) {
  const [activeEntities, setActiveEntities] = useState<Entity[]>([
    'personal', 'huf', 'firm'
  ])

  const toggleEntity = (entity: Entity) => {
    setActiveEntities(prev =>
      prev.includes(entity)
        ? prev.filter(e => e !== entity)
        : [...prev, entity]
    )
  }

  const isActive = (entity: Entity) => activeEntities.includes(entity)

  return (
    <EntityContext.Provider value={{ activeEntities, toggleEntity, isActive }}>
      {children}
    </EntityContext.Provider>
  )
}

export const useEntity = () => useContext(EntityContext)
