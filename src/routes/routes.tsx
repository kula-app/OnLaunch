import type { Org } from "@/models/org";

class Routes {
  static readonly INDEX = "/";

  static get dashboard() {
    return "/dashboard";
  }

  static readonly profile = "/profile";

  static readonly SUBSCRIPTION = "/subscription";

  static get orgs(): string {
    return "/orgs";
  }

  static get createOrg(): string {
    return "/orgs/new";
  }

  static upgradeOrg({ orgId }: { orgId: Org["id"] }): string {
    return `/orgs/${orgId}/upgrade`;
  }

  static org({
    baseUrl,
    orgId,
    reason,
  }: {
    baseUrl?: string;
    orgId: number;
    reason?: "user-joined";
  }): string {
    const url = new URL(baseUrl ?? "");
    url.pathname = `/orgs/${orgId}`;
    if (reason) {
      url.searchParams.set("reason", reason);
    }
    return url.toString();
  }

  static orgJoin({
    baseUrl,
    directInviteToken,
    inviteToken,
  }: {
    baseUrl?: string;
    directInviteToken?: string;
    inviteToken?: string;
  }): string {
    const url = new URL(baseUrl ?? "");
    url.pathname = "/orgs/join";
    if (directInviteToken) {
      url.searchParams.set("direct-invite-token", directInviteToken);
    }
    if (inviteToken) {
      url.searchParams.set("invite-token", inviteToken);
    }
    return url.toString();
  }

  static apps({ orgId }: { orgId: number }): string {
    return `/orgs/${orgId}/apps`;
  }

  static createApp({ orgId }: { orgId: number }): string {
    return `/orgs/${orgId}/apps/new`;
  }

  static app({ orgId, appId }: { appId: number; orgId: number }): string {
    return `/orgs/${orgId}/apps/${appId}`;
  }

  static appSettings({
    orgId,
    appId,
    tab,
  }: {
    appId: number;
    orgId: number;
    tab?: string;
  }): string {
    let path = `/orgs/${orgId}/apps/${appId}/settings`;
    let searchParams = new URLSearchParams();
    if (tab) {
      searchParams.set("tab", tab);
    }
    if (searchParams.size > 0) {
      return `${path}?${searchParams.toString()}`;
    }
    return path;
  }

  static messages({ orgId, appId }: { appId: number; orgId: number }): string {
    return `/orgs/${orgId}/apps/${appId}/messages`;
  }

  static createMessage({
    orgId,
    appId,
  }: {
    appId: number;
    orgId: number;
  }): string {
    return `/orgs/${orgId}/apps/${appId}/messages/new`;
  }

  static message({
    orgId,
    appId,
    messageId,
  }: {
    appId: number;
    messageId: number;
    orgId: number;
  }): string {
    return `/orgs/${orgId}/apps/${appId}/messages/${messageId}`;
  }

  static orgSettings({ orgId, tab }: { orgId: number; tab?: string }): string {
    let path = `/orgs/${orgId}/settings`;
    let searchParams = new URLSearchParams();
    if (tab) {
      searchParams.set("tab", tab);
    }
    if (searchParams.size > 0) {
      return `${path}?${searchParams.toString()}`;
    }
    return path;
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
      | "email-confirmation"
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
    if (params?.reason) {
      searchParams.set("reason", params.reason);
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

  static readonly changeEmail = "/account/confirm-email";
  static confirmEmailWithToken({
    baseUrl,
    token,
  }: {
    baseUrl: string;
    token: string;
  }): string {
    const url = new URL(baseUrl);
    url.pathname = Routes.changeEmail;
    url.searchParams.set("token", token);
    return url.toString();
  }

  static invitationUrlWithToken({
    baseUrl,
    token,
  }: {
    baseUrl: string;
    token: string;
  }): string {
    return `${baseUrl}/orgs/join?invite-token=${token}`;
  }

  static directInvitationUrlWithToken({
    baseUrl,
    token,
  }: {
    baseUrl: string;
    token: string;
  }): string {
    return `${baseUrl}/orgs/join?direct-invite-token=${token}`;
  }

  static accountRecoverConfirmWithToken({
    baseUrl,
    token,
  }: {
    baseUrl: string;
    token: string;
  }): string {
    return `${baseUrl}/${Routes.ACCOUNT_RECOVERY_CONFIRM}?token=${token}`;
  }

  static accountVerify({
    baseUrl,
    token,
    email,
  }: {
    baseUrl: string;
    token: string;
    email: string;
  }): string {
    const url = new URL(baseUrl);
    url.pathname = "/account/verify";
    url.searchParams.set("token", token);
    url.searchParams.set("email", email);
    return url.toString();
  }

  static subscriptionPageSuccess({
    baseUrl,
    orgId,
  }: {
    baseUrl: string;
    orgId: string;
  }): string {
    return `${baseUrl}${Routes.SUBSCRIPTION}?success=true&orgId=${orgId}`;
  }

  static subscriptionPageCancelled({ baseUrl }: { baseUrl: string }): string {
    return `${baseUrl}${Routes.SUBSCRIPTION}?canceled=true`;
  }
}

export default Routes;
