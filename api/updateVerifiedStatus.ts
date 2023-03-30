import ApiRoutes from "../routes/apiRoutes";
import { returnDataOrThrowError } from "../util/api";

const updateVerifiedStatus = async (
  token: string,
) => {
  const response = await fetch(ApiRoutes.VERIFICATION, {
    method: "PUT",
    body: JSON.stringify({ token: token }),
    headers: {
        "Content-Type": "application/json",
    },
  });

  return await returnDataOrThrowError(response);
}

export default updateVerifiedStatus;