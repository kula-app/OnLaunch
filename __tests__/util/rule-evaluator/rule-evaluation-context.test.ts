import {
  createRuleEvaluationContextFromHeaders,
  RuleEvaluationContext,
} from "../../../src/util/rule-evaluation/rule-evaluation-context";

describe("createRuleEvaluationContextFromHeaders", () => {
  it("should create context with all headers", () => {
    const headers = {
      "x-onlaunch-bundle-id": "bundle-id",
      "x-onlaunch-bundle-version": "1.0.0",
      "x-onlaunch-locale": "en-US",
      "x-onlaunch-locale-language-code": "en",
      "x-onlaunch-locale-region-code": "US",
      "x-onlaunch-package-name": "com.example.app",
      "x-onlaunch-platform-name": "iOS",
      "x-onlaunch-platform-version": "14.0",
      "x-onlaunch-release-version": "1.0.0",
      "x-onlaunch-version-code": "100",
      "x-onlaunch-version-name": "1.0.0",
      "x-onlaunch-update-available": true,
    };

    const context: RuleEvaluationContext =
      createRuleEvaluationContextFromHeaders(headers);

    expect(context).toEqual({
      clientBundleId: "bundle-id",
      clientBundleVersion: "1.0.0",
      clientLocale: "en-US",
      clientLocaleLanguageCode: "en",
      clientLocaleRegionCode: "US",
      clientPackageName: "com.example.app",
      clientPlatformName: "iOS",
      clientPlatformVersion: "14.0",
      clientReleaseVersion: "1.0.0",
      clientVersionCode: "100",
      clientVersionName: "1.0.0",
      clientUpdateAvailable: true,
    });
  });

  it("should create context with missing headers", () => {
    const headers = {
      "x-onlaunch-bundle-id": "bundle-id",
      "x-onlaunch-bundle-version": "1.0.0",
    };

    const context: RuleEvaluationContext =
      createRuleEvaluationContextFromHeaders(headers);

    expect(context).toEqual({
      clientBundleId: "bundle-id",
      clientBundleVersion: "1.0.0",
      clientLocale: undefined,
      clientLocaleLanguageCode: undefined,
      clientLocaleRegionCode: undefined,
      clientPackageName: undefined,
      clientPlatformName: undefined,
      clientPlatformVersion: undefined,
      clientReleaseVersion: undefined,
      clientVersionCode: undefined,
      clientVersionName: undefined,
      clientUpdateAvailable: undefined,
    });
  });

  it("should create context with no headers", () => {
    const headers = {};

    const context: RuleEvaluationContext =
      createRuleEvaluationContextFromHeaders(headers);

    expect(context).toEqual({
      clientBundleId: undefined,
      clientBundleVersion: undefined,
      clientLocale: undefined,
      clientLocaleLanguageCode: undefined,
      clientLocaleRegionCode: undefined,
      clientPackageName: undefined,
      clientPlatformName: undefined,
      clientPlatformVersion: undefined,
      clientReleaseVersion: undefined,
      clientVersionCode: undefined,
      clientVersionName: undefined,
      clientUpdateAvailable: undefined,
    });
  });
});
