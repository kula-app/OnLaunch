import ApiRoutes from "../../routes/apiRoutes";
import { returnDataOrThrowError } from "../../util/api";

const createSubscription = async () => {
  const response = await fetch(ApiRoutes.CUSTOMER_PORTAL, {
    method: "POST",
    body: JSON.stringify({}),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await returnDataOrThrowError(response);
};

export default createSubscription;
