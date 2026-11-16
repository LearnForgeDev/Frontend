import dynamic from 'next/dynamic';
import { Paper, Stack, Typography } from '@mui/material';
import HomeworkHint from '../HomeworkHint/HomeworkHint';
import HomeworkAttachment from '../HomeworkAttachment/HomeworkAttachment';
import type { HomeworkQuestionViewProps } from './HomeworkQuestionView.type';

const RichTextEditor = dynamic(() => import('@/Assets/Components/RichTextEditor/RichTextEditor'), { ssr: false });

export default function HomeworkQuestionView({ question, schoolPublicId, homeworkPublicId, teacher, children }: HomeworkQuestionViewProps) {
  return <Paper component="section" aria-label={`Вопрос ${question.position + 1}`} variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}><Stack spacing={2}>
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}><Typography variant="subtitle1" sx={{ flex: 1 }}>Вопрос {question.position + 1}{question.isRequired ? ' · обязательный' : ''}</Typography><Typography variant="body2">{question.points} б.</Typography><HomeworkHint teacher={teacher} studentHint={question.studentHint} teacherHint={question.teacherHint} /></Stack>
    {question.richText ? <RichTextEditor value={question.richText} readOnly label={`Условие вопроса ${question.position + 1}`} /> : <Typography sx={{ whiteSpace: 'pre-wrap' }}>{question.text}</Typography>}
    {question.files.map(file => <HomeworkAttachment key={file.publicId} schoolPublicId={schoolPublicId} homeworkPublicId={homeworkPublicId} questionId={question.id} file={file} />)}
    {children}
  </Stack></Paper>;
}
