import ApiRoutes from "../routes/apiRoutes";
import { returnDataOrThrowError } from "../util/api";

const deleteMessage = async (
  orgId: number,
  appId: number,
  messageId: number
) => {
  const response = await fetch(
    ApiRoutes.getMessageByOrgIdAndAppIdAndMessageId(orgId, appId, messageId),
    {
      method: "DELETE",
    }
  );

  return await returnDataOrThrowError(response);
};

export default deleteMessage;
