# Deploy lên Vercel

Dự án **rent-management** là Next.js 16, tương thích trực tiếp với Vercel.

## Bước 1: Đẩy code lên Git

Đảm bảo code đã được push lên GitHub / GitLab / Bitbucket:

```bash
git add .
git commit -m "Prepare for Vercel deploy"
git push origin main
```

## Bước 2: Kết nối với Vercel

1. Vào [vercel.com](https://vercel.com) và đăng nhập (có thể dùng GitHub).
2. Chọn **Add New** → **Project**.
3. Import repo **rent-management** từ Git (chọn đúng org/user và repo).
4. Vercel sẽ tự nhận **Framework Preset: Next.js** (không cần đổi).

## Bước 3: Cấu hình Environment Variables

Trong bước import project, mở **Environment Variables** và thêm:

| Name | Value | Ghi chú |
|------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Anon/Public key từ Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Service Role key từ Supabase (giữ bí mật) |

Lấy các giá trị từ: [Supabase Dashboard](https://supabase.com/dashboard) → Project → **Settings** → **API**.

**Hoặc dùng CLI** (xem mục [Lấy env bằng CLI](#lấy-env-bằng-cli) bên dưới).

Sau khi thêm xong, chọn **Deploy**.

## Bước 4: Deploy

- Lần đầu: Vercel sẽ chạy `npm install` và `npm run build` rồi deploy.
- Mỗi lần push lên branch đã kết nối (thường là `main`), Vercel sẽ tự deploy lại.

## Lưu ý

- **Production URL**: Sau khi deploy xong, Vercel cung cấp URL dạng `https://rent-management-xxx.vercel.app`.
- **Custom domain**: Vào Project → **Settings** → **Domains** để thêm tên miền riêng.
- **Env chỉnh sửa sau**: **Project** → **Settings** → **Environment Variables**; chỉnh xong cần **Redeploy** (Deployments → ... → Redeploy) để áp dụng.

## Deploy bằng Vercel CLI (tùy chọn)

```bash
npm i -g vercel
vercel login
vercel
```

Lần đầu sẽ hỏi link project; sau đó có thể dùng `vercel --prod` để deploy production.

---

## Lấy env bằng CLI

Trong workspace **không có MCP** nào của Supabase hay Vercel. Bạn dùng **CLI** để lấy URL/keys và đồng bộ env.

### 1. Supabase CLI – lấy URL và API keys

**Cài đặt:**

```bash
npm i -g supabase
```

**Project Supabase trên cloud (hosted):**

**Cách 1 – Script trong repo (chỉ cần Access Token + Project Ref):**

1. Tạo **Personal Access Token**: [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) → Generate new token.
2. Lấy **Project Ref**: vào [Dashboard](https://supabase.com/dashboard) → chọn project → URL dạng `.../project/<ref>`.
3. Chạy (thay `sbp_xxx` và `your-ref`):

```bash
# Liệt kê project để lấy ref
SUPABASE_ACCESS_TOKEN=sbp_xxx npm run supabase:keys -- --list

# Lấy keys và in ra .env
SUPABASE_ACCESS_TOKEN=sbp_xxx PROJECT_REF=your-ref npm run supabase:keys
```

Copy output vào `.env` / `.env.local` hoặc vào Vercel → Project → Settings → Environment Variables.

**Cách 2 – Supabase CLI:**

```bash
npx supabase login
npx supabase projects api-keys --project-ref <PROJECT_REF>
```

Lệnh in ra **anon key** và **service_role key**. URL: `https://<PROJECT_REF>.supabase.co` → `NEXT_PUBLIC_SUPABASE_URL`.

**Supabase chạy local (Docker):**

Sau khi chạy `supabase start`:

```bash
supabase status -o env
```

Copy output vào `.env` và đổi tên biến cho khớp: `API URL` → `NEXT_PUBLIC_SUPABASE_URL`, `anon key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`.

### 2. Vercel CLI – kéo env từ Vercel về máy

Sau khi đã cấu hình Environment Variables trên Vercel:

```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
```

File `.env.local` sẽ chứa các biến đã set trên Vercel (dùng cho chạy local giống production).

