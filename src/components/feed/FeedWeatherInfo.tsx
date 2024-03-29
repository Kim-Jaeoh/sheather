import React from "react";
import { useMemo } from "react";
import styled from "@emotion/styled";
import useCurrentLocation from "../../hooks/useCurrentLocation";
import { MdPlace } from "react-icons/md";
import { Spinner } from "../../assets/spinner/Spinner";
import Flicking from "@egjs/react-flicking";
import "../../styles/DetailFlicking.css";
import TempClothes from "../../assets/data/TempClothes";
import { BiErrorCircle } from "react-icons/bi";
import useWeatherQuery from "../../hooks/useQuery/useWeatherQuery";
import useRegionQuery from "../../hooks/useQuery/useRegionQuery";
import { Link, useNavigate } from "react-router-dom";

const FeedWeatherInfo = () => {
  const { location } = useCurrentLocation();
  const { tempClothes, clothesCategory } = TempClothes(); // 옷 정보
  const { weatherData } = useWeatherQuery();
  const { region, isRegionLoading } = useRegionQuery();
  const navigate = useNavigate();

  const filterTempClothes = useMemo(() => {
    const temp = weatherData?.data?.main.temp;

    return tempClothes.filter(
      (info) =>
        // ex) min: 23, max: 27, currentTemp: `23` (22.66 반올림)
        // 23(min) <= `23` <= 27(max)
        info.tempMin <= Math.round(temp) && Math.round(temp) <= info.tempMax
    );
  }, [tempClothes, weatherData?.data?.main.temp]);

  const onSetUrl = (q: string, cat: string, detail: string | number) => {
    navigate(`/explore?q=${q}&cat=${cat}&detail=${detail}&sort=recent`);
  };

  return (
    <Container>
      {!location?.error?.message ? (
        <>
          {!isRegionLoading ? (
            <WeatherBox>
              <NowBox>
                <p>NOW</p>
              </NowBox>
              <WeatherInfo
                onClick={() =>
                  onSetUrl("region", "region", region?.region_1depth_name)
                }
              >
                <InfoText>
                  <MdPlace />
                  {region?.region_1depth_name} {region?.region_3depth_name}
                </InfoText>
                <WeatherIcon>
                  <img
                    src={`/image/weather/${weatherData?.data?.weather[0].icon}.png`}
                    alt="weather icon"
                  />
                </WeatherIcon>
              </WeatherInfo>
              <WeatherInfo>
                <InfoText>날씨</InfoText>
                <WeatherDesc
                  onClick={() =>
                    onSetUrl(
                      "weather",
                      "weather",
                      weatherData?.data?.weather[0].description
                    )
                  }
                >
                  {weatherData?.data?.weather[0].description}
                </WeatherDesc>
              </WeatherInfo>
              <WeatherInfo>
                <InfoText>온도</InfoText>
                <WeatherTemp
                  onClick={() =>
                    onSetUrl(
                      "weather",
                      "temp",
                      Math.round(weatherData?.data?.main.temp)
                    )
                  }
                >
                  {Math.round(weatherData?.data?.main.temp)}
                  <sup>º</sup>
                </WeatherTemp>
              </WeatherInfo>
              <WeatherInfo>
                <InfoText>바람</InfoText>
                <WeatherTemp
                  onClick={() =>
                    onSetUrl(
                      "weather",
                      "wind",
                      Math.round(weatherData?.data?.wind.speed)
                    )
                  }
                >
                  {Math.round(weatherData?.data?.wind.speed)}
                  <span>m/s</span>
                </WeatherTemp>
              </WeatherInfo>
              <WeatherClothesInfo>
                <InfoText>추천하는 옷</InfoText>
                <FlickingCategoryBox>
                  <Flicking moveType="freeScroll" bound={true} align="prev">
                    <TagBox>
                      {filterTempClothes[0]?.clothes?.map((clothes, index) => {
                        const select = Object.entries(clothesCategory).filter(
                          (cat) => cat[1].some((obj) => obj === clothes)
                        );
                        return (
                          <Tag
                            to={`/explore?q=clothes&cat=${select[0][0]}&detail=${clothes}&sort=recent`}
                            key={index}
                          >
                            {clothes}
                          </Tag>
                        );
                      })}
                    </TagBox>
                  </Flicking>
                </FlickingCategoryBox>
              </WeatherClothesInfo>
            </WeatherBox>
          ) : (
            <Spinner />
          )}
        </>
      ) : (
        <NotInfoBox>
          <NotInfo>
            <BiErrorCircle />
            위치 권한이 허용되지 않았습니다.
          </NotInfo>
        </NotInfoBox>
      )}
    </Container>
  );
};

export default FeedWeatherInfo;

const Container = styled.nav`
  position: sticky;
  flex-shrink: 0;
  top: 0px;
  height: 80px;
  border-top: 2px solid #222;
  border-bottom: 2px solid #222;
  background-color: #fff;
  overflow: hidden;
  z-index: 99;
`;

const WeatherBox = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;

  div:not(:nth-of-type(1), :nth-of-type(3)) {
    flex: 1;
  }
  div:nth-of-type(3) {
    flex: 1 0 auto;
  }
`;

const NowBox = styled.div`
  width: 22px;
  height: 100%;
  background-color: #ff5673;
  display: inline-block;
  overflow: hidden;
  border-right: 2px solid #222222;
  position: relative;

  p {
    position: absolute;
    top: 50%;
    left: 50%;
    font-size: 12px;
    letter-spacing: 2px;
    font-weight: bold;
    color: #fff;
    transform: translate(-50%, -50%) rotate(-90deg);
  }
`;

const WeatherInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  max-width: 110px;
  min-width: 80px;
  text-align: center;
  text-overflow: ellipsis;
  height: 100%;
  padding: 6px 14px;
  position: relative;

  &::after {
    content: "";
    display: block;
    position: absolute;
    right: 0;
    width: 1px;
    height: 100%;
    background: #dbdbdb;
  }
`;

const WeatherClothesInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  text-overflow: ellipsis;
  width: 100%;
  height: 100%;
  padding: 6px 14px;
  position: relative;
`;

const FlickingCategoryBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex: 1;
  cursor: pointer;
  &::after {
    right: 0px;
    background: linear-gradient(to right, rgba(255, 255, 255, 0), #fff);
    position: absolute;
    top: 0px;
    z-index: 10;
    height: 100%;
    width: 14px;
    content: "";
  }
`;

const TagBox = styled.div`
  display: flex;
  flex: nowrap;
  width: 100%;
  padding: 2px;
  gap: 8px;
`;

const Tag = styled(Link)`
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  padding: 6px 8px;
  display: flex;
  align-items: center;
  border: 1px solid var(--third-color);
  border-radius: 4px;

  svg {
    margin-right: 2px;
    font-size: 12px;
    color: var(--second-color);
  }
`;

const WeatherIcon = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  justify-content: center;
  width: 64px;
  flex: 1;
  overflow: hidden;
  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const InfoText = styled.span`
  font-size: 12px;
  cursor: pointer;
  height: 20px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  svg {
    color: var(--third-color);
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const WeatherTemp = styled.p`
  font-size: 18px;
  flex: 1;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  span {
    font-size: 14px;
    margin-top: 4px;
  }

  sup {
    font-size: 14px;
    margin-bottom: 4px;
  }
`;

const WeatherDesc = styled.span`
  cursor: pointer;
  font-size: 14px;
  word-break: keep-all;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  font-weight: bold;
`;

const NotInfoBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--second-color);
`;

const NotInfo = styled.p`
  color: #fff;
  opacity: 0.4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  svg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    margin-right: 6px;
  }
`;
