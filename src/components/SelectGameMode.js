import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';

import { screenStatesArrays, wipScreens } from '../lib/screenConstants';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    '& button': {
      marginTop: theme.spacing(2),
      minWidth: 150,
    },
    '& ul': {
      textAlign: 'center',
    },
  },
  header: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
  },
}));

const SelectGameMode = (props) => {
  const classes = useStyles();

  const handleSetGameMode = useCallback(
    ({ currentTarget: { name } }) => {
      props.game.screen.handlers.setGameMode(name);
    },
    [props.game.screen.handlers],
  );

  return (
    <div className={classes.root}>
      <Typography component="h1" variant="h4" className={classes.header}>
        Select Game Mode
      </Typography>
      <ul className={classes.gameMode}>
        {screenStatesArrays.mode[props.game.screen.state.players]?.map((gameMode) => (
          <li className={classes.gameModeItem} key={gameMode}>
            <Button
              color="primary"
              disabled={!!wipScreens[gameMode]}
              variant="contained"
              onClick={handleSetGameMode}
              name={gameMode}
            >
              {gameMode}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

SelectGameMode.propTypes = {
  game: PropTypes.object.isRequired,
};

export default SelectGameMode;