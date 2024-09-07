import ApiRoutes from "@/routes/apiRoutes";
import { returnDataOrThrowError } from "@/util/api";

const resetOrgInvitationToken = async (token: string) => {
  const response = await fetch(ApiRoutes.getOrgsInvitationByToken(token), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await returnDataOrThrowError(response);
};

export default resetOrgInvitationToken;
