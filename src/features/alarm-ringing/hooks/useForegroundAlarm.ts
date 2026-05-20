import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Vibration } from "react-native";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

const ALARM_SOUND = require("../../../../assets/audio/alarm-placeholder.wav");
const VIBRATION_PATTERN_MS = [0, 700, 500];

type AudioStatusText = "idle" | "loading" | "starting" | "playing" | "stopped" | `error: ${string}`;

export function useForegroundAlarm() {
  const [audioStatusText, setAudioStatusText] = useState<AudioStatusText>("idle");
  const shouldRingRef = useRef(false);
  const isPlayingRef = useRef(false);
  const player = useAudioPlayer(ALARM_SOUND, {
    keepAudioSessionActive: true
  });
  const playerStatus = useAudioPlayerStatus(player);
  const isLoaded = playerStatus.isLoaded || player.isLoaded;

  const logAudioError = useCallback((message: string, error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : String(error);

    setAudioStatusText(`error: ${errorMessage}`);
    console.warn(`[StableWake alarm audio] ${message}`, error);
  }, []);

  const stopAlarm = useCallback(() => {
    shouldRingRef.current = false;

    try {
      player.pause();
    } catch (error) {
      logAudioError("Unable to pause alarm sound.", error);
    }

    player.seekTo(0).catch((error) => {
      logAudioError("Unable to reset alarm sound.", error);
    });
    isPlayingRef.current = false;
    setAudioStatusText("stopped");
    Vibration.cancel();
  }, [logAudioError, player]);

  const playLoadedAlarm = useCallback(async () => {
    if (isPlayingRef.current) {
      return;
    }

    if (!isLoaded) {
      setAudioStatusText("loading");

      return;
    }

    setAudioStatusText("starting");

    try {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: "doNotMix"
      });

      if (!shouldRingRef.current || isPlayingRef.current) {
        return;
      }

      player.loop = true;
      player.volume = 1;
      player.play();
      isPlayingRef.current = true;
      setAudioStatusText("playing");
      Vibration.vibrate(VIBRATION_PATTERN_MS, true);
    } catch (error) {
      isPlayingRef.current = false;
      logAudioError("Unable to start alarm sound.", error);
      Vibration.cancel();
    }
  }, [isLoaded, logAudioError, player]);

  const startAlarm = useCallback(() => {
    shouldRingRef.current = true;
    void playLoadedAlarm();
  }, [playLoadedAlarm]);

  useEffect(() => {
    if (shouldRingRef.current && !isPlayingRef.current && isLoaded) {
      void playLoadedAlarm();
    }
  }, [isLoaded, playLoadedAlarm]);

  useEffect(() => stopAlarm, [stopAlarm]);

  const audioStatus = useMemo(() => {
    if (audioStatusText.startsWith("error:")) {
      return `Audio ${audioStatusText}`;
    }

    return `Audio: ${audioStatusText}`;
  }, [audioStatusText]);

  return {
    audioStatus,
    startAlarm,
    stopAlarm
  };
}
