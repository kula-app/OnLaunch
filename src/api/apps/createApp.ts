import ApiRoutes from "@/routes/apiRoutes";
import { returnDataOrThrowError } from "@/util/api";

const createApp = async (orgId: number, appName: string) => {
  const response = await fetch(ApiRoutes.getAppsByOrgId(orgId), {
    method: "POST",
    body: JSON.stringify({
      name: appName,
      orgId: orgId,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await returnDataOrThrowError(response);
};

export default createApp;
