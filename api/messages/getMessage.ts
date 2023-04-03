import ApiRoutes from "../../routes/apiRoutes";
import { returnDataOrThrowError } from "../../util/api";

const getMessage = async (orgId: number, appId: number, messageId: number) => {
  const response = await fetch(
    ApiRoutes.getMessageByOrgIdAndAppIdAndMessageId(orgId, appId, messageId)
  );

  return await returnDataOrThrowError(response);
};

export default getMessage;
