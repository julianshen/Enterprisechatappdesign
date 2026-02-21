
  # Enterprise chat app design

  This is a code bundle for Enterprise chat app design. The original project is available at https://www.figma.com/design/fBqrmPfxEqxPFxU4cFG0tU/Enterprise-chat-app-design.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Recent changes

- Migrated UI components into a shadcn-style structure under `src/components/ui` with a barrel export at `src/components/ui/index.ts`.
- Added a full-featured emoji picker (search, categories, skin tones, recent/frequent, pagination) and reused it for message reactions.
- Upgraded `RichMessageInput` with rich paste (HTML → Markdown), inline image paste/upload hook, and moved it into the UI namespace.
- Added `MarkdownContent` and `TableGridPicker` as first-class UI components.
  
