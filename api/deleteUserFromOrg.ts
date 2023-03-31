import ApiRoutes from "../routes/apiRoutes";
import { returnDataOrThrowError } from "../util/api";

const deleteUserFromOrg = async (orgId: number, userId: number) => {
  const response = await fetch(
    ApiRoutes.getOrgUserByOrgIdAndUserId(orgId, userId),
    {
      method: "DELETE",
    }
  );

  return await returnDataOrThrowError(response);
};

export default deleteUserFromOrg;
