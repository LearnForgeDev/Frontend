import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authEndpoints } from '@/Endpoints/auth/auth.endpoints';
import { schoolsEndpoints } from '@/Endpoints/schools/schools.endpoints';
import { useUser } from '@/Storage/UserContext/UserContext';
import { normalizeRestoredSession } from '@/Endpoints/auth/utils';
import type { JoinSchoolResult } from '../types/onboarding.types';

type JoinSchoolVariables = {
  inviteToken: string;
  knownSchoolPublicIds: string[];
};

export function useJoinSchool() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser } = useUser();

  return useMutation<JoinSchoolResult, Error, JoinSchoolVariables>({
    mutationFn: async ({ inviteToken, knownSchoolPublicIds }) => {
      const identity = normalizeRestoredSession(await authEndpoints.joinSchool({ inviteToken }));
      if (!identity) throw new Error('Не удалось обновить сессию');
      setUser(identity);

      const schools = await schoolsEndpoints.getMySchools().catch(() => null);
      if (!schools) return { school: null };
      const joinedSchool =
        schools.find(
          (school) => !knownSchoolPublicIds.includes(school.schoolPublicId),
        ) ?? (schools.length === 1 ? schools[0] : null);

      return { school: joinedSchool };
    },
    onSuccess: async ({ school }) => {
      await queryClient.invalidateQueries({ queryKey: ['my-schools'] });

      navigate(
        school ? `/app/schools/${school.schoolPublicId}/today` : '/app/schools',
        { replace: true },
      );
    },
  });
}
