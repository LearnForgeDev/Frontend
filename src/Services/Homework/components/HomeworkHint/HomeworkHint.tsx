import { useId, useRef, useState } from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, ClickAwayListener, IconButton, Paper, Popper, Stack, TextField, Typography } from '@mui/material';
import type { HomeworkHintProps } from './HomeworkHint.type';

export default function HomeworkHint({ studentHint, teacherHint, editing, teacher, disabled, onChange }: HomeworkHintProps) {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [arrow, setArrow] = useState<HTMLElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const id = useId();
  if (!editing && !studentHint && !(teacher && teacherHint)) {
    return null;
  }
  const close = () => {
    setAnchor(null);
    trigger.current?.focus();
  };
  return <>
    <IconButton ref={trigger} disabled={disabled} aria-label={editing ? 'Настроить подсказки' : 'Показать подсказку'} aria-expanded={Boolean(anchor)} aria-controls={anchor ? id : undefined}
      onKeyDown={event => {
        if (event.key === 'Escape') {
          close();
        }
      }} onClick={event => setAnchor(previous => previous ? null : event.currentTarget)}><InfoOutlinedIcon /></IconButton>
    <Popper open={Boolean(anchor)} anchorEl={anchor} placement="bottom-end" sx={{ zIndex: 1400, maxWidth: 'calc(100vw - 24px)' }} modifiers={[{ name: 'offset', options: { offset: [0, 12] } }, { name: 'arrow', enabled: true, options: { element: arrow, padding: 12 } }]}>
      {({ placement }) => <ClickAwayListener onClickAway={close}>
        <Paper id={id} role="dialog" aria-label={editing ? 'Подсказки к вопросу' : 'Подсказка'} elevation={8} onKeyDown={event => {
          if (event.key === 'Escape') {
            close();
          }
        }} sx={{ position: 'relative', p: 2, width: 360, maxWidth: 'calc(100vw - 24px)', border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Box component="span" ref={setArrow} aria-hidden data-homework-hint-arrow sx={{ position: 'absolute', top: placement.startsWith('bottom') ? -7 : undefined, bottom: placement.startsWith('top') ? -7 : undefined, width: 12, height: 12, pointerEvents: 'none',
            '&::before': { content: '""', display: 'block', width: '100%', height: '100%', transform: 'rotate(45deg)', bgcolor: 'background.paper', borderTop: placement.startsWith('bottom') ? 1 : 0, borderLeft: placement.startsWith('bottom') ? 1 : 0, borderRight: placement.startsWith('top') ? 1 : 0, borderBottom: placement.startsWith('top') ? 1 : 0, borderColor: 'divider' } }} />
          {editing ? <Stack spacing={2}>
            <TextField autoFocus multiline minRows={2} label="Подсказка преподавателю" value={teacherHint ?? ''} onChange={event => onChange?.(studentHint ?? '', event.target.value)} />
            <TextField multiline minRows={2} label="Подсказка ученику" value={studentHint ?? ''} onChange={event => onChange?.(event.target.value, teacherHint ?? '')} />
          </Stack> : <Stack spacing={2}>
            {teacher && teacherHint && <Box><Typography variant="subtitle2">Преподавателю</Typography><Typography sx={{ whiteSpace: 'pre-wrap' }}>{teacherHint}</Typography></Box>}
            {studentHint && <Box>{teacher && <Typography variant="subtitle2">Ученику</Typography>}<Typography sx={{ whiteSpace: 'pre-wrap' }}>{studentHint}</Typography></Box>}
          </Stack>}
        </Paper>
      </ClickAwayListener>}
    </Popper>
  </>;
}
