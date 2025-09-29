export const colors = {
  bgPrimary: "#0F0F0F",
  surface: "#1A1A1A",
  surface2: "#242424",
  textPrimary: "#FFFFFF",
  textSecondary: "#B0B0B0",
  textTertiary: "#6B7280",
  accentGold: "#D4B896",
  accentGreen: "#68D391",
  accentRed: "#F56565",
  strengthMild: "#68D391",
  strengthMedium: "#F59E0B",
  strengthFull: "#F56565",
  overlay: "rgba(0, 0, 0, 0.8)",
};

export const getStrengthColor = (strength) => {
  switch (strength) {
    case "MILD":
      return colors.strengthMild;
    case "MEDIUM":
      return colors.strengthMedium;
    case "FULL":
      return colors.strengthFull;
    default:
      return colors.textSecondary;
  }
};
