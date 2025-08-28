# Prompt Hub - AI-Powered Business Tools

Your all-in-one business command center with AI-driven toolkit to master your company with the clarity of world-class advisors.

## Features

- **Guaranteed Persistence**: Every edit is verifiably persisted to SQLite with version-based concurrency control
- **No Silent Failures**: All errors are surfaced with toasts and inline status indicators
- **Race Condition Prevention**: Atomic writes with Prisma transactions and SQLite WAL mode
- **Autosave & Local Drafts**: Automatic saving with IndexedDB fallback for offline editing
- **Conflict Resolution**: Smart conflict detection and resolution UI for concurrent edits
- **Multi-tab Support**: Prevents data loss across multiple browser tabs
- **Save History**: Complete audit trail of all save attempts and outcomes

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React
- **Database**: Prisma with SQLite (WAL mode, FULL synchronous)
- **State Management**: TanStack Query (React Query) for server state
- **Validation**: Zod for runtime type safety
- **Local Storage**: IndexedDB via idb-keyval for offline drafts
- **UI**: Tailwind CSS with custom components
- **Notifications**: React Hot Toast for user feedback

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd prompt-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database (creates tables)
   npm run db:push
   
   # Seed with sample data
   npm run db:seed
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Setup

The application uses SQLite with the following configuration for maximum reliability:

- **WAL Mode**: Write-Ahead Logging for better concurrency
- **FULL Synchronous**: Ensures data is written to disk before returning
- **Atomic Transactions**: All writes are wrapped in Prisma transactions
- **Audit Trail**: Complete history of all changes with before/after snapshots

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Run migrations (if using migrations)
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio
```

## How Saving Works

### 1. **Local Drafts (IndexedDB)**
- Every keystroke triggers a 500ms debounced save to IndexedDB
- Drafts are marked as "dirty" until successfully saved to server
- Provides offline editing capability

### 2. **Autosave to Server**
- After 1.5 seconds of inactivity, content is automatically saved to the server
- Blur events trigger immediate save attempts
- Optimistic updates provide instant UI feedback

### 3. **Version Control**
- Each prompt has a version number that increments on every save
- Server checks client version before allowing updates
- Version conflicts trigger resolution UI

### 4. **Conflict Resolution**
When a version conflict is detected:
- **Keep Mine**: Overwrites server version with your changes
- **Take Server**: Discards local changes and loads server version
- **Merge**: Opens diff editor to manually combine changes

### 5. **Error Handling**
- Network failures trigger exponential backoff retries
- Failed saves are logged with timestamps and error details
- Users can manually retry failed saves
- Local drafts are preserved during network outages

## API Endpoints

### Prompts
- `GET /api/prompts` - List all prompts
- `GET /api/prompts/[key]` - Get single prompt
- `POST /api/prompts` - Create new prompt
- `PUT /api/prompts/[key]` - Update prompt (with version check)

### Response Headers
- `ETag: W/"<version>"` - Version for conflict detection
- `Retry-After: 2` - Retry delay on server errors

## Development

### Project Structure

```
├── app/
│   ├── api/prompts/          # API routes
│   ├── prompt-hub/           # Main prompt hub page
│   └── layout.tsx            # Root layout with providers
├── components/
│   ├── PromptEditor.tsx      # Main editor component
│   ├── ConflictResolutionModal.tsx
│   ├── SaveStatusPill.tsx
│   └── SaveHistoryPanel.tsx
├── lib/
│   ├── db.ts                 # Database connection
│   ├── promptSchema.ts       # Zod schemas
│   ├── usePrompts.ts         # TanStack Query hooks
│   ├── localDraft.ts         # IndexedDB utilities
│   ├── log.ts                # Save logging
│   └── providers.tsx         # App providers
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── seed.ts               # Sample data
│   └── migrations/           # Database migrations
└── types/                    # TypeScript type definitions
```

### Key Components

#### PromptEditor
- Handles all editing logic with autosave
- Manages local drafts and server synchronization
- Provides conflict resolution UI
- Shows save status and history

#### usePrompts (TanStack Query)
- `usePrompts()` - Fetch all prompts
- `usePrompt(key)` - Fetch single prompt
- `useUpdatePrompt()` - Update with optimistic updates and retries
- `useCreatePrompt()` - Create new prompts

#### Local Draft System
- `saveDraft()` - Save to IndexedDB
- `loadDraft()` - Load from IndexedDB
- `hasDirtyDraft()` - Check for unsaved changes
- `markDraftClean()` - Mark as successfully saved

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

## Deployment

### Environment Variables
```env
DATABASE_URL="file:./dev.db"
NODE_ENV="production"
```

### Build and Deploy
```bash
# Build the application
npm run build

# Start production server
npm start
```

## Troubleshooting

### Database Issues
1. **Reset database**: Delete `prisma/dev.db` and run `npm run db:push && npm run db:seed`
2. **Check WAL mode**: Ensure SQLite is in WAL mode with `PRAGMA journal_mode=WAL;`
3. **Verify permissions**: Ensure write permissions to the database directory

### Save Issues
1. **Check IndexedDB**: Open DevTools → Application → IndexedDB to verify drafts
2. **Network connectivity**: Check browser network tab for failed requests
3. **Version conflicts**: Look for 409 status codes indicating conflicts

### Performance Issues
1. **Database size**: Monitor SQLite file size and consider archiving old audit logs
2. **Memory usage**: Check for memory leaks in the save history panel
3. **Network requests**: Monitor TanStack Query cache and refetch frequency

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Prompts Hub — Saving Guarantees
- Atomic writes in SQLite with WAL + FULL sync, Prisma transactions.
- Version locking prevents overwrites; 409 returns conflict.
- IndexedDB keeps local draft; autosaves after 1.5s idle or on blur.
- If API fails, edits persist locally and retry; never lose keystrokes.
- Multi-tab soft lock shows read-only when another tab edits the same prompt.

Troubleshooting:
- See Network tab for 409 (conflict) or 503 (retryable). Draft remains safe.
- To import legacy JSON: put your file at `./data/prompts.json` then run `tsx scripts/import-prompts.ts`.
