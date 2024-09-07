import ApiRoutes from '@/routes/apiRoutes';
import { returnDataOrThrowError } from '@/util/api';

const inviteUser = async (orgId: number, email: string) => {
  const response = await fetch(ApiRoutes.getOrgUsersByOrgId(orgId), {
    method: 'POST',
    body: JSON.stringify({ email: email }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return await returnDataOrThrowError(response);
};

export default inviteUser;
