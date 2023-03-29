class Routes {
  static get index(): string {
    return "/";
  }

  static get dashboard(): string {
    return "/dashboard";
  }

  static get auth(): string {
    return "/auth";
  }

  static get changeEmail(): string {
    return "/changeEmail";
  }

  static get profile(): string {
    return "/profile";
  }

  static get reset(): string {
    return "/reset";
  }

  static get resetPassword(): string {
    return "/resetPassword";
  }

  static get verify(): string {
    return "/verify";
  }

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
}

export default Routes;