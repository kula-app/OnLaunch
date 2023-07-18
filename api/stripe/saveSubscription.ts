import ApiRoutes from "../../routes/apiRoutes";
import { returnDataOrThrowError } from "../../util/api";

const saveSubscription = async (
  sessionId: string,
  orgName: string
) => {
  const response = await fetch(ApiRoutes.SAVE_SUBSCRIPTION, {
    method: "POST",
    body: JSON.stringify({ sessionId: sessionId, orgName: orgName }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await returnDataOrThrowError(response);
};

export default saveSubscription;
