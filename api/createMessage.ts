import { Message } from "../types/message";
import ApiRoutes from "../routes/apiRoutes";

const createMessage = async (
  orgId: number, 
  appId: number, 
  message: Message,
) => {
  const response = await fetch(ApiRoutes.getMessagesByOrgIdAndAppId(orgId, appId), {
    method: "POST",
    body: JSON.stringify(message),
    headers: {
        "Content-Type": "application/json",
    },
});

  const data = await response.json();

  if (!response.ok) {
      throw new Error (data.message || 'an error occurred');
  }

  return data;
}

export default createMessage;