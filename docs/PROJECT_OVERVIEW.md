# RentManager - Project Overview

**Version:** 1.0  
**Last Updated:** 2026-01-28  
**Status:** 🟡 In Development (Foundation Complete)

## Quick Links
- [Product Requirements (PRD)](../PRD.md)
- [Technical Requirements (TRD)](../TRD.md)
- [Implementation & Test Plan](../IMPLEMENTATION_TEST_PLAN.md)
- [Feature Tracking](./requirements/FEATURE_TRACKER.md)
- [Architecture Overview](./architecture/SYSTEM_ARCHITECTURE.md)
- [Development Roadmap](./requirements/ROADMAP.md)

---

## Project Summary

**RentManager** là hệ thống quản lý cho thuê phòng trọ được thiết kế đặc biệt cho thị trường Việt Nam, giúp chủ nhà tự động hóa việc tính toán và xuất hóa đơn hàng tháng.

### Core Value Proposition
- ⚡ Tạo hóa đơn cho 10 phòng trong < 5 phút
- 🎯 Tính toán tiền điện/nước tự động 100% chính xác
- 📱 Responsive & PWA - sử dụng mọi thiết bị
- 🇻🇳 Thiết kế cho người Việt - ngôn ngữ, đơn vị tiền tệ, format phù hợp

---

## Current Status (as of 2026-01-28)

### Overall Progress: 15%

| Area | Progress | Status |
|------|----------|--------|
| **Infrastructure** | 90% | ✅ Complete |
| **Core Features** | 0% | ⏳ Not Started |
| **Testing** | 0% | ⏳ Not Started |
| **Documentation** | 30% | ⚠️ In Progress |
| **Deployment** | 0% | ⏳ Not Started |

### What's Done ✅
1. **Project Foundation**
   - Next.js 14 App Router setup
   - TypeScript + Tailwind CSS configured
   - shadcn/ui design system (6 components)
   - Environment validation

2. **Database & Auth**
   - Complete PostgreSQL schema (7 tables)
   - Row Level Security (RLS) policies
   - Supabase Auth infrastructure
   - Type-safe database access

3. **Basic UI**
   - Landing page
   - Auth pages structure
   - Responsive layout foundation

### What's Next ⏳
1. **Phase 2** - Room & Tenant Management (Next)
2. **Phase 3** - Utility Readings
3. **Phase 4** - Bill Generation
4. **Phase 5** - Export Features

---

## Technology Stack

### Frontend
- **Framework:** Next.js 16.1.5 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod
- **State:** TanStack Query (React Query)
- **Theme:** next-themes (dark/light mode)

### Backend
- **API:** Next.js API Routes (serverless)
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (planned)

### Testing (Planned)
- **Unit:** Vitest
- **E2E:** Playwright
- **Accessibility:** Axe

### Deployment
- **Hosting:** Vercel (planned)
- **Database:** Supabase Cloud

---

## Project Structure

```
rent-management/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
│
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── providers.tsx     # Context providers
│
├── lib/                   # Core libraries
│   ├── supabase/         # Supabase clients & middleware
│   ├── types/            # TypeScript types
│   ├── env.ts            # Environment validation
│   └── utils.ts          # Utilities
│
├── supabase/             # Supabase config
│   └── migrations/       # Database migrations
│
├── docs/                 # 📚 Documentation (This folder)
│   ├── architecture/     # System architecture docs
│   ├── features/         # Feature specifications
│   └── requirements/     # Requirements tracking
│
├── PRD.md                # Product Requirements Document
├── TRD.md                # Technical Requirements Document
└── IMPLEMENTATION_TEST_PLAN.md  # Implementation guide
```

---

## Key Features (Planned)

### Phase 2-3: Core Management
1. **Room Management** - CRUD operations for rooms
2. **Tenant Management** - Manage tenants and assignments
3. **Property Settings** - Basic property configuration

### Phase 4-6: Billing System
4. **Utility Readings** - Monthly meter input
5. **Auto Calculation** - Electricity/water consumption
6. **Bill Generation** - Automatic bill creation
7. **Bill Preview** - Review before export

### Phase 7-8: Export & Distribution
8. **Single Export** - PNG/PDF per bill
9. **Bulk Export** - ZIP all bills at once
10. **File Naming** - Auto-naming convention

### Phase 9-10: Settings & Mobile
11. **Price Settings** - Configure rates
12. **Bill Templates** - Customize bill design
13. **Responsive UI** - Mobile-first design
14. **PWA** - Installable app experience

---

## Success Metrics (Target)

| Metric | Target | Current |
|--------|--------|---------|
| Bill generation (10 rooms) | < 5 min | N/A |
| Calculation accuracy | 100% | N/A |
| Export clicks | ≤ 3 clicks | N/A |
| First Contentful Paint | < 1.5s | ~0.8s ✅ |
| App load time | < 3s | N/A |

---

## Risk Assessment

### 🔴 High Risk
- **No testing** - Could cause production bugs
- **Bill export complexity** - Performance on mobile devices

### 🟡 Medium Risk
- **Mobile performance** - PWA needs real device testing
- **Data migration** - No rollback strategy yet

### 🟢 Low Risk
- **Tech stack** - Proven technologies
- **Documentation** - Comprehensive specs available

---

## Team & Contacts

**Developer:** LocTran  
**Project Start:** January 2026  
**Target Launch:** February 2026 (estimated)

---

## External Resources

- **Supabase Dashboard:** [Link to your Supabase project]
- **Vercel Dashboard:** [When deployed]
- **Figma Designs:** [If applicable]
- **GitHub Repository:** [If applicable]

---

## Documentation Map

### For Developers
1. Start with [TRD.md](../TRD.md) for technical architecture
2. Review [SYSTEM_ARCHITECTURE.md](./architecture/SYSTEM_ARCHITECTURE.md) for diagrams
3. Follow [IMPLEMENTATION_TEST_PLAN.md](../IMPLEMENTATION_TEST_PLAN.md) for development

### For Product/Planning
1. Start with [PRD.md](../PRD.md) for product requirements
2. Track progress in [FEATURE_TRACKER.md](./requirements/FEATURE_TRACKER.md)
3. View timeline in [ROADMAP.md](./requirements/ROADMAP.md)

### For Testing
1. Follow [IMPLEMENTATION_TEST_PLAN.md](../IMPLEMENTATION_TEST_PLAN.md)
2. Use test cases per feature phase
3. Check [FEATURE_TRACKER.md](./requirements/FEATURE_TRACKER.md) for coverage

---

**Last Updated:** 2026-01-28 by LocTran
