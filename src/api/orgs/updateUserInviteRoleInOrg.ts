import ApiRoutes from "@/routes/apiRoutes";
import { returnDataOrThrowError } from "@/util/api";

const updateUserRoleInOrg = async (
  orgId: number,
  userEmail: string,
  role: string,
) => {
  const response = await fetch(
    ApiRoutes.getOrgUserByOrgIdAndUserEmail(orgId, userEmail),
    {
      method: "PUT",
      body: JSON.stringify({ role: role, userEmail: userEmail, orgId: orgId }),
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  return await returnDataOrThrowError(response);
};

export default updateUserRoleInOrg;
