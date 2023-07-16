import ApiRoutes from "../../routes/apiRoutes";
import { returnDataOrThrowError } from "../../util/api";

const createSubscription = async (productId: string, orgName: string) => {
  const response = await fetch(ApiRoutes.SUBSCRIPTIONS, {
    method: "POST",
    body: JSON.stringify({ productId: productId, orgName: orgName }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await returnDataOrThrowError(response);
};

export default createSubscription;
