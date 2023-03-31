import ApiRoutes from "../routes/apiRoutes";
import { Message } from "../models/message";
import { returnDataOrThrowError } from "../util/api";

const updateMessage = async (
  orgId: number,
  appId: number,
  messageId: number,
  message: Message,
) => {
  const response = await fetch(ApiRoutes.getMessageByOrgIdAndAppIdAndMessageId(orgId, appId, messageId), {
    method: "PUT",
    body: JSON.stringify(message),
    headers: {
        "Content-Type": "application/json",
    },
  });

  return await returnDataOrThrowError(response);
}

export default updateMessage;