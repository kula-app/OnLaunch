import type { SimpleFiltersAndroidVersion } from "../../_models/filters/simple-filters-android-version";
import type { SimpleFiltersComparator } from "../../_models/filters/simple-filters-comparator";
import type { SimpleFiltersIosVersion } from "../../_models/filters/simple-filters-ios-version";
import type { SimpleFiltersLanguage } from "../../_models/filters/simple-filters-language";
import type { SimpleFiltersPlatform } from "../../_models/filters/simple-filters-platform";
import type { SimpleFiltersRegion } from "../../_models/filters/simple-filters-region";

export interface SimplePlatformVersionFilterFormData {
  isEnabled: boolean;
  android?: {
    comparator?: SimpleFiltersComparator | null;
    version?: SimpleFiltersAndroidVersion | null;
  } | null;
  ios?: {
    comparator?: SimpleFiltersComparator | null;
    version?: SimpleFiltersIosVersion | null;
  } | null;
}

export interface SimpleAppVersionFilterFormData {
  isEnabled: boolean;
  android?: {
    comparator?: SimpleFiltersComparator | null;
    version?: string | null;
  } | null;
  ios?: {
    comparator?: SimpleFiltersComparator | null;
    version?: string | null;
  } | null;
}

export interface SimpleRegionFilterFormData {
  isEnabled: boolean;
  included: SimpleFiltersRegion[];
  excluded: SimpleFiltersRegion[];
}

export interface SimpleLanguageFilterFormData {
  isEnabled: boolean;
  included: SimpleFiltersLanguage[];
  excluded: SimpleFiltersLanguage[];
}

export interface SimpleFilterFormData {
  platform?: SimpleFiltersPlatform | null;
  platformVersionFilter?: SimplePlatformVersionFilterFormData | null;
  appVersionFilter?: SimpleAppVersionFilterFormData | null;
  regionFilter?: SimpleRegionFilterFormData | null;
  languageFilter?: SimpleLanguageFilterFormData | null;
}
