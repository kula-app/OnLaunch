import ApiRoutes from "@/routes/apiRoutes";
import { returnDataOrThrowError } from "@/util/api";

const createOrgAdminToken = async (orgId: number, tokenLabel: string) => {
  const response = await fetch(ApiRoutes.getOrgAdminTokensByOrgId(orgId), {
    method: "POST",
    body: JSON.stringify({ label: tokenLabel }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await returnDataOrThrowError(response);
};

export default createOrgAdminToken;
