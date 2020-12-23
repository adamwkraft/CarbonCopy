import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import React, { useRef, useEffect, memo } from 'react';

import { useWebcam } from '../../context/webcam';

import Game from '../Game';
import NoWebcam from './NoWebcam';
import { maxWidth } from '../../lib/constants';

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth,
    margin: `0 auto ${theme.spacing(2)}px`,
  },
}));

const Main = (props) => {
  const webcam = useWebcam();
  const { currentDeviceId, hasVideo, cameras, autoStartDeviceId } = webcam;

  const startedRef = useRef();

  useEffect(() => {
    if (
      hasVideo &&
      cameras.length &&
      (currentDeviceId || autoStartDeviceId) &&
      !startedRef.current
    ) {
      startedRef.current = true;

      webcam.start().catch(console.error);
    }
  }, [hasVideo, cameras, currentDeviceId, autoStartDeviceId, webcam]);

  const classes = useStyles();

  return (
    <main className={classes.root}>{!hasVideo ? <NoWebcam /> : <Game webcam={webcam} />}</main>
  );
};

Main.propTypes = {
  cvReady: PropTypes.bool.isRequired,
};

export default memo(Main);
