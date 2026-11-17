import { useEffect, useRef, useState } from 'react';
import { Typography } from '@mui/material';
import { remainingSeconds } from '../../homework.validation';
import { advanceHomeworkClock, sampleHomeworkClock } from '../../homework.clock';
import type { HomeworkClockSample } from '../../homework.type';
import type { HomeworkCountdownProps } from './HomeworkCountdown.type';

export default function HomeworkCountdown({ deadline, serverTimeUtc }: HomeworkCountdownProps) {
  const sourceTime = Date.parse(serverTimeUtc);
  const [clock, setClock] = useState(sourceTime);
  const anchor = useRef<HomeworkClockSample | null>(null);
  useEffect(() => {
    const sample = sampleHomeworkClock(anchor.current, serverTimeUtc, performance.now());
    anchor.current = sample;
    const update = () => setClock(advanceHomeworkClock(sample, performance.now()));
    const initial = window.setTimeout(update, 0);
    const timer = window.setInterval(update, 1000);
    const deadlineTimer = window.setTimeout(update, Math.max(0, Date.parse(deadline) - sample.serverTime));
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
      window.clearTimeout(deadlineTimer);
    };
  }, [serverTimeUtc, deadline]);
  const seconds = remainingSeconds(deadline, 0, Math.max(clock, sourceTime)) ?? 0;
  return <Typography role="status" color="warning.main">{seconds > 0 ? `Автосдача через ${seconds} сек.` : 'Завершаем попытку…'}</Typography>;
}
