import ApiRoutes from "../../routes/apiRoutes";
import { returnDataOrThrowError } from "../../util/api";

const createPasswordResetToken = async (email: string) => {
  const response = await fetch(ApiRoutes.PASSWORD_RESET, {
    method: "POST",
    body: JSON.stringify({ email }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await returnDataOrThrowError(response);
};

export default createPasswordResetToken;
