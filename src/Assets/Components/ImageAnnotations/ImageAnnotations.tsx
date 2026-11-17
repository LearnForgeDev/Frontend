import { useId, useRef, useState } from 'react';
import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CropFreeIcon from '@mui/icons-material/CropFree';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { boundRectangle, imagePoint, imageRectangle } from './ImageAnnotations.utils';
import type { ImageAnnotationsProps, ImagePoint, ImagePointerEvent, ImageRectangle } from './ImageAnnotations.type';

export default function ImageAnnotations({ src, alt, filePublicId, annotations, onChange, readOnly = false }: ImageAnnotationsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [rectangle, setRectangle] = useState<ImageRectangle | null>(null);
  const start = useRef<ImagePoint | null>(null);
  const baseId = useId();
  const editable = !readOnly && Boolean(onChange);
  const visible = annotations.filter(annotation => annotation.filePublicId === filePublicId);
  const selected = visible.find(annotation => annotation.publicId === selectedId);

  function updateSelected(patch: Partial<ImageRectangle> & { text?: string }) {
    if (!selected || !editable) {
      return;
    }
    const geometry = boundRectangle({ ...selected, ...patch });
    onChange?.(annotations.map(annotation => annotation.publicId === selected.publicId ? { ...annotation, ...patch, ...geometry } : annotation));
  }

  function addRegion(geometry: ImageRectangle) {
    const publicId = crypto.randomUUID();
    onChange?.([...annotations, { publicId, filePublicId, ...geometry, text: '' }]);
    setSelectedId(publicId);
    setDrawing(false);
    setRectangle(null);
    start.current = null;
  }

  function point(event: ImagePointerEvent) {
    return imagePoint({ x: event.clientX, y: event.clientY }, event.currentTarget.getBoundingClientRect());
  }

  function pointerDown(event: ImagePointerEvent) {
    if (!drawing || !editable || event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    start.current = point(event);
    setRectangle(imageRectangle(start.current, start.current));
  }

  function pointerMove(event: ImagePointerEvent) {
    if (!start.current) {
      return;
    }
    setRectangle(imageRectangle(start.current, point(event)));
  }

  function pointerUp(event: ImagePointerEvent) {
    if (!start.current) {
      return;
    }
    addRegion(imageRectangle(start.current, point(event)));
  }

  function cancelDrawing() {
    start.current = null;
    setRectangle(null);
    setDrawing(false);
  }

  return <Stack spacing={1.5}>
    {editable && <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: 'wrap' }}>
      <Button size="small" startIcon={<AddIcon />} onClick={() => addRegion({ x: 0.1, y: 0.1, width: 0.25, height: 0.15 })}>Добавить область</Button>
      <Button size="small" startIcon={<CropFreeIcon />} aria-pressed={drawing} onClick={() => drawing ? cancelDrawing() : setDrawing(true)}>{drawing ? 'Отменить выделение' : 'Выделить на изображении'}</Button>
    </Stack>}
    {drawing && <Typography variant="body2" id={`${baseId}-instructions`}>Проведите по изображению, чтобы выделить область. Escape отменяет выделение.</Typography>}
    <Box
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={cancelDrawing}
      onKeyDown={event => {
        if (event.key === 'Escape') {
          cancelDrawing();
        }
      }}
      tabIndex={drawing ? 0 : undefined}
      aria-describedby={drawing ? `${baseId}-instructions` : undefined}
      sx={{ position: 'relative', alignSelf: 'flex-start', display: 'inline-block', maxWidth: '100%', lineHeight: 0, touchAction: drawing ? 'none' : 'auto', cursor: drawing ? 'crosshair' : 'auto' }}
    >
      <Box component="img" src={src} alt={alt} draggable={false} sx={{ display: 'block', maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }} />
      {visible.map((annotation, index) => <Box
        component="button"
        type="button"
        key={annotation.publicId}
        aria-label={`Область ${index + 1}: ${annotation.text || 'без комментария'}`}
        aria-pressed={selectedId === annotation.publicId}
        aria-controls={`${baseId}-comment-${index}`}
        onPointerDown={event => event.stopPropagation()}
        onFocus={() => setSelectedId(annotation.publicId)}
        onClick={() => setSelectedId(annotation.publicId)}
        sx={{ position: 'absolute', left: `${annotation.x * 100}%`, top: `${annotation.y * 100}%`, width: `${annotation.width * 100}%`, height: `${annotation.height * 100}%`, padding: 0, border: '2px solid', borderColor: selectedId === annotation.publicId ? 'secondary.main' : 'primary.main', borderRadius: 0.5, backgroundColor: selectedId === annotation.publicId ? 'rgba(16, 100, 210, 0.16)' : 'transparent', cursor: 'pointer', '&:focus-visible': { outline: '3px solid', outlineColor: 'secondary.main', outlineOffset: 2 } }}
      >
        <Box component="span" sx={{ position: 'absolute', top: -1, left: -1, bgcolor: 'primary.main', color: 'primary.contrastText', minWidth: 22, height: 22, display: 'grid', placeItems: 'center', borderRadius: '0 0 4px 0', lineHeight: 1, fontWeight: 700 }}>{index + 1}</Box>
      </Box>)}
      {rectangle && <Box sx={{ pointerEvents: 'none', position: 'absolute', left: `${rectangle.x * 100}%`, top: `${rectangle.y * 100}%`, width: `${rectangle.width * 100}%`, height: `${rectangle.height * 100}%`, border: '2px dashed', borderColor: 'primary.main' }} />}
    </Box>
    {visible.length > 0 && <Stack component="ol" spacing={1} sx={{ m: 0, pl: 3 }} aria-label="Комментарии к областям">
      {visible.map((annotation, index) => <Box component="li" key={annotation.publicId}>
        <Button id={`${baseId}-comment-${index}`} size="small" sx={{ textAlign: 'left', justifyContent: 'flex-start', overflowWrap: 'anywhere' }} onClick={() => setSelectedId(annotation.publicId)} aria-pressed={selectedId === annotation.publicId}>
          {annotation.text || 'Добавьте комментарий'}
        </Button>
      </Box>)}
    </Stack>}
    {editable && selected && <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <TextField fullWidth multiline minRows={2} label="Комментарий к области" value={selected.text} onChange={event => updateSelected({ text: event.target.value })} helperText="Комментарий будет виден ученику после завершения проверки." />
        <IconButton aria-label="Удалить область" onClick={() => {
          onChange?.(annotations.filter(annotation => annotation.publicId !== selected.publicId));
          setSelectedId(null);
        }}><DeleteOutlineIcon /></IconButton>
      </Stack>
      <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: 'wrap' }}>
        {(['x', 'y', 'width', 'height'] satisfies (keyof ImageRectangle)[]).map((field, index) => <TextField
          key={field}
          size="small"
          type="number"
          label={['Слева, %', 'Сверху, %', 'Ширина, %', 'Высота, %'][index]}
          value={Math.round(selected[field] * 100)}
          slotProps={{ htmlInput: { min: field === 'width' || field === 'height' ? 1 : 0, max: 100, step: 1 } }}
          sx={{ width: 120 }}
          onChange={event => {
            const value = Number(event.target.value);
            if (Number.isFinite(value)) {
              updateSelected({ [field]: value / 100 });
            }
          }}
        />)}
      </Stack>
    </Stack>}
  </Stack>;
}
