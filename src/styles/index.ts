export const AppContainerStyles = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column" as const,
  overflow: "hidden",
  paddingInline: "20px",
};

export const FlexContentStyles = {
  flex: 1,
  overflow: "hidden",
  height: "calc(100vh - 94px)",
};

export const MapContainerStyles = {
  flex: 1,
  height: "100%",
  borderRadius: "8px",
  overflow: "hidden",
};
