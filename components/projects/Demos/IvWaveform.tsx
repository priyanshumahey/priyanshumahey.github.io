"use client"

import { useCallback, useEffect, useRef, useState } from 'react';

type IvWaveformProps = {
    barWidth?: number;
    barGap?: number;
    barRadius?: number;
    barHeight?: number;
    sensitivity?: number;
    fadeEdges?: boolean;
    fadeWidth?: number;
    recordingColor?: string;
    processingColor?: string;
    idleColor?: string;
    /** Duration of recording phase in ms */
    recordingDuration?: number;
    /** Duration of processing phase in ms */
    processingDuration?: number;
    /** Duration of idle phase before restarting in ms */
    idleDuration?: number;
    className?: string;
};

/**
 * Self-animating waveform component that simulates speech-to-text.
 * Cycles through: recording -> processing -> idle -> repeat
 * Acts like a dynamic GIF for project card displays.
 */
export function IvWaveform({
    barWidth = 3,
    barGap = 1,
    barRadius = 1.5,
    barHeight: baseBarHeight = 4,
    sensitivity = 2.5,
    fadeEdges = true,
    fadeWidth = 12,
    recordingColor = 'rgba(255, 68, 68, ',
    processingColor = 'rgba(68, 136, 255, ',
    idleColor = 'rgba(255, 255, 255, ',
    recordingDuration = 4000,
    processingDuration = 2000,
    idleDuration = 800,
    className = '',
}: IvWaveformProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>(0);

    // State machine: 'recording' | 'processing' | 'idle'
    const [phase, setPhase] = useState<'recording' | 'processing' | 'idle'>('recording');
    const phaseStartRef = useRef<number>(Date.now());

    // Simulated audio level for recording phase
    const simulatedLevelRef = useRef(0);
    const levelHistoryRef = useRef<number[]>([]);
    const maxHistorySize = 100;

    // For smooth bar values
    const displayBarsRef = useRef<number[]>([]);

    // For processing mode
    const processingTimeRef = useRef(0);
    const transitionProgressRef = useRef(0);
    const lastActiveDataRef = useRef<number[]>([]);

    // Gradient cache
    const gradientCacheRef = useRef<CanvasGradient | null>(null);
    const lastWidthRef = useRef(0);

    // Speech pattern generator - creates realistic speech-like audio levels
    const generateSpeechLevel = useCallback((time: number): number => {
        // Multiple overlapping waves to simulate natural speech patterns
        const syllableRate = Math.sin(time * 8) * 0.3;
        const wordRate = Math.sin(time * 2.5 + 1) * 0.2;
        const phraseRate = Math.sin(time * 0.8 + 2) * 0.15;
        const breath = Math.max(0, Math.sin(time * 0.4) * 0.1);

        // Add some randomness for natural variation
        const noise = (Math.random() - 0.5) * 0.15;

        // Combine all components
        let level = 0.35 + syllableRate + wordRate + phraseRate + breath + noise;

        // Occasional pauses (simulate gaps between words/phrases)
        const pauseChance = Math.sin(time * 1.2) * Math.sin(time * 0.7);
        if (pauseChance < -0.6) {
            level *= 0.2;
        }

        return Math.max(0.05, Math.min(1, level));
    }, []);

    // Phase cycling effect
    useEffect(() => {
        const cyclePhases = () => {
            const now = Date.now();
            const elapsed = now - phaseStartRef.current;

            if (phase === 'recording' && elapsed >= recordingDuration) {
                setPhase('processing');
                phaseStartRef.current = now;
            } else if (phase === 'processing' && elapsed >= processingDuration) {
                setPhase('idle');
                phaseStartRef.current = now;
            } else if (phase === 'idle' && elapsed >= idleDuration) {
                // Reset for next cycle
                levelHistoryRef.current = [];
                displayBarsRef.current = [];
                transitionProgressRef.current = 0;
                processingTimeRef.current = 0;
                setPhase('recording');
                phaseStartRef.current = now;
            }
        };

        const interval = setInterval(cyclePhases, 100);
        return () => clearInterval(interval);
    }, [phase, recordingDuration, processingDuration, idleDuration]);

    // Handle canvas resizing
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = canvasContainerRef.current;
        if (!canvas || !container) return;

        const resizeObserver = new ResizeObserver(() => {
            const rect = container.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(dpr, dpr);
            }

            gradientCacheRef.current = null;
            lastWidthRef.current = rect.width;
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, []);

    // Main animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = canvasContainerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let lastTime = 0;
        let lastAudioLevel = 0;

        const animate = (timestamp: number) => {
            const deltaTime = (timestamp - lastTime) / 1000;
            lastTime = timestamp;

            const rect = container.getBoundingClientRect();
            const step = barWidth + barGap;
            const barCount = Math.floor(rect.width / step);
            const centerY = rect.height / 2;
            const halfCount = Math.floor(barCount / 2);

            ctx.clearRect(0, 0, rect.width, rect.height);

            const isActive = phase === 'recording';
            const isProcessing = phase === 'processing';

            if (isActive) {
                // RECORDING MODE - Simulate speech waveform
                transitionProgressRef.current = 0;

                // Generate simulated audio level
                const timeInSeconds = (Date.now() - phaseStartRef.current) / 1000;
                const audioLevel = generateSpeechLevel(timeInSeconds);
                simulatedLevelRef.current = audioLevel;

                // Add current audio level to history
                if (audioLevel !== lastAudioLevel || levelHistoryRef.current.length === 0) {
                    levelHistoryRef.current.push(audioLevel);
                    if (levelHistoryRef.current.length > maxHistorySize) {
                        levelHistoryRef.current.shift();
                    }
                    lastAudioLevel = audioLevel;
                }

                // Initialize display bars if needed
                if (displayBarsRef.current.length !== barCount) {
                    displayBarsRef.current = new Array(barCount).fill(0.03);
                }

                const history = levelHistoryRef.current;
                const historyLen = history.length;

                // Map history to bars - center shows recent, edges show older
                for (let i = 0; i < barCount; i++) {
                    const distFromCenter = Math.abs(i - halfCount) / halfCount;
                    const historyOffset = Math.floor(distFromCenter * Math.min(historyLen, halfCount * 0.8));
                    const historyIndex = Math.max(0, historyLen - 1 - historyOffset);

                    let level = historyLen > 0 ? (history[historyIndex] || 0) : 0;
                    level = Math.pow(level, 0.5) * sensitivity;
                    level = Math.max(0.02, Math.min(1, level));

                    const current = displayBarsRef.current[i] || 0.02;
                    const speed = level > current ? 0.6 : 0.12;
                    displayBarsRef.current[i] = current + (level - current) * speed;
                }

                // Save for transition
                lastActiveDataRef.current = [...displayBarsRef.current];

                // Draw bars
                for (let i = 0; i < barCount; i++) {
                    const value = displayBarsRef.current[i];
                    const x = i * step;
                    const height = Math.max(baseBarHeight, value * rect.height * 0.9);
                    const y = centerY - height / 2;

                    const alpha = 0.35 + value * 0.65;
                    ctx.fillStyle = `${recordingColor}${alpha})`;
                    ctx.beginPath();
                    ctx.roundRect(x, y, barWidth, height, barRadius);
                    ctx.fill();
                }

            } else if (isProcessing) {
                // PROCESSING MODE - Flowing wave animation
                processingTimeRef.current += 0.04;
                transitionProgressRef.current = Math.min(1, transitionProgressRef.current + 0.025);

                // Initialize display bars if needed
                if (displayBarsRef.current.length !== barCount) {
                    displayBarsRef.current = new Array(barCount).fill(0.2);
                }

                const time = processingTimeRef.current;

                for (let i = 0; i < barCount; i++) {
                    const phase = (i / barCount) * Math.PI * 4 - time * 2.5;
                    const wave1 = Math.sin(phase) * 0.35;
                    const wave2 = Math.sin(phase * 0.6 + time * 0.7) * 0.2;
                    const wave3 = Math.cos(phase * 0.3 - time * 0.4) * 0.12;

                    let targetValue = 0.3 + wave1 + wave2 + wave3;
                    targetValue = Math.max(0.08, Math.min(0.85, targetValue));

                    if (lastActiveDataRef.current.length > 0 && transitionProgressRef.current < 1) {
                        const lastValue = lastActiveDataRef.current[i] || 0.2;
                        targetValue = lastValue * (1 - transitionProgressRef.current) +
                            targetValue * transitionProgressRef.current;
                    }

                    const current = displayBarsRef.current[i] || 0.2;
                    displayBarsRef.current[i] = current + (targetValue - current) * 0.12;
                }

                // Draw bars
                for (let i = 0; i < barCount; i++) {
                    const value = displayBarsRef.current[i];
                    const x = i * step;
                    const height = Math.max(baseBarHeight, value * rect.height * 0.9);
                    const y = centerY - height / 2;

                    const alpha = 0.35 + value * 0.65;
                    ctx.fillStyle = `${processingColor}${alpha})`;
                    ctx.beginPath();
                    ctx.roundRect(x, y, barWidth, height, barRadius);
                    ctx.fill();
                }

            } else {
                // IDLE - Fade out
                if (displayBarsRef.current.length > 0) {
                    let allFaded = true;

                    for (let i = 0; i < displayBarsRef.current.length; i++) {
                        displayBarsRef.current[i] *= 0.88;
                        if (displayBarsRef.current[i] > 0.015) allFaded = false;
                    }

                    if (!allFaded) {
                        for (let i = 0; i < displayBarsRef.current.length; i++) {
                            const value = displayBarsRef.current[i];
                            const x = i * step;
                            const height = Math.max(baseBarHeight * 0.5, value * rect.height * 0.9);
                            const y = centerY - height / 2;

                            ctx.fillStyle = `${idleColor}${0.15 + value * 0.5})`;
                            ctx.beginPath();
                            ctx.roundRect(x, y, barWidth, height, barRadius);
                            ctx.fill();
                        }
                    }
                }
            }

            // Apply edge fading
            if (fadeEdges && fadeWidth > 0 && rect.width > 0) {
                if (!gradientCacheRef.current || lastWidthRef.current !== rect.width) {
                    const gradient = ctx.createLinearGradient(0, 0, rect.width, 0);
                    const fadePercent = Math.min(0.2, fadeWidth / rect.width);

                    gradient.addColorStop(0, 'rgba(255,255,255,1)');
                    gradient.addColorStop(fadePercent, 'rgba(255,255,255,0)');
                    gradient.addColorStop(1 - fadePercent, 'rgba(255,255,255,0)');
                    gradient.addColorStop(1, 'rgba(255,255,255,1)');

                    gradientCacheRef.current = gradient;
                    lastWidthRef.current = rect.width;
                }

                ctx.globalCompositeOperation = 'destination-out';
                ctx.fillStyle = gradientCacheRef.current;
                ctx.fillRect(0, 0, rect.width, rect.height);
                ctx.globalCompositeOperation = 'source-over';
            }

            ctx.globalAlpha = 1;
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [phase, barWidth, barGap, barRadius, baseBarHeight, sensitivity, fadeEdges, fadeWidth, recordingColor, processingColor, idleColor, generateSpeechLevel]);

    return (
        <div
            className={`select-none pointer-events-none ${className}`}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0a0a0a',
            }}
            aria-label={
                phase === 'recording'
                    ? 'Simulated audio recording'
                    : phase === 'processing'
                        ? 'Processing audio'
                        : 'Audio waveform idle'
            }
            role="img"
        >
            {/* Pill-shaped waveform container matching iv app styling */}
            <div
                ref={containerRef}
                className="waveform-wrapper"
                style={{
                    width: '180px',
                    height: '48px',
                    background: 'rgba(0, 0, 0, 0.85)',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div
                    ref={canvasContainerRef}
                    style={{
                        position: 'absolute',
                        inset: '8px 12px',
                    }}
                >
                    <canvas
                        ref={canvasRef}
                        className="waveform-canvas"
                        style={{
                            display: 'block',
                        }}
                        aria-hidden="true"
                    />
                </div>
            </div>
        </div>
    );
}
