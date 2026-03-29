import { create } from 'zustand'

interface TimestampState {
    index: number
    timeout: NodeJS.Timeout
}

interface UIState {
    // Theme
    theme: Theme
    setTheme: (theme: Theme) => void

    // Dialog
    dialog: Dialog | null
    setDialog: (dialog: Dialog | null) => void

    // Window focus
    focus: boolean
    setFocus: (focus: boolean) => void

    // Timestamp display (toggling timestamp visibility on a message)
    timestamp: TimestampState | null
    setTimestamp: (timestamp: TimestampState | null) => void

    // Reply
    replyingTo: Reply | undefined
    setReplyingTo: (reply: Reply | undefined) => void

    // Session timeout (in seconds)
    sessionTimeout: number
    setSessionTimeout: (timeout: number) => void
}

export const useUIStore = create<UIState>()((set) => ({
    theme: 'Default' as Theme,
    setTheme: (theme) => set({ theme }),

    dialog: null,
    setDialog: (dialog) => set({ dialog }),

    focus: true,
    setFocus: (focus) => set({ focus }),

    timestamp: null,
    setTimestamp: (timestamp) => set({ timestamp }),

    replyingTo: undefined,
    setReplyingTo: (replyingTo) => set({ replyingTo }),

    sessionTimeout: 15,
    setSessionTimeout: (sessionTimeout) => set({ sessionTimeout }),
}))
