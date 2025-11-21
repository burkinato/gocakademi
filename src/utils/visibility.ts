export type VisibilityContext = {
  currentRole: 'student' | 'instructor' | 'admin' | null
  currentUserId: number | null
  targetUserId?: number | null
  targetUserRole?: 'student' | 'instructor' | 'admin' | null
  targetUserActive?: boolean | null
}

export function canSeeActiveToggle(ctx: VisibilityContext): boolean {
  if (!ctx.currentRole) return false
  if (ctx.currentRole !== 'admin') return false
  if (ctx.currentUserId && ctx.targetUserId && ctx.currentUserId === ctx.targetUserId) return false
  return true
}

export function canSeeTwoFactor(ctx: VisibilityContext): boolean {
  // 2FA yönetimi sadece admin ve kendisi olmayan hedef kullanıcılar için
  if (!ctx.currentRole) return false
  if (ctx.currentRole !== 'admin') return false
  if (ctx.currentUserId && ctx.targetUserId && ctx.currentUserId === ctx.targetUserId) return false
  return true
}

import type { CSSProperties } from 'react'

export function transitionStyle(show: boolean): CSSProperties {
  return {
    transition: 'opacity 350ms cubic-bezier(0.4, 0, 0.2, 1), transform 350ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: show ? 1 : 0,
    transform: show ? 'translateX(0)' : 'translateX(-8px)'
  }
}

export function baseTransitionClass(): string {
  return 'transition-all duration-300'
}