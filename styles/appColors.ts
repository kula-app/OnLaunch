class AppColors {
  static backgroundBlack = "#000000";
  static background = this.backgroundBlack;
  static backgroundGray = "#2A292C";
  static textWhite = "#FFFFFF";
  static textGray = "#8D8D92";
  static highlightPurple = {
    500: "#7823C9", // Main shade
    600: "#6a21b3", // Darker shade for hover
    700: "#5d1e9d", // Even darker for active
  };
  static detailGrayPurple = {
    500: "#ADA2C4",
    600: "#988bb3",
  };
  static tdBorderColor = this.detailGrayPurple[500];
}

export default AppColors;
