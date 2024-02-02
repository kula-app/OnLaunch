import ApiRoutes from "../../../../routes/apiRoutes";
import { returnDataOrThrowError } from "../../../../util/api";

const createAppAdminToken = async (
  orgId: number,
  appId: number,
  tokenLabel: string,
  timeToLive: number
) => {
  const response = await fetch(
    ApiRoutes.getAppAdminTokensByOrgIdAndAppId(orgId, appId),
    {
      method: "POST",
      body: JSON.stringify({
        label: tokenLabel,
        timeToLive: timeToLive,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return await returnDataOrThrowError(response);
};

export default createAppAdminToken;
