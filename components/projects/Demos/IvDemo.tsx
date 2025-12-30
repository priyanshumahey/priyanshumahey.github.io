"use client"

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * iv Demo Component - A full demo showing speech-to-text in action.
 * Shows waveform recording, then transcribed text appearing.
 */
export function IvDemo() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>(0);

    // Demo phrases to "transcribe"
    const phrases = [
        "Hello, how can I help you today?",
        "Send a message to Sarah",
        "What's the weather like?",
        "Remind me to call mom",
    ];

    // State machine
    const [phase, setPhase] = useState<'recording' | 'processing' | 'showing'>('recording');
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const phaseStartRef = useRef<number>(Date.now());

    // FFT-style waveform state - each bar is a frequency bin
    const staticBarsRef = useRef<number[]>([]);
    const targetBarsRef = useRef<number[]>([]);
    const lastActiveDataRef = useRef<number[]>([]);
    const transitionProgressRef = useRef(0);
    const processingTimeRef = useRef(0);
    const gradientCacheRef = useRef<CanvasGradient | null>(null);
    const lastWidthRef = useRef(0);
    const frameCountRef = useRef(0);

    // Speech simulation state
    const speechTimeRef = useRef(0);

    // Waveform config
    const barWidth = 3;
    const barGap = 2;
    const barRadius = 1.5;
    const baseBarHeight = 3;
    const fadeWidth = 16;

    const recordingDuration = 3500;
    const processingDuration = 800;
    const showingDuration = 2200;

    /**
     * Generate FFT-style frequency bin data that simulates speech.
     * Each bar represents a frequency bin, not time history.
     * Speech has:
     * - Strong fundamentals (100-300Hz) - low/mid bars
     * - Formants/vowels (300-3000Hz) - mid bars  
     * - Consonants/sibilants (3000-8000Hz) - higher bars
     */
    const generateSpeechFFT = (barCount: number, time: number): number[] => {
        const halfCount = Math.floor(barCount / 2);
        const bins: number[] = new Array(barCount).fill(0);

        // Syllable envelope - controls overall amplitude
        const syllableFreq = 1.8; // syllables per second
        const syllablePhase = (time * syllableFreq) % 1;

        // Natural speech envelope with attack/sustain/decay
        let syllableEnvelope: number;
        if (syllablePhase < 0.12) {
            syllableEnvelope = syllablePhase / 0.12;
        } else if (syllablePhase < 0.55) {
            syllableEnvelope = 1 - (syllablePhase - 0.12) * 0.2;
        } else if (syllablePhase < 0.75) {
            syllableEnvelope = 0.8 - (syllablePhase - 0.55) * 2;
        } else {
            // Gap between syllables
            syllableEnvelope = 0.08 + Math.random() * 0.04;
        }

        // Word-level modulation (pauses between words)
        const wordFreq = 0.5;
        const wordPhase = (time * wordFreq) % 1;
        const wordEnvelope = wordPhase < 0.12 ? 0.2 : (wordPhase > 0.88 ? 0.3 : 1);

        // Combined speech envelope
        const speechLevel = syllableEnvelope * wordEnvelope;

        // Generate symmetric FFT-like data (mirrored around center)
        for (let i = 0; i < halfCount; i++) {
            const normalizedFreq = i / halfCount; // 0 = low freq, 1 = high freq

            // Speech spectrum shape - peaks in mid frequencies

            let freqWeight: number;
            if (normalizedFreq < 0.2) {
                // Low frequencies - moderate
                freqWeight = 0.4 + normalizedFreq * 2;
            } else if (normalizedFreq < 0.6) {
                // Mid frequencies - strongest (formants)
                freqWeight = 0.8 + Math.sin((normalizedFreq - 0.2) * Math.PI / 0.4) * 0.2;
            } else {
                // High frequencies - fall off
                freqWeight = 0.8 - (normalizedFreq - 0.6) * 1.5;
            }
            freqWeight = Math.max(0.1, freqWeight);

            // Add frequency-specific variation (slower, gentler movement)
            const binPhase = time * (1.2 + normalizedFreq * 4) + i * 0.5;
            const binVariation = Math.sin(binPhase) * 0.25 + Math.sin(binPhase * 1.7) * 0.12;

            // Random micro-variation per bin (reduced)
            const noise = (Math.random() - 0.5) * 0.1;

            // Combine everything
            let value = speechLevel * freqWeight * (0.7 + binVariation + noise);
            value = Math.max(0, Math.min(1, value));

            // Mirror: left side from center
            bins[halfCount - 1 - i] = value;
            // Mirror: right side from center  
            bins[halfCount + i] = value;
        }

        return bins;
    };

    // Reset state when phase changes
    useEffect(() => {
        if (phase === 'recording') {
            staticBarsRef.current = [];
            targetBarsRef.current = [];
            speechTimeRef.current = 0;
            frameCountRef.current = 0;
        }
    }, [phase]);

    // Typewriter effect for showing text
    useEffect(() => {
        if (phase !== 'showing') {
            setDisplayedText('');
            return;
        }

        const currentPhrase = phrases[currentPhraseIndex];
        let charIndex = 0;

        const typeInterval = setInterval(() => {
            if (charIndex <= currentPhrase.length) {
                setDisplayedText(currentPhrase.substring(0, charIndex));
                charIndex++;
            } else {
                clearInterval(typeInterval);
            }
        }, 40);

        return () => clearInterval(typeInterval);
    }, [phase, currentPhraseIndex]);

    // Phase cycling
    useEffect(() => {
        const cyclePhases = () => {
            const now = Date.now();
            const elapsed = now - phaseStartRef.current;

            if (phase === 'recording' && elapsed >= recordingDuration) {
                setPhase('processing');
                phaseStartRef.current = now;
            } else if (phase === 'processing' && elapsed >= processingDuration) {
                setPhase('showing');
                phaseStartRef.current = now;
            } else if (phase === 'showing' && elapsed >= showingDuration) {
                // Reset for next cycle
                staticBarsRef.current = [];
                targetBarsRef.current = [];
                transitionProgressRef.current = 0;
                processingTimeRef.current = 0;
                speechTimeRef.current = 0;
                setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
                setPhase('recording');
                phaseStartRef.current = now;
            }
        };

        const interval = setInterval(cyclePhases, 100);
        return () => clearInterval(interval);
    }, [phase]);

    // Canvas resize
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
            if (ctx) ctx.scale(dpr, dpr);
            gradientCacheRef.current = null;
            lastWidthRef.current = rect.width;
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, []);

    // Animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = canvasContainerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const animate = () => {
            const rect = container.getBoundingClientRect();
            const step = barWidth + barGap;
            const barCount = Math.floor(rect.width / step);
            const centerY = rect.height / 2;

            ctx.clearRect(0, 0, rect.width, rect.height);

            const isActive = phase === 'recording';
            const isProcessing = phase === 'processing';

            if (isActive) {
                transitionProgressRef.current = 0;
                frameCountRef.current++;

                // Update speech time (slower progression for more natural feel)
                speechTimeRef.current += 0.012;

                // Generate FFT-style data
                const targetData = generateSpeechFFT(barCount, speechTimeRef.current);

                // Initialize bars if needed
                if (staticBarsRef.current.length !== barCount) {
                    staticBarsRef.current = new Array(barCount).fill(0);
                }

                // Smooth interpolation towards target (gentler movement)
                for (let i = 0; i < barCount; i++) {
                    const target = targetData[i] || 0;
                    const current = staticBarsRef.current[i] || 0;
                    const speed = target > current ? 0.22 : 0.1;
                    staticBarsRef.current[i] = current + (target - current) * speed;
                }

                lastActiveDataRef.current = [...staticBarsRef.current];

                // Draw bars
                for (let i = 0; i < barCount; i++) {
                    const value = staticBarsRef.current[i];
                    const x = i * step;
                    // Height scales with value
                    const minHeight = 2;
                    const height = minHeight + value * (rect.height * 0.8 - minHeight);
                    const y = centerY - height / 2;
                    // Alpha scales with value
                    const alpha = 0.2 + value * 0.8;
                    ctx.fillStyle = `rgba(255, 68, 68, ${alpha})`;
                    ctx.beginPath();
                    ctx.roundRect(x, y, barWidth, height, barRadius);
                    ctx.fill();
                }

            } else if (isProcessing) {
                processingTimeRef.current += 0.05;
                transitionProgressRef.current = Math.min(1, transitionProgressRef.current + 0.03);

                if (staticBarsRef.current.length !== barCount) {
                    staticBarsRef.current = new Array(barCount).fill(0.2);
                }

                const time = processingTimeRef.current;
                const halfCount = Math.floor(barCount / 2);

                for (let i = 0; i < barCount; i++) {
                    const normalizedPos = (i - halfCount) / halfCount;
                    const centerWeight = 1 - Math.abs(normalizedPos) * 0.4;

                    const wave1 = Math.sin(time * 1.5 + normalizedPos * 3) * 0.25;
                    const wave2 = Math.sin(time * 0.8 - normalizedPos * 2) * 0.2;
                    const wave3 = Math.cos(time * 2 + normalizedPos) * 0.15;

                    let targetValue = (0.2 + wave1 + wave2 + wave3) * centerWeight;
                    targetValue = Math.max(0.05, Math.min(0.8, targetValue));

                    if (lastActiveDataRef.current.length > 0 && transitionProgressRef.current < 1) {
                        const lastValue = lastActiveDataRef.current[i] || 0.2;
                        targetValue = lastValue * (1 - transitionProgressRef.current) + targetValue * transitionProgressRef.current;
                    }

                    const current = staticBarsRef.current[i] || 0.2;
                    staticBarsRef.current[i] = current + (targetValue - current) * 0.12;
                }

                for (let i = 0; i < barCount; i++) {
                    const value = staticBarsRef.current[i];
                    const x = i * step;
                    const height = Math.max(baseBarHeight, value * rect.height * 0.8);
                    const y = centerY - height / 2;
                    const alpha = 0.35 + value * 0.65;
                    ctx.fillStyle = `rgba(68, 136, 255, ${alpha})`;
                    ctx.beginPath();
                    ctx.roundRect(x, y, barWidth, height, barRadius);
                    ctx.fill();
                }
            }

            // Edge fading
            if (fadeWidth > 0 && rect.width > 0 && (isActive || isProcessing)) {
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
    }, [phase, generateSpeechFFT]);

    return (
        <div
            className="select-none pointer-events-none"
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                // Subtle gradient that complements red/blue waveform
                background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 50%, #16213e 100%)',
            }}
        >
            {/* Status indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    fontWeight: 500,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    color: phase === 'recording' ? '#ff4444' : phase === 'processing' ? '#4488ff' : '#22c55e',
                }}
            >
                <motion.div
                    animate={{
                        scale: phase === 'recording' ? [1, 1.2, 1] : 1,
                        opacity: phase === 'showing' ? 0 : 1,
                    }}
                    transition={{
                        scale: { repeat: Infinity, duration: 1 },
                    }}
                    style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: phase === 'recording' ? '#ff4444' : '#4488ff',
                    }}
                />
                {phase === 'recording' ? 'Listening...' : phase === 'processing' ? 'Processing...' : ''}
            </motion.div>

            {/* Waveform pill */}
            <AnimatePresence mode="wait">
                {(phase === 'recording' || phase === 'processing') && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            width: '200px',
                            height: '52px',
                            background: 'rgba(0, 0, 0, 0.7)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: '26px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: phase === 'recording'
                                ? '0 0 20px rgba(255, 68, 68, 0.2)'
                                : '0 0 20px rgba(68, 136, 255, 0.2)',
                        }}
                    >
                        <div
                            ref={canvasContainerRef}
                            style={{
                                position: 'absolute',
                                inset: '10px 14px',
                            }}
                        >
                            <canvas
                                ref={canvasRef}
                                style={{ display: 'block' }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Transcribed text */}
            <AnimatePresence mode="wait">
                {phase === 'showing' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            padding: '12px 20px',
                            background: 'rgba(0, 0, 0, 0.7)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            maxWidth: '280px',
                            boxShadow: '0 0 20px rgba(34, 197, 94, 0.15)',
                        }}
                    >
                        <p
                            style={{
                                fontSize: '14px',
                                fontWeight: 400,
                                color: '#fafafa',
                                margin: 0,
                                lineHeight: 1.5,
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            }}
                        >
                            {displayedText}
                            <motion.span
                                animate={{ opacity: [1, 0] }}
                                transition={{ repeat: Infinity, duration: 0.5 }}
                                style={{ color: '#22c55e' }}
                            >
                                |
                            </motion.span>
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Subtle app branding */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                style={{
                    position: 'absolute',
                    bottom: '16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: '#fff',
                }}
            >
                iv
            </motion.div>
        </div>
    );
}
