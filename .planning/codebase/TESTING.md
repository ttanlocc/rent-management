# Testing Patterns

**Analysis Date:** 2026-02-15

## Test Framework

**Status:** Not yet implemented

**Planned Infrastructure:**
- Runner: Vitest (for unit tests)
- E2E: Playwright (for end-to-end tests)
- Accessibility: Axe (mentioned in README)

**Current State:**
- No test files exist in the project (`find . -name "*.test.ts" -o -name "*.spec.ts"` returns no results)
- No test configuration files present (no `jest.config.*`, `vitest.config.*`, etc.)
- No test scripts in `package.json` (only `dev`, `build`, `start`, `lint`)
- Testing framework needs to be set up as part of future phases

## Manual Testing Patterns (Current Approach)

Since automated testing is not yet implemented, the project follows manual testing and integration patterns:

**Data Validation:**
- Zod schemas validate all inputs (API and form level)
- Type safety provided by TypeScript (`strict: true`)
- Example from `/c/Users/LocTran/Project-2026/rent-management/lib/validations/room.ts`:
  ```typescript
  export const createRoomSchema = z.object({
      property_id: z.string().uuid('Property ID không hợp lệ'),
      name: z.string().min(1, 'Tên phòng không được trống').max(100, 'Tên phòng tối đa 100 ký tự'),
      floor: z.number().int('Tầng phải là số nguyên').min(1, 'Tầng phải >= 1').default(1),
      area: z.number().positive('Diện tích phải > 0').optional().nullable(),
      base_rent: z.number().positive('Giá thuê phải > 0'),
      status: roomStatusSchema.default('vacant'),
  })
  ```

**API Route Testing:**
- Manual verification via curl/Postman
- Structured error responses aid debugging
- Example error handling in `/c/Users/LocTran/Project-2026/rent-management/app/api/rooms/route.ts`:
  ```typescript
  try {
      // ... validation
      if (error instanceof ZodError) {
          return handleZodError(error)
      }
      // ... database operations
  } catch (error) {
      console.error('GET /api/rooms error:', error)
      return errors.internal()
  }
  ```

**Component Testing:**
- UI components use shadcn/ui (pre-tested component library)
- Props interfaces ensure correct usage
- Form validation caught at Zod schema level
- Client-side error messages via `toast.error()`

**Integration Points:**
- TanStack Query handles API call retries and error states
- Mutation hooks show loading states (`isPending`)
- Example from `/c/Users/LocTran/Project-2026/rent-management/hooks/useRooms.ts`:
  ```typescript
  export function useCreateRoom() {
      const queryClient = useQueryClient()
      return useMutation({
          mutationFn: createRoom,
          onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: roomKeys.lists() })
              toast.success('Tạo phòng thành công!')
          },
          onError: (error: Error) => {
              toast.error(error.message)
          },
      })
  }
  ```

## Test File Organization (When Implemented)

**Recommended Structure:**

**Unit Tests:**
- Location: Co-located with implementation (e.g., `utils/formatters.test.ts` next to `utils/formatters.ts`)
- Or: `tests/unit/` directory for shared utilities
- Naming: `*.test.ts` or `*.spec.ts` (Vitest detects both)

**Integration Tests:**
- Location: `tests/integration/`
- Focus: API route behavior, database interactions, validation logic

**E2E Tests (Playwright):**
- Location: `e2e/` or `tests/e2e/`
- Focus: User workflows (login → create room → update tenant)

**Fixtures & Mocks:**
- Location: `tests/fixtures/` for test data
- Location: `tests/mocks/` for mock handlers

## Test Structure & Patterns (Recommendations)

**Unit Test Example (for formatters):**
```typescript
import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, formatPhone } from '@/lib/utils/formatters'

describe('formatCurrency', () => {
  it('should format amount as Vietnamese currency', () => {
    expect(formatCurrency(3000000)).toBe('3.000.000 đ')
  })

  it('should handle null/undefined', () => {
    expect(formatCurrency(null)).toBe('0 đ')
    expect(formatCurrency(undefined)).toBe('0 đ')
  })

  it('should omit symbol when requested', () => {
    expect(formatCurrency(3000000, { showSymbol: false })).toBe('3.000.000')
  })
})

describe('formatDate', () => {
  it('should format date as DD/MM/YYYY', () => {
    const date = new Date('2026-01-30')
    expect(formatDate(date)).toBe('30/01/2026')
  })

  it('should include time when requested', () => {
    const date = new Date('2026-01-30T14:30:00')
    const result = formatDate(date, { includeTime: true })
    expect(result).toContain('14:30')
  })

  it('should handle invalid dates', () => {
    expect(formatDate('invalid')).toBe('')
    expect(formatDate(null)).toBe('')
  })
})
```

**API Route Test Example:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from '@/app/api/rooms/route'
import { createServer } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server')

describe('POST /api/rooms', () => {
  it('should create a room with valid data', async () => {
    // Mock Supabase
    const mockInsert = vi.fn().mockResolvedValue({
      data: { id: '123', name: 'Room 101', floor: 1, base_rent: 3000000, status: 'vacant' },
      error: null,
    })

    // Test request
    const request = new Request('http://localhost:3000/api/rooms', {
      method: 'POST',
      body: JSON.stringify({
        property_id: 'prop-123',
        name: 'Room 101',
        floor: 1,
        base_rent: 3000000,
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
  })

  it('should return 400 for invalid data', async () => {
    const request = new Request('http://localhost:3000/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ name: '' }), // Missing required fields
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('should require authentication', async () => {
    // Without auth header, should return 401
    const request = new Request('http://localhost:3000/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ property_id: 'prop-123', name: 'Room 101', base_rent: 3000000 }),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })
})
```

**Component Test Example:**
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RoomForm } from '@/components/rooms/RoomForm'

describe('RoomForm', () => {
  it('should render form fields', () => {
    const mockSubmit = vi.fn()
    render(
      <RoomForm
        propertyId="prop-123"
        onSubmit={mockSubmit}
      />
    )

    expect(screen.getByLabelText('Tên phòng *')).toBeInTheDocument()
    expect(screen.getByLabelText('Tầng')).toBeInTheDocument()
    expect(screen.getByLabelText('Giá thuê (đ/tháng) *')).toBeInTheDocument()
  })

  it('should submit form with valid data', async () => {
    const mockSubmit = vi.fn()
    render(
      <RoomForm
        propertyId="prop-123"
        onSubmit={mockSubmit}
      />
    )

    fireEvent.change(screen.getByLabelText('Tên phòng *'), { target: { value: 'Room 101' } })
    fireEvent.change(screen.getByLabelText('Giá thuê (đ/tháng) *'), { target: { value: '3000000' } })
    fireEvent.click(screen.getByText('Thêm phòng'))

    // Would need proper async handling with waitFor
    // expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Room 101' }))
  })

  it('should show validation errors', async () => {
    const mockSubmit = vi.fn()
    render(
      <RoomForm
        propertyId="prop-123"
        onSubmit={mockSubmit}
      />
    )

    // Try to submit empty form
    fireEvent.click(screen.getByText('Thêm phòng'))

    // Zod validation would prevent submission, form shows errors
    // expect(screen.getByText('Tên phòng không được trống')).toBeInTheDocument()
  })
})
```

**Hook Test Example:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useRooms } from '@/hooks/useRooms'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useRooms', () => {
  it('should fetch rooms list', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          rooms: [{ id: '1', name: 'Room 101', status: 'vacant' }],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        },
      }),
    })

    const { result } = renderHook(() => useRooms(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data.rooms).toHaveLength(1)
  })

  it('should handle errors', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: 'Không thể tải danh sách phòng' } }),
    })

    const { result } = renderHook(() => useRooms(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toContain('Không thể tải')
  })
})
```

## Mocking Strategy

**What to Mock:**
- External API calls (Supabase queries)
- `fetch()` calls
- Timer functions (`setTimeout`, `setInterval`)
- Browser APIs (`localStorage`, `window.location`)

**What NOT to Mock:**
- Validation logic (Zod schemas)
- Formatting utilities (test real behavior)
- React components internal state (test via user interactions)
- UI component libraries (trust shadcn/ui)

**Mocking Patterns:**

1. **Supabase queries:**
   ```typescript
   vi.mock('@/lib/supabase/server')
   const mockSelect = vi.fn().mockResolvedValue({ data: [...], error: null })
   ```

2. **Fetch calls:**
   ```typescript
   global.fetch = vi.fn().mockResolvedValue({
       ok: true,
       json: async () => ({ data: [...] }),
   })
   ```

3. **Toast notifications:**
   ```typescript
   vi.mock('sonner', () => ({
       toast: {
           success: vi.fn(),
           error: vi.fn(),
       },
   }))
   ```

## Coverage Goals (When Implemented)

**Targets (Recommended):**
- Unit tests: 80%+ coverage for utilities
- Integration tests: All API routes
- Critical paths: Login, CRUD operations for rooms/tenants
- Not required: UI component internals (rely on visual testing)

**Command (Once set up):**
```bash
vitest --coverage
```

## Current Testing Gaps

**What's Not Tested:**
- All API routes (`/app/api/*`)
- All utility functions (`/lib/utils/*`)
- All validation schemas (`/lib/validations/*`)
- All custom hooks (`/hooks/*`)
- All React components (`/components/*`)

**Known Issues Mentioned:**
- Dashboard stats not fetching from real API (TODO in `/c/Users/LocTran/Project-2026/rent-management/app/(dashboard)/dashboard/page.tsx`)
- No automated test coverage for user workflows
- No E2E tests for complete rental property management flows

## Setup Instructions (For Future Implementation)

**1. Install testing dependencies:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @vitest/ui
npm install -D playwright @playwright/test
npm install -D @axe-core/playwright
```

**2. Create `vitest.config.ts`:**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

**3. Add test scripts to `package.json`:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test"
  }
}
```

**4. Create `playwright.config.ts`:**
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:3000',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
})
```

---

*Testing analysis: 2026-02-15*
