import { useMemo, useCallback, useState, useEffect } from 'react';

import { useWebcam } from '../../context/webcam';
import { useSimpleGame } from '../loopHandlers/simpleGame';
import { useCaptureMasks } from '../loopHandlers/captureMasks';
import { initialLapInfo } from '../lapTimer';

export const usePractice = (loop) => {
  const webcam = useWebcam();
  const [lapTimeInfo, setLapTimeInfo] = useState(initialLapInfo);
  const simpleGame = useSimpleGame({ setLapTimeInfo });
  const captureMasks = useCaptureMasks({ setLapTimeInfo });
  const [loopType, setLoopType] = useState(null);

  useEffect(() => {
    if (!loop.looping && loopType) {
      setLoopType(null);
    }
  }, [loop.looping, loopType]);

  const handleClickGame = useCallback(async () => {
    if (loop.looping) {
      loop.stop();
      simpleGame.reset();
    } else {
      loop.start(simpleGame.handleLoop);
      setLoopType('play');
    }
  }, [loop, simpleGame]);

  const handleStartRandomGame = useCallback(async () => {
    if (loop.looping) return;

    await simpleGame.zip.handleLoadRandomMaskSet();
    handleClickGame();
  }, [handleClickGame, loop.looping, simpleGame.zip]);

  const handleClickCaptureMasks = useCallback(() => {
    if (loop.looping) {
      loop.stop();
      simpleGame.reset();
    } else {
      loop.start(captureMasks.handleLoop());
      setLoopType('capture');
    }
  }, [loop, captureMasks, simpleGame]);

  const handlePlayCapturedMasks = useCallback(async () => {
    if (loop.looping) return;

    const masks = await Promise.all(
      captureMasks.masks.map(({ overlay }) => webcam.dataUriToImageData(overlay)),
    );
    simpleGame.setMasks(masks);
    handleClickGame();
  }, [captureMasks.masks, simpleGame, webcam, handleClickGame, loop.looping]);

  const practice = useMemo(
    () => ({
      name: 'practice',
      loopType,
      simpleGame,
      lapTimeInfo,
      captureMasks,
      handleClickGame,
      handleStartRandomGame,
      handlePlayCapturedMasks,
      handleClickCaptureMasks,
    }),
    [
      loopType,
      simpleGame,
      lapTimeInfo,
      captureMasks,
      handleClickGame,
      handleStartRandomGame,
      handlePlayCapturedMasks,
      handleClickCaptureMasks,
    ],
  );

  return practice;
};
