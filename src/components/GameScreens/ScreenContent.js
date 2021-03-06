import React from 'react';
import PropTypes from 'prop-types';

import { screenStates } from '../../lib/screenConstants';

import Null from '../Null';
import SelectGameMode from '../SelectGameMode';
import Practice from './SinglePlayer/Practice';
import Survival from './SinglePlayer/Survival';
import ChoosePlayers from '../ChoosePlayers';
import TimeAttack from './SinglePlayer/TimeAttack';
import Local from './MultiPlayer/Local';
import Remote from './MultiPlayer/Remote';

const Screens = {
  [screenStates.screen.PLAY]: {
    [screenStates.players.SINGLE_PLAYER]: {
      [screenStates.mode[screenStates.players.SINGLE_PLAYER].PRACTICE]: Practice,
      [screenStates.mode[screenStates.players.SINGLE_PLAYER].SURVIVAL]: Survival,
      [screenStates.mode[screenStates.players.SINGLE_PLAYER].TIME_ATTACK]: TimeAttack,
    },
    [screenStates.players.MULTIPLAYER]: {
      [screenStates.mode[screenStates.players.MULTIPLAYER].LOCAL]: Local,
      [screenStates.mode[screenStates.players.MULTIPLAYER].REMOTE]: Remote,
    },
  },
};

const ScreenContent = (props) => {
  const { screen, mode, players } = props.screen.state;

  if (screen === screenStates.screen.DEFAULT)
    return <ChoosePlayers setPlayerMode={props.screen.handlers.setPlayerMode} />;
  if (mode === screenStates.mode.DEFAULT) return <SelectGameMode screen={props.screen} />;

  const Content = Screens[screen]?.[players]?.[mode] || Null;

  return <Content />;
};

ScreenContent.propTypes = {
  screen: PropTypes.object.isRequired,
};

export default ScreenContent;
