export interface User {
  id: number;
  email: string | null;
  firstName: string | null;
  lastName: string | null;

  /**
   * The user's unconfirmed email address.
   *
   * This field is only present if the user has an unconfirmed email address.
   * If the confirmation has expired, the field will not be set.
   */
  unconfirmedEmail?: string | null;
}
