import { Org } from "@/models/org";
import ApiRoutes from "@/routes/apiRoutes";
import { returnDataOrThrowError } from "@/util/api";

const updateOrg = async (org: Org) => {
  const response = await fetch(ApiRoutes.getOrgById(org.id), {
    method: "PUT",
    body: JSON.stringify(org),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await returnDataOrThrowError(response);
};

export default updateOrg;
