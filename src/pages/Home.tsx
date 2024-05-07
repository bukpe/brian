import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./home.module.scss";
import { WeatherDTO, WeatherService } from "../services/WeatherService";
import { Checkbox } from "../components/Checkbox/Checkbox";
import { Textbox } from "../components/Textbox/Textbox";
import { getIcon } from "../services/IconService";
import { Celcius } from "@khanisak/temperature-converter";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

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

export const Home = () => {
  const [search, setSearch] = useState<SearchType>(defaultSearch);
  const [currentWeather, setCurrentWeather] = useState<WeatherDTO | undefined>(undefined);
  const [temperature, setTemperature] = useState<CurrentTemperature>({
    code: "",
    type: "celsius",
    value: "",
  });
  const [favoriteList, setFavoriteList] = useState<SearchType[]>([]);
  const [localStorageData, setLocalStorageData] = useState<SearchType[]>([]);

  const isMobileDevice = useMemo(() => {
    return window.innerWidth <= 768;
  }, []);

  useEffect(() => {
    const savedLocalStorageData = localStorage.getItem("savedLocalStorageData");
    if (savedLocalStorageData) {
      setLocalStorageData(JSON.parse(savedLocalStorageData));
    }
  }, []);

  const filterUniqueSearchTypes = (searchList: SearchType[]): SearchType[] => {
    const uniqueSearchList: SearchType[] = [];
    searchList.forEach(searchItem => {
      if (searchItem.location === "" && searchItem.coordinates.lat === "" && searchItem.coordinates.lon === "") {
        return searchList;
      }
      if (
        !uniqueSearchList.some(
          item => item.coordinates.lat === searchItem.coordinates.lat && item.coordinates.lon === searchItem.coordinates.lon && item.location === searchItem.location && item.type === searchItem.type
        )
      ) {
        uniqueSearchList.push(searchItem);
      }
    });
    return uniqueSearchList;
  };

  const saveLocalStorageData = useCallback(() => {
    let newLocalStorageData = [...localStorageData];
    if (filterUniqueSearchTypes(localStorageData).length === 5) {
      localStorage.removeItem("savedLocalStorageData");
      newLocalStorageData.pop();
    }
    const listToSave = filterUniqueSearchTypes([search, ...newLocalStorageData]);
    localStorage.setItem("savedLocalStorageData", JSON.stringify(listToSave));
    setLocalStorageData(listToSave);
  }, [search, localStorageData]);

  const isSearchDisabled = useMemo(() => {
    const isLocationUnset = search.location === "";
    const isLatUnset = search.coordinates.lat === "";
    const isLonUnset = search.coordinates.lon === "";
    return isLocationUnset && isLatUnset && isLonUnset;
  }, [search.coordinates.lat, search.coordinates.lon, search.location]);

  const getWeatherByLocation = useCallback(
    (selectedSearch: SearchType) => {
      return WeatherService.getWeatherByLocation(selectedSearch).then(data => {
        saveLocalStorageData();
        const celsius = new Celcius(data.current.temparature);
        setTemperature({
          code: celsius.unit.code,
          type: "celsius",
          value: celsius.value.toString(),
        });
        setCurrentWeather(data);
      });
    },
    [saveLocalStorageData]
  );

  return (
    <div className={styles.home}>
      <div className={styles.searchField}>
        <div>
          <p>Cerca per:</p>
          <div className={styles.coordinatesField}>
            <div className={styles.coordinateField}>
              <Checkbox
                isChecked={search.type === SearchTypeEnum.LOCATION}
                onChange={() =>
                  setSearch({
                    ...search,
                    type: SearchTypeEnum.LOCATION,
                  })
                }
                id="locationInput"
                name="location"
              />
              <label>località</label>
            </div>
            <div className={styles.coordinateField}>
              <Checkbox
                name="coordinates"
                id="coordinatesInput"
                onChange={() =>
                  setSearch({
                    ...search,
                    type: SearchTypeEnum.COORDINATES,
                  })
                }
                isChecked={search.type === SearchTypeEnum.COORDINATES}
              />
              <label>coordinate</label>
            </div>
          </div>
          <div className={styles.searchBar}>
            {search.type === SearchTypeEnum.LOCATION ? (
              <Textbox
                onChange={location =>
                  setSearch({
                    ...search,
                    location,
                  })
                }
                placeholder="Milano"
                value={search.location}
              />
            ) : (
              <div className={styles.coordinatesInputs}>
                <Textbox
                  placeholder="0"
                  onChange={lat =>
                    setSearch({
                      ...search,
                      coordinates: {
                        ...search.coordinates,
                        lat,
                      },
                    })
                  }
                  value={search.coordinates.lat}
                />
                <Textbox
                  placeholder="0"
                  onChange={lon =>
                    setSearch({
                      ...search,
                      coordinates: {
                        ...search.coordinates,
                        lon,
                      },
                    })
                  }
                  value={search.coordinates.lon}
                />
              </div>
            )}
            <button
              onClick={() => {
                setLocalStorageData([...localStorageData, search]);
                getWeatherByLocation(search);
              }}
              disabled={isSearchDisabled}
            >
              Cerca
            </button>
          </div>
          <div className={styles.coordinatesField}>
            <div className={styles.coordinateField}>
              <label>Celsius</label>
              <Checkbox
                id="temperatureTypeCelsius"
                isChecked={temperature.type === "celsius"}
                name="celsius"
                onChange={() => {
                  const celsius = currentWeather && new Celcius(currentWeather?.current.temparature);
                  setTemperature({
                    code: celsius?.unit.code || "",
                    value: celsius?.value.toString() || "",
                    type: "celsius",
                  });
                }}
              />
            </div>
            <div className={styles.coordinateField}>
              <label>Fahrenheit</label>
              <Checkbox
                id="temperatureTypeFahrenheit"
                isChecked={temperature.type === "fahrenheit"}
                name="fahrenheit"
                onChange={() => {
                  const fahrenheit = currentWeather && new Celcius(currentWeather?.current.temparature).toFahrenheit();
                  setTemperature({
                    code: fahrenheit?.unit.code || "",
                    value: fahrenheit?.value.toString() || "",
                    type: "fahrenheit",
                  });
                }}
              />
            </div>
          </div>
        </div>
        {favoriteList.length > 0 && <label>Lista preferiti</label>}
        <div className={styles.favoriteList}>
          {filterUniqueSearchTypes(favoriteList).map((el, i) => {
            const label = el.type === SearchTypeEnum.LOCATION ? el.location : `${el.coordinates.lat},${el.coordinates.lon}`;
            return (
              <button
                key={i}
                className={styles.favoriteItemList}
                onClick={() => {
                  setSearch(el);
                  getWeatherByLocation(el);
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
        {localStorageData.length > 0 && <label>Lista ultime ricerche</label>}
        <div className={styles.favoriteList}>
          {filterUniqueSearchTypes(localStorageData).map((el, i) => {
            const label = el.type === SearchTypeEnum.LOCATION ? el.location : `${el.coordinates.lat},${el.coordinates.lon}`;
            return (
              <button
                key={i}
                className={styles.favoriteItemList}
                onClick={() => {
                  setSearch(el);
                  getWeatherByLocation(el);
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <div className={styles.weatherLocationField}>
        {currentWeather ? (
          <>
            <div>
              <div className={styles.weatherIcon}>{getIcon(currentWeather?.current.weather_descriptions[0], isMobileDevice ? 50 : 200)}</div>
              <p>
                <span>{currentWeather?.location?.name}</span>
                <span>{temperature.value + temperature.code}</span>
              </p>
            </div>
            <div className={styles.windValues}>
              <p>Vento</p>
              <div>
                <div className={styles.icon}>{getIcon("wind", isMobileDevice ? 30 : 100)}</div>
                <div className={styles.description}>
                  <p>velocità: {currentWeather?.current.wind_speed} km/h</p>
                  <p>direzione: {currentWeather?.current.wind_dir}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                console.log(search, favoriteList);
                setFavoriteList([...favoriteList, search]);
              }}
            >
              Salva nei preferiti
            </button>
          </>
        ) : (
          <div className={styles.noSearch}>Esegui una ricerca</div>
        )}
      </div>
    </div>
  );
};
