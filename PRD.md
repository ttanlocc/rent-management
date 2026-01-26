# Product Requirements Document (PRD)
## Phần Mềm Quản Lý Nhà Trọ - RentManager

---

## 1. Tổng Quan Sản Phẩm

### 1.1 Mục Tiêu
Xây dựng phần mềm quản lý nhà trọ giúp chủ trọ dễ dàng theo dõi tiền điện nước, xuất hóa đơn tự động và lưu trữ bill một cách tiện lợi.

### 1.2 Đối Tượng Sử Dụng
- **Chủ trọ**: Quản lý nhiều phòng trọ, theo dõi số điện nước, xuất bill hàng tháng
- **Người quản lý**: Có thể được chủ trọ ủy quyền quản lý một số phòng

### 1.3 Vấn Đề Cần Giải Quyết
| Vấn đề | Giải pháp |
|--------|-----------|
| Ghi chép số điện nước thủ công, dễ sai sót | Nhập liệu số hóa, tự động tính toán |
| Tính tiền thủ công mất thời gian | Tự động tính tiền dựa trên đơn giá cấu hình |
| Khó lưu trữ và tìm kiếm hóa đơn cũ | Lưu trữ tập trung, xuất ảnh bill 1 click |
| Không có lịch sử theo dõi tiêu thụ | Báo cáo thống kê theo tháng/năm |

---

## 2. Tính Năng Chính

### 2.1 Quản Lý Phòng Trọ
- [ ] Thêm/Sửa/Xóa phòng trọ
- [ ] Cấu hình thông tin phòng (tên phòng, diện tích, giá thuê)
- [ ] Gán người thuê vào phòng
- [ ] Theo dõi trạng thái phòng (đang thuê / trống)

### 2.2 Quản Lý Người Thuê
- [ ] Thêm/Sửa/Xóa thông tin người thuê
- [ ] Lưu thông tin liên hệ (SĐT, email)
- [ ] Lưu ảnh CMND/CCCD (tùy chọn)
- [ ] Lịch sử thuê trọ

### 2.3 Quản Lý Số Điện Nước Hàng Tháng
- [ ] Nhập số điện đầu kỳ / cuối kỳ cho từng phòng
- [ ] Nhập số nước đầu kỳ / cuối kỳ cho từng phòng
- [ ] Tự động tính lượng tiêu thụ = cuối kỳ - đầu kỳ
- [ ] Hỗ trợ nhập nhanh cho nhiều phòng cùng lúc
- [ ] Cảnh báo khi số cuối kỳ < số đầu kỳ (nhập sai)

### 2.4 Xuất Bill Tự Động
- [ ] Tự động tính tiền điện = lượng tiêu thụ × đơn giá
- [ ] Tự động tính tiền nước = lượng tiêu thụ × đơn giá
- [ ] Tổng hợp: Tiền phòng + Tiền điện + Tiền nước + Phí khác
- [ ] Tạo bill dạng ảnh (PNG/JPG) hoặc PDF
- [ ] Mẫu bill đẹp, chuyên nghiệp, có logo (tùy chỉnh)

### 2.5 Lưu Ảnh Bill 1 Click
- [ ] Chọn tháng cần xuất bill
- [ ] Xuất tất cả bill của tháng đó về máy trong 1 thư mục
- [ ] Đặt tên file theo format: `[TênPhòng]_[Tháng-Năm].png`
- [ ] Hỗ trợ xuất ZIP nén tất cả bill

### 2.6 Cấu Hình Hệ Thống
- [ ] Cấu hình đơn giá điện (đ/kWh)
- [ ] Cấu hình đơn giá nước (đ/m³)
- [ ] Cấu hình phí dịch vụ mặc định (wifi, rác, bảo vệ...)
- [ ] Tùy chỉnh mẫu bill (logo, thông tin chủ trọ)

---

## 3. Tính Năng Phụ (Giai Đoạn 2)

- [ ] Thống kê doanh thu theo tháng/năm
- [ ] Biểu đồ tiêu thụ điện nước
- [ ] Nhắc nhở thu tiền qua thông báo
- [ ] Xuất báo cáo Excel
- [ ] Gửi bill qua Zalo/Email
- [ ] Backup dữ liệu lên cloud

---

## 4. User Stories

### US-001: Nhập số điện nước hàng tháng
> **Là** chủ trọ  
> **Tôi muốn** nhập nhanh số điện nước cho tất cả phòng  
> **Để** tiết kiệm thời gian ghi chép

**Acceptance Criteria:**
- Màn hình nhập liệu hiển thị danh sách tất cả phòng
- Có thể nhập số cuối kỳ, số đầu kỳ tự lấy từ cuối kỳ tháng trước
- Tự động tính lượng tiêu thụ ngay khi nhập
- Có nút "Lưu tất cả" để save 1 lần

### US-002: Xuất bill tự động
> **Là** chủ trọ  
> **Tôi muốn** hệ thống tự động tính tiền và tạo bill  
> **Để** không phải tính toán thủ công

**Acceptance Criteria:**
- Bill hiển thị đầy đủ: tên phòng, người thuê, chi tiết tiền
- Có thể xem preview trước khi xuất
- Hỗ trợ xuất ảnh PNG hoặc PDF

### US-003: Lưu tất cả bill 1 click
> **Là** chủ trọ  
> **Tôi muốn** tải về tất cả bill của tháng trong 1 click  
> **Để** lưu trữ và gửi cho người thuê

**Acceptance Criteria:**
- Chọn tháng cần xuất
- Click 1 nút để tải tất cả
- File được đặt tên rõ ràng theo phòng và tháng

---

## 5. Wireframe Cơ Bản

```
┌─────────────────────────────────────────────────────────┐
│  🏠 RentManager                    [Cấu hình] [Thoát]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [📋 Phòng Trọ] [👤 Người Thuê] [⚡ Điện Nước] [📄 Bill]│
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           NỘI DUNG CHÍNH                        │   │
│  │                                                  │   │
│  │  Danh sách phòng / Form nhập liệu / Preview...  │   │
│  │                                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [💾 Lưu] [📥 Xuất Bill] [📦 Tải Tất Cả Bill]          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Yêu Cầu Phi Chức Năng

| Yêu cầu | Mô tả |
|---------|-------|
| **Hiệu năng** | Ứng dụng mở trong < 3 giây |
| **Dữ liệu** | Lưu trữ local, không cần internet |
| **Bảo mật** | Có thể đặt mật khẩu mở ứng dụng |
| **Khả năng mở rộng** | Hỗ trợ quản lý nhiều nhà trọ |
| **Dễ sử dụng** | Giao diện đơn giản, trực quan |

---

## 7. Phạm Vi Giai Đoạn 1 (MVP)

> [!IMPORTANT]
> Các tính năng ưu tiên cho MVP:

1. ✅ Quản lý danh sách phòng (CRUD)
2. ✅ Nhập số điện nước hàng tháng
3. ✅ Tự động tính tiền và xuất bill
4. ✅ Lưu tất cả bill 1 click
5. ✅ Cấu hình đơn giá điện/nước

---

## 8. Metrics Thành Công

| Metric | Mục tiêu |
|--------|----------|
| Thời gian tạo bill cho 10 phòng | < 5 phút |
| Độ chính xác tính toán | 100% |
| Số bước để xuất tất cả bill | ≤ 3 clicks |
