#include "fall_detector.hpp"
#include <algorithm>
#include <cmath>

namespace aicamera {
namespace { constexpr std::size_t kNose=0, kLeftHip=23, kRightHip=24, kLeftAnkle=27, kRightAnkle=28; }

void FallDetector::Reset() { initial_height_=previous_height_=0; previous_timestamp_=0; low_since_=-1; calibrated_=false; alerted_=false; fall_candidate_=false; }

Result FallDetector::Update(const std::array<Landmark, 33>& p, double timestamp) {
  Result out{};
  for (auto index : {kNose,kLeftHip,kRightHip,kLeftAnkle,kRightAnkle}) {
    if (p[index].visibility < config_.min_visibility) return out;
  }
  const float ankle_y=(p[kLeftAnkle].y+p[kRightAnkle].y)/2.0f;
  const float height=std::fabs(ankle_y-p[kNose].y);
  const float hip_y=(p[kLeftHip].y+p[kRightHip].y)/2.0f;
  if (!calibrated_) { initial_height_=previous_height_=std::max(height, 1e-6f); previous_timestamp_=timestamp; calibrated_=true; return out; }
  const double dt=std::max(timestamp-previous_timestamp_, 1e-3);
  const float velocity=std::max(0.0f, (previous_height_-height)/static_cast<float>(dt));
  const float ratio=height/initial_height_;
  out.on_ground = ratio <= config_.height_drop_ratio && hip_y >= config_.low_hip_y;
  const bool rapid=velocity >= config_.descent_velocity_threshold;
  if (rapid) fall_candidate_=true;
  if (out.on_ground) { if (low_since_ < 0) low_since_=timestamp; }
  else if (low_since_ >= 0 && timestamp-low_since_ < config_.confirmation_seconds) low_since_=-1;
  const double low_duration=low_since_ < 0 ? 0 : timestamp-low_since_;
  const float descent_score=std::min(1.0f, velocity/config_.descent_velocity_threshold);
  const float drop_score=std::min(1.0f, std::max(0.0f, 1-ratio)/(1-config_.height_drop_ratio));
  out.confidence=100*(0.45f*descent_score+0.35f*drop_score+0.20f*(out.on_ground?1:0));
  if (out.on_ground && fall_candidate_ && low_duration >= config_.confirmation_seconds && !alerted_) {
    alerted_=true; out.alerted=true; out.event=Event{timestamp, std::min(99.0f, out.confidence)};
  }
  previous_height_=height; previous_timestamp_=timestamp; return out;
}
} // namespace aicamera
