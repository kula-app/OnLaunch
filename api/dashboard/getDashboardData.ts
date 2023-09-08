import ApiRoutes from "../../routes/apiRoutes";
import { returnDataOrThrowError } from "../../util/api";


const getDashboardData = async (orgId: number, appId?: number) => {
  const response = await fetch(ApiRoutes.getDashboardData(orgId, appId));

  return await returnDataOrThrowError(response);
};

export default getDashboardData;
