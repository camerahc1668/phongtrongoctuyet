# Hướng dẫn triển khai Giai đoạn 4

Gồm 3 phần mới: **đồng bộ theo bản ghi**, **phân quyền thật** (do Firebase Rules thực thi) và **cổng khách thuê**.

## Bộ tệp (đặt chung một thư mục trên hosting https)

| Tệp | Công dụng |
|---|---|
| `index.html` | Ứng dụng chính |
| `portal.html` | Trang riêng cho khách thuê (không cần đăng nhập, truy cập bằng link riêng) |
| `sw.js`, `manifest.json`, `icon-*.png` | PWA, chạy offline |
| `database.rules.json` | Rules cho Realtime Database (dán vào Firebase Console) |

Hosting miễn phí: Firebase Hosting hoặc GitHub Pages. Mở file trực tiếp từ máy (`file://`) thì PWA và link cổng khách không dùng được.

## Thứ tự thực hiện (quan trọng)

1. **Sao lưu dữ liệu** (Cài đặt → Sao lưu).
2. **Bật đăng nhập:** Firebase Console → Authentication → Sign-in method → bật *Email/Password*.
3. **Trong app** (Cài đặt → Firebase Sync): Kết nối → nhập email, mật khẩu → *Tạo tài khoản* → bấm **Bật đồng bộ**.
   - Dự án chưa có chủ trọ nên app hỏi có đặt tài khoản này làm **Chủ trọ** không. Chọn OK. Đây là người duy nhất quản lý thành viên và cài đặt.
   - Dữ liệu trên máy được tải lên Firebase theo từng bản ghi (nhánh `phongtro_data_v2`).
4. **Dán Rules:** Realtime Database → Rules → dán toàn bộ nội dung `database.rules.json` → Publish.
   - Dán Rules xong, **chế độ đồng bộ cũ** (một khối dữ liệu `phongtro_data`) sẽ không còn truy cập được. Đây là chủ ý.
5. **Kiểm tra bằng Rules Playground** (ngay trong tab Rules): thử đọc `phongtro_data_v2/rooms` khi *chưa đăng nhập* phải bị từ chối; thử với tài khoản chủ trọ phải được phép.
6. **Thêm nhân viên:** Authentication → Add user (khuyến nghị) hoặc để họ tự *Tạo tài khoản* trong app. Họ xuất hiện ở **Cài đặt → Firebase → 👥 Thành viên** với trạng thái *Chờ duyệt*, bạn chọn vai trò.
7. Sau khi đủ người, nên **tắt tự đăng ký**: Authentication → Settings → User actions → bỏ chọn *Enable create (sign-up)*.

## Vai trò

| Vai trò | Quyền |
|---|---|
| Chủ trọ | Toàn quyền, quản lý thành viên, cài đặt, tài khoản ngân hàng |
| Quản lý | Phòng, khách, hợp đồng, hóa đơn, chi phí, sự cố, cổng khách (không sửa cài đặt, không quản lý thành viên) |
| Nhân viên thu tiền | Xem phòng/khách, tạo hóa đơn, thu tiền, ghi sự cố. Không thấy hợp đồng, chi phí, lịch sử khách |
| Chờ duyệt / Đã khóa | Không đọc được dữ liệu, màn hình khóa |

Giao diện chỉ ẩn/chặn cho tiện, **quyền thật do Rules quyết định** nên không vượt qua được bằng công cụ trình duyệt.

Hai điều cần biết:
- `ownerCccd` (số CCCD chủ trọ), giao diện (tối/sáng, phông chữ, biểu tượng) **không đồng bộ**, mỗi máy tự nhập.
- Ai tạo tài khoản đầu tiên **khi dự án chưa có chủ trọ** sẽ thành chủ trọ. Hãy làm bước 3 ngay, đừng để người khác tạo trước.

## Cổng khách thuê

1. Cài đặt → **Cổng khách thuê** → *+ Tạo link* cho từng khách → *Gửi khách* (Zalo/SMS) hoặc *QR*.
2. Khách mở link: xem hóa đơn, quét **VietQR** (cần cài tài khoản nhận tiền), **gửi chỉ số điện nước**, **báo sự cố**.
3. Chỉ số và sự cố của khách hiện trong app của bạn (mục Sự cố, và gợi ý "Dùng chỉ số khách gửi" khi lập hóa đơn).
4. *Đổi mã* hoặc *Thu hồi* làm link cũ mất hiệu lực ngay.

Cách hoạt động và giới hạn:
- Link chứa mã ngẫu nhiên 24 ký tự (~138 bit). Ai có link thì xem được hóa đơn của phòng đó, **hãy gửi đúng người**. Dữ liệu cổng không có CCCD, ảnh hay số điện thoại khách.
- Dữ liệu cổng được cập nhật **khi app của chủ trọ đang mở và có mạng** (chưa có máy chủ riêng). Hóa đơn mới sẽ hiện trên cổng sau vài giây khi bạn mở app.
- Hộp thư gửi từ khách ai biết mã cũng ghi được (đã giới hạn độ dài và loại dữ liệu). Nếu bị spam, hãy *Đổi mã* của phòng đó. Bật **Firebase App Check** để chống lạm dụng thêm.
- Mã QR tạo ngay trên máy bạn (thư viện `qrcodejs` tải từ cdnjs), link không được gửi cho dịch vụ bên thứ ba.

## Ảnh trên Firebase Storage (tùy chọn)

Storage → Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /phongtro/{file} {
      allow write: if request.auth != null && request.auth.uid == 'UID_CHỦ_TRỌ';
      allow read: if true;   // ảnh vẫn xem được bằng đường dẫn có token
    }
  }
}
```

Thay `UID_CHỦ_TRỌ` bằng UID hiện trong Cài đặt → Firebase → Tài khoản. Ảnh CCCD sau khi chuyển lên Storage có thể xem bằng đường dẫn, **không chia sẻ đường dẫn ảnh**.

## Đã kiểm thử gì, chưa kiểm thử gì

- Đã kiểm thử bằng Firebase giả lập trong bộ nhớ: đồng bộ 2 thiết bị, sửa đồng thời, xóa, mở lại sau khi đóng, xung đột, vai trò, cổng khách, hộp thư.
- **Chưa kiểm thử với Firebase thật và Rules thật** (không có emulator trong môi trường làm việc). Hãy làm bước 5 ở trên và thử bằng một tài khoản thứ hai trước khi giao cho nhân viên.
- Giới hạn còn lại: khi hai máy sửa **cùng một bản ghi** cùng lúc, bản ghi sau cùng thắng (theo từng bản ghi, không phải cả dữ liệu như trước).
