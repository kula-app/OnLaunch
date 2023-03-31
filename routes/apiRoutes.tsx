class ApiRoutes {
    static VERSION = "0.1";
    static API_BASE_URL = `/api/frontend/v${ApiRoutes.VERSION}`;

    static readonly USERS = `${ApiRoutes.API_BASE_URL}/users`;
    static readonly SIGNUP = `${ApiRoutes.API_BASE_URL}/users/register`;
    static readonly ORGS = `${ApiRoutes.API_BASE_URL}/orgs`;

    static readonly ORGS_INVITATION = `${ApiRoutes.API_BASE_URL}/tokens/organisationInvitation`;
    static readonly DIRECT_INVITATION = `${ApiRoutes.API_BASE_URL}/tokens/directInvitation`;
    static readonly PASSWORD_RESET = `${ApiRoutes.API_BASE_URL}/tokens/resetPassword`;
    static readonly VERIFICATION = `${ApiRoutes.API_BASE_URL}/tokens/verification`;
    
    static readonly EMAIL_CHANGE = `${ApiRoutes.API_BASE_URL}/users/emailChange`;
    static readonly PASSWORD_CHANGE = `${ApiRoutes.API_BASE_URL}/users/passwordChange`;
    
    static getOrgById(orgId: number): string {
      return `${ApiRoutes.API_BASE_URL}/orgs/${orgId}`;
    }

    static getOrgUsersByOrgId(orgId: number): string {
      return `${ApiRoutes.getOrgById(orgId)}/users`;
    }

    static getOrgUserByOrgIdAndUserId(orgId: number, userId: number): string {
      return `${ApiRoutes.getOrgUsersByOrgId(orgId)}/${userId}`;
    }

    static getAppsByOrgId(orgId: number): string {
      return `${ApiRoutes.API_BASE_URL}/orgs/${orgId}/apps`;
    }

    static getAppByOrgIdAndAppId(orgId: number, appId: number): string {
      return `${ApiRoutes.getAppsByOrgId(orgId)}/${appId}`;
    }

    static getMessagesByOrgIdAndAppId(orgId: number, appId: number): string {
      return `${ApiRoutes.getAppsByOrgId(orgId)}/${appId}/messages`;
    }

    static getMessageByOrgIdAndAppIdAndMessageId(orgId: number, appId: number, messageId: number): string {
      return `${ApiRoutes.getMessagesByOrgIdAndAppId(orgId, appId)}/${messageId}`;
    }

    static getOrgsInvitationByToken(token: string): string {
      return `${ApiRoutes.ORGS_INVITATION}/${token}`;
    }

    static getDirectInvitationByToken(token: string): string {
      return `${ApiRoutes.DIRECT_INVITATION}/${token}`;
    }

    static getPasswordResetByToken(token: string): string {
      return `${ApiRoutes.API_BASE_URL}/users/resetPassword/${token}`;
    }
  }
  
  export default ApiRoutes;