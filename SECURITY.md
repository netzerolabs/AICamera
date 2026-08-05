# Bảo mật và quyền riêng tư · Security and privacy

**VI:** Báo cáo lỗ hổng bằng kênh riêng của GitHub Security Advisories. Không mở issue công khai kèm video, số điện thoại, token hay endpoint webhook. Khi triển khai, hãy bật TLS, xác thực request, rate limit, xoay vòng secret và giới hạn thời gian lưu metadata.  
**EN:** Report vulnerabilities through private GitHub Security Advisories. Do not open public issues containing video, phone numbers, tokens or webhook endpoints. Deploy with TLS, request authentication, rate limiting, secret rotation and metadata retention limits.

Video/frames are not required by the core detector and should remain in volatile memory. / Lõi không cần video/frame và dữ liệu này nên chỉ tồn tại trong bộ nhớ tạm.
