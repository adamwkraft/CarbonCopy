import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core';

import CapturedMasks from '../../CapturedMasks';
import ScoreResults from '../../ScoreResults';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > div': {
      marginTop: theme.spacing(2),
    },
  },
}));

const Practice = (props) => {
  const classes = useStyles();
  const { captureMasks, simpleGame } = props.game.mode.practice;

  return (
    <div className={classes.root}>
      <ScoreResults results={simpleGame.scores} handleClose={simpleGame.clearScores} />
      <CapturedMasks captureMasks={captureMasks} />
    </div>
  );
};

Practice.propTypes = {
  game: PropTypes.object.isRequired,
  webcam: PropTypes.object.isRequired,
};

export default Practice;