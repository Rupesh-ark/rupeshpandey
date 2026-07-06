import { useCallback, useEffect, useRef, useState } from 'react';

const MUSIC_SRC = '/music/route101.mp3';
const MUSIC_VOLUME = 0.42;

export function useArchiveAudio(opened: boolean) {
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [audioEnergy, setAudioEnergy] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const audioEnergyRef = useRef(0);

  const getAudioElement = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio(MUSIC_SRC);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = MUSIC_VOLUME;
      audioRef.current = audio;
    }

    return audioRef.current;
  }, []);

  const ensureAudioGraph = useCallback((audio: HTMLAudioElement) => {
    if (analyserRef.current) return audioContextRef.current;

    const AudioContextConstructor = window.AudioContext
      ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return null;

    const context = audioContextRef.current ?? new AudioContextConstructor();
    const analyser = context.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.76;

    const source = audioSourceRef.current ?? context.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(context.destination);

    audioContextRef.current = context;
    audioSourceRef.current = source;
    analyserRef.current = analyser;
    audioDataRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));

    return context;
  }, []);

  const handleToggleMusic = useCallback(() => {
    if (musicEnabled) {
      audioRef.current?.pause();
      audioEnergyRef.current = 0;
      setAudioEnergy(0);
      setMusicEnabled(false);
      return;
    }

    const audio = getAudioElement();
    const context = ensureAudioGraph(audio);
    void context?.resume();

    audio.play()
      .then(() => setMusicEnabled(true))
      .catch(() => {
        audio.pause();
        audioEnergyRef.current = 0;
        setAudioEnergy(0);
        setMusicEnabled(false);
      });
  }, [ensureAudioGraph, getAudioElement, musicEnabled]);

  useEffect(() => {
    if (opened || !musicEnabled) return;

    audioRef.current?.pause();
    audioEnergyRef.current = 0;
    setAudioEnergy(0);
    setMusicEnabled(false);
  }, [musicEnabled, opened]);

  useEffect(() => {
    if (!musicEnabled) {
      audioEnergyRef.current = 0;
      setAudioEnergy(0);
      return;
    }

    let animationFrame = 0;
    let lastCommit = 0;

    function updateEnergy(now: number) {
      const analyser = analyserRef.current;
      const data = audioDataRef.current;

      if (analyser && data) {
        analyser.getByteFrequencyData(data);
        const bins = Math.min(36, data.length);
        let sum = 0;

        for (let index = 0; index < bins; index += 1) {
          const lowFrequencyWeight = 1 - index / bins * 0.45;
          sum += data[index] * lowFrequencyWeight;
        }

        const normalized = sum / (bins * 255);
        const targetEnergy = Math.min(1, Math.pow(normalized * 2.05, 0.82));
        audioEnergyRef.current += (targetEnergy - audioEnergyRef.current) * 0.34;

        if (now - lastCommit > 66) {
          setAudioEnergy(audioEnergyRef.current);
          lastCommit = now;
        }
      }

      animationFrame = window.requestAnimationFrame(updateEnergy);
    }

    animationFrame = window.requestAnimationFrame(updateEnergy);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [musicEnabled]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      void audioContextRef.current?.close();
    };
  }, []);

  return { musicEnabled, audioEnergy, toggleMusic: handleToggleMusic };
}
