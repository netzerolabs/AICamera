# Đóng góp · Contributing

## Tiếng Việt

1. Mở issue với bối cảnh camera, FPS, góc đặt, ánh sáng và đối tượng cần bảo vệ.
2. Không tải video khuôn mặt hoặc dữ liệu y tế nhận dạng được; ưu tiên landmark đã ẩn danh/mô phỏng.
3. Thêm test tái tạo được cho mỗi thay đổi thuật toán. Ghi precision, recall, false alarms/giờ và latency nếu có dữ liệu thật.
4. Không đưa khoá Twilio/Firebase/webhook vào code. Dùng biến môi trường.
5. Mọi thay đổi ảnh hưởng cảnh báo phải giữ nút huỷ và đường gọi người thật.

## English

1. Open an issue with camera, FPS, viewpoint, lighting and protected-subject context.
2. Do not upload identifiable face video or medical data; prefer anonymized/synthetic landmarks.
3. Add a reproducible test for each algorithmic change. Report precision, recall, false alarms/hour and latency when real evaluation data exists.
4. Never commit Twilio/Firebase/webhook secrets. Use environment variables.
5. Alerting changes must preserve cancellation and human escalation paths.
