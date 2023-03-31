import { Message } from "../models/message";
import ApiRoutes from "../routes/apiRoutes";
import { returnDataOrThrowError } from "../util/api";

const createMessage = async (
  orgId: number,
  appId: number,
  message: Message
) => {
  const response = await fetch(
    ApiRoutes.getMessagesByOrgIdAndAppId(orgId, appId),
    {
      method: "POST",
      body: JSON.stringify(message),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return await returnDataOrThrowError(response);
};

export default createMessage;
