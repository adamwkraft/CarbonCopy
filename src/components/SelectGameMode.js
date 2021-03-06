import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import React, { useCallback, useMemo } from 'react';
import { useCarbon } from '../context/carbon';
import {
  MULTIPLAYER,
  SINGLE_PLAYER,
  screenStates,
  screenStatesArrays,
} from '../lib/screenConstants';
import TimerIcon from '@material-ui/icons/Timer';
import WeightIcon from '@material-ui/icons/FitnessCenter';
import BeachIcon from '@material-ui/icons/BeachAccess';
import HouseIcon from '@material-ui/icons/House';
import LanguageIcon from '@material-ui/icons/Language';
import Options from './Options';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    '& button': {
      marginTop: theme.spacing(2),
    },
  },
  gameMode: {
    textAlign: 'center',
  },
  header: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
  },
}));

const Icons = {
  [screenStates.mode[SINGLE_PLAYER].SURVIVAL]: WeightIcon,
  [screenStates.mode[SINGLE_PLAYER].PRACTICE]: BeachIcon,
  [screenStates.mode[SINGLE_PLAYER].TIME_ATTACK]: TimerIcon,
  [screenStates.mode[MULTIPLAYER].LOCAL]: HouseIcon,
  [screenStates.mode[MULTIPLAYER].REMOTE]: LanguageIcon,
};

const SelectGameMode = (props) => {
  const classes = useStyles();
  const { carbonState } = useCarbon();

  const handleSetGameMode = useCallback(
    ({ currentTarget: { name } }) => {
      props.screen.handlers.setGameMode(name);
    },
    [props.screen.handlers],
  );

  const buttons = useMemo(
    () =>
      screenStatesArrays.mode[props.screen.state.players]
        ?.map((gameMode) => ({
          props: {
            key: gameMode,
            name: gameMode,
            children: gameMode,
            onClick: handleSetGameMode,
            Icon: Icons[gameMode],
            hover: true,
          },
        }))
        .filter((obj) => (!carbonState ? obj.props.name !== 'Practice' : true)), // Only show Practice in Carbonate mode.
    [props.screen.state.players, handleSetGameMode, carbonState],
  );

  return (
    <div className={classes.root}>
      <div className={classes.gameMode}>
        <Options buttons={buttons} label="Choose Mode" layout="h" />
      </div>
    </div>
  );
};

SelectGameMode.propTypes = {
  screen: PropTypes.object.isRequired,
};

export default SelectGameMode;
