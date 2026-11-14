import { Box } from '@mui/material';
import PillButtonGroup from '@/Assets/Components/PillButtonGroup/PillButtonGroup';
import type { PillChoice } from '@/Assets/Components/PillButtonGroup/PillButtonGroup.type';
import { useSchedulingContext } from '@/Storage/SchedulingContext/SchedulingContext';
import type { ScheduleView } from '@/Storage/SchedulingContext/SchedulingContext';

const labelSx = {
  display: 'inline-block', width: { xs: 64, sm: 84 }, textAlign: 'center', whiteSpace: 'nowrap',
} as const;

const OPTIONS: PillChoice<ScheduleView>[] = [
  { label: <Box component="span" sx={labelSx}>День</Box>, value: 'day' },
  { label: <Box component="span" sx={labelSx}>Неделя</Box>, value: 'week' },
  { label: <Box component="span" sx={labelSx}>События</Box>, value: 'agenda' },
];

export function ViewToggle() {
  const { view, setView } = useSchedulingContext();
  return (
    <PillButtonGroup
      aria-label="Вид расписания"
      options={OPTIONS}
      value={view}
      onChange={setView}
      sx={{ width: { xs: '100%', sm: 'auto' }, maxWidth: '100%', '& .MuiToggleButton-root': { minWidth: 0, minHeight: 44, px: { xs: 1, sm: 2 } } }}
    />
  );
}
