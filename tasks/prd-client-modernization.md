# PRD: Client Modernization & Push Notifications

## Introduction

Diskreta is a 5-year-old E2E encrypted chat application with an outdated client stack (Create React App, Bootstrap + SCSS, Recoil, MUI icons). This PRD covers a full client-side modernization: migrating to Vite, replacing the styling system with Tailwind + shadcn/ui, replacing Recoil with Zustand, redesigning all UI from scratch, and adding push notifications. The existing Express + MongoDB + Socket.IO server is untouched.

## Goals

- Migrate from CRA to Vite for fast builds and modern DX
- Replace Bootstrap + SCSS + Emotion + MUI with Tailwind CSS + shadcn/ui + lucide-react
- Replace abandoned Recoil state management with Zustand
- Redesign all UI pages and components using shadcn/ui
- Simplify theming from 4 custom SCSS themes to light/dark/system toggle
- Add Web Push notifications for offline message alerts
- Maintain all existing functionality: E2E encryption, real-time messaging, reactions, replies, media sharing, read receipts, typing indicators, session timeout, data export/import

## User Stories

### US-001: Migrate from CRA to Vite
**Description:** As a developer, I want the client app to build and serve with Vite so that development is faster and the webpack/CRA tooling is removed.

**Acceptance Criteria:**
- [ ] `react-app-rewired`, `react-scripts`, and `config-overrides.js` are removed
- [ ] `vite` and `@vitejs/plugin-react` are installed
- [ ] `vite.config.ts` is created with dev server on port 3000 and proxy to backend (`VITE_BE_DOMAIN`)
- [ ] `public/index.html` is moved to `index.html` at the client app root (Vite convention)
- [ ] `tsconfig.json` is updated: `moduleResolution: "bundler"`, `target: "ES2022"`, remove CRA-specific settings
- [ ] All `REACT_APP_*` environment variables are renamed to `VITE_*` and all references updated
- [ ] `vite-plugin-node-polyfills` is installed and configured (node-forge and bip39 require Buffer/stream polyfills)
- [ ] Package.json scripts updated: `dev` → `vite`, `build` → `vite build`, `preview` → `vite preview`
- [ ] `pnpm dev --filter=@diskreta/client` starts the app without errors
- [ ] Existing app renders and is functional (login, register, chat all work)
- [ ] Typecheck passes

### US-002: Set up Tailwind CSS + shadcn/ui
**Description:** As a developer, I want Tailwind CSS and shadcn/ui configured so that new UI components can be built with them.

**Acceptance Criteria:**
- [ ] `tailwindcss` and `@tailwindcss/vite` are installed
- [ ] shadcn/ui is initialized (`components.json` created, `src/lib/utils.ts` with `cn()` helper exists)
- [ ] `src/styles/globals.css` contains Tailwind directives (`@import "tailwindcss"`) and shadcn CSS variables for light and dark themes
- [ ] The `globals.css` is imported in the app entry point
- [ ] Dark mode works via `class` strategy (adding `dark` class to `<html>`)
- [ ] A test shadcn component (e.g. `Button`) can be added and renders correctly with Tailwind styles
- [ ] Old styling dependencies are NOT removed yet (existing UI still works alongside new setup)
- [ ] Typecheck passes

### US-003: Set up Zustand stores
**Description:** As a developer, I want Zustand stores created to replace Recoil atoms so that state management uses a maintained library.

**Acceptance Criteria:**
- [ ] `zustand` is installed
- [ ] `src/stores/auth.ts` is created with the same shape as the current `userState` atom: `LoggedUser | null`, with getters and setters
- [ ] `src/stores/chats.ts` is created with the same shape as `chatsState` atom: `Record<string, Chat> | null`, with methods for updating messages, status, reactions, typing
- [ ] `src/stores/ui.ts` is created combining: theme (light/dark/system), dialog state, focus state, timestamp display state, replyingTo state, sessionTimeout
- [ ] Encrypted localStorage persistence middleware is implemented in `src/stores/middleware/encrypted-storage.ts` — replicating the AES encryption from `atoms/effects/persist.ts` using the user's digest as the key
- [ ] Auth and chats stores use the encrypted persistence middleware
- [ ] Recoil is NOT removed yet (both coexist temporarily)
- [ ] Typecheck passes

### US-004: Rewire hooks and API layer to Zustand
**Description:** As a developer, I want all hooks and the API layer to read/write from Zustand stores instead of Recoil atoms so that Recoil can be removed.

**Acceptance Criteria:**
- [ ] `API/index.ts` reads token from Zustand auth store (not Recoil via recoil-nexus)
- [ ] `API/refreshToken.ts` updates Zustand auth store
- [ ] `useSocket.ts` reads/writes Zustand stores for user, chats, and UI state
- [ ] `useActiveChat.ts` reads from Zustand chats store
- [ ] `useUpdateMessage.ts` updates Zustand chats store
- [ ] `usePrivateKey.ts` reads from Zustand auth store
- [ ] `useDisplayTimestamp.ts` uses Zustand UI store
- [ ] `FocusHandler.tsx` uses Zustand UI store for focus and session timeout
- [ ] All page handlers (`useHandleSubmit`, `useHandleRecovery`, `useHandleMnemonicSubmit`, `useHandleDigestUpdate`, `useHandleRegenerate`, `useArchiveMessage`, `useMessageStatus`, `useHandleDeleteChat`) use Zustand stores
- [ ] `Register/index.tsx` and `Login/index.tsx` use Zustand auth store
- [ ] `recoil`, `recoil-persist`, and `recoil-nexus` are removed from dependencies
- [ ] All files in `src/atoms/` are deleted
- [ ] `RecoilRoot` is removed from `index.tsx`
- [ ] App is fully functional with Zustand: can register, login, send/receive messages, reactions, replies, typing indicators, read receipts all work
- [ ] Typecheck passes

### US-005: Redesign login page
**Description:** As a user, I want a clean, modern login page so that the app feels polished and trustworthy.

**Acceptance Criteria:**
- [ ] Login page uses shadcn `Card`, `Input`, `Button`, `Label` components
- [ ] Styled with Tailwind, no Bootstrap or SCSS classes
- [ ] Fields: nick, password (with show/hide toggle)
- [ ] "Login" button submits the form
- [ ] "Recover account" link/button triggers the recovery flow (mnemonic entry dialog)
- [ ] "Create account" link navigates to `/register`
- [ ] Error states shown via shadcn toast or inline message
- [ ] Responsive: looks good on both mobile and desktop viewports
- [ ] Existing login logic (digest creation, API call, token decryption) works unchanged
- [ ] Typecheck passes
- [ ] Verify in browser

### US-006: Redesign register page
**Description:** As a user, I want a clean registration page that clearly presents the mnemonic seed phrase so I understand its importance.

**Acceptance Criteria:**
- [ ] Register page uses shadcn `Card`, `Input`, `Button`, `Label` components
- [ ] Fields: nick (with availability check), password (with show/hide toggle)
- [ ] On submit, shadcn `Dialog` displays the 24-word mnemonic in a clear grid layout
- [ ] Dialog warns user to write down the mnemonic and not screenshot it
- [ ] "I have saved my seed phrase" button confirms and completes registration
- [ ] Styled with Tailwind, no Bootstrap or SCSS
- [ ] Existing registration logic (keypair generation, digest, API call) works unchanged
- [ ] Typecheck passes
- [ ] Verify in browser

### US-007: Build layout shell
**Description:** As a user, I want a responsive app layout with a sidebar for conversations and a main panel for chat.

**Acceptance Criteria:**
- [ ] Two-column layout: left sidebar (conversations list) + right main panel (active chat or empty state)
- [ ] On desktop (≥768px): both panels visible side by side
- [ ] On mobile (<768px): only one panel visible at a time — conversations list is default, tapping a chat navigates to full-screen chat view, back button returns to conversations
- [ ] Sidebar header shows app branding ("diskreta") and action buttons (new chat, settings)
- [ ] Empty state in main panel when no chat is selected (e.g., "Select a conversation")
- [ ] Uses shadcn `ScrollArea` for scrollable panels
- [ ] Styled with Tailwind, no Bootstrap grid or SCSS
- [ ] Route structure: `/` shows conversations, `/:activeChatId` shows chat (mobile: full-screen, desktop: in main panel)
- [ ] Typecheck passes
- [ ] Verify in browser

### US-008: Build conversations list
**Description:** As a user, I want to see my conversations sorted by most recent so I can quickly find and open chats.

**Acceptance Criteria:**
- [ ] Lists all chats from Zustand chats store, sorted by latest message timestamp (newest first)
- [ ] Each conversation row shows: recipient nick(s), last message preview (or "typing..." if active), timestamp of last message
- [ ] Unread message count shown as a badge on each conversation
- [ ] Clicking a conversation navigates to `/:chatId`
- [ ] Active conversation is visually highlighted
- [ ] Delete conversation option (hover on desktop, swipe or long-press on mobile) with confirmation dialog
- [ ] Uses shadcn `Avatar`, `Badge`, `ScrollArea` components
- [ ] Styled with Tailwind
- [ ] Typecheck passes
- [ ] Verify in browser

### US-009: Build user search dialog
**Description:** As a user, I want to search for other users by nickname so I can start new conversations.

**Acceptance Criteria:**
- [ ] "New chat" button in sidebar header opens a shadcn `Dialog`
- [ ] Dialog contains a search input with debounced search (existing API: `GET /users?nick={query}`)
- [ ] Results shown as a list of user nicks
- [ ] Clicking a user creates or navigates to the existing chat with them
- [ ] Empty state when no results found
- [ ] Styled with Tailwind + shadcn components
- [ ] Typecheck passes
- [ ] Verify in browser

### US-010: Build chat header
**Description:** As a user, I want to see who I'm chatting with and have access to chat actions.

**Acceptance Criteria:**
- [ ] Shows recipient nick(s) for the active chat
- [ ] On mobile: back button (left arrow) to return to conversations list
- [ ] Dropdown menu (shadcn `DropdownMenu`) with "Delete chat" option
- [ ] Delete chat shows confirmation dialog before executing
- [ ] Styled with Tailwind + shadcn
- [ ] Typecheck passes
- [ ] Verify in browser

### US-011: Build message list
**Description:** As a user, I want to see the message history in a chat with clear visual distinction between sent and received messages.

**Acceptance Criteria:**
- [ ] Messages rendered in chronological order (oldest at top, newest at bottom)
- [ ] Sent messages aligned right with a distinct background color
- [ ] Received messages aligned left with a different background color
- [ ] Each message shows: text content, timestamp (on click for sent messages)
- [ ] Sent messages show status icons: clock (outgoing) → single check (sent) → double check (delivered) → blue double check (read)
- [ ] Date separators between message groups ("Today", "Yesterday", or full date)
- [ ] Scroll-to-bottom floating button when scrolled up
- [ ] Chat auto-scrolls to bottom on new messages (only if already at bottom)
- [ ] Emits `read-msg` for visible received messages (existing read receipt logic)
- [ ] Uses shadcn `ScrollArea`
- [ ] URL detection: URLs in message text are rendered as clickable links
- [ ] Emoji-only messages rendered at larger font size
- [ ] Styled with Tailwind
- [ ] Typecheck passes
- [ ] Verify in browser

### US-012: Build message input
**Description:** As a user, I want to type and send encrypted messages.

**Acceptance Criteria:**
- [ ] Textarea input at bottom of chat, auto-grows with content (max ~5 lines, then scrolls)
- [ ] Send button (lucide `Send` icon) — disabled when input is empty
- [ ] Enter sends message, Shift+Enter inserts newline
- [ ] Camera/attachment button for media (triggers file input for image capture/selection)
- [ ] Media compression (existing `browser-image-compression` logic) and HEIC→PNG conversion (existing `heic2any` logic) preserved
- [ ] Emits `typing` socket event while user is typing (existing debounce logic)
- [ ] Existing encryption logic preserved: text encrypted with recipient's RSA public key, media encrypted with random AES key (key itself RSA-encrypted)
- [ ] Message sent via existing Socket.IO `out-msg` event with ACK handling
- [ ] Styled with Tailwind + shadcn `Button`
- [ ] Typecheck passes
- [ ] Verify in browser

### US-013: Build reply-to functionality
**Description:** As a user, I want to reply to specific messages so conversations have clear context.

**Acceptance Criteria:**
- [ ] Swipe right on a message (50px threshold) triggers reply mode (existing `useSwipe` logic)
- [ ] Reply bar appears above the message input showing the quoted message content and sender
- [ ] Close button on reply bar cancels the reply
- [ ] Sent reply includes `replyingTo` field in the message payload (existing logic)
- [ ] Received replies show a quoted block above the message content
- [ ] Styled with Tailwind (left border accent on quoted block)
- [ ] Typecheck passes
- [ ] Verify in browser

### US-014: Build emoji reactions
**Description:** As a user, I want to react to messages with emoji.

**Acceptance Criteria:**
- [ ] Long-press (500ms) on a message shows reaction picker (existing `useLongPress` logic)
- [ ] Reaction options: 👍 ❤️ 😂 😮 😢 🙏
- [ ] Picker shown as shadcn `Popover` positioned near the message
- [ ] Selecting a reaction sends it via existing `out-reaction` Socket.IO event
- [ ] Received reactions displayed as small badges below the message
- [ ] Tapping a reaction badge shows a dialog listing who reacted with what (existing `UsersReaction` logic)
- [ ] Styled with Tailwind + shadcn
- [ ] Typecheck passes
- [ ] Verify in browser

### US-015: Build typing indicator
**Description:** As a user, I want to see when the other person is typing.

**Acceptance Criteria:**
- [ ] "User is typing..." text with animated dots shown at the bottom of the message list
- [ ] Triggered by incoming `typing` Socket.IO event (existing logic)
- [ ] Disappears after 500ms of no typing events (existing timeout logic)
- [ ] Also shown as preview text in conversations list ("typing..." instead of last message)
- [ ] Styled with Tailwind
- [ ] Typecheck passes
- [ ] Verify in browser

### US-016: Build media viewer
**Description:** As a user, I want to view shared images in a full-screen viewer with zoom and pan.

**Acceptance Criteria:**
- [ ] Tapping an image in a message opens a full-screen overlay
- [ ] Overlay supports pinch-to-zoom and pan (using existing `react-zoom-pan-pinch` or replacement)
- [ ] Close button or tap outside dismisses the viewer
- [ ] Smooth fade-in/fade-out animation
- [ ] Uses shadcn `Dialog` as the overlay container
- [ ] Styled with Tailwind
- [ ] Typecheck passes
- [ ] Verify in browser

### US-017: Build settings dialog
**Description:** As a user, I want to access settings to control theme, session timeout, and manage my data.

**Acceptance Criteria:**
- [ ] Settings gear icon in sidebar header opens a shadcn `Dialog`
- [ ] **Theme section:** dropdown or select to choose light / dark / system. Selecting a theme applies it immediately by toggling `dark` class on `<html>` and respecting `prefers-color-scheme` for system option. Persisted in user settings.
- [ ] **Session timeout section:** dropdown to select inactivity timeout (15 seconds, 60 seconds, 10 minutes, 1 hour, Never). Existing `FocusHandler` logic applies.
- [ ] **Manage data section:** Export button (copies encrypted JSON to clipboard), Import button (paste JSON to restore), Delete account button (with confirmation dialog, calls `DELETE /users/me`)
- [ ] Styled with Tailwind + shadcn
- [ ] Typecheck passes
- [ ] Verify in browser

### US-018: Remove legacy styling dependencies
**Description:** As a developer, I want all legacy CSS/styling dependencies removed so the bundle is clean.

**Acceptance Criteria:**
- [ ] All files in `src/styles/` deleted except `globals.css`
- [ ] `sass`, `bootstrap`, `react-bootstrap`, `react-bootstrap-icons`, `@emotion/react`, `@emotion/styled`, `@mui/icons-material` removed from dependencies
- [ ] No remaining imports of Bootstrap classes, SCSS files, Emotion styled components, or MUI icons anywhere in the codebase
- [ ] `lucide-react` used for all icons
- [ ] App renders correctly with only Tailwind + shadcn styling
- [ ] No console warnings about missing stylesheets
- [ ] Typecheck passes
- [ ] Verify in browser

### US-019: Remove legacy files and unused dependencies
**Description:** As a developer, I want all old code removed so the codebase is clean and there's no dead code.

**Acceptance Criteria:**
- [ ] Old `src/pages/` directory deleted (replaced by new pages)
- [ ] Old `src/components/` directory deleted (replaced by new components and shadcn ui)
- [ ] Old `src/hooks/` files that were fully replaced are deleted (unused hooks only — keep any that are still imported)
- [ ] Old `src/constants/themes.ts` deleted (replaced by light/dark/system)
- [ ] `react-json-tree`, `react-device-detect`, `use-deep-compare`, `copy-to-clipboard`, `serve`, `patch-package` evaluated and removed if unused
- [ ] `react-error-overlay` removed from devDependencies
- [ ] No unused imports or dead code files remain
- [ ] Bundle size reduced compared to pre-migration
- [ ] `pnpm dev` and `pnpm build` both succeed
- [ ] Typecheck passes

### US-020: Add push notification support (server)
**Description:** As a developer, I want the server to send Web Push notifications when a recipient is offline so they know they have a new message.

**Acceptance Criteria:**
- [ ] `web-push` package installed in `apps/server`
- [ ] VAPID key pair generated and stored as environment variables (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL`)
- [ ] New route `POST /api/push/subscribe` — accepts a `PushSubscription` object, stores it on the user document in MongoDB (new `pushSubscription` field on User model)
- [ ] New route `DELETE /api/push/unsubscribe` — removes the stored push subscription from the user document
- [ ] New route `GET /api/push/vapid-public-key` — returns the VAPID public key for client-side subscription
- [ ] In the existing `out-msg` handler in `server.ts`: when recipient is offline (not in `shared.onlineUsers`), send a Web Push notification with payload `{ title: "Diskreta", body: "You have a new message" }` — NO message content, NO sender name
- [ ] Push notification send failures (expired subscription, etc.) are caught and the subscription is removed from the user document
- [ ] Existing message queuing to MongoDB is unchanged (push is in addition to, not a replacement for, the queue)
- [ ] Typecheck passes

### US-021: Add push notification support (client)
**Description:** As a user, I want to receive a push notification when I get a message while the app is in the background, so I don't miss conversations.

**Acceptance Criteria:**
- [ ] Service Worker file at `public/sw.js` handles `push` events and shows a notification using `self.registration.showNotification()`
- [ ] Notification click opens/focuses the app window
- [ ] On first login after registration, the app prompts the user to enable notifications (browser permission prompt). If granted, subscribes and sends the `PushSubscription` to `POST /api/push/subscribe`
- [ ] On logout or account deletion, calls `DELETE /api/push/unsubscribe`
- [ ] Toggle in settings (US-017) to enable/disable push notifications. Default: on (prompt shown). If disabled, unsubscribes.
- [ ] Push subscription is refreshed on each login (subscriptions can expire)
- [ ] Service Worker registered in app entry point
- [ ] Works in Chrome and Firefox (Safari Web Push is bonus, not required)
- [ ] Typecheck passes
- [ ] Verify in browser

## Functional Requirements

- FR-1: The client must build and serve using Vite (not CRA/webpack)
- FR-2: All UI components must use Tailwind CSS for styling and shadcn/ui as the component library
- FR-3: All icons must use lucide-react
- FR-4: State management must use Zustand with encrypted localStorage persistence
- FR-5: The app must support three theme modes: light, dark, and system (follows OS preference)
- FR-6: Theme selection must be persisted in user settings and applied via CSS class toggle on `<html>`
- FR-7: On mobile (<768px), the app must show one panel at a time — conversations or chat — with navigation between them
- FR-8: On desktop (≥768px), conversations and chat must be visible side by side
- FR-9: All existing features must work after migration: E2E encryption, real-time messaging, reactions, replies, media sharing, read receipts, typing indicators, session timeout, data export/import, account recovery via mnemonic
- FR-10: The server must send a Web Push notification (empty ping, no content) when a message is sent to an offline recipient
- FR-11: Push notifications must be opt-in (default on), with a toggle in settings to disable
- FR-12: No Bootstrap, SCSS, Emotion, MUI, or Recoil code may remain after migration

## Non-Goals

- No server-side changes except push notification support (Express, MongoDB, Socket.IO stay)
- No changes to the encryption/crypto implementation (RSA-4096, crypto-js, node-forge stay)
- No changes to the message protocol or Socket.IO events
- No new features beyond push notifications (no group chat, no voice/video, no file sharing beyond images)
- No migration to Gun.js or SEA (deferred)
- No automated testing additions (existing tests may break and can be removed if they test deleted code)
- No SSR or server-side rendering

## Design Considerations

- shadcn/ui provides unstyled, accessible components — customize with Tailwind to match a clean, minimal chat aesthetic
- Dark mode should feel native, not an afterthought — design dark-first, light is the variant
- Mobile UX should feel like a native messaging app (WhatsApp/Signal navigation pattern)
- Keep the "diskreta." branding minimal and elegant
- Existing `react-zoom-pan-pinch` can be kept for the media viewer or replaced with a lighter CSS-based solution

## Technical Considerations

- **Vite polyfills**: node-forge and bip39 require Node.js `Buffer` and `stream`. Use `vite-plugin-node-polyfills` to provide these.
- **shadcn/ui path aliases**: shadcn expects `@/components`, `@/lib` path aliases. Configure in `vite.config.ts` and `tsconfig.json`.
- **Zustand encrypted persistence**: Port the AES encryption logic from `atoms/effects/persist.ts`. The digest (SHA512 of nick+password) is used as the encryption key. The persistence must handle the bootstrap problem: on app load, the digest isn't available until login, so the store initializes empty and hydrates after authentication.
- **Environment variables**: Vite uses `import.meta.env.VITE_*` instead of `process.env.REACT_APP_*`. All references must be updated.
- **Socket.IO**: Keep the existing `socket.io-client` integration. The `useSocket` hook just needs to read/write Zustand instead of Recoil.
- **Push notification VAPID keys**: Generate once with `web-push generate-vapid-keys` and store as server environment variables.
- **Service Worker scope**: The SW file must be at the root of the public directory to have full scope.

## Success Metrics

- `pnpm dev` starts both client and server, app is fully functional
- `pnpm build` produces a production bundle with no errors
- All existing features work: register, login, recover, send/receive messages, reactions, replies, media, read receipts, typing, settings, export/import, delete account
- Theme toggle switches between light/dark/system correctly
- Mobile layout works as a single-panel navigation (conversations → chat → back)
- Push notification appears on a mobile/desktop browser when a message arrives while the app is backgrounded
- No Bootstrap, SCSS, Emotion, MUI, or Recoil code remains in the codebase

## Resolved Questions

- **`react-zoom-pan-pinch`**: Keep it. It's lightweight and purpose-built for the image viewer.
- **Notification sound**: Use browser default. No custom audio.
- **`copy-to-clipboard`**: Remove it. Use native `navigator.clipboard.writeText()` — fully supported in all browsers including Safari since 2020.
