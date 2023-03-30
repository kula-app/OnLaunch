import ApiRoutes from "../routes/apiRoutes";

const deleteOrg = async (
  orgId: number, 
) => {
  const response = await fetch(ApiRoutes.getOrgById(orgId), {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
      throw new Error (data.message || 'an error occurred');
  }

  return data;
}

export default deleteOrg;