import type { HomeworkAttemptDto, HomeworkDto, HomeworkReviewInput } from '@/Endpoints/Homework/homework.type';
import type { HomeworkMetadataProps } from '@/Services/Homework/components/HomeworkMetadata/HomeworkMetadata.type';
import type { HomeworkAudienceProps } from '@/Services/Homework/components/HomeworkAudience/HomeworkAudience.type';
import type { HomeworkQuestionEditorProps } from '@/Services/Homework/components/HomeworkQuestionEditor/HomeworkQuestionEditor.type';
import type { HomeworkQuestionViewProps } from '@/Services/Homework/components/HomeworkQuestionView/HomeworkQuestionView.type';
import type { HomeworkStudentAnswerProps } from '@/Services/Homework/components/HomeworkStudentAnswer/HomeworkStudentAnswer.type';
import type { HomeworkAttachmentProps } from '@/Services/Homework/components/HomeworkAttachment/HomeworkAttachment.type';
import type { HomeworkCountdownProps } from '@/Services/Homework/components/HomeworkCountdown/HomeworkCountdown.type';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { homeworkAttempt, homeworkDefinition, homeworkQuestion, HOMEWORK_TEST_TIME } from '@/Services/Homework/homework.testUtils';
import HomeworkPage from '@/Services/Homework/HomeworkPage';
import HomeworkDetailPage from '@/Services/Homework/HomeworkDetailPage';
import HomeworkEditorPage from '@/Services/Homework/HomeworkEditorPage';
import HomeworkAttemptPage from '@/Services/Homework/HomeworkAttemptPage';
import HomeworkReviewPage from '@/Services/Homework/HomeworkReviewPage';
import { useHomeworkRealtime } from '@/Services/Homework/hooks/useHomeworkRealtime';
import HomeworkCountdown from '@/Services/Homework/components/HomeworkCountdown/HomeworkCountdown';

const navigate = vi.fn();
let canTeach = true;
let params: { homeworkPublicId?: string } = { homeworkPublicId: 'homework-1' };
let search = new URLSearchParams('course=course-1&item=item-1');
function makeHomeworkView(definition: HomeworkDto | undefined = homeworkDefinition()) {
  return { definition, homeworks: [homeworkDefinition({ canManage: true })], status: 'ready', error: null as string | null,
    schoolPublicId: 'school', userPublicId: 'student-1', busy: false, refresh: vi.fn(), load: vi.fn(),
    beginDraft: vi.fn(async (): Promise<HomeworkDto | null> => homeworkDefinition()), cancelQueue: vi.fn(async (): Promise<HomeworkDto | null> => homeworkDefinition()),
    remove: vi.fn(async () => true), forceFinish: vi.fn(), create: vi.fn(async (): Promise<HomeworkDto | null> => homeworkDefinition()),
    metadata: vi.fn(async () => true), access: vi.fn(async () => true), publish: vi.fn(async (): Promise<HomeworkDto | null> => homeworkDefinition()),
    reorder: vi.fn(), removeQuestion: vi.fn(), removeQuestionImage: vi.fn(), uploadQuestionImage: vi.fn(),
    saveQuestion: vi.fn(async () => homeworkQuestion()) };
}
function makeAttemptView(attempt: HomeworkAttemptDto | undefined = homeworkAttempt()) {
  return { attempt, schoolPublicId: 'school', state: { error: null as string | null }, editable: true, dirty: false,
    storageFailed: false, hasOtherDrafts: false, seconds: null as number | null, conflicted: [] as number[], busy: false,
    refresh: vi.fn(), save: vi.fn(), submit: vi.fn(), downloadDrafts: vi.fn(), discardConflict: vi.fn(),
    answerDraft: vi.fn(), recordAnswer: vi.fn(), upload: vi.fn(), removeFile: vi.fn() };
}
function makeReviewView() {
  const review: HomeworkReviewInput = { submissionNumber: 1, revision: 0, returnForRevision: false, reviewComment: null, answers: [{ questionId: 11, score: null, teacherComment: null, annotations: [] }] };
  return { review, busy: false, error: null as string | null, hasChanges: false, change: vi.fn(), save: vi.fn(), discard: vi.fn() };
}
let homeworkView: Omit<ReturnType<typeof makeHomeworkView>, 'definition'> & { definition: HomeworkDto | undefined } = makeHomeworkView();
let attemptView: Omit<ReturnType<typeof makeAttemptView>, 'attempt'> & { attempt: HomeworkAttemptDto | undefined } = makeAttemptView();
let reviewView = makeReviewView();
let attemptsView = { attempts: [] as HomeworkAttemptDto[], busy: false, isLoaded: true, refresh: vi.fn(), start: vi.fn(async (): Promise<HomeworkAttemptDto | null> => homeworkAttempt()) };
vi.mock('react-router-dom', () => ({ useNavigate: () => navigate, useParams: () => params, useSearchParams: () => [search, vi.fn()] }));
vi.mock('@/Services/AppShell/hooks/useCurrentSchool', () => ({ useCurrentSchool: () => ({ capabilities: { canTeach } }) }));
vi.mock('@/Services/Homework/hooks/useHomework', () => ({ useHomework: () => homeworkView }));
vi.mock('@/Services/Homework/hooks/useHomeworkAttempt', () => ({ useHomeworkAttempt: () => attemptView }));
vi.mock('@/Services/Homework/hooks/useHomeworkAttempts', () => ({ useHomeworkAttempts: () => attemptsView }));
vi.mock('@/Services/Homework/hooks/useHomeworkReview', () => ({ useHomeworkReview: () => reviewView }));
vi.mock('@/Services/Homework/hooks/useHomeworkRealtime', () => ({ useHomeworkRealtime: vi.fn() }));
vi.mock('next/dynamic', () => ({ default: () => () => <div>Форматированный ответ</div> }));
vi.mock('@/Services/Homework/components/HomeworkMetadata/HomeworkMetadata', () => ({ default: (props: HomeworkMetadataProps) => <button disabled={props.busy} onClick={() => void props.onSave({ title: 'Новое задание', description: null, passingScore: 1, maxAttempts: null, deadlineUtc: null })}>Сохранить метаданные</button> }));
vi.mock('@/Services/Homework/components/HomeworkAudience/HomeworkAudience', () => ({ default: (props: HomeworkAudienceProps) => <button onClick={() => void props.onSave({ allowedUserPublicIds: ['student-1'], allowedGroupIds: [] })}>Сохранить аудиторию</button> }));
vi.mock('@/Services/Homework/components/HomeworkQuestionEditor/HomeworkQuestionEditor', () => ({ default: (props: HomeworkQuestionEditorProps) => <section aria-label="Редактор вопроса"><output aria-label="Позиция вопроса">{props.position}</output><button onClick={props.onCancel}>Отменить вопрос</button><button onClick={() => void props.onSave({ ...homeworkQuestion(), position: props.question?.position ?? props.position, options: [] })}>Сохранить вопрос</button></section> }));
vi.mock('@/Services/Homework/components/HomeworkQuestionView/HomeworkQuestionView', () => ({ default: ({ question, children }: HomeworkQuestionViewProps) => <section aria-label={`Вопрос ${question.id}`}><h2>{question.text}</h2>{children}</section> }));
vi.mock('@/Services/Homework/components/HomeworkStudentAnswer/HomeworkStudentAnswer', () => ({ default: (props: HomeworkStudentAnswerProps) => <div><button disabled={props.disabled} onClick={() => props.onChange({ questionId: props.question.id, textValue: 'Ответ' })}>Изменить ответ</button><button onClick={() => props.onUpload(new File(['x'], 'work.png', { type: 'image/png' }))}>Загрузить работу</button><button onClick={() => props.onRemoveFile('file-1')}>Убрать файл</button></div> }));
vi.mock('@/Services/Homework/components/HomeworkAttachment/HomeworkAttachment', () => ({ default: (props: HomeworkAttachmentProps) => <div><span>{props.file.fileName}</span>{props.onRemove && <button onClick={props.onRemove}>Удалить изображение вопроса</button>}{props.onAnnotations && <button onClick={() => props.onAnnotations?.([{ publicId: 'annotation', filePublicId: props.file.publicId, x: 0.1, y: 0.1, width: 0.2, height: 0.2, text: 'Проверьте' }])}>Разметить изображение</button>}</div> }));
vi.mock('@/Services/Homework/components/HomeworkHint/HomeworkHint', () => ({ default: () => <span>Подсказка</span> }));
vi.mock('@/Services/Homework/components/HomeworkCountdown/HomeworkCountdown', () => ({ default: vi.fn((props: HomeworkCountdownProps) => <span data-deadline={props.deadline}>Осталось 30 секунд</span>) }));

beforeEach(() => {
  homeworkView = makeHomeworkView();
  attemptView = makeAttemptView();
  reviewView = makeReviewView();
  attemptsView = { attempts: [], busy: false, isLoaded: true, refresh: vi.fn(), start: vi.fn(async (): Promise<HomeworkAttemptDto | null> => homeworkAttempt()) };
  params = { homeworkPublicId: 'homework-1' };
  search = new URLSearchParams('course=course-1&item=item-1');
  canTeach = true;
});
afterEach(cleanup);

describe('Homework catalogue', () => {
  it('opens assignments, exposes teacher creation and retries a failed read', () => {
    const view = render(<HomeworkPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Открыть' }));
    expect(navigate).toHaveBeenLastCalledWith('homework-1');
    fireEvent.click(screen.getByRole('button', { name: 'Создать задание' }));
    expect(navigate).toHaveBeenLastCalledWith('new');
    homeworkView.error = 'Не удалось загрузить';
    view.rerender(<HomeworkPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(homeworkView.refresh).toHaveBeenCalled();
  });
  it('distinguishes loading and empty student views', () => {
    canTeach = false;
    homeworkView.homeworks = [];
    homeworkView.status = 'loading';
    const view = render(<HomeworkPage />);
    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Создать задание' })).toBeNull();
    homeworkView.status = 'ready';
    view.rerender(<HomeworkPage />);
    expect(screen.getByText('Здесь появятся домашние задания')).toBeTruthy();
  });
});

describe('Homework details', () => {
  it('encodes the originating course and stable item while supporting a return without item context', () => {
    search = new URLSearchParams({ course: 'course/one?two', item: 'item?one&two' });
    const view = render(<HomeworkDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Вернуться к курсу' }));
    expect(navigate).toHaveBeenLastCalledWith('/app/schools/school/courses/course%2Fone%3Ftwo?item=item%3Fone%26two');
    search = new URLSearchParams('course=course-1');
    view.rerender(<HomeworkDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Вернуться к курсу' }));
    expect(navigate).toHaveBeenLastCalledWith('/app/schools/school/courses/course-1');
  });
  it.each([true, false])('retains an armed deadline after publication or queue cancellation, published=%s', published => {
    homeworkView.definition = homeworkDefinition({ canManage: true, activeVersion: published ? 2 : 1, draftVersion: published ? null : 2, queuedVersion: null, blockers: [] });
    const deadline = '2026-11-17T12:01:00Z';
    const armed = homeworkAttempt({ status: published ? 0 : 4, forceSubmitAtUtc: deadline, serverTimeUtc: '2026-11-17T12:00:30Z' });
    attemptsView.attempts = [armed];
    const view = render(<HomeworkDetailPage />);
    expect(screen.queryByText(/ожидает публикации/)).toBeNull();
    expect(screen.getByText('Осталось 30 секунд')).toBeTruthy();
    expect(screen.getByText(new Date(deadline).toLocaleString('ru-RU')).getAttribute('datetime')).toBe(deadline);
    expect(vi.mocked(HomeworkCountdown).mock.calls.at(-1)?.[0]).toEqual({ deadline, serverTimeUtc: armed.serverTimeUtc });
    attemptsView.attempts = [{ ...armed, status: 2 }];
    view.rerender(<HomeworkDetailPage />);
    expect(screen.queryByText('Осталось 30 секунд')).toBeNull();
    attemptsView.attempts = [armed];
    homeworkView.definition = homeworkDefinition({ canManage: false });
    view.rerender(<HomeworkDetailPage />);
    expect(screen.queryByText('Осталось 30 секунд')).toBeNull();
  });
  it('keeps realtime invalidation stable and refreshes both definition and attempt roster', async () => {
    const view = render(<HomeworkDetailPage />);
    const refresh = vi.mocked(useHomeworkRealtime).mock.calls.at(-1)?.[2];
    expect(refresh).toBeTypeOf('function');
    await refresh?.();
    expect(homeworkView.load).toHaveBeenCalledOnce();
    expect(attemptsView.refresh).toHaveBeenCalledOnce();
    view.rerender(<HomeworkDetailPage />);
    expect(vi.mocked(useHomeworkRealtime).mock.calls.at(-1)?.[2]).toBe(refresh);
  });
  it('shows recovery before a definition loads', () => {
    homeworkView.definition = undefined;
    const view = render(<HomeworkDetailPage />);
    expect(screen.getByRole('progressbar')).toBeTruthy();
    homeworkView.error = 'Ошибка чтения';
    view.rerender(<HomeworkDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(homeworkView.load).toHaveBeenCalled();
  });
  it('blocks new attempts during publication but resumes an existing pinned attempt', async () => {
    homeworkView.definition = homeworkDefinition({ publicationState: 'Queued' });
    const view = render(<HomeworkDetailPage />);
    expect(screen.getByRole('button', { name: 'Начать выполнение' }).hasAttribute('disabled')).toBe(true);
    attemptsView.attempts = [homeworkAttempt({ status: 4 })];
    view.rerender(<HomeworkDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Продолжить попытку' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/app/schools/school/homework/homework-1/attempts/attempt-1?course=course-1&item=item-1'));
    fireEvent.click(screen.getByRole('button', { name: 'Вернуться к курсу' }));
    expect(navigate).toHaveBeenLastCalledWith('/app/schools/school/courses/course-1?item=item-1');
    fireEvent.click(screen.getByRole('button', { name: 'Открыть' }));
    expect(navigate).toHaveBeenLastCalledWith('/app/schools/school/homework/homework-1/attempts/attempt-1?course=course-1&item=item-1');
    fireEvent.click(screen.getByRole('button', { name: 'Все домашние задания' }));
    expect(navigate).toHaveBeenLastCalledWith('..', { relative: 'path' });
  });
  it('lets managers inspect blockers, arm a finish deadline and cancel the queued publication', async () => {
    homeworkView.definition = homeworkDefinition({ canManage: true, publicationState: 'Queued', queuedVersion: 2, deadlineUtc: HOMEWORK_TEST_TIME, maxAttempts: 3,
      blockers: [{ attemptPublicId: 'attempt-1', studentPublicId: 'student-1', studentName: 'Анна', leaseExpiresAtUtc: HOMEWORK_TEST_TIME, forceSubmitAtUtc: null }, { attemptPublicId: 'attempt-2', studentPublicId: 'student-2', studentName: 'Иван', leaseExpiresAtUtc: HOMEWORK_TEST_TIME, forceSubmitAtUtc: HOMEWORK_TEST_TIME }] });
    attemptsView.attempts = [homeworkAttempt({ status: 3, score: 1, maxScore: 1 })];
    render(<HomeworkDetailPage />);
    expect(screen.getByRole('button', { name: 'Редактировать' }).hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Завершить через 60 секунд' }));
    expect(homeworkView.forceFinish).toHaveBeenCalledWith('attempt-1');
    expect(screen.getByText('Осталось 30 секунд')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Открыть работу' }));
    expect(navigate).toHaveBeenLastCalledWith('/app/schools/school/homework/homework-1/attempts/attempt-1/review?course=course-1&item=item-1');
    fireEvent.click(screen.getByRole('button', { name: 'Отменить публикацию и изменить' }));
    await waitFor(() => expect(homeworkView.cancelQueue).toHaveBeenCalled());
    await waitFor(() => expect(navigate).toHaveBeenLastCalledWith('/app/schools/school/homework/homework-1/edit'));
  });
  it('starts a draft and confirms deletion only after explicit dialog action', async () => {
    homeworkView.definition = homeworkDefinition({ canManage: true });
    render(<HomeworkDetailPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Редактировать' }));
    await waitFor(() => expect(homeworkView.beginDraft).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Удалить' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Отмена' }));
    expect(homeworkView.remove).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    fireEvent.click(screen.getByRole('button', { name: 'Удалить' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Удалить' }));
    await waitFor(() => expect(homeworkView.remove).toHaveBeenCalledWith('homework-1'));
    await waitFor(() => expect(navigate).toHaveBeenLastCalledWith('/app/schools/school/homework'));
  });
});

describe('Homework editor', () => {
  it('creates metadata before navigating into the real draft editor', async () => {
    params = {};
    render(<HomeworkEditorPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить метаданные' }));
    await waitFor(() => expect(homeworkView.create).toHaveBeenCalledWith(expect.objectContaining({ title: 'Новое задание', allowedUserPublicIds: [], allowedGroupIds: [] })));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/app/schools/school/homework/homework-1/edit'));
    fireEvent.click(screen.getByRole('button', { name: 'Все задания' }));
    expect(navigate).toHaveBeenLastCalledWith('/app/schools/school/homework');
  });
  it('exposes loading, retry, denied access and immutable-version states', () => {
    homeworkView.definition = undefined;
    const view = render(<HomeworkEditorPage />);
    expect(screen.getByRole('progressbar')).toBeTruthy();
    homeworkView.error = 'Не удалось открыть';
    view.rerender(<HomeworkEditorPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(homeworkView.load).toHaveBeenCalled();
    homeworkView.definition = homeworkDefinition();
    view.rerender(<HomeworkEditorPage />);
    expect(screen.getByText('Редактирование недоступно.')).toBeTruthy();
    homeworkView.definition = homeworkDefinition({ canManage: true });
    view.rerender(<HomeworkEditorPage />);
    expect(screen.getByText(/Эта версия зафиксирована/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Добавить вопрос' }).hasAttribute('disabled')).toBe(true);
  });
  it('saves metadata/audience, edits questions, changes order and publishes', async () => {
    homeworkView.definition = homeworkDefinition({ canManage: true, canEditDefinition: true, questions: [homeworkQuestion(), homeworkQuestion({ id: 12, position: 1, text: 'Второй вопрос' })] });
    render(<HomeworkEditorPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить метаданные' }));
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить аудиторию' }));
    expect(homeworkView.metadata).toHaveBeenCalled();
    expect(homeworkView.access).toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole('button', { name: 'Ниже' })[0]);
    expect(homeworkView.reorder).toHaveBeenLastCalledWith([12, 11]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Выше' })[1]);
    expect(homeworkView.reorder).toHaveBeenLastCalledWith([12, 11]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Изменить' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить вопрос' }));
    await waitFor(() => expect(homeworkView.saveQuestion).toHaveBeenCalledWith(11, expect.objectContaining({ points: 1 })));
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Редактор вопроса' })).toBeNull());
    fireEvent.click(screen.getByRole('button', { name: 'Добавить вопрос' }));
    fireEvent.click(screen.getByRole('button', { name: 'Отменить вопрос' }));
    fireEvent.click(screen.getByRole('button', { name: 'Добавить вопрос' }));
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить вопрос' }));
    await waitFor(() => expect(homeworkView.saveQuestion).toHaveBeenLastCalledWith(null, expect.any(Object)));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Опубликовать версию 1' }).hasAttribute('disabled')).toBe(false));
    fireEvent.click(screen.getByRole('button', { name: 'Опубликовать версию 1' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/app/schools/school/homework/homework-1'));
    fireEvent.click(screen.getAllByRole('button', { name: 'Удалить' })[1]);
    expect(homeworkView.removeQuestion).toHaveBeenCalledWith(12);
  });
  it('passes question image uploads and removals to the owning hook', () => {
    homeworkView.definition = homeworkDefinition({ canManage: true, canEditDefinition: true, questions: [homeworkQuestion({ files: [{ publicId: 'file-1', fileName: 'Условие.png', sizeBytes: 1, mimeType: 'image/png', position: 0 }, { publicId: 'file-3', fileName: 'Продолжение.png', sizeBytes: 1, mimeType: 'image/png', position: 2 }] })] });
    const view = render(<HomeworkEditorPage />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Удалить изображение вопроса' })[0]);
    expect(homeworkView.removeQuestionImage).toHaveBeenCalledWith(11, 'file-1');
    const file = new File(['x'], 'condition.png', { type: 'image/png' });
    fireEvent.change(view.container.querySelector('input[type=file]')!, { target: { files: [file] } });
    expect(homeworkView.uploadQuestionImage).toHaveBeenCalledWith(11, file, 3);
    fireEvent.click(screen.getByRole('button', { name: 'К заданию' }));
    expect(navigate).toHaveBeenCalledWith('/app/schools/school/homework/homework-1');
  });
  it('appends a new question after the highest surviving position following deletion', async () => {
    homeworkView.definition = homeworkDefinition({ canManage: true, canEditDefinition: true, questions: [homeworkQuestion(), homeworkQuestion({ id: 13, position: 2 })] });
    render(<HomeworkEditorPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Добавить вопрос' }));
    expect(screen.getByLabelText('Позиция вопроса').textContent).toBe('3');
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить вопрос' }));
    await waitFor(() => expect(homeworkView.saveQuestion).toHaveBeenCalledWith(null, expect.objectContaining({ position: 3 })));
  });
});

describe('Student attempt', () => {
  it('offers loading and read retry before the pinned attempt arrives', () => {
    attemptView.attempt = undefined;
    const view = render(<HomeworkAttemptPage />);
    expect(screen.getByRole('progressbar')).toBeTruthy();
    attemptView.state.error = 'Ошибка чтения';
    view.rerender(<HomeworkAttemptPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(attemptView.refresh).toHaveBeenCalled();
  });
  it('preserves course return context and routes answer/save/submit actions through the public hook', () => {
    attemptView.dirty = true;
    attemptView.storageFailed = true;
    attemptView.hasOtherDrafts = true;
    attemptView.seconds = 30;
    render(<HomeworkAttemptPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Изменить ответ' }));
    expect(attemptView.recordAnswer).toHaveBeenCalledWith({ questionId: 11, textValue: 'Ответ' });
    fireEvent.click(screen.getByRole('button', { name: 'Загрузить работу' }));
    expect(attemptView.upload).toHaveBeenCalledWith(11, expect.any(File));
    fireEvent.click(screen.getByRole('button', { name: 'Убрать файл' }));
    expect(attemptView.removeFile).toHaveBeenCalledWith(11, 'file-1');
    fireEvent.click(screen.getByRole('button', { name: 'Скачать черновики' }));
    expect(attemptView.downloadDrafts).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить ответы' }));
    fireEvent.click(screen.getByRole('button', { name: 'Сдать работу' }));
    expect(attemptView.save).toHaveBeenCalled();
    expect(attemptView.submit).toHaveBeenCalled();
    expect(screen.getByText(/Осталось 30 сек/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Вернуться к курсу' }));
    expect(navigate).toHaveBeenCalledWith('/app/schools/school/courses/course-1?item=item-1');
  });
  it('disables conflicted answers and keeps forced/unsaved recovery visible', () => {
    attemptView.attempt = homeworkAttempt({ wasForced: true, status: 1, score: 0, maxScore: 1, reviewComment: 'Проверьте решение' });
    attemptView.editable = false;
    attemptView.dirty = true;
    attemptView.conflicted = [11];
    attemptView.seconds = 0;
    attemptView.state.error = 'Не удалось сохранить';
    render(<HomeworkAttemptPage />);
    expect(screen.getByRole('button', { name: 'Изменить ответ' }).hasAttribute('disabled')).toBe(true);
    expect(screen.queryByRole('button', { name: 'Сдать работу' })).toBeNull();
    expect(screen.getByText(/Сервер отправляет сохранённые ответы/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Загрузить с сервера' }));
    expect(attemptView.discardConflict).toHaveBeenCalledWith(11);
    fireEvent.click(screen.getByRole('button', { name: 'Повторить сохранение' }));
    expect(attemptView.save).toHaveBeenCalled();
  });
});

it('keeps a selected historical null grade/comment separate from released current feedback', () => {
  attemptView.attempt = homeworkAttempt({ status: 3, score: 1, maxScore: 1, passed: true, reviewComment: 'Комментарий текущей проверки',
    submissions: [{ submissionNumber: 1, submittedAt: HOMEWORK_TEST_TIME, checkedAt: null, status: 1, score: null, maxScore: 1, passed: null, reviewComment: null, wasForced: false, answers: [] }] });
  attemptView.editable = false;
  render(<HomeworkAttemptPage />);
  expect(screen.getByText('Результат: 1 / 1 баллов.')).toBeTruthy();
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'История сдач' }));
  fireEvent.click(screen.getByRole('option', { name: /Сдача 1/ }));
  expect(screen.queryByText('Результат: 1 / 1 баллов.')).toBeNull();
  expect(screen.queryByText('Комментарий текущей проверки')).toBeNull();
  expect(screen.getByRole('button', { name: 'Изменить ответ' }).hasAttribute('disabled')).toBe(true);
});

it('keeps the detail route when starting or drafting failed', async () => {
  attemptsView.start.mockResolvedValueOnce(null);
  const view = render(<HomeworkDetailPage />);
  fireEvent.click(screen.getByRole('button', { name: 'Начать выполнение' }));
  await waitFor(() => expect(attemptsView.start).toHaveBeenCalled());
  expect(navigate).not.toHaveBeenCalled();
  homeworkView.definition = homeworkDefinition({ canManage: true });
  homeworkView.beginDraft.mockResolvedValueOnce(null);
  view.rerender(<HomeworkDetailPage />);
  fireEvent.click(screen.getByRole('button', { name: 'Редактировать' }));
  await waitFor(() => expect(homeworkView.beginDraft).toHaveBeenCalled());
  expect(navigate).not.toHaveBeenCalled();
});

describe('Teacher review', () => {
  it('offers loading/read recovery and rejects non-managers', () => {
    attemptView.attempt = undefined;
    const view = render(<HomeworkReviewPage />);
    expect(screen.getByRole('progressbar')).toBeTruthy();
    attemptView.state.error = 'Ошибка чтения';
    view.rerender(<HomeworkReviewPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(attemptView.refresh).toHaveBeenCalled();
    attemptView.attempt = homeworkAttempt();
    view.rerender(<HomeworkReviewPage />);
    expect(screen.getByText('Проверка недоступна.')).toBeTruthy();
  });
  it('changes private scores/comments/annotations and explicitly releases or returns review', () => {
    const file = { publicId: 'file-1', fileName: 'Решение.png', sizeBytes: 1, mimeType: 'image/png' };
    attemptView.attempt = homeworkAttempt({ status: 1, wasForced: true, homework: homeworkDefinition({ canManage: true }), answers: [{ questionId: 11, revision: 1, textValue: 'Решение', richText: null, selectedOptionIds: [], score: null, isCorrect: null, teacherComment: null, files: [file], annotations: [] }] });
    reviewView.error = 'Не удалось сохранить проверку';
    reviewView.hasChanges = true;
    const view = render(<HomeworkReviewPage />);
    fireEvent.change(screen.getByLabelText('Баллы за вопрос 1'), { target: { value: '0.5' } });
    expect(reviewView.change).toHaveBeenLastCalledWith(expect.objectContaining({ answers: [expect.objectContaining({ score: 0.5 })] }));
    fireEvent.change(screen.getByLabelText('Комментарий к ответу'), { target: { value: 'Поясните шаг' } });
    fireEvent.change(screen.getByLabelText('Общий комментарий'), { target: { value: 'Продолжайте' } });
    fireEvent.click(screen.getByRole('button', { name: 'Разметить изображение' }));
    expect(reviewView.change).toHaveBeenLastCalledWith(expect.objectContaining({ answers: [expect.objectContaining({ annotations: [expect.objectContaining({ filePublicId: 'file-1' })] })] }));
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить приватный черновик' }));
    expect(reviewView.save).toHaveBeenLastCalledWith();
    fireEvent.click(screen.getByRole('button', { name: 'Завершить проверку' }));
    expect(reviewView.save).toHaveBeenLastCalledWith(true);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Вернуть на доработку' }));
    expect(reviewView.change).toHaveBeenLastCalledWith(expect.objectContaining({ returnForRevision: true }));
    reviewView.review.returnForRevision = true;
    view.rerender(<HomeworkReviewPage />);
    expect(screen.getByRole('button', { name: 'Вернуть ученику' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Загрузить серверный черновик' }));
    expect(reviewView.discard).toHaveBeenCalled();
    expect(attemptView.refresh).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'К работам учеников' }));
    expect(navigate).toHaveBeenCalledWith('/app/schools/school/homework/homework-1');
  });
  it('renders objective answer keys and locks released reviews', () => {
    const question = homeworkQuestion({ questionType: 1, options: [{ id: 9, position: 0, text: 'Правильный вариант', value: null, isCorrect: true }] });
    attemptView.attempt = homeworkAttempt({ status: 3, homework: homeworkDefinition({ canManage: true, questions: [question] }), answers: [{ questionId: 11, revision: 1, textValue: null, richText: null, selectedOptionIds: [9], score: 1, isCorrect: true, teacherComment: null, files: [], annotations: [] }] });
    render(<HomeworkReviewPage />);
    expect(screen.getByText('Правильный вариант', { exact: true })).toBeTruthy();
    expect(screen.getByText('Правильные: Правильный вариант')).toBeTruthy();
    expect(screen.getByLabelText('Баллы за вопрос 1').hasAttribute('disabled')).toBe(true);
    expect(screen.queryByRole('button', { name: 'Завершить проверку' })).toBeNull();
  });
});
