import { useEffect } from 'react';
import { studentsEndpoints } from '@/Endpoints/students/students.endpoints';
import { useHomeworkScope } from './useHomeworkScope';
import { homeworkActions } from '@/Storage/Homework/homework.slice';

export function useHomeworkAudience() {
  const { schoolPublicId, run, state, dispatch, scope } = useHomeworkScope();
  useEffect(() => {
    let active = true;
    void run(async () => {
      const [roster, studentGroups] = await Promise.all([studentsEndpoints.getStudentsSimple(schoolPublicId), studentsEndpoints.getStudentGroups(schoolPublicId)]);
      if (active) {
        const students = roster.flatMap(student => {
          const id = student.publicId ?? student.userPublicId;
          return id ? [{ publicId: id, name: student.fullName ?? student.name ?? student.displayName ?? student.userName ?? id }] : [];
        });
        dispatch(homeworkActions.audienceReceived({ scope, audience: { students, groups: studentGroups } }));
      }
    });
    return () => {
      active = false;
    };
  }, [schoolPublicId, run, dispatch, scope]);
  return state.audience ?? { students: [], groups: [] };
}
