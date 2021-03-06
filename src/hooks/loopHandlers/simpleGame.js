import { useMemo, useRef, useCallback, useState } from 'react';

import { useZip } from '../zip';
import { useAudio } from '../../context/audio';
import { useIterateMask } from '../iterateMask';
import { useWebcam } from '../../context/webcam';
import { rawScoreToTenBinScore } from '../../lib/score';
import { getScoreAndOverlayForSegmentationAndImageData, getScore } from '../../lib/util';
import { useCarbon } from '../../context/carbon';
import { useMultiplayerScores } from '../../components/Main';

export const useSimpleGame = ({ setLapTimeInfo } = {}) => {
  const promRef = useRef();
  const webcam = useWebcam();
  const { carbonRef } = useCarbon();
  const roundTracker = useRef(0);
  const maskIterator = useIterateMask();
  const lastTimeAttackSuccess = useRef(0);
  const [scores, setScores] = useState([]);
  const zip = useZip(maskIterator.setMasks);
  const [multiplayerScores, setMultiplayerScores] = useMultiplayerScores();

  const {
    handlers: {
      sfx: { playSuccessSound, playFailureSound },
      speech: { say },
    },
  } = useAudio();

  const clearScores = useCallback(() => {
    setScores([]);
    setMultiplayerScores([[], []]);
  }, [setMultiplayerScores]);

  const handleBasicLoop = useCallback(
    (playerIndex, sendResults = () => {}) => async (controller) => {
      if (controller.time.first) {
        maskIterator.next(); // load the first mask
        if (!playerIndex) clearScores();
        controller.useTimer({
          maxLaps: maskIterator.getNumMasks(),
          setLapTimeInfo: setLapTimeInfo,
          announceSeconds: true,
          onLap: ({ predict, time, stop }) => {
            const target = maskIterator.maskRef.current;

            // we actually shouldn't reach this,
            // because the maxLaps should trigger a stop first
            if (!target) return stop();

            promRef.current = predict(webcam.videoRef.current).then(async (segmentation) => {
              const { score, targetOverlay } = getScoreAndOverlayForSegmentationAndImageData(
                target,
                segmentation,
                webcam.flipX,
              );

              const dataUri = webcam.imageDataToDataUri(targetOverlay);

              if (playerIndex !== undefined) {
                const scorePacket = { score: rawScoreToTenBinScore(score), dataUri };

                sendResults(scorePacket);
                setMultiplayerScores((state) => {
                  const newState = [...state];
                  newState[playerIndex] = [
                    ...newState[playerIndex],
                    scorePacket,
                  ];

                  return newState;
                });
              } else {
                setScores((state) => [...state, { score: rawScoreToTenBinScore(score), dataUri }]);
              }

              webcam.clearCanvas();
              maskIterator.next();
            });
          },
        });
      }

      if (maskIterator.maskRef.current) {
        webcam.ctx.putImageData(maskIterator.maskRef.current, 0, 0);
      }

      // return a cleanup function to clear the canvas
      // use a promise ref since we are capturing asynchronously
      // if first promise not initialized, clear canvas right away
      return () => {
        if (promRef.current) promRef.current.then(controller.webcam.clearCanvas);
        else controller.webcam.clearCanvas();
      };
    },
    [maskIterator, clearScores, setLapTimeInfo, webcam, setMultiplayerScores],
  );

  const handleLoop = useCallback(() => handleBasicLoop(), [handleBasicLoop]);

  const handleMultiplayerLoop = useCallback((playerIndex, sendResults) => handleBasicLoop(playerIndex, sendResults), [
    handleBasicLoop,
  ]);

  const handleSurvivalLoop = useCallback(
    async (controller) => {
      if (controller.time.first) {
        maskIterator.random();
        clearScores();
        controller.useTimer({
          maxLaps: 9999999, // Good luck surviving this long!
          lapDuration: 10.0 * 1000, // Initial time
          setLapTimeInfo: setLapTimeInfo,
          announceSeconds: true,
          onLap: ({ predict, time, stop }) => {
            const target = maskIterator.maskRef.current;

            // we actually shouldn't reach this,
            // because the maxLaps should trigger a stop first
            if (!target) return stop();

            promRef.current = predict(webcam.videoRef.current).then(async (segmentation) => {
              const { score, targetOverlay } = getScoreAndOverlayForSegmentationAndImageData(
                target,
                segmentation,
                webcam.flipX,
              );

              const scoreToProceed = 4;

              // Play Sound ASAP
              const tenBinScore = rawScoreToTenBinScore(score);
              if (tenBinScore < scoreToProceed) {
                if (carbonRef.current) {
                  say('Missed it!');
                } else {
                  playFailureSound();
                }
              } else {
                if (carbonRef.current) {
                  say('Got it!');
                } else {
                  playSuccessSound();
                }
              }

              const dataUri = webcam.imageDataToDataUri(targetOverlay);

              setScores((state) => [...state, { score: rawScoreToTenBinScore(score), dataUri }]);

              webcam.clearCanvas();
              if (tenBinScore < scoreToProceed) {
                // Game Over
                maskIterator.reset();
                return stop();
              } else {
                // Adjust time - multiply (decay) by 0.9.
                // controller.timerRef.current.lapDuration =
                //   Math.floor(Math.max(controller.timerRef.current.lapDuration * 0.9, 1) * 10) / 10;

                // Adjust time linear - subtract a fixed value.
                // controller.timerRef.current.lapDuration =
                //   Math.floor(Math.max(controller.timerRef.current.lapDuration - 500, 1000) * 10) /
                //   10;

                // Adjust time, t + 1 = t - log(t) - small_constant
                // Intervals are: [10, 9.3, 8.6, 7.9, 7.4, 6.7, 6.1, 5.6, 5.0, 4.5, 4.0, 3.6, 3.2, 2.7, 2.4, 2.0, 1.8, 1.5, 1.3, 1.1, 1.0 ...... 0.67]
                const t_sec = controller.timerRef.current.lapDuration / 1000;
                controller.timerRef.current.lapDuration =
                  (t_sec - Math.log(t_sec) / Math.log(50)) * 1000 - 100;

                maskIterator.random();
              }
            });
          },
        });
      }

      if (maskIterator.maskRef.current) {
        webcam.ctx.putImageData(maskIterator.maskRef.current, 0, 0);
      }

      // return a cleanup function to clear the canvas
      // use a promise ref since we are capturing asynchronously
      // if first promise not initialized, clear canvas right away
      return () => {
        if (promRef.current) promRef.current.then(controller.webcam.clearCanvas);
        else controller.webcam.clearCanvas();
      };
    },
    [
      webcam,
      maskIterator,
      setLapTimeInfo,
      clearScores,
      carbonRef,
      playFailureSound,
      playSuccessSound,
      say,
    ],
  );

  const handleTimeAttackLoop = useCallback(
    async (controller) => {
      if (controller.time.first) {
        const numMasksPerGame = 10; // Use only this many masks in a game.
        maskIterator.resetAndShuffle();
        maskIterator.next(true);
        clearScores();
        roundTracker.current = 0;
        lastTimeAttackSuccess.current = 0;
        controller.useTimer({
          setLapTimeInfo: setLapTimeInfo,
          announceSeconds: false,
          lapDuration: 250,
          postLapDelay: 0,
          onLap: ({ predict, time, stop }) => {
            const currentMaskIdx = maskIterator.maskIdxRef.current;
            const target = maskIterator.maskRef.current;

            // we will reach this
            if (!target || roundTracker.current >= numMasksPerGame) {
              return stop();
            }

            // if we hit this then we succeeded in the predict promise
            // but fired a new lap before it succeeded
            if (roundTracker.current >= currentMaskIdx || roundTracker.current >= numMasksPerGame)
              return;

            const maxTimeAllowed = 10.0;
            const segmentationMs = time.elapsed - lastTimeAttackSuccess.current;
            if (segmentationMs / 1000 >= maxTimeAllowed) {
              lastTimeAttackSuccess.current = time.elapsed;
              if (carbonRef.current) {
                say('Missed it!');
              } else {
                playFailureSound();
              }
              const dataUri = webcam.imageDataToDataUri(target);
              setScores((state) => [...state, { score: maxTimeAllowed, dataUri }]);
              webcam.clearCanvas();
              roundTracker.current++;
              if (roundTracker.current < numMasksPerGame) {
                maskIterator.next(true);
              }
            }

            promRef.current = predict(webcam.videoRef.current)
              .then(async (segmentation) => {
                const score = getScore(target, segmentation, webcam.flipX);

                const tenBinScore = rawScoreToTenBinScore(score);
                if (tenBinScore > 5) {
                  // if we hit this then we succeeded in the predict promise
                  // but fired a new lap before it succeeded
                  if (
                    roundTracker.current >= currentMaskIdx ||
                    roundTracker.current >= numMasksPerGame
                  ) {
                    return;
                  }

                  if (carbonRef.current) {
                    say('Got it!');
                  } else {
                    playSuccessSound();
                  }

                  const segmentationSec = segmentationMs / 1000;
                  lastTimeAttackSuccess.current = time.elapsed;
                  const numSecs = Number(segmentationSec.toFixed(1));

                  const { targetOverlay } = getScoreAndOverlayForSegmentationAndImageData(
                    target,
                    segmentation,
                    webcam.flipX,
                  );
                  const dataUri = webcam.imageDataToDataUri(targetOverlay);
                  setScores((state) => [...state, { score: numSecs, dataUri }]);
                  webcam.clearCanvas();
                  roundTracker.current++;
                  if (roundTracker.current < numMasksPerGame) {
                    maskIterator.next(true);
                  }
                }
              })
              .catch(console.error);
          },
        });
      }

      if (maskIterator.maskRef.current) {
        webcam.ctx.putImageData(maskIterator.maskRef.current, 0, 0);
      }

      // return a cleanup function to clear the canvas
      // use a promise ref since we are capturing asynchronously
      // if first promise not initialized, clear canvas right away
      return () => {
        if (promRef.current) promRef.current.then(controller.webcam.clearCanvas);
        else controller.webcam.clearCanvas();
      };
    },
    [
      webcam,
      maskIterator,
      clearScores,
      setLapTimeInfo,
      playFailureSound,
      playSuccessSound,
      carbonRef,
      say,
    ],
  );

  return useMemo(
    () => ({
      zip,
      scores,
      multiplayerScores,
      handleLoop,
      handleMultiplayerLoop,
      handleSurvivalLoop,
      handleTimeAttackLoop,
      clearScores,
      reset: maskIterator.reset,
      ready: maskIterator.hasMasks,
      setMasks: maskIterator.setMasks,
    }),
    [
      zip,
      scores,
      multiplayerScores,
      handleLoop,
      handleMultiplayerLoop,
      handleSurvivalLoop,
      handleTimeAttackLoop,
      clearScores,
      maskIterator.hasMasks,
      maskIterator.reset,
      maskIterator.setMasks,
    ],
  );
};
