import ApiRoutes from "../../routes/apiRoutes";
import { returnDataOrThrowError } from "../../util/api";

const getDashboardData = async (orgId: number) => {
  const response = await fetch(ApiRoutes.getDashboardDataByOrgId(orgId));

  return await returnDataOrThrowError(response);
};

export default getDashboardData;
