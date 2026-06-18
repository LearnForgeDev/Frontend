import PillButtonGroup from '@/Assets/Components/PillButtonGroup/PillButtonGroup';
import { useSchedulingContext, type ScheduleView } from '@/Storage/Context/SchedulingContext';

const OPTIONS: { label: string; value: ScheduleView }[] = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Agenda', value: 'agenda' },
];

export function ViewToggle() {
  const { view, setView } = useSchedulingContext();
  return <PillButtonGroup options={OPTIONS} value={view} onChange={setView} />;
}
