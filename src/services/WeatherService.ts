import axios, { AxiosError, AxiosResponse } from "axios";
import { SearchType, SearchTypeEnum } from "../pages/Home";

export type WeatherDTO = {
  request: {
    type: string;
    query: string;
    language: string;
    unit: string;
  };
  location: {
    name: string;
    country: string;
    region: string;
    lat: string;
    lon: string;
    timezone_id: string;
    localtime: string;
    localtime_epoch: number;
    utc_offset: string;
  };
  current: {
    observation_time: string;
    temparature: number;
    weather_code: number;
    weather_icons: string[];
    weather_descriptions: string[];
    wind_speed: number;
    wind_degree: number;
    wind_dir: string;
    pressure: number;
    precip: number;
    humidity: number;
    cloudcover: number;
    feelslike: number;
    uv_index: number;
    visibility: number;
  };
};

const weatherMock: WeatherDTO = {
  request: {
    type: "City",
    query: "San Francisco, United States of America",
    language: "en",
    unit: "m",
  },
  location: {
    name: "San Francisco",
    country: "United States of America",
    region: "California",
    lat: "37.775",
    lon: "-122.418",
    timezone_id: "America/Los_Angeles",
    localtime: "2019-09-03 05:35",
    localtime_epoch: 1567488900,
    utc_offset: "-7.0",
  },
  current: {
    observation_time: "12:35 PM",
    temparature: 16,
    weather_code: 122,
    weather_icons: ["https://assets.weatherstack.com/images/symbol.png"],
    weather_descriptions: ["Overcast"],
    wind_speed: 17,
    wind_degree: 260,
    wind_dir: "W",
    pressure: 1016,
    precip: 0,
    humidity: 87,
    cloudcover: 100,
    feelslike: 16,
    uv_index: 0,
    visibility: 16,
  },
};

const errorHandler = (err: AxiosError) => {
  switch (err.code) {
    case "400":
      alert("Errore 400: Richiesta non valida");
      break;
    case "401":
      alert("Errore 401: Non autorizzato");
      break;
    case "403":
      alert("Errore 403: Accesso vietato");
      break;
    case "404":
      alert("Errore 404: Risorsa non trovata");
      break;
    case "500":
      alert("Errore 500: Errore interno del server");
      break;
    default:
      alert("Errore sconosciuto");
  }
};

const getWeatherByLocation = (search: SearchType): Promise<WeatherDTO> => {
  const query = search.type === SearchTypeEnum.LOCATION ? search.location : `${search.coordinates.lat},${search.coordinates.lon}`;
  const params = {
    access_key: process.env.REACT_APP_API_KEY,
    query,
  };
  return axios
    .get("https://api.weatherstack.com/current", { params })
    .then((response: AxiosResponse<any>) => {
      const data = response.data;
      // if (data.success) {
      //   return data;
      // } else {
      //   return Promise.resolve(alert(`${data.error.code} - ${data.error.info}`));
      // }
      return Promise.resolve({
        ...weatherMock,
        location: {
          ...weatherMock.location,
          name: search.type === SearchTypeEnum.LOCATION ? search.location : "",
          lat: search.type === SearchTypeEnum.COORDINATES ? search.coordinates.lat : "",
          lon: search.type === SearchTypeEnum.COORDINATES ? search.coordinates.lon : "",
        },
      });
    })
    .catch((err: AxiosError) => {
      errorHandler(err);
      return Promise.reject();
    });
};

export const WeatherService = {
  getWeatherByLocation,
};
