import ApiRoutes from "../routes/apiRoutes";

const getDirectInviteToken = async (
  token: string, 
) => {
    const response = await fetch(
      ApiRoutes.DIRECT_INVITATION + "/" + token, {
        method: "GET",
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

export default getDirectInviteToken;