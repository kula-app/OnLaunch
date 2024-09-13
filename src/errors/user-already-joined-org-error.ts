import type { Org } from "@/models/org";
import { CustomErrorNames } from "./custom-error-names";
import { ServerError } from "./server-error";

export class UserAlreadyJoinedOrgError extends ServerError {
  constructor(
    readonly orgId: Org["id"],
    message: string = "User already joined organization",
  ) {
    super(CustomErrorNames.UserAlreadyJoinedOrgError, message);
  }
}
