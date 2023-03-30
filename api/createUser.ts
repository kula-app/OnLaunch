import ApiRoutes from "../routes/apiRoutes";

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

  const data = await response.json();

  if (!response.ok) {
      throw new Error (data.message || 'an error occurred');
  }

  return data;
}

export default createUser;