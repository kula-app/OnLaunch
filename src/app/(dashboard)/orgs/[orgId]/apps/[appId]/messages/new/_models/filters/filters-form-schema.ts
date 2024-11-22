import { MessageRuleComparator } from "@/models/message-rule-comparator";
import { MessageRuleGroupOperator } from "@/models/message-rule-group-operator";
import { MessageRuleSystemVariable } from "@/models/message-rule-system-variable";
import * as Yup from "yup";
import {
  type SimpleAppVersionFilterFormData,
  type SimpleFilterFormData,
  type SimpleLanguageFilterFormData,
  type SimplePlatformVersionFilterFormData,
  type SimpleRegionFilterFormData,
} from "../../_components/filters/simple-filters-form-data";
import type { AdvancedFiltersRuleCondition } from "./advanced-filters-rule-condition";
import type { AdvancedFiltersRuleGroup } from "./advanced-filters-rule-group";
import { FilterKind } from "./filter-kind";
import {
  type AdvancedFilterFormData,
  type FilterFormData,
} from "./filters-form-data";
import { SimpleFiltersAndroidVersion } from "./simple-filters-android-version";
import { SimpleFiltersComparator } from "./simple-filters-comparator";
import { SimpleFiltersIosVersion } from "./simple-filters-ios-version";
import { SimpleFiltersLanguage } from "./simple-filters-language";
import { SimpleFiltersPlatform } from "./simple-filters-platform";
import { SimpleFiltersRegion } from "./simple-filters-region";

const simpleLanguageFilter: Yup.ObjectSchema<SimpleLanguageFilterFormData> =
  Yup.object({
    isEnabled: Yup.boolean().required(),
    included: Yup.array()
      .required()
      .of(Yup.string().oneOf(Object.values(SimpleFiltersLanguage)).required())
      .test(
        "mutually-exclusive",
        "You can not include and exclude the same language",
        function (included) {
          return !included?.some((language) =>
            this.parent.excluded.includes(language),
          );
        },
      )
      .when("isEnabled", {
        is: true,
        then: (schema) =>
          schema.required().min(1, "You must select at least one region"),
        otherwise: (schema) => schema,
      }),
    excluded: Yup.array()
      .required()
      .of(Yup.string().oneOf(Object.values(SimpleFiltersLanguage)).required())
      .test(
        "mutually-exclusive",
        "You can not include and exclude the same language",
        function (excluded) {
          return !excluded?.some((language) =>
            this.parent.included.includes(language),
          );
        },
      ),
  });

const simpleRegionFilter: Yup.ObjectSchema<SimpleRegionFilterFormData> =
  Yup.object({
    isEnabled: Yup.boolean().required(),
    included: Yup.array()
      .required()
      .of(Yup.string().oneOf(Object.values(SimpleFiltersRegion)).required())
      .test(
        "mutually-exclusive",
        "You can not include and exclude the same region",
        function (included) {
          return !included?.some((region) =>
            this.parent.excluded.includes(region),
          );
        },
      )
      .when("isEnabled", {
        is: true,
        then: (schema) =>
          schema.required().min(1, "You must select at least one region"),
        otherwise: (schema) => schema,
      }),
    excluded: Yup.array()
      .required()
      .of(Yup.string().oneOf(Object.values(SimpleFiltersRegion)).required())
      .test(
        "mutually-exclusive",
        "You can not include and exclude the same region",
        function (excluded) {
          return !excluded?.some((region) =>
            this.parent.included.includes(region),
          );
        },
      ),
  });

const simpleAppVersionFilterAndroidSchema = Yup.lazy((_value, options) => {
  if (!options.context?.filter?.simple?.appVersionFilter?.isEnabled) {
    return Yup.object().notRequired();
  }
  const schema: Yup.ObjectSchema<SimpleAppVersionFilterFormData["android"]> =
    Yup.object({
      comparator: Yup.string()
        .oneOf(Object.values(SimpleFiltersComparator))
        .required(),
      version: Yup.string()
        .required("You must select an Android version")
        .min(1),
    }).required();
  return schema;
});

const simpleAppVersionFilterIosSchema = Yup.lazy((_value, options) => {
  if (!options.context?.filter?.simple?.appVersionFilter?.isEnabled) {
    return Yup.object().notRequired();
  }
  const schema: Yup.ObjectSchema<SimpleAppVersionFilterFormData["ios"]> =
    Yup.object({
      comparator: Yup.string()
        .oneOf(Object.values(SimpleFiltersComparator))
        .required(),
      version: Yup.string().required("You must select an iOS version").min(1),
    }).required();
  return schema;
});

const simplePlatformVersionFilterAndroidSchema = Yup.lazy((_value, options) => {
  if (!options.context?.filter?.platformVersionFilter?.android?.isEnabled) {
    return Yup.object({}).notRequired();
  }
  const schema: Yup.ObjectSchema<
    SimplePlatformVersionFilterFormData["android"]
  > = Yup.object({
    comparator: Yup.string()
      .oneOf(Object.values(SimpleFiltersComparator))
      .required(),
    version: Yup.string()
      .oneOf(Object.values(SimpleFiltersAndroidVersion))
      .required(),
  }).required();
  return schema;
});

const simplePlatformVersionFilterIosSchema = Yup.lazy((_value, options) => {
  if (!options.context?.filter?.platformVersionFilter?.ios?.isEnabled) {
    return Yup.object().notRequired();
  }
  const schema: Yup.ObjectSchema<SimplePlatformVersionFilterFormData["ios"]> =
    Yup.object({
      comparator: Yup.string()
        .oneOf(Object.values(SimpleFiltersComparator))
        .required(),
      version: Yup.string()
        .oneOf(Object.values(SimpleFiltersIosVersion))
        .required(),
    }).required();
  return schema;
});

const simpleFilterSchema: Yup.ObjectSchema<SimpleFilterFormData> = Yup.object({
  platform: Yup.string().oneOf(Object.values(SimpleFiltersPlatform)).required(),
  platformVersionFilter: Yup.lazy((value, options) => {
    const platform =
      options.context?.filter?.simple?.platform ?? SimpleFiltersPlatform.ALL;
    if (platform === SimpleFiltersPlatform.ANDROID) {
      return Yup.object({
        isEnabled: Yup.boolean().required(),
        android: simplePlatformVersionFilterAndroidSchema,
        ios: Yup.object().notRequired(),
      }).required();
    }
    if (platform === SimpleFiltersPlatform.IOS) {
      return Yup.object({
        isEnabled: Yup.boolean().required(),
        android: Yup.object().notRequired(),
        ios: simplePlatformVersionFilterIosSchema,
      }).required();
    }
    return Yup.object({
      isEnabled: Yup.boolean().required(),
      android: simplePlatformVersionFilterAndroidSchema,
      ios: simplePlatformVersionFilterIosSchema,
    }).required();
  }),
  appVersionFilter: Yup.lazy((value, options) => {
    const platform =
      options.context?.filter?.simple?.platform ?? SimpleFiltersPlatform.ALL;
    if (platform === SimpleFiltersPlatform.ANDROID) {
      return Yup.object({
        isEnabled: Yup.boolean().required(),
        android: simpleAppVersionFilterAndroidSchema,
        ios: Yup.object().notRequired(),
      }).required();
    }
    if (platform === SimpleFiltersPlatform.IOS) {
      return Yup.object({
        isEnabled: Yup.boolean().required(),
        android: Yup.object().notRequired(),
        ios: simpleAppVersionFilterIosSchema,
      }).required();
    }
    return Yup.object({
      isEnabled: Yup.boolean().required(),
      android: simpleAppVersionFilterAndroidSchema,
      ios: simpleAppVersionFilterIosSchema,
    }).required();
  }),
  regionFilter: simpleRegionFilter.required(),
  languageFilter: simpleLanguageFilter.required(),
}).required();

const advancedFilterRuleConditionSchema: Yup.ObjectSchema<AdvancedFiltersRuleCondition> =
  Yup.object({
    id: Yup.string().required(),
    systemVariable: Yup.string()
      .oneOf(Object.values(MessageRuleSystemVariable))
      .required(),
    comparator: Yup.string()
      .oneOf(Object.values(MessageRuleComparator))
      .required(),
    userVariable: Yup.string().required(),
  }).required();

const advancedFilterRuleGroupSchema: Yup.ObjectSchema<AdvancedFiltersRuleGroup> =
  Yup.object({
    id: Yup.string().required(),
    operator: Yup.string()
      .oneOf(Object.values(MessageRuleGroupOperator))
      .required(),
    groups: Yup.array()
      .of(Yup.lazy(() => advancedFilterRuleGroupSchema))
      .notRequired(),
    conditions: Yup.array().of(advancedFilterRuleConditionSchema).notRequired(),
  }).required();

const advancedFilterSchema: Yup.ObjectSchema<AdvancedFilterFormData> =
  Yup.object({
    root: advancedFilterRuleGroupSchema.notRequired(),
    isDirty: Yup.boolean().notRequired(),
  }).required();

export const filtersSchema: Yup.ObjectSchema<FilterFormData> = Yup.object({
  isAll: Yup.boolean().required(),
  kind: Yup.string().oneOf(Object.values(FilterKind)).required(),
  simple: Yup.lazy((_value, options) => {
    if (options.context?.filter?.isAll !== false) {
      return Yup.object().notRequired();
    }
    if (options.context?.filter?.kind !== FilterKind.SIMPLE) {
      return Yup.object().notRequired();
    }
    return simpleFilterSchema.required();
  }),
  advanced: Yup.lazy((_value, options) => {
    if (options.context?.filter?.isAll !== false) {
      return Yup.object().notRequired();
    }
    if (options.context?.filter?.kind !== FilterKind.ADVANCED) {
      return Yup.object().notRequired();
    }
    return advancedFilterSchema.required();
  }),
});
