import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    useId,
    type CSSProperties,
    type PointerEvent as ReactPointerEvent,
} from "react";
import { CloudIcon } from "../../../assets/images/featureIcons/CloudIcon.tsx";
import type { FeatureItem } from "../../../types/landingTypes.ts";
import { AnalyticsIcon } from "../../../assets/images/featureIcons/AnalyticsIcon.tsx";
import { LessonsIcon } from "../../../assets/images/featureIcons/LessonsIcon.tsx";
import { VideoMeetingIcon } from "../../../assets/images/featureIcons/VideoMeetingIcon.tsx";

const FEATURES: FeatureItem[] = [
    {
        name: "Облако",
        description: "Храните курсы и материалы в одном месте, без забот о бэкапах.",
        icon: CloudIcon,
        backgroundColor: "var(--feature-card-bg-cloud)",
    },
    {
        name: "Аналитика",
        description: "Отслеживайте прогресс и вовлеченность по каждому курсу.",
        icon: AnalyticsIcon,
        backgroundColor: "var(--feature-card-bg-analytics)",
    },
    {
        name: "Уроки",
        description: "Планируйте и публикуйте структурированные уроки и практики.",
        icon: LessonsIcon,
        backgroundColor: "var(--feature-card-bg-lessons)",
    },
    {
        name: "Видеовстречи",
        description: "Создавайте живые созвоны и поддерживайте студентов в реальном времени.",
        icon: VideoMeetingIcon,
        backgroundColor: "var(--feature-card-bg-meetings)",
    },
];

const DEFAULT_GAP_PX = 20;
const DEFAULT_CARD_WIDTH = 420;
const AUTO_SPEED_PX_PER_SEC = 36;
const STEP_TRANSITION = "transform 320ms cubic-bezier(0.22, 0.61, 0.36, 1)";
const PAUSE_AFTER_INTERACTION_MS = 2000;

const getTrackGap = (track: HTMLElement | null) => {
    if (!track || typeof window === "undefined") {
        return DEFAULT_GAP_PX;
    }
    const styles = window.getComputedStyle(track);
    const rawGap = styles.columnGap || styles.gap;
    const parsed = Number.parseFloat(rawGap);
    return Number.isFinite(parsed) ? parsed : DEFAULT_GAP_PX;
};

const getCardWidth = (track: HTMLElement | null) => {
    const firstCard = track?.querySelector<HTMLElement>(".feature");
    return firstCard?.offsetWidth ?? DEFAULT_CARD_WIDTH;
};

export default function FeaturesCarousel() {
    const trackRef = useRef<HTMLDivElement | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [repeatCount, setRepeatCount] = useState(3);
    const [disableTransition, setDisableTransition] = useState(false);
    const [isStepAnimating, setIsStepAnimating] = useState(false);
    const [offset, setOffset] = useState(0);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [isPausedAfterInteraction, setIsPausedAfterInteraction] = useState(false);

    const offsetRef = useRef(0);
    const dragStartRef = useRef(0);
    const lastTimeRef = useRef<number | null>(null);
    const stepTimerRef = useRef<number | null>(null);
    const isStepAnimatingRef = useRef(false);
    const pauseTimerRef = useRef<number | null>(null);
    const trackId = useId();

    const loopedFeatures = useMemo(
        () => Array.from({ length: repeatCount }, () => FEATURES).flat(),
        [repeatCount],
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
        handleChange();

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }

        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
    }, []);

    const getBaseWidth = useCallback(() => {
        const track = trackRef.current;
        if (!track) return 0;

        const cards = track.querySelectorAll<HTMLElement>(".feature");
        if (cards.length > FEATURES.length) {
            const firstCard = cards[0];
            const nextCycleCard = cards[FEATURES.length];
            const measured = nextCycleCard.offsetLeft - firstCard.offsetLeft;
            if (measured > 0) return measured;
        }

        return track.scrollWidth / Math.max(1, repeatCount);
    }, [repeatCount]);

    const runStepAnimation = () => {
        if (stepTimerRef.current) {
            window.clearTimeout(stepTimerRef.current);
        }
        setIsStepAnimating(true);
        isStepAnimatingRef.current = true;
        stepTimerRef.current = window.setTimeout(() => {
            setIsStepAnimating(false);
            isStepAnimatingRef.current = false;
            stepTimerRef.current = null;
        }, 360);
    };

    const applyOffset = useCallback((value: number, options?: { skipWrap?: boolean; onWrap?: (shift: number) => void }) => {
        const baseWidth = getBaseWidth();
        if (!baseWidth) return;

        const track = trackRef.current;
        const viewportWidth = track?.parentElement?.clientWidth ?? window.innerWidth;
        const trackWidth = baseWidth * repeatCount;

        let next = value;
        let jumped = false;

        if (!options?.skipWrap) {
            //карусель крутится виртуально, чтобы при переносе мышкой или кнопкой не было скачков
            const minOffset = baseWidth;
            const maxOffset = Math.max(minOffset, trackWidth - baseWidth - viewportWidth);

            if (next < minOffset) {
                const cyclesToAdd = Math.ceil((minOffset - next) / baseWidth);
                const shift = baseWidth * cyclesToAdd;
                next += shift;
                jumped = true;
                options?.onWrap?.(shift);
            } else if (next > maxOffset) {
                const cyclesToSubtract = Math.ceil((next - maxOffset) / baseWidth);
                const shift = baseWidth * cyclesToSubtract;
                next -= shift;
                jumped = true;
                options?.onWrap?.(-shift);
            }
        }

        if (jumped) {
            setDisableTransition(true);
            requestAnimationFrame(() => setDisableTransition(false));
            if (stepTimerRef.current) {
                window.clearTimeout(stepTimerRef.current);
                stepTimerRef.current = null;
            }
            setIsStepAnimating(false);
            isStepAnimatingRef.current = false;
        }

        offsetRef.current = next;
        setOffset(next);
    }, [getBaseWidth, repeatCount]);

    useEffect(() => {
        const computeRepeat = () => {
            const track = trackRef.current;
            const gap = getTrackGap(track);
            const cardWidth = getCardWidth(track);
            const totalCardWidth = cardWidth + gap;
            const baseWidth = FEATURES.length * totalCardWidth;
            const viewportWidth = track?.parentElement?.clientWidth ?? window.innerWidth;

            //если уменьшить количество карточек в карусели - они будут багаться при прокрутке
            const repeatsForBuffer = Math.ceil((viewportWidth + 5 * baseWidth) / baseWidth);
            const repeats = Math.max(6, repeatsForBuffer);
            setRepeatCount(repeats);
        };

        computeRepeat();
        window.addEventListener("resize", computeRepeat);
        return () => window.removeEventListener("resize", computeRepeat);
    }, []);

    useEffect(() => {
        applyOffset(offsetRef.current);
    }, [applyOffset, repeatCount]);

    useEffect(() => {
        let frame: number;
        const step = (ts: number) => {
            if (isStepAnimatingRef.current) {
                //удержание синхронизации прокрутки при ручном перемещении карусели
                lastTimeRef.current = ts;
                frame = requestAnimationFrame(step);
                return;
            }

            if (lastTimeRef.current === null) {
                lastTimeRef.current = ts;
            }
            const delta = ts - lastTimeRef.current;
            lastTimeRef.current = ts;

            if (!isPaused && !isDragging && !prefersReducedMotion && !isPausedAfterInteraction) {
                const move = (AUTO_SPEED_PX_PER_SEC * delta) / 1000;
                applyOffset(offsetRef.current + move);
            }

            frame = requestAnimationFrame(step);
        };

        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [applyOffset, isPaused, isDragging, prefersReducedMotion, isPausedAfterInteraction, repeatCount]);

    const getCenteredIndex = (offsetValue: number) => {
        const track = trackRef.current;
        if (!track) return 0;

        const gap = getTrackGap(track);
        const cardWidth = getCardWidth(track);
        const step = cardWidth + gap;
        if (step <= 0) return 0;

        const viewportWidth = track.parentElement?.clientWidth ?? window.innerWidth;
        const center = offsetValue + viewportWidth / 2;
        return (center - cardWidth / 2) / step;
    };

    const getOffsetForIndex = (index: number) => {
        const track = trackRef.current;
        if (!track) return offsetRef.current;

        const gap = getTrackGap(track);
        const cardWidth = getCardWidth(track);
        const step = cardWidth + gap;
        if (step <= 0) return offsetRef.current;

        const viewportWidth = track.parentElement?.clientWidth ?? window.innerWidth;
        return index * step + cardWidth / 2 - viewportWidth / 2;
    };

    const animateByDelta = (delta: number) => {
        if (delta === 0) return;

        const track = trackRef.current;
        if (!track) return;

        const baseWidth = getBaseWidth();
        if (!baseWidth) return;

        const viewportWidth = track.parentElement?.clientWidth ?? window.innerWidth;
        const trackWidth = baseWidth * repeatCount;
        const minOffset = baseWidth;
        const maxOffset = Math.max(minOffset, trackWidth - baseWidth - viewportWidth);

        let current = offsetRef.current;
        let target = current + delta;
        const needsRebase = target < minOffset || target > maxOffset;

        if (needsRebase) {
            const middleCycle = Math.floor(repeatCount / 2);
            const middleOffset = baseWidth * middleCycle;
            const relative = ((current - middleOffset) % baseWidth + baseWidth) % baseWidth;
            current = middleOffset + relative;

            if (current > maxOffset) {
                const cyclesBack = Math.ceil((current - maxOffset) / baseWidth);
                current -= baseWidth * cyclesBack;
            } else if (current < minOffset) {
                const cyclesForward = Math.ceil((minOffset - current) / baseWidth);
                current += baseWidth * cyclesForward;
            }

            target = current + delta;

            setDisableTransition(true);
            setOffset(current);
            offsetRef.current = current;
            requestAnimationFrame(() => {
                setDisableTransition(false);
                runStepAnimation();
                applyOffset(target, { skipWrap: true });
            });
            return;
        }

        runStepAnimation();
        applyOffset(target, { skipWrap: true });
    };

    const scrollByCard = (direction: -1 | 1) => {
        const currentIndex = getCenteredIndex(offsetRef.current);
        const targetIndex = Math.round(currentIndex) + direction;
        const targetOffset = getOffsetForIndex(targetIndex);
        animateByDelta(targetOffset - offsetRef.current);
        startPauseAfterInteraction();
    };

    const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
        if (!trackRef.current) return;
        trackRef.current.setPointerCapture(e.pointerId);
        setIsDragging(true);
        setIsPaused(true);
        dragStartRef.current = e.clientX + offsetRef.current;
    };

    const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        applyOffset(dragStartRef.current - e.clientX, {
            onWrap: (shift) => {
                dragStartRef.current += shift;
            },
        });
    };

    const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
        if (!trackRef.current || !isDragging) return;
        if (trackRef.current.hasPointerCapture(e.pointerId)) {
            trackRef.current.releasePointerCapture(e.pointerId);
        }
        setIsDragging(false);
        setIsPaused(false);
        const currentIndex = getCenteredIndex(offsetRef.current);
        const targetIndex = Math.round(currentIndex);
        const targetOffset = getOffsetForIndex(targetIndex);
        animateByDelta(targetOffset - offsetRef.current);
        startPauseAfterInteraction();
    };

    const trackStyle: CSSProperties = {
        transform: `translateX(${-offset}px)`,
        transition: disableTransition || isDragging || prefersReducedMotion ? "none" : isStepAnimating ? STEP_TRANSITION : "none",
    };

    const startPauseAfterInteraction = useCallback(() => {
        if (pauseTimerRef.current) {
            window.clearTimeout(pauseTimerRef.current);
        }
        setIsPausedAfterInteraction(true);
        pauseTimerRef.current = window.setTimeout(() => {
            setIsPausedAfterInteraction(false);
            pauseTimerRef.current = null;
        }, PAUSE_AFTER_INTERACTION_MS);
    }, []);

    useEffect(
        () => () => {
            if (stepTimerRef.current) {
                window.clearTimeout(stepTimerRef.current);
            }
            if (pauseTimerRef.current) {
                window.clearTimeout(pauseTimerRef.current);
            }
        },
        [],
    );

    return (
        <section className="features-carousel" id="features" aria-label="Возможности learnForge">
            <header className="carousel-header">
                <div className="section-kicker">Возможности</div>
                <div className="carousel-title">
                    <h2>Инструменты для онлайн-школы</h2>
                    <p>Мы собрали ключевые возможности — чтобы вы могли быстрее обучать и поддерживать пользователей.</p>
                </div>
            </header>
            <div className="carousel-viewport">
                <div
                    className={`carousel-track ${isDragging ? "dragging" : ""}`}
                    id={trackId}
                    ref={trackRef}
                    role="list"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => !isDragging && setIsPaused(false)}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    style={trackStyle}
                >
                    {loopedFeatures.map((value, index) => (
                        <Feature
                            icon={value.icon}
                            name={value.name}
                            iconSize={80}
                            description={value.description}
                            key={`${value.name}-${index}`}
                            backgroundColor={value.backgroundColor}
                        />
                    ))}
                </div>
            </div>
            <CarouselControls onPrev={() => scrollByCard(-1)} onNext={() => scrollByCard(1)} trackId={trackId} />
        </section>
    );
}

function Feature({ name, description, icon: IconComp, iconSize, backgroundColor }: FeatureItem & { iconSize: number }) {
    return (
        <div className="feature" role="listitem">
            <IconComp size={iconSize} backgroundColor={backgroundColor} />
            <h3>{name}</h3>
            <p>{description}</p>
        </div>
    );
}

function CarouselControls({ onPrev, onNext, trackId }: { onPrev: () => void; onNext: () => void; trackId: string }) {
    return (
        <div className="carousel-controls">
            <button
                className="carousel-btn"
                type="button"
                aria-label="Перелистнуть назад"
                aria-controls={trackId}
                onClick={onPrev}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </button>
            <button
                className="carousel-btn"
                type="button"
                aria-label="Перелистнуть вперёд"
                aria-controls={trackId}
                onClick={onNext}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                </svg>
            </button>
        </div>
    );
}
