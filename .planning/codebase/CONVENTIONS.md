# Coding Conventions

**Analysis Date:** 2026-02-15

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `RoomForm.tsx`, `RoomList.tsx`)
- Pages: lowercase with hyphens in dynamic routes (e.g., `page.tsx`, `[id]/route.ts`)
- Utilities and helpers: camelCase (e.g., `formatters.ts`, `api-error.ts`)
- Hooks: camelCase with `use` prefix (e.g., `useRooms.ts`, `useTenants.ts`)
- Type files: camelCase (e.g., `database.ts`, `room.ts` for validations)

**Functions:**
- Regular functions: camelCase (e.g., `fetchRooms`, `createRoom`, `formatCurrency`)
- React components: PascalCase (e.g., `RoomForm`, `RoomList`, `RoomCard`)
- Server actions: camelCase (e.g., `login`, `signup`)
- Hooks: camelCase with `use` prefix (e.g., `useRooms`, `useCreateRoom`)

**Variables:**
- Constants: UPPER_SNAKE_CASE (rarely used, mostly inline literals)
- Regular variables: camelCase (e.g., `propertyId`, `isEditing`, `searchParams`)
- Boolean prefixes: `is`, `has`, `can` (e.g., `isLoading`, `isEditing`, `hasError`)
- State variables from hooks: camelCase (e.g., `data`, `error`, `isPending`)

**Types:**
- Interfaces/Types: PascalCase (e.g., `RoomFormProps`, `RoomsResponse`, `QueryParams`)
- Generic type parameters: Single uppercase letters (e.g., `<T>`)
- Enum-like types: PascalCase literal unions (e.g., `type RoomStatus = 'vacant' | 'occupied'`)

## Code Style

**Formatting:**
- Line length: No explicit limit, follows natural breaks
- Indentation: 2 spaces (enforced by Tailwind CSS conventions)
- Semicolons: Always included (ESLint default)
- Quotes: Single quotes for strings, double quotes for JSX attributes
- Trailing commas: In objects/arrays that span multiple lines

**Linting:**
- Tool: ESLint v9 with Next.js config
- Config: `eslint.config.mjs` (flat config format)
- Rules enforced by `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Run: `npm run lint`

**Example ESLint output:**
```bash
npm run lint
# Checks against next/core-web-vitals and TypeScript rules
```

## Import Organization

**Order:**
1. External packages (`react`, `next/*`, third-party libraries)
2. Supabase and internal services (`@/lib/supabase/*`)
3. Utilities and validators (`@/lib/utils/*`, `@/lib/validations/*`)
4. Types and database types (`@/lib/types/*`)
5. Components (`@/components/*`)
6. Hooks (`@/hooks/*`)

**Path Aliases:**
- `@/*` maps to root directory (configured in `tsconfig.json`)
- Used throughout codebase for clean imports
- Example: `import { Room } from '@/lib/types/database'`

**Example from `/c/Users/LocTran/Project-2026/rent-management/components/rooms/RoomForm.tsx`:**
```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { roomFormSchema, RoomFormInput, UpdateRoomInput } from '@/lib/validations/room'
import { Room } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import { Building2, Loader2 } from 'lucide-react'
```

## Error Handling

**Patterns:**

1. **API Routes**: Centralized error handling via `/c/Users/LocTran/Project-2026/rent-management/lib/utils/api-error.ts`
   - Uses `ZodError` for validation errors with detailed field information
   - Uses `handleSupabaseError()` to map database errors to consistent API response format
   - Returns structured error responses with `code`, `message`, and optional `details`

2. **Example from API Route (`/c/Users/LocTran/Project-2026/rent-management/app/api/rooms/route.ts`):**
   ```typescript
   try {
       // ... validation and operations
       if (error instanceof ZodError) {
           return handleZodError(error)
       }
       // ... more code
   } catch (error) {
       if (error instanceof ZodError) {
           return handleZodError(error)
       }
       console.error('GET /api/rooms error:', error)
       return errors.internal()
   }
   ```

3. **Client-Side Hooks**: Error messages displayed via `toast.error()` from Sonner
   ```typescript
   export function useCreateRoom() {
       return useMutation({
           mutationFn: createRoom,
           onError: (error: Error) => {
               toast.error(error.message)
           },
       })
   }
   ```

4. **Server Actions**: Return error objects from async functions
   ```typescript
   export async function login(formData: FormData) {
       const { error } = await supabase.auth.signInWithPassword(...)
       if (error) {
           return { error: error.message }
       }
       // ... redirect
   }
   ```

5. **Pre-built error responses via `errors` object:**
   - `errors.unauthorized(message?)`
   - `errors.forbidden(message?)`
   - `errors.notFound(resource?)`
   - `errors.validation(message, details?)`
   - `errors.conflict(message?)`
   - `errors.internal()`

## Logging

**Framework:** `console` object (no external logging library)

**Patterns:**
- Errors logged with `console.error()` in catch blocks
- Format: `console.error('LOCATION error:', error)`
- Example: `console.error('GET /api/rooms error:', error)`
- Used in API routes for server-side debugging
- No client-side console logs in components (except development)

**Best Practice:**
- Log errors at the point of failure in API routes
- Include the operation name/location for traceability
- Client-side errors shown via `toast.error()` instead of console

## Comments

**When to Comment:**
- JSDoc comments for utility functions that have complex logic
- Inline comments for non-obvious logic only (most code is self-documenting)
- Section headers before major code blocks (e.g., `// ============ HOOKS ============`)

**JSDoc/TSDoc:**
- Used in formatter utilities (`/c/Users/LocTran/Project-2026/rent-management/lib/utils/formatters.ts`)
- Format includes `@example` for usage clarification
- Example:
  ```typescript
  /**
   * Format a number as Vietnamese currency (VND)
   * @example formatCurrency(3000000) => "3.000.000 đ"
   * @example formatCurrency(3000000, { showSymbol: false }) => "3.000.000"
   */
  export function formatCurrency(amount: number | null | undefined, options?: { showSymbol?: boolean }): string
  ```

## Function Design

**Size:** Functions kept focused on single responsibility
- Most utility functions are 5-20 lines
- Component functions range from 30-100 lines depending on complexity
- Custom hooks separate data fetching logic from component rendering

**Parameters:**
- Use object destructuring for multiple parameters (especially in React components)
- TypeScript interfaces define function prop contracts
- Example from `RoomForm`:
  ```typescript
  interface RoomFormProps {
      room?: Room | null
      propertyId: string
      onSubmit: (data: RoomFormInput | UpdateRoomInput) => void
      onCancel?: () => void
      isSubmitting?: boolean
  }
  ```

**Return Values:**
- Async functions return typed responses or throw errors
- Hooks return objects or tuples from TanStack Query
- Component handlers accept callbacks via props
- API routes return `NextResponse` objects with standardized structure

**Async/Await:**
- Preferred over `.then()` chains
- Used consistently in server actions, API routes, and data fetching functions
- Example:
  ```typescript
  const supabase = await createServer()
  const { data: { user } } = await supabase.auth.getUser()
  ```

## Module Design

**Exports:**
- Named exports for utilities and validators (allows selective imports)
- Default exports for React components (one component per file)
- Type exports for TypeScript interfaces
- Barrel files: Not extensively used, single-component export preference

**Example from validators (`/c/Users/LocTran/Project-2026/rent-management/lib/validations/room.ts`):**
```typescript
export const roomStatusSchema = z.enum(['vacant', 'occupied'])
export const createRoomSchema = z.object({ ... })
export type CreateRoomInput = z.infer<typeof createRoomSchema>
export type RoomFormInput = z.infer<typeof roomFormSchema>
```

**Component Structure:**
- Each component in separate file
- Props interface defined at top of file
- Component exported as default or named export
- Styling with Tailwind className prop

## Validation & Schemas

**Validation Tool:** Zod v4
- Schemas defined in `/c/Users/LocTran/Project-2026/rent-management/lib/validations/`
- Separate schemas for different operations (create, update, form, query)
- Form schemas omit defaults for react-hook-form compatibility

**Example from room validation:**
```typescript
// For API: includes defaults
export const createRoomSchema = z.object({
    property_id: z.string().uuid('Property ID không hợp lệ'),
    name: z.string().min(1, 'Tên phòng không được trống').max(100, 'Tên phòng tối đa 100 ký tự'),
    status: roomStatusSchema.default('vacant'),
})

// For form: no defaults
export const roomFormSchema = z.object({
    property_id: z.string().uuid('Property ID không hợp lệ'),
    name: z.string().min(1, 'Tên phòng không được trống').max(100, 'Tên phòng tối đa 100 ký tự'),
    status: roomStatusSchema,
})
```

**Validation Messages:** Vietnamese language for user-facing messages

## React Patterns

**Client/Server Components:**
- `'use client'` directive at top of client components
- Server actions marked with `'use server'` directive
- Server-side data fetching in server components or API routes

**Hooks Usage:**
- `useForm` from react-hook-form for form state management
- `useQuery`/`useMutation` from TanStack Query for server state
- Custom hooks in `/c/Users/LocTran/Project-2026/rent-management/hooks/` for shared logic

**Component Props:**
- Props defined as TypeScript interfaces
- Optional props marked with `?`
- Callback props typed with function signatures

**Example Component Structure:**
```typescript
interface RoomListProps {
    rooms: RoomWithTenant[]
    isLoading?: boolean
    onAddRoom?: () => void
    onEditRoom?: (room: Room) => void
    onDeleteRoom?: (room: Room) => void
    onRoomClick?: (room: Room) => void
}

export function RoomList({
    rooms,
    isLoading,
    onAddRoom,
    onEditRoom,
    onDeleteRoom,
    onRoomClick,
}: RoomListProps) {
    // Implementation
}
```

## Internationalization

**Language:** Vietnamese (vi-VN)
- UI text: Vietnamese language
- Locale formatting: Vietnamese locale for dates, numbers, currency
- Examples:
  - Currency: `3.000.000 đ` (Vietnamese format)
  - Date: `30/01/2026` (DD/MM/YYYY)
  - Formatting functions in `/c/Users/LocTran/Project-2026/rent-management/lib/utils/formatters.ts`

## TypeScript Configuration

**Compiler Options:**
- `strict: true` - Full type safety
- `noEmit: true` - Type checking only
- `esModuleInterop: true` - CommonJS compatibility
- `isolatedModules: true` - Single-file transpilation
- `jsx: react-jsx` - React 17+ JSX transform
- Path alias: `@/*` maps to root directory

---

*Convention analysis: 2026-02-15*
