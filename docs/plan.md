# Project Implementation Plan: RentManager

## 1. Documentation & Validation Assessment
Based on the review of `PRD.md` (v1.1) and `TRD.md`:
*   **Sufficiency:** The documents are highly detailed and sufficient for implementation. They cover user stories, database schema, API structure, and UI/UX requirements.
*   **Test Cases:** 
    *   **Functional:** Acceptance Criteria in PRD (Section 4) serve as clear functional test cases.
    *   **Technical:** TRD (Section 10) outlines Unit, Integration, and E2E strategies.
    *   **Validation:** Zod schemas in TRD (Section 4.5) provide strict data validation rules.

## 2. Skill Inventory & Selection
The following skills have been selected from the repository to maximize efficiency and quality across each development phase.

### 2.1 Core Development Skills
*   **Architecture & Setup**: `nextjs-best-practices`, `supabase-postgres-best-practices`, `environment-setup-guide`
*   **Frontend**: `frontend-dev-guidelines`, `tailwind-patterns`, `react-ui-patterns`, `mobile-design` (Critical for PWA)
*   **Backend**: `backend-dev-guidelines`, `api-patterns`
*   **UI/UX**: `ui-ux-pro-max`, `web-design-guidelines`

### 2.2 Feature-Specific Skills
*   **Bill Generation**: `pdf` (or `browser-automation` for image capture) - *Note: TRD suggests html2canvas, but PDF skill is relevant for document handling.*
*   **Data Handling**: `file-uploads` (Supabase Storage), `xlsx` (for future reporting features)
*   **PWA/Mobile**: `mobile-design`

### 2.3 Quality Assurance & Deployment
*   **Testing**: `playwright-skill` (E2E), `testing-patterns` (Unit/Integration), `test-fixing`
*   **Deployment**: `vercel-deployment`
*   **Workflow**: `planning-with-files`, `lint-and-validate`, `git-pushing`

---

## 3. Implementation Roadmap

### Phase 1: Foundation & Setup
- [x] **Initialize Project**: Setup Next.js 14, Tailwind, Shadcn UI.
    - *Skills*: `nextjs-best-practices`, `environment-setup-guide`
- [x] **Environment Config**: Define `.env` schema (Supabase URLs, Keys) and validate on startup.
    - *Reference*: TRD Section 7.2
- [x] **Infrastructure Setup**:
    - **Database**: Apply Schema to Supabase, configure RLS policies (TRD 2.2).
    - **Auth**: Setup Supabase Auth & Middleware (TRD 6.1).
    - **State Management**: specific setup for **TanStack Query** (or SWR) for caching & realtime data (TRD 8.1).
    - *Skills*: `supabase-postgres-best-practices`, `nextjs-supabase-auth`, `react-ui-patterns`

### Phase 2: Core Data Management (MVP)
- [ ] **User Profile**: Profile Management Page (Avatar, Name, Phone).
- [ ] **Room Management**: CRUD for Properties and Rooms.
    - *Skills*: `frontend-dev-guidelines`, `backend-dev-guidelines`
- [ ] **Tenant Management**: CRUD for Tenants + ID Card upload.
    - *Skills*: `file-uploads`
- [ ] **Price Configuration**: Settings for electricity/water rates.
    - *Skills*: `react-patterns`

### Phase 3: Utilities & Billing Logic
- [ ] **Utility Input UI**: Bulk entry form for electricity/water readings.
    - *Skills*: `ui-ux-pro-max` (Focus on usability)
- [ ] **Calculation Engine**: Automatic calculation of usage and costs.
    - *Skills*: `typescript-expert` (Precise math logic)
- [ ] **Bill Generation**: Render Bill Component -> Export to Image/PDF.
    - *Skills*: `frontend-dev-guidelines`

### Phase 4: UX Polish & PWA
- [ ] **Responsive Design**: Ensure Mobile/Tablet/Desktop logic works as defined in TRD.
    - *Skills*: `mobile-design`, `tailwind-patterns`
- [ ] **PWA Config**: Manifest, Service Workers, Offline support.
    - *Skills*: `web-performance-optimization`
- [ ] **Visual Polish**: Micro-animations, dark mode consistency.
    - *Skills*: `ui-ux-pro-max`

### Phase 5: Testing & Deployment
- [ ] **Test Prep**: Create **Seed Data Script** for consistent E2E scenarios.
    - *Why*: Essential for testing "Bill Generation" with predictable usage data.
- [ ] **E2E Testing**: Verify critical flows (CRUD -> Bill Gen -> Export).
    - *Skills*: `playwright-skill`
- [ ] **Unit Testing**: Validate calculation logic edge cases (negative numbers, zero usage).
    - *Skills*: `testing-patterns`
- [ ] **Deployment**: Deploy to Vercel, verify Env vars & Build Logs.
    - *Skills*: `vercel-deployment`

## 4. Next Steps
1.  Initialize the repository (if not already done).
2.  Execute **Phase 1: Foundation & Setup**.
