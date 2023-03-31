import ApiRoutes from "../routes/apiRoutes";
import { returnDataOrThrowError } from "../util/api";

const updateUserRoleInOrg = async (
  orgId: number,
  userId: number,
  role: string
) => {
  const response = await fetch(ApiRoutes.getOrgUsersByOrgId(orgId), {
    method: "PUT",
    body: JSON.stringify({ role: role, userId: userId, orgId: orgId }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await returnDataOrThrowError(response);
};

export default updateUserRoleInOrg;
