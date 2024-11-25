export interface RuleEvaluationContext {
  clientBundleId?: string;
  clientBundleVersion?: string;
  clientLocale?: string;
  clientLocaleLanguageCode?: string;
  clientLocaleRegionCode?: string;
  clientPackageName?: string;
  clientPlatformName?: string;
  clientPlatformVersion?: string;
  clientReleaseVersion?: string;
  clientVersionCode?: string;
  clientVersionName?: string;
  clientUpdateAvailable?: boolean;
}

export function createRuleEvaluationContextFromHeaders(headers: {
  "x-onlaunch-bundle-id"?: string;
  "x-onlaunch-bundle-version"?: string;
  "x-onlaunch-locale"?: string;
  "x-onlaunch-locale-language-code"?: string;
  "x-onlaunch-locale-region-code"?: string;
  "x-onlaunch-package-name"?: string;
  "x-onlaunch-platform-name"?: string;
  "x-onlaunch-platform-version"?: string;
  "x-onlaunch-release-version"?: string;
  "x-onlaunch-version-code"?: string;
  "x-onlaunch-version-name"?: string;
  "x-onlaunch-update-available"?: boolean;
}) {
  const context: RuleEvaluationContext = {
    clientBundleId: headers["x-onlaunch-bundle-id"],
    clientBundleVersion: headers["x-onlaunch-bundle-version"],
    clientLocale: headers["x-onlaunch-locale"],
    clientLocaleLanguageCode: headers["x-onlaunch-locale-language-code"],
    clientLocaleRegionCode: headers["x-onlaunch-locale-region-code"],
    clientPackageName: headers["x-onlaunch-package-name"],
    clientPlatformName: headers["x-onlaunch-platform-name"],
    clientPlatformVersion: headers["x-onlaunch-platform-version"],
    clientReleaseVersion: headers["x-onlaunch-release-version"],
    clientVersionCode: headers["x-onlaunch-version-code"],
    clientVersionName: headers["x-onlaunch-version-name"],
    clientUpdateAvailable: headers["x-onlaunch-update-available"],
  };

  return context;
}
