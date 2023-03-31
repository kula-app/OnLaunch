import config from "../config/config";

class Routes {
  static readonly INDEX = "/";
  static readonly DASHBOARD = "/dashboard";
  static readonly AUTH = "/auth";
  static readonly CHANGE_EMAIL = "/changeEmail";
  static readonly PROFILE = "/profile";
  static readonly RESET = "/reset";
  static readonly RESET_PASSWORD = "/resetPassword";
  static readonly VERIFY = "/verify";

  static get createNewOrg(): string {
    return "/orgs/new";
  }

  static editOrgById(orgId: number): string {
    return `/orgs/${orgId}/edit`;
  }

  static getOrgAppsByOrgId(orgId: number): string {
    return `/orgs/${orgId}/apps`;
  }

  static createNewAppForOrgId(orgId: number): string {
    return `/orgs/${orgId}/apps/new`;
  }

  static editAppForOrgIdAndAppId(
    orgId: number, 
    appId: number
  ): string {
    return `/orgs/${orgId}/apps/${appId}/edit`;
  }

  static getMessagesByOrgIdAndAppId(
    orgId: number, 
    appId: number,
  ): string {
    return `/orgs/${orgId}/apps/${appId}/messages`;
  }

  static createNewMessageForOrgIdAndAppId(
    orgId: number,
    appId: number,
  ): string {
    return `/orgs/${orgId}/apps/${appId}/messages/new`;
  }

  static editMessageByOrgIdAndAppIdAndMessageId(
    orgId: number,
    appId: number,
    messageId: number,
  ): string {
    return `/orgs/${orgId}/apps/${appId}/messages/${messageId}/edit`;
  }

  // the bellow functions use the full path of website for external usage
  
  static changeEmailWithToken(token: string): string {
    return `${config.nextAuth.url}/${Routes.CHANGE_EMAIL}?token=${token}`;
  }

  static directInviteWithToken(token: string): string {
    return `${config.nextAuth.url}/${Routes.DASHBOARD}?directinvite=${token}`;
  }

  static resetPasswordWithToken(token: string): string {
    return `${config.nextAuth.url}/${Routes.RESET_PASSWORD}?token=${token}`;
  }

  static verifyWithToken(token: string): string {
    return `${config.nextAuth.url}/${Routes.VERIFY}?token=${token}`;
  }
}

export default Routes;