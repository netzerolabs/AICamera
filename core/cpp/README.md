# C++17 edge adapter · Adapter edge C++17

**VI:** Header/implementation tối giản cho firmware hoặc camera edge. Nó nhận đúng 33 landmark chuẩn hoá, không phụ thuộc OpenCV; dùng OpenCV/GStreamer chỉ ở lớp thu hình.  
**EN:** A tiny firmware/edge adapter. It consumes 33 normalized landmarks and has no OpenCV dependency; use OpenCV/GStreamer only in the capture layer.

```bash
g++ -std=c++17 -Icore/cpp -c core/cpp/fall_detector.cpp
```
