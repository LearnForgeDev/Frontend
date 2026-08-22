import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authEndpoints } from '@/Endpoints/auth/auth.endpoints';
import { schoolsEndpoints } from '@/Endpoints/schools/schools.endpoints';
import { useUser } from '@/Storage/UserContext/UserContext';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
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
      const identity = await authEndpoints.joinSchool({ inviteToken });
      useGlobalContext.getState().auth.setUser(identity);
      setUser(identity);

      const schools = await schoolsEndpoints.getMySchools();
      const joinedSchool =
        schools.find(
          (school) => !knownSchoolPublicIds.includes(school.schoolPublicId),
        ) ?? (schools.length === 1 ? schools[0] : null);

      return { school: joinedSchool };
    },
    onSuccess: async ({ school }) => {
      await queryClient.invalidateQueries({ queryKey: ['my-schools'] });

      navigate(
        school ? `/app/schools/${school.schoolPublicId}/today` : '/onboarding',
        { replace: true },
      );
    },
  });
}
