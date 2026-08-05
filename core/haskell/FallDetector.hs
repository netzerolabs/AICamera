{-# LANGUAGE RecordWildCards #-}
-- | Pure functional reference for the temporal state machine.
-- | Tham chiếu thuần hàm cho máy trạng thái theo thời gian.
module FallDetector (Landmark(..), Config(..), Model, Result(..), initialModel, update) where

data Landmark = Landmark { x :: Double, y :: Double, visibility :: Double } deriving (Show, Eq)
data Config = Config
  { minVisibility :: Double, heightDropRatio :: Double
  , descentThreshold :: Double, lowHipY :: Double, confirmSeconds :: Double
  } deriving (Show, Eq)
data Model = Model
  { cfg :: Config, calibratedHeight :: Maybe Double, previousHeight :: Maybe Double
  , previousTime :: Maybe Double, lowSince :: Maybe Double, fallCandidate :: Bool, hasAlerted :: Bool
  } deriving (Show, Eq)
data Result = Result { onGround :: Bool, confidence :: Double, alert :: Bool } deriving (Show, Eq)

initialModel :: Config -> Model
initialModel c = Model c Nothing Nothing Nothing Nothing False False

-- MediaPipe order: nose=0, hips=23/24, ankles=27/28.
-- Thứ tự MediaPipe: mũi=0, hông=23/24, mắt cá=27/28.
update :: Double -> [Landmark] -> Model -> (Model, Result)
update now pose model@Model{..}
  | length pose < 29 = (model, Result False 0 False)
  | calibratedHeight == Nothing =
      (model { calibratedHeight = Just h, previousHeight = Just h, previousTime = Just now }, Result False 0 False)
  | otherwise = (next, Result grounded score fire)
  where
    at i = pose !! i
    h = abs (((y (at 27) + y (at 28)) / 2) - y (at 0))
    hip = (y (at 23) + y (at 24)) / 2
    base = maybe h id calibratedHeight
    dt = max 0.001 (now - maybe now id previousTime)
    velocity = max 0 ((maybe h id previousHeight - h) / dt)
    rapid = velocity >= descentThreshold cfg
    candidate = fallCandidate || rapid
    ratio = h / max 0.000001 base
    grounded = ratio <= heightDropRatio cfg && hip >= lowHipY cfg
    lowStart = if grounded then Just (maybe now id lowSince) else Nothing
    duration = maybe 0 (now -) lowStart
    descentScore = min 1 (velocity / descentThreshold cfg)
    dropScore = min 1 (max 0 (1 - ratio) / (1 - heightDropRatio cfg))
    score = 100 * (0.45 * descentScore + 0.35 * dropScore + if grounded then 0.20 else 0)
    fire = candidate && grounded && duration >= confirmSeconds cfg && not hasAlerted
    next = model { previousHeight = Just h, previousTime = Just now, lowSince = lowStart, fallCandidate = candidate, hasAlerted = hasAlerted || fire }
