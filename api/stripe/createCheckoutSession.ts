import ApiRoutes from "../../routes/apiRoutes";
import { returnDataOrThrowError } from "../../util/api";

const createCheckoutSession = async (priceId: string, orgId: number) => {
  const response = await fetch(ApiRoutes.CHECKOUT_SESSION, {
    method: "POST",
    body: JSON.stringify({ priceId: priceId, orgId: orgId }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await returnDataOrThrowError(response);
};

export default createCheckoutSession;
