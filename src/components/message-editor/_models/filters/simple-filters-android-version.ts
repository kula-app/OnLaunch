/**
 * @see https://source.android.com/docs/setup/reference/build-numbers#platform-code-names-versions-api-levels-and-ndk-releases
 */

export enum SimpleFiltersAndroidVersion {
  ANDROID_15 = "15",
  ANDROID_14 = "14",
  ANDROID_13 = "13",
  ANDROID_12L = "12L",
  ANDROID_12 = "12",
  ANDROID_11 = "11",
  ANDROID_10 = "10",
  PIE = "9",
  OREO_81 = "8.1.0",
  OREO_80 = "8.0.0",
  NOUGAT_71 = "7.1",
  NOUGAT_70 = "7.0",
  MARSHMALLOW = "6.0",
  LOLLIPOP_51 = "5.1",
  LOLLIPOP_50 = "5.0",
  KITKAT = "4.4",
  JELLY_BEAN_43 = "4.3",
  JELLY_BEAN_42 = "4.2",
  JELLY_BEAN_41 = "4.1",
  ICE_CREAM_SANDWICH_403 = "4.0.3",
  ICE_CREAM_SANDWICH_401 = "4.0.1",
  HONEYCOMB_32 = "3.2",
  HONEYCOMB_31 = "3.1",
  HONEYCOMB_30 = "3.0",
  GINGERBREAD_233 = "2.3.3",
  GINGERBREAD_23 = "2.3",
  FROYO = "2.2",
  ECLAIR_21 = "2.1",
  ECLAIR_201 = "2.0.1",
  ECLAIR_20 = "2.0",
  DONUT = "1.6",
  CUPCAKE = "1.5",
  NO_CODENAME_11 = "1.1",
  NO_CODENAME_10 = "1.0",
}

export function displayTextForAndroidVersion(
  version: SimpleFiltersAndroidVersion,
): string {
  switch (version) {
    case SimpleFiltersAndroidVersion.ANDROID_15:
      return "Android 15 (API level 35)";
    case SimpleFiltersAndroidVersion.ANDROID_14:
      return "Android 14 (API level 34)";
    case SimpleFiltersAndroidVersion.ANDROID_13:
      return "Android 13 (API level 33)";
    case SimpleFiltersAndroidVersion.ANDROID_12L:
      return "Android 12L (API level 32)";
    case SimpleFiltersAndroidVersion.ANDROID_12:
      return "Android 12 (API level 31)";
    case SimpleFiltersAndroidVersion.ANDROID_11:
      return "Android 11 (API level 30)";
    case SimpleFiltersAndroidVersion.ANDROID_10:
      return "Android 10 (API level 29)";
    case SimpleFiltersAndroidVersion.PIE:
      return "Pie (API level 28)";
    case SimpleFiltersAndroidVersion.OREO_81:
      return "Oreo 8.1.0 (API level 27)";
    case SimpleFiltersAndroidVersion.OREO_80:
      return "Oreo 8.0.0 (API level 26)";
    case SimpleFiltersAndroidVersion.NOUGAT_71:
      return "Nougat 7.1 (API level 25)";
    case SimpleFiltersAndroidVersion.NOUGAT_70:
      return "Nougat 7.0 (API level 24)";
    case SimpleFiltersAndroidVersion.MARSHMALLOW:
      return "Marshmallow (API level 23)";
    case SimpleFiltersAndroidVersion.LOLLIPOP_51:
      return "Lollipop 5.1 (API level 22)";
    case SimpleFiltersAndroidVersion.LOLLIPOP_50:
      return "Lollipop 5.0 (API level 21)";
    case SimpleFiltersAndroidVersion.KITKAT:
      return "KitKat (API level 19)";
    case SimpleFiltersAndroidVersion.JELLY_BEAN_43:
      return "Jelly Bean 4.3 (API level 18)";
    case SimpleFiltersAndroidVersion.JELLY_BEAN_42:
      return "Jelly Bean 4.2 (API level 17)";
    case SimpleFiltersAndroidVersion.JELLY_BEAN_41:
      return "Jelly Bean 4.1 (API level 16)";
    case SimpleFiltersAndroidVersion.ICE_CREAM_SANDWICH_403:
      return "Ice Cream Sandwich 4.0.3 (API level 15)";
    case SimpleFiltersAndroidVersion.ICE_CREAM_SANDWICH_401:
      return "Ice Cream Sandwich 4.0.1 (API level 14)";
    case SimpleFiltersAndroidVersion.HONEYCOMB_32:
      return "Honeycomb 3.2 (API level 13)";
    case SimpleFiltersAndroidVersion.HONEYCOMB_31:
      return "Honeycomb 3.1 (API level 12)";
    case SimpleFiltersAndroidVersion.HONEYCOMB_30:
      return "Honeycomb 3.0 (API level 11)";
    case SimpleFiltersAndroidVersion.GINGERBREAD_233:
      return "Gingerbread 2.3.3 (API level 10)";
    case SimpleFiltersAndroidVersion.GINGERBREAD_23:
      return "Gingerbread 2.3 (API level 9)";
    case SimpleFiltersAndroidVersion.FROYO:
      return "Froyo (API level 8)";
    case SimpleFiltersAndroidVersion.ECLAIR_21:
      return "Eclair 2.1 (API level 7)";
    case SimpleFiltersAndroidVersion.ECLAIR_201:
      return "Eclair 2.0.1 (API level 6)";
    case SimpleFiltersAndroidVersion.ECLAIR_20:
      return "Eclair 2.0 (API level 5)";
    case SimpleFiltersAndroidVersion.DONUT:
      return "Donut (API level 4)";
    case SimpleFiltersAndroidVersion.CUPCAKE:
      return "Cupcake (API level 3)";
    case SimpleFiltersAndroidVersion.NO_CODENAME_11:
      return "No codename 1.1 (API level 2)";
    case SimpleFiltersAndroidVersion.NO_CODENAME_10:
      return "No codename 1.0 (API level 1)";
    default:
      return `Android ${version}`;
  }
}
