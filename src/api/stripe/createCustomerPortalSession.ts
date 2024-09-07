import ApiRoutes from "@/routes/apiRoutes";
import { returnDataOrThrowError } from "@/util/api";

const createCustomerPortalSession = async (orgId: number) => {
  const response = await fetch(ApiRoutes.CUSTOMER_PORTAL, {
    method: "POST",
    body: JSON.stringify({ orgId: orgId }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await returnDataOrThrowError(response);
};

export default createCustomerPortalSession;
