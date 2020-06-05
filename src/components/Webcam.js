import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';

import { useWebcam } from '../context/webcam';

const useStyles = makeStyles((theme) => ({
  root: (props) => ({
    position: 'relative',
    display: props.videoStarted ? 'inherit' : 'none',
    ...(props.width ? {
      width: props.width,
      height: `calc(${props.width}${typeof props.width === 'number' ? 'px' : ''} * 0.5625)`, // 0.5625 = 720 / 1280 (aspect ratio)
    } : {
        width: 1280,
        height: 720,
      }),
    // fix height discrepancy
    width: '100%',
    maxWidth: 1280,
    maxHeight: 720,
  }),
  video: (props) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    ...(props.flipX ? {
      'p-webkit-transform': 'scaleX(- 1)',
      transform: 'scaleX(-1)',
    } : {}),
  }),
  canvas: (props) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
  }),
}));

const Webcam = (props) => {
  const webcam = useWebcam();
  const classes = useStyles({ ...props, ...webcam });

  const withCanvas = props.withCanvas !== false;

  return (
    <div className={classes.root}>
      <video
        autoPlay={true}
        ref={webcam.videoRef}
        className={classes.video}
        width={webcam.videoRef?.current?.videoWidth}
        height={webcam.videoRef?.current?.videoHeight}
      />
      {withCanvas && (
        <canvas
          ref={webcam.canvasRef}
          className={classes.canvas}
          width={webcam.videoRef?.current?.videoWidth}
          height={webcam.videoRef?.current?.videoHeight}
        />
      )}
    </div>
  )
}

Webcam.propTypes = {
  styles: PropTypes.object,
  withCanvas: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
}

export default Webcam;
