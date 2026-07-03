# Cliper — mobile remote for your local AI coding agent

React Native (Expo SDK 53 + TypeScript + Expo Router) MVP built from the product spec.
The phone browses repos, chats with codebase memory, launches tasks, and watches
the agent stream — code changes only ever happen on your laptop.

## Run it

```bash
npm install
npx expo start
```

Scan the QR with Expo Go (iOS/Android).

## Structure

```
app/
  _layout.tsx            Root stack (dark, slide transitions)
  index.tsx              Auth gate → sign-in or tabs
  sign-in.tsx            GitHub OAuth launch screen (mocked)
  (tabs)/
    _layout.tsx          Bottom tabs (View-built geometric icons)
    repositories.tsx     Repo list · pull-to-refresh · empty state
    activity.tsx         Event timeline
    profile.tsx          Avatar, stats, logout
  repo/[id]/
    index.tsx            Repo details · Sync / Chat / Run task
    chat.tsx             Ask ↔ Agent segmented chat + live task timeline
components/
  ui.tsx                 StatusDot (agent pulse), Pill, ProgressBar, Card, TabGlyph
  RepoCard.tsx           Large repo card w/ memory coverage bar
  SegmentedControl.tsx   Ask / Agent switch
  Markdown.tsx           Minimal md renderer (code blocks + copy, inline code)
  TaskTimeline.tsx       Streamed agent event feed
  EmptyState.tsx         Terminal-styled `cliper init` prompt
lib/
  theme.ts               Colors / radius / spacing tokens from the spec
  types.ts               Domain models
  mock.ts                Mock repos, activity, task script
  store.ts               Zustand store · optimistic sync · simulated /ws stream
```

## Constraints honored

- Only core RN components: View, Text, Pressable, FlatList, ScrollView,
  SafeAreaView (safe-area-context), TextInput, Image.
- No HTML, CSS, Tailwind/NativeWind, className, SVG, or icon libraries —
  tab icons and glyphs are built from Views and unicode.
- Theme exactly per spec: #09090B / #18181B / #6D5DFB / 18px radius.

## Wiring the real backend

Every mocked call is marked with a comment naming its endpoint:

- `sign-in.tsx` → `POST /auth/github` (use expo-auth-session + expo-secure-store)
- `repositories.tsx` onRefresh → `GET /repositories` (drop in React Query here)
- `store.ts syncRepo` → `POST /repositories/:id/sync`
- `chat.tsx` Ask mode → `POST /repositories/:id/chat`
- `chat.tsx` Agent mode / `store.ts runTask` → `POST /repositories/:id/tasks`,
  then replace the `setInterval` in `runTask` with a `/ws` subscription — the
  event shape (`TaskEvent`) already matches the streamed kinds.

## Nice next steps

- KeyboardAvoidingView around the chat input (left out to stay within the
  allowed-component list).
- expo-clipboard for real copy in code blocks.
- React Query + FlashList once the API is live.
