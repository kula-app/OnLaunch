import { OrgUser } from "@/models/org-user";
import ApiRoutes from "@/routes/apiRoutes";
import { returnDataOrThrowError } from "@/util/api";

const getUser = async () => {
  const response = await fetch(ApiRoutes.USERS);

  const data = await returnDataOrThrowError(response);

  const userData: Partial<OrgUser> = {
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
  };

  return userData;
};

export default getUser;
