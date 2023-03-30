import ApiRoutes from "../routes/apiRoutes";
import { returnDataOrThrowError } from "../util/api";

const deleteApp = async (
  orgId: number,
  appId: number,
) => {
  const response = await fetch(ApiRoutes.getAppByOrgIdAndAppId(orgId, appId), {
    method: "DELETE",
  });

  return await returnDataOrThrowError(response);
}

export default deleteApp;