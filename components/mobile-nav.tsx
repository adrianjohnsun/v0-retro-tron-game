'use client'

import React, { useState } from 'react'
import { useMobileLayout } from '@/hooks/useMobileLayout'

export interface NavItem {
  id: string
  label: string
  icon?: React.ReactNode
  onClick: () => void
  disabled?: boolean
}

interface MobileNavProps {
  items: NavItem[]
  title?: string
  isOpen?: boolean
  onClose?: () => void
}

export function MobileNav({ items, title = 'Menu', isOpen = true, onClose }: MobileNavProps) {
  const { isMobile, screenHeight } = useMobileLayout()

  if (!isMobile) return null

  const handleNavClick = (item: NavItem) => {
    if (!item.disabled) {
      item.onClick()
      onClose?.()
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Bottom drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-black border-t border-cyan-400/30 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          maxHeight: '70vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div className="sticky top-0 px-4 py-4 border-b border-cyan-400/20 bg-black">
          <h3 className="font-retro text-cyan-400 text-sm uppercase tracking-widest">
            {title}
          </h3>
        </div>

        {/* Menu items */}
        <div className="grid grid-cols-1 gap-0">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              disabled={item.disabled}
              className={`
                w-full px-6 py-4 text-left font-mono text-base
                border-b border-cyan-400/10 transition-all
                active:bg-cyan-400/10 active:border-cyan-400/30
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:bg-cyan-400/5
                flex items-center gap-3
              `}
            >
              {item.icon && <span className="text-lg">{item.icon}</span>}
              <span className="text-cyan-400/80 hover:text-cyan-400">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Safe area spacing */}
        <div className="h-4" />
      </div>
    </>
  )
}

export function BottomNavBar({ items, activeId }: { items: NavItem[]; activeId?: string }) {
  const { isMobile } = useMobileLayout()

  if (!isMobile) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-cyan-400/30 bg-black">
      <div className="flex items-stretch h-16">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => item.onClick()}
            disabled={item.disabled}
            className={`
              flex-1 flex flex-col items-center justify-center gap-1
              border-r border-cyan-400/10 last:border-r-0
              transition-all active:bg-cyan-400/10
              disabled:opacity-50 disabled:cursor-not-allowed
              ${activeId === item.id ? 'bg-cyan-400/5 border-t-2 border-t-cyan-400' : ''}
            `}
          >
            {item.icon && <span className="text-lg">{item.icon}</span>}
            <span className="text-xs font-mono text-cyan-400/70 uppercase whitespace-nowrap">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Responsive container that adjusts for mobile nav
export function ResponsiveContainer({
  children,
  hasBottomNav = false,
}: {
  children: React.ReactNode
  hasBottomNav?: boolean
}) {
  const { isMobile } = useMobileLayout()

  return (
    <div
      className={`w-full ${
        isMobile && hasBottomNav ? 'pb-16' : ''
      }`}
    >
      {children}
    </div>
  )
}
