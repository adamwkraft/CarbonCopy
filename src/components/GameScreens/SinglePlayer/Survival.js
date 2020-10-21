import React from 'react';
import classnames from 'classnames';
import Button from '@material-ui/core/Button';
import { makeStyles, Typography } from '@material-ui/core';

import ProgressBar from '../../ProgressBar';
import SurvivalFooter from './SurvivalFooter';
import { useGameMode } from '../../Game';
import { useSurvival } from '../../../hooks/screenHooks/survival';
import { useWebcam } from '../../../context/webcam';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(1),
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  overlay: {
    background: 'rgba(255,255,255,0.5)',
  },
  rootTop: {
    justifyContent: 'flex-start',
  },
  rootApart: {
    justifyContent: 'space-between',
  },
  options: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
    '& > *': {
      marginTop: theme.spacing(2),
      minWidth: 150,
    },
  },
  optionsTop: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    paddingLeft: theme.spacing(10),
    paddingRight: theme.spacing(10),
  },
  captures: {
    width: '100%',
    '& > div': {
      marginTop: theme.spacing(1),
    },
  },
  progress: {
    position: 'absolute',
    top: theme.spacing(1),
    left: theme.spacing(8),
    right: theme.spacing(8),
  },
  slap: {
    background: 'rgba(255,255,255,0.95)',
    padding: theme.spacing(1),
    borderRadius: theme.spacing(0.5),
  },
}));

export const getSurvivalPaperProps = (_, ind, masks) =>
  ind === masks.length - 1
    ? {
        style: { background: 'rgba(255, 0, 0, 0.4)' },
      }
    : {};

const Survival = (props) => {
  const classes = useStyles();
  const survival = useGameMode(useSurvival);
  const webcam = useWebcam();
  const { loop, lapTimeInfo, simpleGame, captureMasks, handleClickGame } = survival;

  // TODO: add an animation for the screen content on page transition

  return (
    <div
      className={classnames(classes.root, {
        [classes.overlay]: !loop.looping,
        [classes.rootTop]: !!loop.looping,
        [classes.rootApart]:
          !!(simpleGame.scores?.length || captureMasks.masks?.length) && webcam.isFullScreen,
      })}
    >
      <div
        className={classnames(classes.options, {
          [classes.optionsTop]: !!loop.looping,
        })}
      >
        {loop.looping ? (
          <div className={classes.progress}>
            <ProgressBar color={lapTimeInfo.color} completed={lapTimeInfo.percentRemaining} />
          </div>
        ) : (
          <>
            <Typography component="h3" variant="h5" className={classes.slap}>
              Match the poses and survive as long as you can.
            </Typography>
            <Button
              color="primary"
              variant="contained"
              onClick={handleClickGame}
              disabled={!loop.ready}
            >
              Play
            </Button>
          </>
        )}
      </div>
      {webcam.isFullScreen && !loop.looping && (
        <div className={classes.captures}>
          <SurvivalFooter />
        </div>
      )}
    </div>
  );
};

export default Survival;
