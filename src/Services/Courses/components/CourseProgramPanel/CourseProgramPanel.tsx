import { useEffect, useRef, useState } from 'react';
import { ArrowForward } from '@mui/icons-material';
import { Box, Button, Checkbox, Chip, FormControlLabel, Typography } from '@mui/material';
import type { CourseProgramPanelProps } from './CourseProgramPanel.type';
import { isCourseItemAvailable } from '../../utils/courseProgram.conversion';
import CourseState from '../CourseState/CourseState';

const BLOCK_LABELS = ['Материал', 'Занятие', 'Урок', 'Домашнее задание'];

export default function CourseProgramPanel({ items, focusItemPublicId, canManage, isSavingProgress, openingItemPublicId, onOpen, onToggleCompleted, onEdit }: CourseProgramPanelProps) {
  const [now, setNow] = useState(Date.now);
  const focusTarget = useRef<HTMLLIElement>(null);
  const matchedItemPublicId = items.find(item => item.publicId === focusItemPublicId)?.publicId;
  useEffect(() => {
    if (matchedItemPublicId && focusTarget.current) {
      focusTarget.current.focus({ preventScroll: true });
      focusTarget.current.scrollIntoView({ block: 'center' });
    }
  }, [matchedItemPublicId]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, []);
  if (!items.length) {
    return <CourseState kind="empty" title={canManage ? 'В программе пока нет блоков' : 'Программа пока пуста'} description={canManage ? 'Соберите путь из уроков, материалов, занятий и домашних заданий.' : 'Преподаватель добавит материалы курса.'} actionLabel={canManage ? 'Собрать программу' : undefined} onAction={canManage ? onEdit : undefined} />;
  }
  return <Box data-testid="course-program" component="ol" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 2 }}>
    {items.map((item, index) => {
      const available = canManage || isCourseItemAvailable(item, now);
      const supported = item.block.kind === 'supported';
      return <Box component="li" data-testid={`course-item-${item.publicId}`} key={item.publicId} ref={item.publicId === matchedItemPublicId ? focusTarget : undefined} tabIndex={item.publicId === matchedItemPublicId ? -1 : undefined} sx={{ display: 'flex', gap: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3, p: { xs: 2, sm: 3 }, flexWrap: 'wrap', '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 } }}>
        <Typography aria-hidden="true" color="text.secondary">{index + 1}</Typography>
        <Box sx={{ flex: '1 1 240px', minWidth: 0 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            <Chip size="small" variant="outlined" label={BLOCK_LABELS[item.itemType] ?? 'Другой блок'} />
            {!item.isRequired && <Chip size="small" label="Необязательный" />}
            {item.itemType === 3 && <Chip size="small" color={item.isCompleted ? 'success' : 'default'} label={item.isCompleted ? 'Зачтено' : 'Зачёт после проверки'} />}
          </Box>
          <Typography component="h2" variant="h6">{item.title}</Typography>
          {item.description && <Typography color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{item.description}</Typography>}
          {(item.availableFromUtc || item.availableUntilUtc) && <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1 }}>
            {item.availableFromUtc && `С ${new Date(item.availableFromUtc).toLocaleString('ru-RU')}. `}
            {item.availableUntilUtc && `До ${new Date(item.availableUntilUtc).toLocaleString('ru-RU')}.`}
          </Typography>}
          {!available && <Typography color="text.secondary" role="status">Блок сейчас недоступен</Typography>}
          {!supported && <Typography color="text.secondary">Этот тип блока пока нельзя открыть.</Typography>}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          {!canManage && supported && item.itemType !== 3 && <FormControlLabel label={item.isCompleted ? 'Пройден' : 'Отметить пройденным'} control={<Checkbox checked={item.isCompleted} disabled={!available || isSavingProgress} onChange={() => onToggleCompleted(item)} slotProps={{ input: { 'aria-label': `Блок «${item.title}» пройден` } }} />} />}
          <Button endIcon={<ArrowForward />} disabled={!available || !supported || openingItemPublicId !== null} onClick={() => onOpen(item)}>{openingItemPublicId === item.publicId ? 'Открываем…' : 'Открыть'}</Button>
        </Box>
      </Box>;
    })}
  </Box>;
}
