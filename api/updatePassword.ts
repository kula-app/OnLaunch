import ApiRoutes from "../routes/apiRoutes";
import { returnDataOrThrowError } from "../util/api";

const updatePassword = async (password: string, passwordOld: string) => {
  const response = await fetch(ApiRoutes.PASSWORD_CHANGE, {
    method: "PUT",
    body: JSON.stringify({ password: password, passwordOld: passwordOld }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await returnDataOrThrowError(response);
};

export default updatePassword;
