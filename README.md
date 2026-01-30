# 🏠 RentManager

**Hệ thống quản lý cho thuê phòng trọ thông minh, tự động hóa tính toán và xuất hóa đơn hàng tháng.**

---

## 🚀 Quick Start

RentManager là hệ thống quản lý cho thuê phòng trọ được thiết kế đặc biệt cho thị trường Việt Nam, giúp chủ nhà:
- ⚡ Tạo hóa đơn cho 10 phòng trong **< 5 phút**
- 🎯 Tính toán tiền điện/nước **100% chính xác**
- 📱 Sử dụng trên mọi thiết bị (Responsive & PWA)
- 🇻🇳 Thiết kế cho người Việt (ngôn ngữ, đơn vị tiền tệ phù hợp)

### 📋 Project Status

| Phase | Status | Progress |
|-------|--------|----------|
| **Phase 1** - Foundation | ✅ Complete | 100% |
| **Phase 2** - Room Management | ⏳ Next | 0% |
| **Phase 3** - Tenant Management | ⏳ Planned | 0% |
| **Phase 4** - Utility Readings | ⏳ Planned | 0% |
| **Phase 5** - Bill Generation | ⏳ Planned | 0% |

**Overall Progress: 15%**  
**Current Focus:** Phase 2 - Room Management

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **State Management:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod

### Backend
- **API:** Next.js API Routes (serverless)
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage

### Testing (Planned)
- **Unit:** Vitest
- **E2E:** Playwright
- **Accessibility:** Axe

---

## 📁 Project Structure

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
├── docs/                 # 📚 Documentation
│   ├── PRD.md            # Product Requirements
│   ├── TRD.md            # Technical Requirements
│   ├── plan.md           # Implementation Plan
│   ├── PROJECT_STATUS_LOG.md # Status Tracking
│   ├── IMPLEMENTATION_TEST_PLAN.md
│   ├── PROJECT_OVERVIEW.md
│   ├── architecture/     # System Architecture
│   └── requirements/     # Feature Tracker & Roadmap
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rent-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials in `.env.local`

4. **Database setup**
   - Create a new Supabase project
   - Run the migration in `supabase/migrations/20260128000001_init_schema.sql`
   - Update your environment variables

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📚 Documentation

### 🎯 For Developers
- **[Project Overview](docs/PROJECT_OVERVIEW.md)** - Project summary & current status
- **[System Architecture](docs/architecture/SYSTEM_ARCHITECTURE.md)** - Technical architecture & design
- **[Feature Tracker](docs/requirements/FEATURE_TRACKER.md)** - Implementation progress & test coverage

### 📋 For Product Management
- **[PRD.md](docs/PRD.md)** - Product Requirements Document (user stories, features)
- **[Status Log](docs/PROJECT_STATUS_LOG.md)** - PM/PO Project status tracking
- **[Roadmap](docs/requirements/ROADMAP.md)** - Development timeline & milestones

### 🧪 For Testing
- **[Implementation & Test Plan](docs/IMPLEMENTATION_TEST_PLAN.md)** - Complete testing strategy
- **[Feature Tracker](docs/requirements/FEATURE_TRACKER.md)** - Test status per feature

---

## 🎯 Key Features (Planned)

### Phase 2-3: Core Management
- [ ] **Room Management** - CRUD operations for rooms
- [ ] **Tenant Management** - Manage tenants and assignments

### Phase 4-6: Billing System
- [ ] **Utility Readings** - Monthly meter input
- [ ] **Auto Calculation** - Electricity/water consumption
- [ ] **Bill Generation** - Automatic bill creation
- [ ] **Export Features** - PNG/PDF export for bills

### Phase 7-8: Settings & Mobile
- [ ] **Price Settings** - Configure utility rates
- [ ] **Bill Templates** - Customize bill design
- [ ] **Responsive Design** - Mobile-first experience
- [ ] **PWA** - Installable app with offline support

---

## 🧪 Testing

### Running Tests
```bash
# Unit tests (when implemented)
npm run test

# E2E tests (when implemented)
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Test Strategy
- **Unit Tests:** Component logic, utility functions, API routes
- **Integration Tests:** Database operations, authentication flows
- **E2E Cases:** Complete user workflows
- **Accessibility Tests:** WCAG compliance

---

## 📊 Database Schema

The application uses 7 main tables:

1. **profiles** - User profile information
2. **properties** - Rental properties owned by users
3. **rooms** - Individual rental rooms
4. **tenants** - Tenant information and lease history
5. **price_settings** - Configurable electricity/water rates
6. **utility_readings** - Monthly meter readings (auto-calculates usage)
7. **bills** - Generated bills with payment status

All tables have Row Level Security (RLS) enabled to ensure users only access their own data.

---

## 🚀 Deployment

### Environment Variables
Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Production Deployment
1. **Vercel (Recommended)**
   ```bash
   npm run build
   vercel --prod
   ```

2. **Supabase**
   - Deploy database schema
   - Configure authentication
   - Set up storage buckets

---

## 🤝 Contributing

### Development Workflow
1. Create a feature branch from `main`
2. Implement your feature following the [Feature Tracker](docs/requirements/FEATURE_TRACKER.md)
3. Add tests for your implementation
4. Update documentation as needed
5. Submit a pull request

### Code Quality
- Follow TypeScript best practices
- Use ESLint and Prettier configurations
- Write meaningful tests
- Update feature status in documentation

---

## 📈 Project Metrics

### Success Targets
- **Bill generation speed:** < 5 minutes for 10 rooms
- **Calculation accuracy:** 100%
- **Load time:** < 3 seconds
- **First Contentful Paint:** < 1.5 seconds
- **Lighthouse score:** > 90

### Current Status
- **Code Coverage:** 0% (testing not yet implemented)
- **Performance:** ~0.8s FCP ✅
- **Documentation:** 80% complete ✅
- **Features:** 4/30 implemented (13%)

---

## 🆘 Getting Help

### Documentation
- **[Project Overview](docs/PROJECT_OVERVIEW.md)** - Start here for project understanding
- **[System Architecture](docs/architecture/SYSTEM_ARCHITECTURE.md)** - Technical questions
- **[Feature Tracker](docs/requirements/FEATURE_TRACKER.md)** - Implementation progress

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Project:** RentManager  
**Developer:** LocTran  
**Version:** 1.0  
**Last Updated:** 2026-01-28

---

*Made with ❤️ for Vietnamese landlords*