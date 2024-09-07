import ApiRoutes from '@/routes/apiRoutes';
import { returnDataOrThrowError } from '@/util/api';

const deleteOrg = async (orgId: number) => {
  const response = await fetch(ApiRoutes.getOrgById(orgId), {
    method: 'DELETE',
  });

  return await returnDataOrThrowError(response);
};

export default deleteOrg;
