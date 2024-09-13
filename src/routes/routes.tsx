import { loadServerConfig } from "../config/loadServerConfig";

const config = loadServerConfig();

class Routes {
  static readonly INDEX = "/";

  static get dashboard() {
    return "/dashboard";
  }

  static readonly CHANGE_EMAIL = "/changeEmail";
  static readonly PROFILE = "/profile";

  static readonly SUBSCRIPTION = "/subscription";

  static get orgs(): string {
    return "/orgs";
  }

  static get createNewOrg(): string {
    return "/orgs/new";
  }

  static org(orgId: number): string {
    return `/orgs/${orgId}`;
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

  static login(params?: {
    email?: string | null;
    redirect?: string | null;
    reason?:
      | "account-recovery-requested"
      | "account-recovered"
      | "account-verified"
      | "logout";
  }): string {
    const path = "/login";
    const searchParams = new URLSearchParams();
    if (params?.email) {
      searchParams.set("email", params.email);
    }
    if (params?.redirect) {
      searchParams.set("redirect", params.redirect);
    }
    if (searchParams.size > 0) {
      return `${path}?${searchParams.toString()}`;
    }
    return path;
  }

  static readonly SIGNUP = "/signup";
  static readonly ACCOUNT_RECOVERY = "/account/recover";
  static readonly ACCOUNT_RECOVERY_CONFIRM = "/account/recover/confirm";

  // the bellow functions use the full path of website for external usage

  static changeEmailWithToken(token: string): string {
    return `${config.nextAuth.url}/${Routes.CHANGE_EMAIL}?token=${token}`;
  }

  static directInviteWithToken(token: string): string {
    return `${config.nextAuth.url}/${Routes.dashboard}?directinvite=${token}`;
  }

  static accountRecoverConfirmWithToken(token: string): string {
    return `${config.nextAuth.url}/${Routes.ACCOUNT_RECOVERY_CONFIRM}?token=${token}`;
  }

  static accountVerify(params: { token: string; email: string }): string {
    const url = new URL(config.nextAuth.url);
    url.pathname = "/account/verify";
    url.searchParams.set("token", params.token);
    url.searchParams.set("email", params.email);
    return url.toString();
  }

  static subscriptionPageSuccess(orgId: string): string {
    return `${config.nextAuth.url}${Routes.SUBSCRIPTION}?success=true&orgId=${orgId}`;
  }

  static subscriptionPageCancelled(): string {
    return `${config.nextAuth.url}${Routes.SUBSCRIPTION}?canceled=true`;
  }
}

export default Routes;
