import ApiRoutes from "../routes/apiRoutes";
import { returnDataOrThrowError } from "../util/api";

const updateApp = async (
  orgId: number,
  appId: number,
  name: string,
) => {
  const response = await fetch(ApiRoutes.getAppByOrgIdAndAppId(orgId, appId), {
    method: "PUT",
    body: JSON.stringify({
      id: appId,
      name: name,
    }),
    headers: {
        "Content-Type": "application/json",
    },
  });

  return await returnDataOrThrowError(response);
}

export default updateApp;