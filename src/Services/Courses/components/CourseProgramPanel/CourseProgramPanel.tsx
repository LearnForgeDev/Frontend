import { useEffect, useRef, useState } from 'react';
import { ArrowForward } from '@mui/icons-material';
import { Box, Button, Chip, Typography } from '@mui/material';
import type { CourseProgramPanelProps } from './CourseProgramPanel.type';
import { isCourseItemAvailable } from '../../utils/courseProgram.conversion';
import { COURSE_COMPLETION_OPTIONS } from '../../utils/courseCompletion.const';
import CourseState from '../CourseState/CourseState';

const BLOCK_LABELS = ['Файл', 'Занятие', 'Статья', 'Домашнее задание'];

export default function CourseProgramPanel({ items, focusItemPublicId, canManage, openingItemPublicId, onOpen, onEdit }: CourseProgramPanelProps) {
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
    return <CourseState kind="empty" title={canManage ? 'В программе пока нет блоков' : 'Программа пока пуста'} description={canManage ? 'Соберите путь из статей, файлов, занятий и домашних заданий.' : 'Преподаватель добавит материалы курса.'} actionLabel={canManage ? 'Собрать программу' : undefined} onAction={canManage ? onEdit : undefined} />;
  }
  return <Box data-testid="course-program" component="ol" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 2 }}>
    {items.map((item, index) => {
      const available = canManage || item.isUnlocked && isCourseItemAvailable(item, now);
      const supported = item.block.kind === 'supported';
      return <Box component="li" data-testid={`course-item-${item.publicId}`} key={item.publicId} ref={item.publicId === matchedItemPublicId ? focusTarget : undefined} tabIndex={item.publicId === matchedItemPublicId ? -1 : undefined} sx={{ display: 'flex', gap: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3, p: { xs: 2, sm: 3 }, flexWrap: 'wrap', '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 } }}>
        <Typography aria-hidden="true" color="text.secondary">{index + 1}</Typography>
        <Box sx={{ flex: '1 1 240px', minWidth: 0 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            <Chip size="small" variant="outlined" label={BLOCK_LABELS[item.itemType] ?? 'Другой блок'} />
            {!item.isRequired && <Chip size="small" label="Необязательный" />}
            {item.isCompleted && <Chip size="small" color="success" label="Пройден" />}
            {!canManage && !item.isUnlocked && <Chip size="small" label="Закрыт" />}
          </Box>
          <Typography component="h2" variant="h6">{item.title}</Typography>
          {item.description && <Typography color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{item.description}</Typography>}
          {(item.availableFromUtc || item.availableUntilUtc) && <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1 }}>
            {item.availableFromUtc && `С ${new Date(item.availableFromUtc).toLocaleString('ru-RU')}. `}
            {item.availableUntilUtc && `До ${new Date(item.availableUntilUtc).toLocaleString('ru-RU')}.`}
          </Typography>}
          {item.isRequired && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{COURSE_COMPLETION_OPTIONS[item.itemType]?.find(option => option.value === item.completionRule)?.label}</Typography>}
          {item.completionRule === 2 && <Typography variant="caption" color="text.secondary">Время в статье: {Math.floor(item.elapsedSeconds / 60)} из {Math.ceil((item.requiredSeconds ?? 0) / 60)} мин.</Typography>}
          {item.completionRule === 6 && item.completeAfterUtc && <Typography variant="caption" component="p" color="text.secondary">Засчитывается после {new Date(item.completeAfterUtc).toLocaleString('ru-RU')}</Typography>}
          {!canManage && !item.isUnlocked && <Typography color="text.secondary" role="status">Сначала пройдите предыдущие обязательные блоки</Typography>}
          {!available && (canManage || item.isUnlocked) && <Typography color="text.secondary" role="status">Блок сейчас недоступен</Typography>}
          {!supported && <Typography color="text.secondary">Этот тип блока пока нельзя открыть.</Typography>}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Button endIcon={<ArrowForward />} disabled={!available || !supported || openingItemPublicId !== null} onClick={() => onOpen(item)}>{openingItemPublicId === item.publicId ? 'Открываем…' : 'Открыть'}</Button>
        </Box>
      </Box>;
    })}
  </Box>;
}
