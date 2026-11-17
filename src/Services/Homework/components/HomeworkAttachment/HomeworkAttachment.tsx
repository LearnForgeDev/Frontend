import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import ImageAnnotations from '@/Assets/Components/ImageAnnotations/ImageAnnotations';
import { useHomeworkFile } from '../../hooks/useHomeworkFile';
import type { HomeworkAttachmentProps } from './HomeworkAttachment.type';

export default function HomeworkAttachment(props: HomeworkAttachmentProps) {
  const { file, annotations = [], onAnnotations, onRemove, readOnly = true } = props;
  const isImage = Boolean(file.mimeType?.startsWith('image/'));
  const supportsAnnotations = ['image/png', 'image/jpeg', 'image/webp'].includes(file.mimeType ?? '');
  const source = useHomeworkFile({ ...props, filePublicId: file.publicId, isImage });
  return <Box sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
      <Typography variant="body2" sx={{ flex: 1, overflowWrap: 'anywhere' }}>{file.fileName}</Typography>
      <Button onClick={() => void source.download(file.fileName)}>Скачать</Button>
      {onRemove && <Button color="error" onClick={onRemove}>Убрать</Button>}
    </Stack>
    {source.error && <Alert severity="error" action={<Button onClick={source.retry}>Повторить</Button>}>Не удалось открыть файл.</Alert>}
    {isImage && !source.url && !source.error && <CircularProgress size={24} aria-label="Загрузка изображения" />}
    {isImage && source.url && <ImageAnnotations src={source.url} alt={file.altText || file.fileName} filePublicId={file.publicId} annotations={annotations} onChange={onAnnotations} readOnly={readOnly || !supportsAnnotations} />}
    {isImage && !readOnly && !supportsAnnotations && <Typography color="text.secondary" variant="body2">Отметки на изображении доступны для PNG, JPEG и WebP. Оставьте комментарий к ответу.</Typography>}
  </Box>;
}
