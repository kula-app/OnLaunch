class ApiRoutes {
  static VERSION = "0.1";
  static API_BASE_URL = `/api/frontend/v${ApiRoutes.VERSION}`;

  static readonly USERS = `${ApiRoutes.API_BASE_URL}/users`;
  static readonly ORGS = `${ApiRoutes.API_BASE_URL}/orgs`;
  static readonly STRIPE = `${ApiRoutes.API_BASE_URL}/stripe`;

  static readonly ORGS_INVITATION = `${ApiRoutes.API_BASE_URL}/tokens/organisationInvitation`;

  static readonly PRODUCTS = `${ApiRoutes.STRIPE}/products`;
  static readonly SUBSCRIPTIONS = `${ApiRoutes.STRIPE}/subscriptions`;
  static readonly CHECKOUT_SESSION = `${ApiRoutes.STRIPE}/checkoutSession`;
  static readonly SAVE_SUBSCRIPTION = `${ApiRoutes.STRIPE}/saveSubscription`;
  static readonly CUSTOMER_PORTAL = `${ApiRoutes.STRIPE}/customerPortal`;
}

export default ApiRoutes;
