// AICamera event gateway / Gateway sự kiện AICamera.
//
// VI: Nhận metadata FallEvent từ điện thoại và chuyển tiếp tới webhook nội bộ.
// EN: Receives a small FallEvent metadata payload and forwards it to an internal webhook.
// Chỉ dùng Go standard library; không nhận video và không lưu payload vào đĩa.
package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"
)

type FallEvent struct {
	Timestamp  float64            `json:"timestamp"`
	Confidence float64            `json:"confidence"`
	State      string             `json:"state"`
	Evidence   map[string]float64 `json:"evidence"`
}

func main() {
	webhook := os.Getenv("AICAMERA_WEBHOOK_URL")
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusNoContent) })
	mux.HandleFunc("/v1/events/fall", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "POST required", http.StatusMethodNotAllowed)
			return
		}
		defer r.Body.Close()
		var event FallEvent
		decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, 16<<10))
		if err := decoder.Decode(&event); err != nil || event.Confidence < 0 || event.Confidence > 100 {
			http.Error(w, "invalid FallEvent", http.StatusBadRequest)
			return
		}
		log.Printf("fall event confidence=%.1f state=%s", event.Confidence, event.State)
		if webhook != "" {
			body, _ := json.Marshal(event)
			request, _ := http.NewRequestWithContext(r.Context(), http.MethodPost, webhook, bytes.NewReader(body))
			request.Header.Set("Content-Type", "application/json")
			client := &http.Client{Timeout: 5 * time.Second}
			response, err := client.Do(request)
			if err != nil {
				http.Error(w, "webhook delivery failed", http.StatusBadGateway)
				return
			}
			response.Body.Close()
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"accepted": true, "webhook_configured": webhook != ""})
	})
	addr := os.Getenv("AICAMERA_ADDR")
	if addr == "" {
		addr = ":8080"
	}
	log.Printf("AICamera gateway listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}
