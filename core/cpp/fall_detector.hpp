#pragma once

// C++17 edge-friendly detector. / Bộ phát hiện C++17 cho thiết bị edge.
// The implementation mirrors core/python/smartguard_core.py and consumes
// normalized landmarks only; it deliberately does not depend on OpenCV.

#include <array>
#include <cstddef>
#include <optional>

namespace aicamera {

struct Landmark { float x{0}; float y{0}; float visibility{1}; };
struct Config {
  float min_visibility{0.55f};
  float height_drop_ratio{0.55f};
  float descent_velocity_threshold{0.28f};
  float low_hip_y{0.62f};
  float confirmation_seconds{1.2f};
};
struct Event { double timestamp; float confidence; };
struct Result { bool on_ground{false}; bool alerted{false}; float confidence{0}; std::optional<Event> event; };

class FallDetector {
 public:
  explicit FallDetector(Config config = {}) : config_(config) { Reset(); }
  void Reset();
  Result Update(const std::array<Landmark, 33>& pose, double timestamp);

 private:
  Config config_{};
  float initial_height_{0};
  float previous_height_{0};
  double previous_timestamp_{0};
  double low_since_{-1};
  bool calibrated_{false};
  bool alerted_{false};
  bool fall_candidate_{false};
};

}  // namespace aicamera
