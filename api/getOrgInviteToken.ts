import ApiRoutes from "../routes/apiRoutes";

const getOrgInviteToken = async (
  token: string, 
) => {
    const response = await fetch(
      ApiRoutes.ORGS_INVITATION + "/" + token, {
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

export default getOrgInviteToken;