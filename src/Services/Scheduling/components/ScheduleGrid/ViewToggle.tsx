import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import PillButtonGroup from '@/Assets/Components/PillButtonGroup/PillButtonGroup';
import { useSchedulingContext, type ScheduleView } from '@/Storage/Context/SchedulingContext';

// Equal-width labels so PillButtonGroup's slider thumb — which assumes equal
// thirds — stays aligned despite the differing label lengths (Day/Week/Agenda).
const labelSx = { minWidth: 64, textAlign: 'center', px: 1 } as const;

const OPTIONS: { label: ReactNode; value: ScheduleView }[] = [
  { label: <Box component="span" sx={labelSx}>Day</Box>, value: 'day' },
  { label: <Box component="span" sx={labelSx}>Week</Box>, value: 'week' },
  { label: <Box component="span" sx={labelSx}>Agenda</Box>, value: 'agenda' },
];

export function ViewToggle() {
  const { view, setView } = useSchedulingContext();
  return <PillButtonGroup options={OPTIONS} value={view} onChange={setView} />;
}
