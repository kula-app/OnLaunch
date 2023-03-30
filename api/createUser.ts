import ApiRoutes from "../routes/apiRoutes";
import { returnDataOrThrowError } from "../util/api";

const createUser = async (
  email: string, 
  password: string, 
  firstName: string, 
  lastName: string,
) => {
  const response = await fetch(ApiRoutes.USERS, {
    method: 'POST',
    body: JSON.stringify({ 
      email, 
      password, 
      firstName, 
      lastName,
    }),
    headers: {
        'Content-Type':  'application/json'
    }
  });

  return await returnDataOrThrowError(response);
}

export default createUser;