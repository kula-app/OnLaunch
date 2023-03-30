import ApiRoutes from "../routes/apiRoutes";

const deleteUser = async (
  orgId: number,
  appId: number,
  messageId: number,
) => {
  const response = await fetch(ApiRoutes.getMessageByOrgIdAndAppIdAndMessageId(orgId, appId, messageId), {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
      throw new Error (data.message || 'an error occurred');
  }

  return data;
}

export default deleteUser;