import { Box, Button, TextField, Typography } from '@mui/material';
import type { CourseDetail } from '@/Endpoints/courses';
import { Modal } from '@/Assets/Components/Modal/Modal';
import { useCourseEditor } from '../../hooks/useCourseEditor';
import CourseState from '../CourseState/CourseState';
import CourseLessonPicker from '../CourseLessonPicker/CourseLessonPicker';
import CourseStudentPicker from '../CourseStudentPicker/CourseStudentPicker';
import { styles } from './CourseEditorModal.styles';

interface CourseEditorModalProps {
  schoolPublicId: string;
  course?: CourseDetail;
  onClose: () => void;
  onSaved: (course: CourseDetail) => void;
}

export default function CourseEditorModal({ schoolPublicId, course, onClose, onSaved }: CourseEditorModalProps) {
  const editor = useCourseEditor(schoolPublicId, onSaved, course);
  return (
    <Modal title={course ? 'Настройки курса' : 'Новый курс'} onClose={onClose}>
      <Box component="form" sx={styles.form} onSubmit={event => { event.preventDefault(); editor.submit(); }} noValidate>
        <TextField label="Название курса" value={editor.form.title} onChange={event => editor.setField('title', event.target.value)} required autoFocus fullWidth disabled={editor.isSaving} />
        <TextField label="Описание" value={editor.form.description} onChange={event => editor.setField('description', event.target.value)} multiline minRows={2} fullWidth disabled={editor.isSaving} />
        {editor.isLoading && <CourseState kind="loading" title="Загружаем уроки и учеников" />}
        {editor.isError && <CourseState kind="error" title="Не удалось загрузить состав курса" actionLabel="Повторить" onAction={editor.retry} />}
        {!editor.isLoading && !editor.isError && <>
          <CourseLessonPicker options={editor.lessonOptions} selected={editor.selectedLessons} onChange={editor.setLessons} onMove={editor.moveLesson} disabled={editor.isSaving} />
          <CourseStudentPicker options={editor.studentOptions} selectedIds={editor.form.studentPublicIds} onChange={editor.setStudents} disabled={editor.isSaving} />
        </>}
        {editor.form.error && <Typography role="alert" variant="body2" sx={styles.error}>{editor.form.error}</Typography>}
        <Box sx={styles.actions}>
          <Button onClick={onClose} disabled={editor.isSaving} sx={styles.button}>Отмена</Button>
          <Button type="submit" variant="contained" disabled={editor.isSaving || editor.isLoading || editor.isError} sx={styles.button}>{editor.isSaving ? 'Сохраняем…' : course ? 'Сохранить' : 'Создать курс'}</Button>
        </Box>
      </Box>
    </Modal>
  );
}
