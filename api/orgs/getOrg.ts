import ApiRoutes from "../../routes/apiRoutes";
import { returnDataOrThrowError } from "../../util/api";

const getOrg = async (orgId: number) => {
  const response = await fetch(ApiRoutes.getOrgById(orgId));

  return await returnDataOrThrowError(response);
};

export default getOrg;
