import { LuCloud, LuSun, LuWind } from "react-icons/lu";

export const getIcon = (weatherDescription: string | undefined, size: number) => {
  const description = weatherDescription?.toLowerCase();
  switch (description) {
    case "overcast":
      return <LuCloud size={size} />;
    case "sun":
      return <LuSun size={size} />;
    case "wind":
      return <LuWind size={size} />;
    default:
      return null;
  }
};
