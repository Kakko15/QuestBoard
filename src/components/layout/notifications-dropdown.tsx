'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Scroll,
  Trophy,
  Users,
  Settings,
  CheckCheck,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNotifications } from '@/hooks/use-notifications'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  quest: <Scroll className="h-4 w-4 text-neon-orange" />,
  achievement: <Trophy className="h-4 w-4 text-neon-purple" />,
  guild: <Users className="h-4 w-4 text-neon-blue" />,
  system: <Settings className="h-4 w-4 text-gray-400" />,
}

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications()

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    // Mark visible unread notifications as read when closing
    if (!isOpen && unreadCount > 0) {
      const unreadIds = notifications
        .filter((n) => !n.isRead)
        .slice(0, 10)
        .map((n) => n.id)
      if (unreadIds.length > 0) {
        markAsRead(unreadIds)
      }
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground rounded-full"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-neon-orange text-[10px] font-bold text-black"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 p-0 bg-gray-900 border-white/10"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs text-neon-green hover:text-neon-green/80"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : notifications.length > 0 ? (
            <AnimatePresence initial={false}>
              {notifications.slice(0, 20).map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.03 }}
                  className={cn(
                    'flex gap-3 p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer',
                    !notification.isRead && 'bg-neon-purple/5'
                  )}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead([notification.id])
                    }
                  }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="p-2 rounded-full bg-white/5">
                      {NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.system}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm text-white truncate">
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-neon-orange" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="py-12 text-center">
              <Bell className="mx-auto h-10 w-10 text-gray-600" />
              <p className="mt-3 text-sm text-gray-400">No notifications yet</p>
              <p className="text-xs text-gray-500">
                We'll notify you about quests and achievements
              </p>
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-2 border-t border-white/10">
            <Button
              variant="ghost"
              className="w-full text-sm text-gray-400 hover:text-white"
              onClick={() => setOpen(false)}
            >
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


