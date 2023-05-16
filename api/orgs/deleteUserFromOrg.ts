import ApiRoutes from "../../routes/apiRoutes";
import { returnDataOrThrowError } from "../../util/api";

const deleteUserFromOrg = async (orgId: number, userEmail: string) => {
  const response = await fetch(
    ApiRoutes.getOrgUserByOrgIdAndUserEmail(orgId, userEmail),
    {
      method: "DELETE",
    }
  );

  return await returnDataOrThrowError(response);
};

export default deleteUserFromOrg;
