# chatxin — Frontend

Vite + React 18 + Redux Toolkit + Tailwind CSS. Talks to the `chatxin-backend`.

## Run

```bash
npm install
npm run dev
```

Vite dev server `5173` par chalega, aur `/api` + `/socket.io` calls automatically `http://localhost:3001` (backend) pe proxy ho jayengi (`vite.config.js` dekho) — CORS ki tension nahi.

Backend already `.env` mein `CLIENT_URL=http://localhost:5173` set hona chahiye.

## Structure

```
src/
├── main.jsx, App.jsx        # entry + routes
├── index.css                 # tailwind + design tokens
├── lib/
│   ├── axiosInstance.js      # withCredentials + silent 401 → /auth/refresh → retry
│   └── socket.js             # socket.io-client singleton
├── redux/
│   ├── store.js
│   └── slices/
│       ├── authSlice.js      # signup/login/logout/checkAuth/updateProfile
│       └── chatSlice.js      # chats, messages, selectedUser, online users, typing
├── hooks/
│   └── useSocketListeners.js # newMessage/status/seen/typing events → redux
├── components/
│   ├── ui/                   # Button, Input, Avatar (pulse ring), Spinner
│   ├── sidebar/               # Sidebar, SearchBar, ChatListItem
│   ├── chat/                  # ChatWindow, MessageBubble, MessageInput, TypingIndicator
│   └── layout/ProtectedRoute.jsx
├── pages/
│   ├── AuthPage.jsx           # login/signup toggle (zod + react-hook-form)
│   ├── HomePage.jsx           # sidebar + chat window shell (mobile: one pane at a time)
│   └── ProfilePage.jsx
└── utils/formatTime.js
```

## Design system

- **Colors**: `ink` (bg), `surface` / `surface-2` / `surface-3` (panels/inputs), `marigold` (primary accent), `teal` (secondary/online) — see `tailwind.config.js`
- **Type**: Sora (display), Inter (body), JetBrains Mono (timestamps)
- **Signature**: online-user avatar pulse ring (teal) + speech-bubble typing indicator (marigold dots) — everything else kept quiet/disciplined

## API/socket contract this expects (matches your tested backend)

- Auth: `/api/auth/{signup,login,logout,refresh,check,update-profile}` — response shape `{ success, message, data }`
- Message: `GET /api/message/users`, `GET /api/message/:id`, `POST /api/message/send/:id`
- Search: `GET /api/search?q=...`
- Socket events: `newMessage`, `messageStatusUpdate`, `messagesSeen`, `getOnlineUsers`, `userTyping`, `userStopTyping`, `typing`, `stopTyping`

## Notes on dependency versions

Latest **stable, non-breaking** versions used. Skipped for now (all released but bring breaking API changes vs. this codebase — can upgrade later deliberately):

- React 19 (kept 18.3.1 — hook/ref behavior changes)
- React Router v7 (kept v6.30 — different route config API)
- Tailwind v4 (kept v3.4 — v4 drops `tailwind.config.js` for CSS-based config)
- Zod v4 (kept v3.25 — error/message API changed)
- lucide-react v1 (kept v0.577 — some icon renames)
