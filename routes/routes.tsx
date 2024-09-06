import { loadServerConfig } from "../config/loadServerConfig";

const config = loadServerConfig();

class Routes {
  static readonly INDEX = "/";
  static readonly DASHBOARD = "/dashboard";
  static readonly CHANGE_EMAIL = "/changeEmail";
  static readonly PROFILE = "/profile";
  static readonly VERIFY = "/verify";
  static readonly VERIFY_AFTER_SIGNUP = "/verify?signup=true";
  static readonly SUBSCRIPTION = "/subscription";

  static getVerifyWithEmail(email: string): string {
    return `/verify?email=${email}`;
  }

  static get createNewOrg(): string {
    return "/orgs/new";
  }

  static orgSettingsById(orgId: number): string {
    return `/orgs/${orgId}/settings`;
  }

  static appSettingsByOrgIdAndAppId(orgId: number, appId: number): string {
    return `${Routes.getOrgAppsByOrgId(orgId)}/${appId}/settings`;
  }

  static getOrgAppsByOrgId(orgId: number): string {
    return `/orgs/${orgId}/apps`;
  }

  static getOrgUpgradeByOrgId(orgId: number): string {
    return `/orgs/${orgId}/upgrade`;
  }

  static createNewAppForOrgId(orgId: number): string {
    return `/orgs/${orgId}/apps/new`;
  }

  static getMessagesByOrgIdAndAppId(orgId: number, appId: number): string {
    return `/orgs/${orgId}/apps/${appId}/messages`;
  }

  static createNewMessageForOrgIdAndAppId(
    orgId: number,
    appId: number
  ): string {
    return `/orgs/${orgId}/apps/${appId}/messages/new`;
  }

  static editMessageByOrgIdAndAppIdAndMessageId(
    orgId: number,
    appId: number,
    messageId: number
  ): string {
    return `/orgs/${orgId}/apps/${appId}/messages/${messageId}/edit`;
  }

  static readonly LOGIN = "/login";
  static readonly SIGNUP = "/signup";
  static readonly ACCOUNT_RECOVERY = "/account/recover";
  static readonly ACCOUNT_RECOVERY_CONFIRM = "/account/recover/confirm";

  // the bellow functions use the full path of website for external usage

  static changeEmailWithToken(token: string): string {
    return `${config.nextAuth.url}/${Routes.CHANGE_EMAIL}?token=${token}`;
  }

  static directInviteWithToken(token: string): string {
    return `${config.nextAuth.url}/${Routes.DASHBOARD}?directinvite=${token}`;
  }

  static accountRecoverConfirmWithToken(token: string): string {
    return `${config.nextAuth.url}/${Routes.ACCOUNT_RECOVERY_CONFIRM}?token=${token}`;
  }

  static verifyWithToken(token: string): string {
    return `${config.nextAuth.url}/${Routes.VERIFY}?token=${token}`;
  }

  static subscriptionPageSuccess(orgId: string): string {
    return `${config.nextAuth.url}${Routes.SUBSCRIPTION}?success=true&orgId=${orgId}`;
  }

  static subscriptionPageCancelled(): string {
    return `${config.nextAuth.url}${Routes.SUBSCRIPTION}?canceled=true`;
  }
}

export default Routes;
