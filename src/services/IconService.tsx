import { LuCloud, LuCloudRain, LuCloudSnow, LuGlasses, LuSearch, LuSun, LuThermometer, LuWind } from "react-icons/lu";
import { GiWindsock } from "react-icons/gi";
import { SlDirection } from "react-icons/sl";
import { CiDroplet, CiTimer } from "react-icons/ci";
import { BsCloudRainHeavy } from "react-icons/bs";
import { IoStar, IoStarOutline } from "react-icons/io5";

export const getIcon = (weatherDescription: string | undefined, size: number) => {
  const description = weatherDescription?.toLowerCase();
  switch (description) {
    case "cloud":
    case "overcast":
      return <LuCloud size={size} />;
    case "sun":
      return <LuSun size={size} />;
    case "wind":
      return <LuWind size={size} />;
    case "wind-degree":
      return <GiWindsock size={size} />;
    case "snow":
      return <LuCloudSnow size={size} />;
    case "search":
      return <LuSearch size={size} />;
    case "direction":
      return <SlDirection size={size} />;
    case "precipitation":
      return <LuCloudRain size={size} />;
    case "temperature":
      return <LuThermometer size={size} />;
    case "visibility":
      return <LuGlasses size={size} />;
    case "pressure":
      return <CiTimer size={size} />;
    case "rain":
      return <BsCloudRainHeavy size={size} />;
    case "humidity":
      return <CiDroplet size={size} />;
    case "star-empty":
      return <IoStarOutline size={size} />;
    case "star":
      return <IoStar size={size} />;

    default:
      return null;
  }
};
