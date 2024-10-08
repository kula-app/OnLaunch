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

  static readonly EMAIL_CHANGE = `${ApiRoutes.API_BASE_URL}/users/emailChange`;
  static readonly PASSWORD_CHANGE = `${ApiRoutes.API_BASE_URL}/users/passwordChange`;

  static getOrgById(orgId: number): string {
    return `${ApiRoutes.API_BASE_URL}/orgs/${orgId}`;
  }

  static getDashboardData(orgId: number, appId?: number): string {
    return `${ApiRoutes.API_BASE_URL}/dashboard?orgId=${orgId}${
      appId ? `&appId=${appId}` : ""
    }`;
  }

  static getOrgUsersByOrgId(orgId: number): string {
    return `${ApiRoutes.getOrgById(orgId)}/users`;
  }

  static getOrgUserByOrgIdAndUserEmail(
    orgId: number,
    userEmail: string,
  ): string {
    return `${ApiRoutes.getOrgUsersByOrgId(orgId)}/${userEmail}`;
  }

  static getAppsByOrgId(orgId: number): string {
    return `${ApiRoutes.API_BASE_URL}/orgs/${orgId}/apps`;
  }

  static getAppByOrgIdAndAppId(orgId: number, appId: number): string {
    return `${ApiRoutes.getAppsByOrgId(orgId)}/${appId}`;
  }

  static getMessagesByOrgIdAndAppId(orgId: number, appId: number): string {
    return `${ApiRoutes.getAppByOrgIdAndAppId(orgId, appId)}/messages`;
  }

  static getMessageByOrgIdAndAppIdAndMessageId(
    orgId: number,
    appId: number,
    messageId: number,
  ): string {
    return `${ApiRoutes.getMessagesByOrgIdAndAppId(orgId, appId)}/${messageId}`;
  }

  static getOrgsInvitationByToken(token: string): string {
    return `${ApiRoutes.ORGS_INVITATION}/${token}`;
  }

  static getOrgAdminTokensByOrgId(orgId: number): string {
    return `${ApiRoutes.API_BASE_URL}/orgs/${orgId}/admin/tokens`;
  }

  static getOrgAdminTokensByOrgIdAndTokenId(
    orgId: number,
    tokenId: number,
  ): string {
    return `${ApiRoutes.API_BASE_URL}/orgs/${orgId}/admin/tokens/${tokenId}`;
  }

  static getAppAdminTokensByOrgIdAndAppId(
    orgId: number,
    appId: number,
  ): string {
    return `${ApiRoutes.API_BASE_URL}/orgs/${orgId}/apps/${appId}/admin/tokens`;
  }

  static getAppAdminTokensByOrgIdAndAppIdAndTokenId(
    orgId: number,
    appId: number,
    tokenId: number,
  ): string {
    return `${ApiRoutes.API_BASE_URL}/orgs/${orgId}/apps/${appId}/admin/tokens/${tokenId}`;
  }
}

export default ApiRoutes;
