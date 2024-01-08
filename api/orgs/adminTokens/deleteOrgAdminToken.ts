import ApiRoutes from "../../../routes/apiRoutes";
import { returnDataOrThrowError } from "../../../util/api";

const deleteOrgAdminToken = async (orgId: number, tokenId: number) => {
  const response = await fetch(
    ApiRoutes.getOrgAdminTokensByOrgIdAndTokenId(orgId, tokenId),
    {
      method: "DELETE",
    }
  );

  return await returnDataOrThrowError(response);
};

export default deleteOrgAdminToken;
