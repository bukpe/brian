import { useMemo } from "react";
import { SearchType } from "../../pages/Home";
import { SearchTypeEnum } from "../../pages/Main";
import styles from "./searchBox.module.scss";
import { getIcon } from "../../services/IconService";

type ComponentProps = {
  isMobile: boolean;
  search: SearchType;
  getWeatherByLocation(selectedSearch: SearchType): Promise<void>;
  setSearch(search: SearchType): void;
};

export const SearchBox = ({ isMobile, search, getWeatherByLocation, setSearch }: ComponentProps) => {
  const isSearchDisabled = useMemo((): boolean => {
    const isLocationUnset = search.location === "";
    const isLatUnset = search.coordinates.lat === "";
    const isLonUnset = search.coordinates.lon === "";
    return isLocationUnset && isLatUnset && isLonUnset;
  }, [search.coordinates.lat, search.coordinates.lon, search.location]);

  return (
    <div className={styles.searchBox}>
      <div className={styles.inputs}>
        {search.type === SearchTypeEnum.LOCATION ? (
          <input
            type="text"
            placeholder="Location..."
            value={search.location}
            onChange={e => {
              setSearch({
                ...search,
                location: e.target.value,
                coordinates: {
                  lat: "",
                  lon: "",
                },
              });
            }}
          />
        ) : (
          <>
            <input
              type="text"
              placeholder="Latitude..."
              value={search.coordinates.lat}
              onChange={e => {
                setSearch({
                  ...search,
                  location: "",
                  coordinates: {
                    ...search.coordinates,
                    lat: e.target.value,
                  },
                });
              }}
            />
            <input
              type="text"
              placeholder="Longitude..."
              value={search.coordinates.lon}
              onChange={e => {
                setSearch({
                  ...search,
                  location: "",
                  coordinates: {
                    ...search.coordinates,
                    lon: e.target.value,
                  },
                });
              }}
            />
          </>
        )}
      </div>
      <button
        onClick={() => {
          getWeatherByLocation(search);
        }}
        disabled={isSearchDisabled}
      >
        {getIcon("search", isMobile ? 12 : 30)}
      </button>
    </div>
  );
};
