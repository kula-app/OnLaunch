import type { App } from "@/models/app";
import type { Message } from "@/models/message";
import type { Org } from "@/models/org";

export class Routes {
  static get index(): string {
    return "/";
  }

  static get dashboard(): string {
    return "/dashboard";
  }

  static get profile(): string {
    return "/profile";
  }

  static get subscription(): string {
    return "/subscription";
  }

  // --- Organizations ---

  static get organizations(): string {
    return "/orgs";
  }

  static get createOrganization(): string {
    return "/orgs/new";
  }

  static organization({
    orgId,
    reason,
  }: {
    orgId: Org["id"];
    reason?: "user-joined";
  }): string {
    let path = `/orgs/${orgId}`;
    let searchParams = new URLSearchParams();
    if (reason) {
      searchParams.set("reason", reason);
    }
    if (searchParams.size > 0) {
      return `${path}?${searchParams.toString()}`;
    }
    return path;
  }

  static upgradeOrganization({ orgId }: { orgId: Org["id"] }): string {
    return `/orgs/${orgId}/upgrade`;
  }

  static organizationSettings({
    orgId,
    tab,
  }: {
    orgId: Org["id"];
    tab?: string;
  }): string {
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

  // --- Apps ---

  static apps({ orgId }: { orgId: Org["id"] }): string {
    return `/orgs/${orgId}/apps`;
  }

  static createApp({ orgId }: { orgId: Org["id"] }): string {
    return `/orgs/${orgId}/apps/new`;
  }

  static app({ orgId, appId }: { appId: App["id"]; orgId: Org["id"] }): string {
    return `/orgs/${orgId}/apps/${appId}`;
  }

  static appSettings({
    orgId,
    appId,
    tab,
  }: {
    appId: App["id"];
    orgId: Org["id"];
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

  // --- Messages ---

  static messages({
    orgId,
    appId,
  }: {
    appId: App["id"];
    orgId: Org["id"];
  }): string {
    return `/orgs/${orgId}/apps/${appId}/messages`;
  }

  static createMessage({
    orgId,
    appId,
  }: {
    appId: App["id"];
    orgId: Org["id"];
  }): string {
    return `/orgs/${orgId}/apps/${appId}/messages/new`;
  }

  static message({
    orgId,
    appId,
    messageId,
  }: {
    appId: App["id"];
    messageId: Message["id"];
    orgId: Org["id"];
  }): string {
    return `/orgs/${orgId}/apps/${appId}/messages/${messageId}`;
  }

  static editMessage({
    orgId,
    appId,
    messageId,
  }: {
    appId: App["id"];
    messageId: Message["id"];
    orgId: Org["id"];
  }): string {
    return `/orgs/${orgId}/apps/${appId}/messages/${messageId}/edit`;
  }

  // --- Authentication ---

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

  static get signup(): string {
    return "/signup";
  }

  static get accountRecovery(): string {
    return "/account/recover";
  }

  static getAccountConfirmEmailUrl({
    baseUrl,
    token,
  }: {
    baseUrl: string;
    token: string;
  }): string {
    const url = new URL(baseUrl);
    url.pathname = "/account/confirm-email";
    url.searchParams.set("token", token);
    return url.toString();
  }

  static getOrganizationInvitationUrl({
    baseUrl,
    token,
  }: {
    baseUrl: string;
    token: string;
  }): string {
    let url = new URL(baseUrl);
    url.pathname = "/orgs/join";
    url.searchParams.set("invite-token", token);
    return url.toString();
  }

  static getOrganizationDirectInvitationUrl({
    baseUrl,
    token,
  }: {
    baseUrl: string;
    token: string;
  }): string {
    let url = new URL(baseUrl);
    url.pathname = "/orgs/join";
    url.searchParams.set("direct-invite-token", token);
    return url.toString();
  }

  static getAccountConfirmationUrl({
    baseUrl,
    token,
  }: {
    baseUrl: string;
    token: string;
  }): string {
    let url = new URL(baseUrl);
    url.pathname = "/account/recover/confirm";
    url.searchParams.set("token", token);
    return url.toString();
  }

  static getAccountVerificationUrl({
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

  static getSubscriptionPageSuccessUrl({
    baseUrl,
    orgId,
  }: {
    baseUrl: string;
    orgId: string;
  }): string {
    let url = new URL(baseUrl);
    url.pathname = Routes.subscription;
    url.searchParams.set("success", "true");
    url.searchParams.set("orgId", orgId);
    return url.toString();
  }

  static getSubscriptionPageCancelledUrl({
    baseUrl,
  }: {
    baseUrl: string;
  }): string {
    let url = new URL(baseUrl);
    url.pathname = Routes.subscription;
    url.searchParams.set("canceled", "true");
    return url.toString();
  }
}
