import ApiRoutes from "../routes/apiRoutes";
import { returnDataOrThrowError } from "../util/api";

const joinOrgViaDirectInvite = async (
  token: string, 
) => {
  const response = await fetch(
    ApiRoutes.DIRECT_INVITATION + "/" + token, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
  });

  return await returnDataOrThrowError(response);
}

export default joinOrgViaDirectInvite;