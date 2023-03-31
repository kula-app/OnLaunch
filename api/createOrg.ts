import ApiRoutes from "../routes/apiRoutes";
import { returnDataOrThrowError } from "../util/api";

const createOrg = async (orgName: string) => {
  const response = await fetch(ApiRoutes.ORGS, {
    method: "POST",
    body: JSON.stringify({ name: orgName }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await returnDataOrThrowError(response);
};

export default createOrg;
