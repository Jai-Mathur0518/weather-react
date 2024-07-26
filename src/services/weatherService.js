import { DateTime } from "luxon";

const API_KEY = 'a6c716790eb3598637764a0e00503f52';
const BASE_URL = "https://api.openweathermap.org/data";

const getWeatherData = (version, infoType, searchParams) => {
    const url = new URL(`${BASE_URL}/${version}/${infoType}`);
    url.search = new URLSearchParams({ ...searchParams, appid: API_KEY });

    return fetch(url).then((res) => res.json());
};

const formatCurrentWeather = (data) => {
    const {
        coord: { lat, lon },
        main: { temp, feels_like, temp_min, temp_max, humidity },
        name,
        dt,
        sys: { country, sunrise, sunset },
        weather,
        wind: { speed },
    } = data;

    const { main: details, icon } = weather[0];

    return { lat, lon, temp, feels_like, temp_min, temp_max, humidity, name, dt, country, sunrise, sunset, details, icon, speed };
};

const formatForecastWeather = (data) => {
    let { timezone, daily, hourly } = data;
    daily = daily.slice(1, 6).map((d) => {
        return {
            title: formtToLocalTime(d.dt, timezone, 'ccc'),
            temp: d.temp.day,
            icon: d.weather[0].icon,
        };
    });
    hourly = hourly.slice(1, 6).map((d) => {
        return {
            title: formtToLocalTime(d.dt, timezone, 'hh:mm a'),
            temp: d.temp,
            icon: d.weather[0].icon,
        };
    });

    return { timezone, daily, hourly };
};

const getFormattedWeatherData = async (searchParams) => {
    const formattedCurrentedWeather = await getWeatherData(
        '2.5', // Specify the version here
        'weather',
        searchParams
    ).then(formatCurrentWeather);

    const { lat, lon } = formattedCurrentedWeather;

    const formattedForecastWeather = await getWeatherData('3.0', 'onecall', {
        lat,
        lon,
        exclude: 'current,minutely,alerts',
        units: searchParams.units,
    }).then(formatForecastWeather);

    return { ...formattedCurrentedWeather, ...formattedForecastWeather };
};

const formtToLocalTime = (secs, zone, format = "cccc, dd LLL yyyy' | Local time: 'hh:mm a") =>
    DateTime.fromSeconds(secs).setZone(zone).toFormat(format);


const iconUrlFromCode = (code) => `http://openweathermap.org/img/wn/${code}@2x.png`;
    
export default getFormattedWeatherData;

export {formtToLocalTime, iconUrlFromCode};
