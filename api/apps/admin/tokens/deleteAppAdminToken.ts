import ApiRoutes from "../../../../routes/apiRoutes";
import { returnDataOrThrowError } from "../../../../util/api";

const deleteAppAdminToken = async (
  orgId: number,
  appId: number,
  tokenId: number
) => {
  const response = await fetch(
    ApiRoutes.getAppAdminTokensByOrgIdAndAppIdAndTokenId(orgId, appId, tokenId),
    {
      method: "DELETE",
    }
  );

  return await returnDataOrThrowError(response);
};

export default deleteAppAdminToken;
