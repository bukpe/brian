import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./main.module.scss";
import { getIcon } from "../services/IconService";
import { WeatherDTO, WeatherService } from "../services/WeatherService";
import { Celcius } from "@khanisak/temperature-converter";
import { SearchBox } from "../components/SearchBox/SearchBox";
import { ListItem } from "../components/ListItem/ListItem";
import { FavoriteIcon } from "../components/FavoriteIcon/FavoriteIcon";

export enum SearchTypeEnum {
  LOCATION,
  COORDINATES,
}

type CurrentTemperature = {
  code: string;
  value: string;
  type: "celsius" | "fahrenheit";
};

type CoordinatesType = {
  lat: string;
  lon: string;
};

export type SearchType = {
  type: SearchTypeEnum;
  location: string;
  coordinates: CoordinatesType;
};

const defaultSearch: SearchType = {
  type: SearchTypeEnum.LOCATION,
  coordinates: {
    lat: "",
    lon: "",
  },
  location: "",
};

export const Main = () => {
  const [search, setSearch] = useState<SearchType>(defaultSearch);
  const [currentWeather, setCurrentWeather] = useState<WeatherDTO | undefined>(undefined);
  const [temperature, setTemperature] = useState<CurrentTemperature>({
    code: "",
    type: "celsius",
    value: "",
  });
  const [isCurrentLocationFavorite, setIsCurrentLocationFavorite] = useState<boolean>(false);
  const [favoriteList, setFavoriteList] = useState<SearchType[]>([]);
  const [localStorageSearches, setLocalStorageSearches] = useState<SearchType[]>([]);

  const saveToLocalStorage = useCallback((key: string, value: SearchType[]) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, []);

  const loadFromLocalStorage = useCallback((key: string) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }, []);

  const isMobile = useMemo(() => {
    return window.innerWidth <= 767;
  }, []);

  const isTablet = useMemo(() => {
    return 1023 >= window.innerWidth && window.innerWidth > 767;
  }, []);

  useEffect(() => {
    const savedItems = loadFromLocalStorage("weatherSearches");
    setLocalStorageSearches(savedItems);
  }, [loadFromLocalStorage]);

  useEffect(() => {
    if (currentWeather) {
      const celsius = new Celcius(currentWeather?.current.temparature);
      switch (temperature.type) {
        case "celsius":
          setTemperature({
            code: celsius.unit.code,
            type: "celsius",
            value: celsius.value.toString(),
          });
          break;
        case "fahrenheit": {
          const fahrenheit = celsius.toFahrenheit();
          setTemperature({
            code: fahrenheit.unit.code,
            type: "fahrenheit",
            value: fahrenheit.value.toString(),
          });
          break;
        }
      }
    }
  }, [currentWeather, temperature.type]);

  const isSearchEqualToCurrentWeather = useCallback(
    (search: SearchType): boolean => {
      return (
        (search.location === currentWeather?.location.name && search.location !== "") ||
        (search.coordinates.lat === currentWeather?.location.lat && search.coordinates.lon === currentWeather?.location.lon && search.coordinates.lat !== "" && search.coordinates.lon !== "")
      );
    },
    [currentWeather?.location.lat, currentWeather?.location.lon, currentWeather?.location.name]
  );

  useEffect(() => {
    if (currentWeather) {
      const currentFavoriteWeather = favoriteList.find(el => isSearchEqualToCurrentWeather(el));
      setIsCurrentLocationFavorite(!!currentFavoriteWeather);
    }
  }, [currentWeather, favoriteList, isSearchEqualToCurrentWeather]);

  const getWeatherByLocation = useCallback(
    (selectedSearch: SearchType): Promise<void> => {
      setIsCurrentLocationFavorite(false);
      return WeatherService.getWeatherByLocation(selectedSearch).then(data => {
        const searchAlreadyExists = localStorageSearches.find(
          localeStorageSearch =>
            localeStorageSearch.coordinates.lat === selectedSearch.coordinates.lat &&
            localeStorageSearch.coordinates.lon === selectedSearch.coordinates.lon &&
            localeStorageSearch.location === selectedSearch.location &&
            localeStorageSearch.type === selectedSearch.type
        );

        const filteredLocalStorageSearches = localStorageSearches.filter(el => el !== searchAlreadyExists);
        const newLocalStorageSearches = filteredLocalStorageSearches.length <= 4 ? filteredLocalStorageSearches : filteredLocalStorageSearches.slice(1);
        const updatedItems = [...newLocalStorageSearches, selectedSearch];
        const sortedItems = updatedItems.sort();
        setLocalStorageSearches(sortedItems);
        saveToLocalStorage("weatherSearches", sortedItems);

        setCurrentWeather(data);
        setSearch(defaultSearch);
      });
    },
    [localStorageSearches, saveToLocalStorage]
  );

  const onClickFavoriteIcon = useCallback(() => {
    if (!isCurrentLocationFavorite && currentWeather) {
      setFavoriteList([
        ...favoriteList,
        {
          location: currentWeather.location.name,
          coordinates: {
            lat: currentWeather.location.lat,
            lon: currentWeather.location.lon,
          },
          type: currentWeather?.location.name ? SearchTypeEnum.LOCATION : SearchTypeEnum.COORDINATES,
        },
      ]);
    } else {
      const filteredFavoriteList = favoriteList.filter(el => {
        return !isSearchEqualToCurrentWeather(el);
      });
      setFavoriteList(filteredFavoriteList);
    }
  }, [currentWeather, favoriteList, isCurrentLocationFavorite, isSearchEqualToCurrentWeather]);

  const getSearchBoxComponent = useCallback((): React.ReactElement => {
    return (
      <div className={styles.searchBoxAndIcon}>
        <SearchBox isMobile={isMobile} getWeatherByLocation={getWeatherByLocation} search={search} setSearch={setSearch} />
        {isMobile && currentWeather && <FavoriteIcon isCurrentLocationFavorite={isCurrentLocationFavorite} isMobile={isMobile} onClickFavoriteIcon={onClickFavoriteIcon} />}
      </div>
    );
  }, [currentWeather, getWeatherByLocation, isCurrentLocationFavorite, isMobile, onClickFavoriteIcon, search]);

  return (
    <div
      className={`
    ${styles.background} 
    ${currentWeather ? styles[currentWeather.current.weather_descriptions[0].toLowerCase()] : ""}
    `}
    >
      <div className={styles.main}>
        {(isTablet || isMobile) && <div className={styles.mobileSearchBox}>{getSearchBoxComponent()}</div>}
        {currentWeather && (
          <div className={styles.weather}>
            <div className={styles.temperature}>{`${temperature.value}${temperature.code}`}</div>
            <div className={styles.weatherDescription}>
              <div className={styles.city}>
                {currentWeather.location.name !== "" ? `${currentWeather.location.name}, ${currentWeather.location.country}` : `${currentWeather.location.lat}, ${currentWeather.location.lon}`}
              </div>
              <div className={styles.date}>{currentWeather.location.localtime.replace(" ", ", ")}</div>
            </div>
            <div className={styles.weatherIcon}>{getIcon("snow", isTablet ? 55 : isMobile ? 40 : 70)}</div>
            {!isMobile && <FavoriteIcon isCurrentLocationFavorite={isCurrentLocationFavorite} onClickFavoriteIcon={onClickFavoriteIcon} />}
          </div>
        )}
      </div>
      <div className={styles.panel}>
        {!isTablet && !isMobile && getSearchBoxComponent()}
        {localStorageSearches.length > 0 && (
          <div className={styles.lastSearchesList}>
            <h2>Last search list:</h2>
            {localStorageSearches.map((el, index) => (
              <ListItem
                isMobile={isMobile}
                label={el.location !== "" ? el.location : `${el.coordinates.lat}, ${el.coordinates.lon}`}
                hasButton
                key={index}
                onButtonClick={() => getWeatherByLocation(el)}
              />
            ))}
          </div>
        )}
        <div className={styles.settings}>
          <h2>Settings</h2>
          <div className={styles.settingDetail}>
            <label>Search by:</label>
            <div className={styles.items}>
              <div className={styles.item}>
                <label>location</label>
                <div
                  className={`${styles.checkbox} ${search.type === SearchTypeEnum.LOCATION ? styles.active : ""}`}
                  onClick={() =>
                    setSearch({
                      ...search,
                      type: SearchTypeEnum.LOCATION,
                    })
                  }
                ></div>
              </div>
              <div className={styles.item}>
                <label>coordinates</label>
                <div
                  className={`${styles.checkbox} ${search.type === SearchTypeEnum.COORDINATES ? styles.active : ""}`}
                  onClick={() =>
                    setSearch({
                      ...search,
                      type: SearchTypeEnum.COORDINATES,
                    })
                  }
                ></div>
              </div>
            </div>
          </div>
          <div className={styles.settingDetail}>
            <label>Show temperature in:</label>
            <div className={styles.items}>
              <div className={styles.item}>
                <label>Celsius</label>
                <div
                  className={`${styles.checkbox} ${temperature.type === "celsius" ? styles.active : ""}`}
                  onClick={() =>
                    setTemperature({
                      ...temperature,
                      type: "celsius",
                    })
                  }
                ></div>
              </div>
              <div className={styles.item}>
                <label>Fahrenheit</label>
                <div
                  className={`${styles.checkbox} ${temperature.type === "fahrenheit" ? styles.active : ""}`}
                  onClick={() =>
                    setTemperature({
                      ...temperature,
                      type: "fahrenheit",
                    })
                  }
                ></div>
              </div>
            </div>
          </div>
        </div>
        {currentWeather && (
          <div className={styles.weatherDetails}>
            <h2>Weather details</h2>
            <ListItem icon="wind" isMobile={isMobile} label="Wind speed" unitOfMeasurement=" km/h" value={currentWeather.current.wind_speed} />
            <ListItem icon="wind-degree" isMobile={isMobile} label="Wind degree" unitOfMeasurement="°" value={currentWeather.current.wind_degree} />
            <ListItem icon="direction" isMobile={isMobile} label="Wind direction" unitOfMeasurement="" value={currentWeather.current.wind_dir} />
            <ListItem icon="pressure" isMobile={isMobile} label="Pressure" unitOfMeasurement=" mmHG" value={currentWeather.current.pressure} />
            <ListItem icon="rain" isMobile={isMobile} label="Precipitations" unitOfMeasurement=" mm" value={currentWeather.current.precip} />
            <ListItem icon="humidity" isMobile={isMobile} label="Humidity" unitOfMeasurement="%" value={currentWeather.current.humidity} />
            <ListItem icon="cloud" isMobile={isMobile} label="Cloud cover" unitOfMeasurement="%" value={currentWeather.current.cloudcover} />
            <ListItem icon="temperature" isMobile={isMobile} label="Feelslike" unitOfMeasurement="°C" value={currentWeather.current.feelslike} />
            <ListItem icon="sun" isMobile={isMobile} label="UV index" unitOfMeasurement="UV" value={currentWeather.current.uv_index} />
            <ListItem icon="visibility" isMobile={isMobile} label="Visibility" unitOfMeasurement=" m" value={currentWeather.current.visibility} />
          </div>
        )}
        {favoriteList.length > 0 && (
          <div className={styles.favoriteList}>
            <h2>Favorite search list:</h2>
            {favoriteList.map((el, index) => (
              <ListItem
                isMobile={isMobile}
                label={el.location !== "" ? el.location : `${el.coordinates.lat}, ${el.coordinates.lon}`}
                hasButton
                key={index}
                onButtonClick={() => getWeatherByLocation(el)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
