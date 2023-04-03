import ApiRoutes from "../../routes/apiRoutes";
import { returnDataOrThrowError } from "../../util/api";

const signupUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
) => {
  const response = await fetch(ApiRoutes.SIGNUP, {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      firstName,
      lastName,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await returnDataOrThrowError(response);
};

export default signupUser;
