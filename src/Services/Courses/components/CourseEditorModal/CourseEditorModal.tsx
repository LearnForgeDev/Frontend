import type { CourseEditorModalProps } from './CourseEditorModal.type';
import { Alert, Box, Button, TextField, Typography } from '@mui/material';

import { Modal } from '@/Assets/Components/Modal/Modal';
import { useCourseEditor } from '../../hooks/useCourseEditor';
import { useCourseDismissal } from '../../hooks/useCourseDismissal';
import CourseState from '../CourseState/CourseState';
import CourseProgramBuilder from '../CourseProgramBuilder/CourseProgramBuilder';
import CourseAccessPicker from '../CourseAccessPicker/CourseAccessPicker';
import CourseStudentPicker from '../CourseStudentPicker/CourseStudentPicker';
import { styles } from './CourseEditorModal.styles';

export default function CourseEditorModal({ schoolPublicId, course, onClose, onSaved }: CourseEditorModalProps) {
  const editor = useCourseEditor(schoolPublicId, onSaved, course);
  const dismissal = useCourseDismissal(editor.form, editor.isSaving, onClose);
  return (
    <Modal title={course ? 'Настройки курса' : 'Новый курс'} onClose={onClose} onRequestClose={dismissal.requestClose} disableClose={editor.isSaving}>
      <Box component="form" sx={styles.form} onSubmit={event => {
        event.preventDefault();
        void editor.submit();
      }} noValidate>
        <TextField label="Название курса" value={editor.form.title} onChange={event => editor.setField('title', event.target.value)} required autoFocus fullWidth disabled={editor.isSaving} />
        <TextField label="Описание" value={editor.form.description} onChange={event => editor.setField('description', event.target.value)} multiline minRows={2} fullWidth disabled={editor.isSaving} />
        {editor.isLoading && <CourseState kind="loading" title="Загружаем статьи и учеников" />}
        {editor.isError && <CourseState kind="error" title="Не удалось загрузить состав курса" actionLabel="Повторить" onAction={editor.retry} />}
        {!editor.isLoading && !editor.isError && <>
          <CourseProgramBuilder blocks={editor.form.blocks} resources={editor.resources} onChange={editor.setBlocks} disabled={editor.isSaving} />
          {editor.homeworkError && <Alert severity="warning" action={<Button onClick={editor.retry}>Повторить</Button>}>Не удалось загрузить домашние задания. Остальные блоки доступны.</Alert>}
          <CourseAccessPicker mode={editor.form.accessMode} onModeChange={editor.setAccessMode} groups={editor.groupOptions} selectedGroupIds={editor.form.groupIds} onGroupsChange={editor.setGroups} disabled={editor.isSaving} />
          {editor.form.accessMode === 'selected' && <CourseStudentPicker options={editor.studentOptions} selectedIds={editor.form.studentPublicIds} onChange={editor.setStudents} disabled={editor.isSaving} />}
        </>}
        {editor.needsCompletionChoice && <Alert severity="warning">
          Условия или содержимое блоков изменились. Сохранить уже полученные отметки о прохождении?
          <Box sx={styles.actions}>
            <Button onClick={() => void editor.submit(true)} disabled={editor.isSaving}>Сохранить прохождение</Button>
            <Button color="warning" onClick={() => void editor.submit(false)} disabled={editor.isSaving}>Сбросить прохождение</Button>
            <Button onClick={editor.cancelCompletionChoice} disabled={editor.isSaving}>Продолжить редактирование</Button>
          </Box>
        </Alert>}
        {editor.errorMessage && <Typography role="alert" variant="body2" sx={styles.error}>{editor.errorMessage}</Typography>}
        <Box sx={styles.actions}>
          <Button onClick={dismissal.requestClose} disabled={editor.isSaving} sx={styles.button}>Отмена</Button>
          <Button type="submit" variant="contained" disabled={editor.isSaving || editor.isSaveBlocked || editor.isLoading || editor.isError} sx={styles.button}>{editor.isSaving ? 'Сохраняем…' : course ? 'Сохранить' : 'Создать курс'}</Button>
        </Box>
        {dismissal.needsConfirmation && (
          <Alert severity="warning">
            Закрыть без сохранения?
            <Box sx={styles.actions}>
              <Button autoFocus onClick={dismissal.keepEditing} sx={styles.button}>Продолжить</Button>
              <Button color="error" onClick={dismissal.discard} disabled={editor.isSaving} sx={styles.button}>Не сохранять</Button>
            </Box>
          </Alert>
        )}
      </Box>
    </Modal>
  );
}
