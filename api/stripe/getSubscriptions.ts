import ApiRoutes from "../../routes/apiRoutes";
import { returnDataOrThrowError } from "../../util/api";

const getSubscriptions = async (orgId: number) => {
  const response = await fetch(`${ApiRoutes.SUBSCRIPTIONS}/${orgId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await returnDataOrThrowError(response);
};

export default getSubscriptions;
