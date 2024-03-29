import styled from "@emotion/styled";
import Flicking from "@egjs/react-flicking";
import { BsSun } from "react-icons/bs";
import { IoShirtOutline } from "react-icons/io5";
import { MdPlace } from "react-icons/md";
import useMediaScreen from "../../../hooks/useMediaScreen";
import { FeedType } from "../../../types/type";
import { useNavigate } from "react-router-dom";

type Props = {
  feed: FeedType;
};

const DetailFeedCategory = ({ feed }: Props) => {
  const { outer, top, innerTop, bottom, etc } = feed?.wearInfo;
  const categoryTags = [
    { name: "outer", type: "outer", detail: outer },
    { name: "top", type: "top", detail: top },
    { name: "innerTop", type: "innerTop", detail: innerTop },
    { name: "bottom", type: "bottom", detail: bottom },
    { name: "etc", type: "etc", detail: etc },
  ];
  const { isMobile } = useMediaScreen();
  const navigate = useNavigate();

  const onWearClick = (cat: string, detail: string) => {
    navigate(`/explore?q=clothes&cat=${cat}&detail=${detail}&sort=recent`);
  };

  // const onWeatherClick = (cat: string, detail: string | number) => {
  //   navigate(`/explore?q=weather&cat=${cat}&detail=${detail}&sort=recent`);
  // };

  // const onRegionClick = (cat: string, detail: string) => {
  //   navigate(`/explore?q=region&cat=${cat}&detail=${detail}&sort=recent`);
  // };

  const onClick = (q: string, cat: string, detail: string | number) => {
    navigate(`/explore?q=${q}&cat=${cat}&detail=${detail}&sort=recent`);
  };

  return (
    <WearDetailBox>
      {isMobile ? (
        <WearDetail>
          <WearInfoBox>
            <FlickingCategoryBox>
              <Flicking moveType="freeScroll" bound={true} align="prev">
                <WearInfo>
                  <CategoryTagBox>
                    <WearInfoMain>
                      <BsSun />
                    </WearInfoMain>
                    <CategoryTag
                      onClick={() => onClick("region", "region", feed.region)}
                    >
                      <MdPlace />
                      {feed.region}
                    </CategoryTag>
                    <CategoryTag
                      onClick={() =>
                        onClick("weather", "weather", feed.weatherInfo.weather)
                      }
                    >
                      <WeatherIcon>
                        <img
                          src={`/image/weather/${feed.weatherInfo.weatherIcon}.png`}
                          alt="weather icon"
                        />
                      </WeatherIcon>
                      {feed.weatherInfo.weather}
                    </CategoryTag>
                    <CategoryTag
                      onClick={() =>
                        onClick("weather", "temp", feed.weatherInfo.temp)
                      }
                    >
                      {feed.weatherInfo.temp}º
                    </CategoryTag>
                    <CategoryTag
                      onClick={() =>
                        onClick("weather", "wind", feed.weatherInfo.wind)
                      }
                    >
                      {feed.weatherInfo.wind}
                      <span>m/s</span>
                    </CategoryTag>
                    <WearInfoMain style={{ marginLeft: `4px` }}>
                      <IoShirtOutline />
                    </WearInfoMain>
                    <CategoryTag>{feed.feel}</CategoryTag>
                    {categoryTags.map((tag) =>
                      tag.detail ? (
                        <CategoryTag
                          key={tag.name}
                          onClick={() => onWearClick(tag.type, tag.detail)}
                        >
                          {tag.detail}
                        </CategoryTag>
                      ) : null
                    )}
                  </CategoryTagBox>
                </WearInfo>
              </Flicking>
            </FlickingCategoryBox>
          </WearInfoBox>
        </WearDetail>
      ) : (
        <>
          <WearDetail>
            <WearInfoBox>
              <WearInfoMain>
                <BsSun />
              </WearInfoMain>
              <FlickingCategoryBox>
                <Flicking moveType="freeScroll" bound={true} align="prev">
                  <WearInfo>
                    <CategoryTagBox>
                      <CategoryTag
                        onClick={() => onClick("region", "region", feed.region)}
                      >
                        <MdPlace />
                        {feed.region}
                      </CategoryTag>
                      <CategoryTag
                        onClick={() =>
                          onClick(
                            "weather",
                            "weather",
                            feed.weatherInfo.weather
                          )
                        }
                      >
                        <WeatherIcon>
                          <img
                            src={`/image/weather/${feed.weatherInfo.weatherIcon}.png`}
                            alt="weather icon"
                          />
                        </WeatherIcon>
                        {feed.weatherInfo.weather}
                      </CategoryTag>
                      <CategoryTag
                        onClick={() =>
                          onClick("weather", "temp", feed.weatherInfo.temp)
                        }
                      >
                        {feed.weatherInfo.temp}º
                      </CategoryTag>
                      <CategoryTag
                        onClick={() =>
                          onClick("weather", "wind", feed.weatherInfo.wind)
                        }
                      >
                        {feed.weatherInfo.wind}
                        <span>m/s</span>
                      </CategoryTag>
                    </CategoryTagBox>
                  </WearInfo>
                </Flicking>
              </FlickingCategoryBox>
            </WearInfoBox>
          </WearDetail>
          <WearDetail>
            <WearInfoBox>
              <WearInfoMain>
                <IoShirtOutline />
              </WearInfoMain>
              <FlickingCategoryBox>
                <Flicking moveType="freeScroll" bound={true} align="prev">
                  <WearInfo>
                    <CategoryTagBox>
                      <CategoryTag>{feed.feel}</CategoryTag>
                      {categoryTags.map((tag) =>
                        tag.detail ? (
                          <CategoryTag
                            key={tag.name}
                            onClick={() => onWearClick(tag.type, tag.detail)}
                          >
                            {tag.detail}
                          </CategoryTag>
                        ) : null
                      )}
                    </CategoryTagBox>
                  </WearInfo>
                </Flicking>
              </FlickingCategoryBox>
            </WearInfoBox>
          </WearDetail>
        </>
      )}
    </WearDetailBox>
  );
};

export default DetailFeedCategory;

const WearDetailBox = styled.div`
  overflow: hidden;
  display: flex;
  border-bottom: 1px solid var(--fourth-color);
`;

const WearDetail = styled.div`
  position: relative;
  padding: 10px 14px;
  display: flex;
  flex: 1;
  align-items: center;
  &:not(:last-of-type) {
    border-right: 1px solid var(--fourth-color);
  }

  @media (max-width: 767px) {
    padding: 10px 16px;
    overflow: hidden;
  }
`;

const WearInfoBox = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  overflow: hidden;
`;

const WearInfoMain = styled.div`
  flex: 0 0 auto;
  user-select: text;
  color: var(--second-color);
  text-align: center;
  margin-right: 12px;
  font-size: 14px;

  svg {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media (max-width: 767px) {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 4px;

    svg {
      color: var(--third-color);
      width: 12px;
      height: 12px;
    }
  }
`;

const FlickingCategoryBox = styled.div`
  width: 100%;
  cursor: pointer;
  position: relative;
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

const WearInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const WeatherIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 4px;
  img {
    display: block;
    width: 100%;
  }
`;

const CategoryTagBox = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
`;

const CategoryTag = styled.div`
  font-size: 14px;
  padding: 6px 8px;
  height: 30px;
  display: flex;
  align-items: center;
  border: 1px solid var(--fourth-color);
  border-radius: 8px;
  color: var(--third-color);
  svg {
    margin-right: 2px;
    font-size: 12px;
    color: var(--third-color);
  }

  @media (max-width: 767px) {
    font-size: 12px;
    padding: 4px 6px;
  }
`;
