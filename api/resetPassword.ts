import ApiRoutes from "../routes/apiRoutes";
import { returnDataOrThrowError } from "../util/api";

const resetPassword = async (
  token: string,
  password: string,
) => {
  const response = await fetch(ApiRoutes.PASSWORD_RESET, {
    method: "PUT",
    body: JSON.stringify({ token: token, password: password }),
    headers: {
        "Content-Type": "application/json",
    },
  });

  return await returnDataOrThrowError(response);
}

export default resetPassword;