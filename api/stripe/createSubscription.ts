import ApiRoutes from "../../routes/apiRoutes";
import { returnDataOrThrowError } from "../../util/api";

const createSubscription = async (priceId: string, orgName: string) => {
  const response = await fetch(ApiRoutes.SUBSCRIPTIONS, {
    method: "POST",
    body: JSON.stringify({ priceId: priceId, orgName: orgName }),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "localhost:3000",
    },
  });

  return await returnDataOrThrowError(response);
};

export default createSubscription;
