import { Modal } from "@mui/material";
import styled from "@emotion/styled";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import ShareWeatherFormModal from "./ShareWeatherFormModal";
import toast, { Toaster } from "react-hot-toast";
import ColorList from "../../../assets/ColorList";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TempClothes from "../../../assets/TempClothes";
import { VisibilityContext, ScrollMenu } from "react-horizontal-scrolling-menu";
import Flicking from "@egjs/react-flicking";
import "../../../styles/flicking.css";
import { CiTempHigh } from "react-icons/ci";
import { WiStrongWind } from "react-icons/wi";
import { TbWindmill } from "react-icons/tb";
import { BsWind } from "react-icons/bs";

type props = {
  text: string;
  select: number;
  outerCheck: number;
  topCheck: number;
  innerTopCheck: number;
  bottomCheck: number;
  etcCheck: number;
  setOuterCheck: React.Dispatch<number>;
  setInnerTopCheck: React.Dispatch<number>;
  setBottomCheck: React.Dispatch<number>;
  setEtcCheck: React.Dispatch<number>;
  setText: React.Dispatch<React.SetStateAction<string>>;
  onClick: (index: number, name: string) => void;
};

const ShareWeatherForm = (props: props) => {
  const {
    text,
    select,
    outerCheck,
    topCheck,
    innerTopCheck,
    bottomCheck,
    etcCheck,
    setOuterCheck,
    setInnerTopCheck,
    setBottomCheck,
    setEtcCheck,
    setText,
    onClick,
  } = props;
  const { ClothesCategory } = TempClothes();

  const CurrentEmoji = [
    ["🥵 더워요"],
    ["😥 조금 더워요"],
    ["😄 적당해요"],
    ["😬 조금 추워요"],
    ["🥶 추워요"],
  ];

  return (
    <>
      <Container>
        <WearInfoBox>
          <WearCondition>
            <WearInfoMain select={select}>현재 착장</WearInfoMain>
            <Flicking
              onChanged={(e) => console.log(e)}
              moveType="freeScroll"
              bound={true}
              align="prev"
            >
              <TagBox>
                {CurrentEmoji.map((res, index) => (
                  <Tag key={index}>
                    <TagInput
                      id={index.toString()}
                      name="range"
                      type="radio"
                      style={{
                        marginTop: "2px",
                        marginRight: "4px",
                        display: "none",
                      }}
                    />
                    <TagLabel
                      select={select}
                      index={index}
                      onClick={() => onClick(index, "current")}
                      htmlFor={index.toString()}
                    >
                      {res}
                    </TagLabel>
                  </Tag>
                ))}
              </TagBox>
            </Flicking>
          </WearCondition>

          <WearDetailBox>
            <WearInfo>
              <WearInfoMain select={outerCheck}>아우터</WearInfoMain>
              {outerCheck !== 0 ? (
                <Flicking
                  onChanged={(e) => console.log(e)}
                  moveType="freeScroll"
                  bound={true}
                  align="prev"
                >
                  <TagBox>
                    {ClothesCategory.outer.map((res, index) => (
                      <Tag key={index}>
                        <TagInput
                          id={index.toString()}
                          name="range"
                          type="radio"
                          style={{
                            marginTop: "2px",
                            marginRight: "4px",
                            display: "none",
                          }}
                        />
                        <TagLabel
                          select={outerCheck}
                          index={index}
                          onClick={() => onClick(index, "outer")}
                          htmlFor={index.toString()}
                        >
                          {res}
                        </TagLabel>
                      </Tag>
                    ))}
                  </TagBox>
                </Flicking>
              ) : (
                <AddTagBox>
                  <Tag>
                    <AddTag onClick={() => setOuterCheck(null)}>+</AddTag>
                  </Tag>
                </AddTagBox>
              )}
            </WearInfo>
            <WearInfo>
              <WearInfoMain select={topCheck}>상의</WearInfoMain>
              <Flicking
                onChanged={(e) => console.log(e)}
                moveType="freeScroll"
                bound={true}
                align="prev"
              >
                <TagBox>
                  {ClothesCategory.top.map((res, index) => (
                    <Tag key={index}>
                      <TagInput
                        id={index.toString()}
                        name="range"
                        type="radio"
                        style={{
                          marginTop: "2px",
                          marginRight: "4px",
                          display: "none",
                        }}
                      />
                      <TagLabel
                        select={topCheck}
                        index={index}
                        onClick={() => onClick(index, "top")}
                        htmlFor={index.toString()}
                      >
                        {res}
                      </TagLabel>
                    </Tag>
                  ))}
                </TagBox>
              </Flicking>
            </WearInfo>
            <WearInfo>
              <WearInfoMain select={innerTopCheck}>내의</WearInfoMain>
              {innerTopCheck !== 0 ? (
                <Flicking
                  onChanged={(e) => console.log(e)}
                  moveType="freeScroll"
                  bound={true}
                  align="prev"
                >
                  <TagBox>
                    {ClothesCategory.innerTop.map((res, index) => (
                      <Tag key={index}>
                        <TagInput
                          id={index.toString()}
                          name="range"
                          type="radio"
                          style={{
                            marginTop: "2px",
                            marginRight: "4px",
                            display: "none",
                          }}
                        />
                        <TagLabel
                          select={innerTopCheck}
                          index={index}
                          onClick={() => onClick(index, "innerTop")}
                          htmlFor={index.toString()}
                        >
                          {res}
                        </TagLabel>
                      </Tag>
                    ))}
                  </TagBox>
                </Flicking>
              ) : (
                <AddTagBox>
                  <Tag>
                    <AddTag onClick={() => setInnerTopCheck(null)}>+</AddTag>
                  </Tag>
                </AddTagBox>
              )}
            </WearInfo>

            <WearInfo>
              <WearInfoMain select={bottomCheck} select2={topCheck}>
                하의
              </WearInfoMain>
              {topCheck !== 1 && bottomCheck !== 0 ? (
                <Flicking
                  onChanged={(e) => console.log(e)}
                  moveType="freeScroll"
                  bound={true}
                  align="prev"
                >
                  <TagBox>
                    {ClothesCategory.bottom.map((res, index) => (
                      <Tag key={index}>
                        <TagInput
                          id={index.toString()}
                          name="range"
                          type="radio"
                          style={{
                            marginTop: "2px",
                            marginRight: "4px",
                            display: "none",
                          }}
                        />
                        <TagLabel
                          select={bottomCheck}
                          index={index}
                          onClick={() => onClick(index, "bottom")}
                          htmlFor={index.toString()}
                        >
                          {res}
                        </TagLabel>
                      </Tag>
                    ))}
                  </TagBox>
                </Flicking>
              ) : (
                <AddTagBox>
                  <Tag>
                    <AddTag onClick={() => setBottomCheck(null)}>+</AddTag>
                  </Tag>
                </AddTagBox>
              )}
            </WearInfo>

            <WearInfo>
              <WearInfoMain select={etcCheck}>기타</WearInfoMain>
              {etcCheck !== 0 ? (
                <Flicking
                  onChanged={(e) => console.log(e)}
                  moveType="freeScroll"
                  bound={true}
                  align="prev"
                >
                  <TagBox>
                    {ClothesCategory &&
                      ClothesCategory.etc.map((res, index) => (
                        <Tag key={index}>
                          <TagInput
                            id={index.toString()}
                            name="range"
                            type="radio"
                            style={{
                              marginTop: "2px",
                              marginRight: "4px",
                              display: "none",
                            }}
                          />
                          <TagLabel
                            select={etcCheck}
                            index={index}
                            onClick={() => onClick(index, "etc")}
                            htmlFor={index.toString()}
                          >
                            {res}
                          </TagLabel>
                        </Tag>
                      ))}
                  </TagBox>
                </Flicking>
              ) : (
                <AddTagBox>
                  <Tag>
                    <AddTag onClick={() => setEtcCheck(null)}>+</AddTag>
                  </Tag>
                </AddTagBox>
              )}
            </WearInfo>
          </WearDetailBox>
        </WearInfoBox>
        <ShareWeatherFormModal text={text} setText={setText} />
      </Container>
    </>
  );
};

export default ShareWeatherForm;

const { mainColor, secondColor, thirdColor, fourthColor } = ColorList();

const Container = styled.div`
  /* width: 480px; */
  /* height: 736px; */
  /* box-sizing: border-box;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%); */
  background: #fff;
  /* border-radius: 8px;
  border: 2px solid ${secondColor};
  box-shadow: 12px 12px 0 -2px ${mainColor}, 12px 12px ${secondColor};
  &::-webkit-scrollbar {
    display: none;
  } */
`;

const Header = styled.header`
  height: 52px;
  display: flex;
  align-items: center;
  border-radius: 12px 12px 0 0;
  border-bottom: 2px solid ${secondColor};
  padding: 0 12px;
  position: sticky;
  background: rgba(255, 255, 255, 0.808);
  top: 0px;
  z-index: 10;
`;

const HeaderCategory = styled.div`
  p {
    /* font-family: "GmarketSans", Apple SD Gothic Neo, Malgun Gothic, sans-serif !important; */
    /* margin-bottom: -4px; // 폰트 여백으로 인한 조정 */
  }
  font-size: 16px;
  font-weight: bold;

  user-select: none;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const DateBox = styled.div`
  /* border: 1px solid ${mainColor}; */
  /* border-radius: 9999px; */
  /* padding: 4px 8px; */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  color: ${mainColor};
  letter-spacing: -0.8px;
`;

const CloseBox = styled.div`
  width: 48px;
  height: 48px;
  position: absolute;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover,
  &:active {
    color: ${mainColor};
  }

  svg {
    font-size: 24px;
  }
`;

const WeatherCategoryBox = styled.div`
  display: flex;
  /* flex-wrap: wrap; */
  align-items: center;
  justify-content: space-between;
  width: 100%;
  /* gap: 28px; */
  padding: 12px;
  border-bottom: 2px solid ${thirdColor};
`;

const WeatherCategoryText = styled.div`
  display: flex;
  align-items: center;
`;

const WeatherIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  margin: 0 -10px;
  img {
    display: block;
    width: 100%;
  }
`;

const WeatherCategoryMain = styled.span`
  border: 1px solid ${thirdColor};
  color: ${thirdColor};
  border-radius: 9999px;
  padding: 4px 8px;
  margin-right: 10px;
  font-size: 12px;
`;

const WeatherCategorySub = styled.span`
  user-select: text;
  /* display: flex; */
  /* align-items: center; */
  /* gap: 4px; */
  font-size: 14px;
  svg {
    /* width: 20px; */
    /* height: 20px; */
    font-size: 20px;
  }
  span {
    font-size: 12px;
  }
`;

const WearInfoBox = styled.section`
  width: 100%;
  border-top: 1px solid ${thirdColor};
  border-bottom: 1px solid ${thirdColor};
`;

const WearCondition = styled.div`
  min-height: 52px;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 12px;
  &:not(:last-of-type) {
    border-bottom: 1px solid ${thirdColor};
  }
`;

const TagBox = styled.div`
  display: flex;
  user-select: none;
  flex: nowrap;
  gap: 8px;
`;

const Tag = styled.div`
  font-size: 12px;
  display: flex;
  flex: 0 0 auto;
`;

const TagInput = styled.input`
  margin-top: 2px;
  margin-right: 4px;
  display: none;
`;

const TagLabel = styled.label<{ select: number; index: number }>`
  gap: 12px;
  padding: 6px 8px;
  border: 1px solid
    ${(props) =>
      props.select === props.index ? `${mainColor}` : `${thirdColor}`};
  border-radius: 4px;
  cursor: pointer;
  color: ${(props) => props.select === props.index && `#fff`};
  background: ${(props) =>
    props.select === props.index ? `${mainColor}` : "transparent"};
`;

const AddTagBox = styled.div`
  padding: 0 2px;
`;

const AddTag = styled.div`
  gap: 12px;
  padding: 6px 8px;
  border: 1px solid ${thirdColor};
  border-radius: 4px;
  cursor: pointer;
`;
const WearDetailBox = styled.div`
  overflow: hidden;
  padding: 12px;
  &:not(:last-of-type) {
    /* border-bottom: 2px solid ${thirdColor}; */
  }
`;

const WearInfo = styled.div`
  display: flex;
  align-items: center;
  &:not(:last-of-type) {
    margin-bottom: 12px;
  }
`;

const WearInfoMain = styled.div<{ select: number; select2?: number }>`
  flex: 0 0 auto;
  user-select: text;
  /* border: 1px solid ${thirdColor}; */
  /* color: ${thirdColor}; */
  font-weight: ${(props) =>
    props.select !== null || props?.select2 === 1 ? "bold" : "normal"};
  color: ${(props) =>
    props.select !== null || props?.select2 === 1 ? mainColor : thirdColor};
  /* border-radius: 9999px; */
  min-width: 55px;
  text-align: center;
  /* padding: 4px 6px; */
  padding-right: 6px;
  border-right: 1px solid ${thirdColor};
  font-size: 12px;
  margin-right: 12px;
`;

const TagButton = styled.button`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;

  svg {
    color: ${thirdColor};
    font-size: 16px;
  }
`;
