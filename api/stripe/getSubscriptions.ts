import ApiRoutes from "../../routes/apiRoutes";
import { returnDataOrThrowError } from "../../util/api";

const getSubscriptions = async () => {
  const response = await fetch(ApiRoutes.SUBSCRIPTIONS, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await returnDataOrThrowError(response);
};

export default getSubscriptions;
