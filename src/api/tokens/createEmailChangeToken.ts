import ApiRoutes from '@/routes/apiRoutes';
import { returnDataOrThrowError } from '@/util/api';

const createEmailChangeToken = async (emailNew: string) => {
  const response = await fetch(ApiRoutes.EMAIL_CHANGE, {
    method: 'POST',
    body: JSON.stringify({ emailNew: emailNew }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return await returnDataOrThrowError(response);
};

export default createEmailChangeToken;
