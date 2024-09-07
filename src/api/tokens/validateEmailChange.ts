import ApiRoutes from "@/routes/apiRoutes";
import { returnDataOrThrowError } from "@/util/api";

const validateEmailChange = async (token: string) => {
  const response = await fetch(ApiRoutes.EMAIL_CHANGE, {
    method: "PUT",
    body: JSON.stringify({ token: token }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await returnDataOrThrowError(response);
};

export default validateEmailChange;
