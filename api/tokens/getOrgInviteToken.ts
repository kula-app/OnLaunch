import ApiRoutes from "../../routes/apiRoutes";
import { returnDataOrThrowError } from "../../util/api";

const getOrgInviteToken = async (token: string) => {
  const response = await fetch(ApiRoutes.getOrgsInvitationByToken(token), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await returnDataOrThrowError(response);
};

export default getOrgInviteToken;
