# Lấy Supabase keys (cho rent-management + Vercel)

Bạn đã có project **vm-pharmacy** trên Supabase. Làm 2 bước sau:

## Trên Supabase (trong trình duyệt)

### Bước 1: Tạo Personal Access Token
1. Vào: **https://supabase.com/dashboard/account/tokens**
2. Bấm **Generate new token**, đặt tên (vd: `rent-management`), copy token (dạng `sbp_...`).

### Bước 2: Lấy Project Ref
1. Vào **Dashboard** → click vào project **vm-pharmacy**.
2. Xem URL trên thanh địa chỉ: `https://supabase.com/dashboard/project/**XXXXXXXX**`  
   → chuỗi **XXXXXXXX** là **Project Ref** (copy lại).

## Trên máy (terminal trong thư mục repo)

### Cách A: Dùng file .env.supabase (tiện nhất)
1. Tạo file `.env.supabase` ở thư mục gốc repo (cùng cấp với `package.json`):

```
SUPABASE_ACCESS_TOKEN=sbp_xxx
PROJECT_REF=XXXXXXXX
```

(Thay `sbp_xxx` và `XXXXXXXX` bằng token và ref vừa lấy.)

2. Chạy:

```bash
npm run supabase:keys
```

Script in ra 3 dòng → copy vào `.env` / `.env.local` và vào **Vercel → Project → Settings → Environment Variables**.

### Cách B: Không tạo file, chạy trực tiếp
```bash
SUPABASE_ACCESS_TOKEN=sbp_xxx PROJECT_REF=XXXXXXXX npm run supabase:keys
```

### Nếu chưa biết Project Ref
1. Cho token vào `.env.supabase`: chỉ cần dòng `SUPABASE_ACCESS_TOKEN=sbp_xxx`.
2. Chạy: `npm run supabase:keys -- --list` → script in ra danh sách project và **ref** của từng project.
3. Copy ref của **vm-pharmacy** vào `.env.supabase` (dòng `PROJECT_REF=...`) rồi chạy lại `npm run supabase:keys`.
