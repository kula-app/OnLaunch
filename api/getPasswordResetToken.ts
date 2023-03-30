import ApiRoutes from "../routes/apiRoutes";
import { returnDataOrThrowError } from "../util/api";

const getPasswordResetToken = async (
  token: string, 
) => {
  const response = await fetch(ApiRoutes.getPasswordResetByToken(token as string), {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
    },
  });

  return await returnDataOrThrowError(response);
}

export default getPasswordResetToken;