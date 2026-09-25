import { SVG } from "components";
import React, { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "hooks/storeHooks";
import { useTimerControls } from "hooks/useTimerControls";
import { TimerStatus } from "store/timer/types";
import { setRound, setTimerType, toggleNotificationSound } from "store";
import {
  StyledControl,
  StyledControlMain,
  StyledStrictIndicator,
  StyledStrictSnackbar,
  StyledControlSpacer,
} from "styles";
import PlayButton from "./PlayButton";
import ResetButton from "./ResetButton";
import Sessions from "./Sessions";
import SkipButton from "./SkipButton";
import VolumeButton from "./VolumeButton";

type Props = {
  resetTimerAction: () => void;
};

const Control: React.FC<Props> = ({ resetTimerAction }) => {
  const { timer, config } = useAppSelector((state) => ({
    timer: state.timer,
    config: state.config,
  }));

  const settings = useAppSelector((state) => state.settings);

  const dispatch = useAppDispatch();

  const { warn, onPlay, onReset, onSkip } =
    useTimerControls(resetTimerAction);

  const onNotifacationSoundCallback = useCallback(() => {
    dispatch(toggleNotificationSound());
  }, [dispatch]);

  const onResetSessionCallback = useCallback(() => {
    dispatch(setTimerType(TimerStatus.STAY_FOCUS));
    dispatch(setRound(1));
  }, [dispatch]);

  return (
    <StyledControl type={timer.timerType}>
      <Sessions
        timerType={timer.timerType}
        round={timer.round}
        sessionRounds={config.sessionRounds}
        onClick={onResetSessionCallback}
      />

      <StyledControlSpacer />
      <StyledControlMain>
        <ResetButton onClick={onReset} />
        <PlayButton playing={timer.playing} onClick={onPlay} />
        <SkipButton onClick={onSkip} />
        <VolumeButton
          soundOn={settings.notificationSoundOn}
          onClick={onNotifacationSoundCallback}
        />
      </StyledControlMain>

      <StyledControlSpacer />
      {settings.enableStrictMode ? (
        <StyledStrictIndicator warn={warn}>
          <SVG name="alert" />

          <StyledStrictSnackbar warn={warn}>
            You are currently on <span>Strict Mode!</span>
          </StyledStrictSnackbar>
        </StyledStrictIndicator>
      ) : null}
    </StyledControl>
  );
};

export default React.memo(Control);
