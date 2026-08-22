import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import PillButtonGroup from '@/Assets/Components/PillButtonGroup/PillButtonGroup';
import { useSchedulingContext, type ScheduleView } from '@/Storage/SchedulingContext/SchedulingContext.tsx';
import { getIsMobileDevice } from '@/Assets/device.utils';

// Fixed equal-width labels so PillButtonGroup's slider thumb — which assumes
// equal thirds — stays aligned despite the differing label lengths
// (День / Неделя / События). The width must fit the longest label.
const labelSx = {
  display: 'inline-block',
  width: 84,
  textAlign: 'center',
  whiteSpace: 'nowrap',
} as const;

const OPTIONS: { label: ReactNode; value: ScheduleView }[] = [
  { label: <Box component="span" sx={labelSx}>День</Box>, value: 'day' },
  { label: <Box component="span" sx={labelSx}>Неделя</Box>, value: 'week' },
  { label: <Box component="span" sx={labelSx}>События</Box>, value: 'agenda' },
];

export function ViewToggle() {
  const { view, setView } = useSchedulingContext();
  const isMobile = getIsMobileDevice();
  const visibleOptions = isMobile
    ? OPTIONS.filter((option) => option.value !== 'week')
    : OPTIONS;

  return <PillButtonGroup options={visibleOptions} value={view} onChange={setView} />;
}
