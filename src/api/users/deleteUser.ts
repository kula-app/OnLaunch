import ApiRoutes from '@/routes/apiRoutes';
import { returnDataOrThrowError } from '@/util/api';

const deleteUser = async () => {
  const response = await fetch(ApiRoutes.USERS, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return await returnDataOrThrowError(response);
};

export default deleteUser;
