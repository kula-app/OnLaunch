import ApiRoutes from "@/routes/apiRoutes";
import { returnDataOrThrowError } from "@/util/api";

const getApp = async (orgId: number, appId: number) => {
  const response = await fetch(ApiRoutes.getAppByOrgIdAndAppId(orgId, appId));

  return await returnDataOrThrowError(response);
};

export default getApp;
