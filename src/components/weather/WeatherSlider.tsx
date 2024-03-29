import React, { useMemo, useState } from "react";
import styled from "@emotion/styled";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { FiShare } from "react-icons/fi";
import { TbShirt } from "react-icons/tb";
import WeatherClothes from "./WeatherClothes";
import { shareWeather } from "../../app/weather";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { WeathersFiveDataType } from "../../types/type";
import ShareWeatherModal from "../modal/shareWeather/ShareWeatherModal";
import Flicking from "@egjs/react-flicking";
import "../../styles/SlickSliderFlicking.css";
import useFlickingArrow from "../../hooks/useFlickingArrow";
import moment from "moment";
import useMediaScreen from "../../hooks/useMediaScreen";

type PropsType = {
  data: WeathersFiveDataType[];
};

interface ResDataType {
  dt?: number;
  dt_txt?: string;
  weather?: { description: string; icon: string }[];
  main?: {
    temp: number;
    feels_like: number;
    temp_max: number;
    temp_min: number;
  };
  wind?: { speed: number };
}

const WeatherSlider = ({ data }: PropsType) => {
  const { currentUser: userObj } = useSelector((state: RootState) => {
    return state.user;
  });
  const [clothesBtn, setClothesBtn] = useState(false);
  const [shareBtn, setShareBtn] = useState(false);
  const [selected, setSelected] = useState(null);
  const dispatch = useDispatch();
  const { isMobile } = useMediaScreen();
  const {
    flickingRef,
    visible,
    visible2,
    setSlideIndex,
    onClickArrowPrev,
    onClickArrowNext,
  } = useFlickingArrow({
    dataLength: data.length,
    lastLength: isMobile ? 2 : data.length < 4 ? data.length : 4,
  });

  // 오늘 날짜인지 boolean 체크, 날짜 입력값
  const day = useMemo(() => {
    if (data) {
      const time = new Date();
      const today = moment(data[1]?.dt).format("DD");
      const dayCheck = time.getDate() === Number(today);
      return dayCheck ? "오늘" : `${moment(data[1]?.dt).format("DD")}일`;
    }
  }, [data]);

  const onShareBtnClick = (res: ResDataType) => {
    setShareBtn(true);
    dispatch(shareWeather(res));
  };

  const clothBtnClick = (index: number) => {
    setClothesBtn((prev) => !prev);
    setSelected(index);
  };

  return (
    <>
      {shareBtn && (
        <ShareWeatherModal shareBtn={shareBtn} setShareBtn={setShareBtn} />
      )}
      {data && (
        <Wrapper>
          <WeatherDateBox>
            <PrevArrow onClick={onClickArrowPrev} visible={visible}>
              <ArrowIcon>
                <IoIosArrowBack />
              </ArrowIcon>
            </PrevArrow>
            <WeatherDate>{data.length > 8 ? `오늘 ~ ${day}` : day}</WeatherDate>
            <NextArrow onClick={onClickArrowNext} visible={visible2}>
              <ArrowIcon>
                <IoIosArrowForward />
              </ArrowIcon>
            </NextArrow>
          </WeatherDateBox>
          <FlickingBox>
            <Flicking
              align={"prev"}
              panelsPerView={isMobile ? 2 : data.length < 4 ? data.length : 4}
              circular={false}
              ref={flickingRef}
              bound={true}
              bounce={0}
              autoInit={true}
              onChanged={(e) => {
                setSlideIndex(e.index);
              }}
            >
              {data?.map((res: ResDataType, index: number) => {
                return (
                  <Container key={res?.dt}>
                    {index === selected && clothesBtn && (
                      <WeatherClothes
                        index={index}
                        clothBtnClick={() => clothBtnClick(index)}
                        temp={res?.main?.temp}
                      />
                    )}
                    <WeatherList
                      clothes={clothesBtn}
                      index={index}
                      selected={selected}
                    >
                      <WeatherInfoBox>
                        <WeatherInfoBtn onClick={() => clothBtnClick(index)}>
                          <TbShirt />
                        </WeatherInfoBtn>

                        <WeatherDateListBox now={res?.dt_txt}>
                          <WeatherDateList now={res?.dt_txt}>
                            {!res?.dt_txt
                              ? "지금"
                              : `${moment(res?.dt).format("HH")}시`}
                          </WeatherDateList>
                        </WeatherDateListBox>
                        {!res?.dt_txt && userObj.displayName && (
                          <WeatherInfoBtn
                            disabled={Boolean(res?.dt_txt)}
                            onClick={() => {
                              onShareBtnClick(res);
                            }}
                          >
                            <FiShare />
                          </WeatherInfoBtn>
                        )}
                      </WeatherInfoBox>

                      <WeatherCategoryIconBox>
                        <WeatherCategoryIconText>
                          {res?.weather[0]?.description}
                        </WeatherCategoryIconText>
                        <WeatherCategoryIcon>
                          <img
                            src={`/image/weather/${res?.weather[0].icon}.png`}
                            alt="weather icon"
                            loading="lazy"
                          />
                        </WeatherCategoryIcon>
                        <WeatherCategoryIconText>
                          {Math.round(res?.main.temp)}º
                        </WeatherCategoryIconText>
                      </WeatherCategoryIconBox>
                      <WeatherCategoryBox>
                        <WeatherCategory>
                          <WeatherCategoryText>
                            <WeatherCategoryMain>최고</WeatherCategoryMain>
                            <WeatherCategorySub>
                              {Math.round(res?.main.temp_max)}º
                            </WeatherCategorySub>
                          </WeatherCategoryText>
                          <WeatherCategoryText>
                            <WeatherCategoryMain>체감</WeatherCategoryMain>
                            <WeatherCategorySub>
                              {Math.round(res?.main?.feels_like)}º
                            </WeatherCategorySub>
                          </WeatherCategoryText>
                        </WeatherCategory>
                        <WeatherCategory>
                          <WeatherCategoryText>
                            <WeatherCategoryMain>최저</WeatherCategoryMain>
                            <WeatherCategorySub>
                              {Math.round(res?.main.temp_min)}º
                            </WeatherCategorySub>
                          </WeatherCategoryText>
                          <WeatherCategoryText>
                            <WeatherCategoryMain>바람</WeatherCategoryMain>
                            <WeatherCategorySub>
                              {Math.round(res?.wind.speed)}
                              <span>m/s</span>
                            </WeatherCategorySub>
                          </WeatherCategoryText>
                        </WeatherCategory>
                      </WeatherCategoryBox>
                    </WeatherList>
                  </Container>
                );
              })}
            </Flicking>
          </FlickingBox>
        </Wrapper>
      )}
    </>
  );
};

export default React.memo(WeatherSlider);

const Wrapper = styled.div`
  /* background: #fff; */
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  border: 2px solid var(--second-color);

  &:not(:last-of-type) {
    margin-bottom: 30px;
  }

  @media (max-width: 767px) {
    border: 1px solid var(--second-color);
  }
`;

const FlickingBox = styled.ul`
  background: #fff;
  min-height: 376px;
  li:not(:last-of-type) {
    border-right: 1px solid var(--fourth-color);
  }
`;

const Container = styled.li`
  width: 100%;
  height: 100%;
  padding: 14px;
  word-wrap: break-word;
  position: relative;
  background: #fff;
`;

const WeatherInfoBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const WeatherInfoBtn = styled.button`
  width: 28px;
  height: 28px;
  border: 1px solid var(--fourth-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  transition: all 0.1s;
  outline: none;
  cursor: pointer;
  :disabled {
    cursor: default;
  }

  svg {
    width: 14px;
    height: 14px;
  }

  &:not(:disabled):hover {
    /* border: 1px solid var(--weather-color); */
    border: 1px solid #174b87;
    svg {
      /* color: var(--weather-color); */
      color: #174b87;
    }
  }
`;

const WeatherDateBox = styled.div`
  text-align: center;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #174b87;
  margin-top: -2px;
  /* background: #fff; */
  /* border-top: 2px solid var(--second-color); */
  border-bottom: 1px solid var(--second-color);

  /* @media (max-width: 767px) {
    border: none;
    border-bottom: 1px solid var(--second-color);
  } */
`;

const WeatherDate = styled.span`
  font-size: 14px;
  cursor: default;
  user-select: none;
  font-weight: bold;
  white-space: nowrap;
  padding: 6px 10px;
  border-radius: 9999px;
  /* background-color: var(--weather-color); */
  /* color: #fff; */
  background-color: #fff;
  color: #174b87;
  margin: 0 14px;
`;

const WeatherList = styled.div<{
  index: number;
  selected: number;
  clothes: boolean;
}>`
  filter: ${(props) =>
    props.clothes && props.index === props.selected && "blur(3px)"};
  transition: filter 0.1s ease;
  width: 100%;
  font-size: 12px;
  line-height: 20px;
  word-wrap: break-word;
`;

const WeatherDateListBox = styled.div<{ now?: string }>`
  width: 52px;
  position: absolute;
  left: 50%;
  transform: translate(-50%, 0);
  /* border: 1px solid
    ${(props) => (!props?.now ? "var(--weather-color)" : "#b3b3b3")}; */
  border: 1px solid ${(props) => (!props?.now ? "#174b87" : "#b3b3b3")};
  border-radius: 9999px;
  margin: 0 auto;
  text-align: center;
  padding: 2px 10px;
`;

const WeatherDateList = styled.span<{ now?: string }>`
  user-select: none;
  cursor: default;
  color: ${(props) => !props?.now && "#174b87"};
  /* color: ${(props) => !props?.now && "var(--weather-color)"}; */
  font-size: 14px;
  font-weight: bold;
  user-select: text;
`;

const WeatherCategoryBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 26px;
  padding: 4px;
`;

const WeatherCategory = styled.div``;

const WeatherCategoryText = styled.div`
  width: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  &:not(:nth-of-type(2)) {
    margin-bottom: 14px;
  }
`;

const WeatherCategoryIconBox = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

const WeatherCategoryIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -4px 0 2px;
  width: 120px;
  height: 120px;

  img {
    display: block;
    width: 100%;
  }
`;

const WeatherCategoryIconText = styled.span`
  user-select: text;
  font-weight: bold;
  font-size: 14px;
  &:not(:last-of-type) {
    margin-top: 20px;
  }
  &:not(:first-of-type) {
    font-size: 18px;
  }
`;

const WeatherCategoryMain = styled.span`
  user-select: text;
  border: 1px solid var(--third-color);
  border-radius: 9999px;
  padding: 2px 6px;
  margin-bottom: 4px;
  font-size: 12px;
  color: var(--third-color);
`;

const WeatherCategorySub = styled.span`
  user-select: text;
  font-size: 14px;
  font-weight: 500;
  span {
    font-size: 10px;
  }
`;

const ArrowStandard = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  /* border: 1px solid var(--weather-color); */
  background-color: #fff;
  z-index: 10;
  transition: all 0.1s;
  color: #174b87;
  /* color: var(--weather-color); */
  cursor: pointer;
`;

const ArrowIcon = styled.span`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NextArrow = styled(ArrowStandard)<{ visible: boolean }>`
  right: 270px;
  color: ${(props) => !props.visible && `var(--fourth-color)`};
  border-color: ${(props) => !props.visible && `var(--fourth-color)`};
  cursor: ${(props) => !props.visible && "default"};
  span {
    svg {
      padding-left: 2px;
    }
  }
`;

const PrevArrow = styled(ArrowStandard)<{ visible: boolean }>`
  left: 270px;
  color: ${(props) => !props.visible && `var(--fourth-color)`};
  border-color: ${(props) => !props.visible && `var(--fourth-color)`};
  cursor: ${(props) => !props.visible && "default"};
  span {
    svg {
      padding-right: 2px;
    }
  }
`;
