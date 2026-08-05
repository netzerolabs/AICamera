# Go gateway · Gateway Go

**VI:** `alert_gateway.go` nhận JSON metadata từ điện thoại, kiểm tra payload nhỏ và tùy chọn chuyển tiếp tới `AICAMERA_WEBHOOK_URL`. Không có video, database hay dependency ngoài Go standard library.  
**EN:** `alert_gateway.go` accepts small JSON metadata from the phone, validates it and optionally forwards it to `AICAMERA_WEBHOOK_URL`. It handles no video, database or third-party dependency.

```bash
go run ./core/go
curl -X POST http://localhost:8080/v1/events/fall \
  -H 'content-type: application/json' \
  -d '{"timestamp":12.4,"confidence":94,"state":"alerted","evidence":{"low_duration_s":1.4}}'
```

Production deployments must add authentication, rate limiting, TLS and a provider-specific SMS/WhatsApp adapter.
