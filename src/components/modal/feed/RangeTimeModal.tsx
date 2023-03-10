import React, { useState } from "react";
import styled from "@emotion/styled";
import ColorList from "../../../assets/ColorList";
import moment from "moment";
import Calendar from "react-calendar";
import "../../../styles/Calendar.css"; // css import
import { BsCalendar3 } from "react-icons/bs";
import Slider from "rc-slider";
import "../../../styles/RangeTimeModalRcSlider.css";
import { Modal, Backdrop } from "@mui/material";
import { IoMdClose } from "react-icons/io";
// import "rc-slider/assets/index.css";

type Props = {
  modalOpen: boolean;
  modalClose: () => void;
  rangeTime: number[];
  setRangeTime: React.Dispatch<React.SetStateAction<number[]>>;
  changeValue: Date;
  setChangeValue: React.Dispatch<React.SetStateAction<Date>>;
  onReset: () => void;
  onDone: () => void;
};

const RangeTimeModal = (props: Props) => {
  const {
    modalOpen,
    modalClose,
    changeValue,
    setChangeValue,
    rangeTime,
    setRangeTime,
    onReset,
    onDone,
  } = props;

  const [isCalendar, setIsCalendar] = useState(false);

  // 캘린더 토글
  const onClickCalendar = () => setIsCalendar((prev) => !prev);

  // 캘린더 날짜 지정 후 닫기
  const setClickCalendar = (e: Date) => {
    setChangeValue(e);
    onClickCalendar();
  };

  const handleSliderChange = (value: number | number[]) => {
    setRangeTime(Array.isArray(value) ? value : [value]); // setRangeTime 함수를 이용해 상태 업데이트
  };

  return (
    <RangeBox>
      <Header onClick={isCalendar ? onClickCalendar : modalClose}>
        <IoMdClose />
      </Header>
      <Container>
        <ViewNumberBox>
          {isCalendar && (
            <CalendarBox>
              <Calendar
                formatDay={(locale, date) => moment(date).format("DD")} // 날'일' 제외하고 숫자만 보이도록 설정
                showNeighboringMonth={false} //  이전, 이후 달의 날짜는 보이지 않도록 설정
                onChange={(e: Date) => {
                  setClickCalendar(e);
                }}
                value={changeValue}
              />
            </CalendarBox>
          )}
          <DateBox onClick={onClickCalendar}>
            <DateIcon>
              <BsCalendar3 />
            </DateIcon>
            <DateText>{moment(changeValue).format("YYYY-MM-DD")}</DateText>
          </DateBox>
          {/* <DateBox onClick={onClickCalendar}>
            {isCalendar ? (
              <ResetBtn>CANCLE</ResetBtn>
            ) : (
              <>
                <DateIcon>
                  <BsCalendar3 />
                </DateIcon>
                <DateText>{moment(changeValue).format("YYYY-MM-DD")}</DateText>
              </>
            )}
          </DateBox> */}
          {rangeTime && (
            <ViewNumber>
              {rangeTime[0] < 10 ? "0" + rangeTime[0] : rangeTime[0]} ~{" "}
              {rangeTime[1] < 10 ? "0" + rangeTime[1] : rangeTime[1]}시
            </ViewNumber>
          )}
        </ViewNumberBox>
        <RangeSlideBox>
          <Slider
            range
            min={0}
            max={23}
            value={rangeTime}
            onChange={handleSliderChange}
            allowCross={false}
            pushable={1}
            defaultValue={[0, 23]}
          />
        </RangeSlideBox>
        <RangeNumberBox>
          <RangeNumber>0시</RangeNumber>
          <RangeNumber>23시</RangeNumber>
        </RangeNumberBox>
        <ButtonBox>
          <ResetBtn onClick={onReset}>초기화</ResetBtn>
          <DoneBtn onClick={onDone}>완료</DoneBtn>
        </ButtonBox>
      </Container>
    </RangeBox>
  );
};

export default RangeTimeModal;

const { mainColor, secondColor, thirdColor, fourthColor } = ColorList();

const RangeBox = styled.div`
  position: absolute;
  top: 40px;
  /* padding: 20px; */
  z-index: 100;
  border-radius: 8px;
  border: 2px solid ${secondColor};
  width: 300px;
  background: #fff;
  box-shadow: 8px 8px 0 -2px #ff5673, 8px 8px ${secondColor};
  /* animation-name: slideDown;
  animation-duration: 0.5s;
  animation-timing-function: ease-in-out;

  @keyframes slideDown {
    0% {
      opacity: 0;
      transform: translateY(-10px);
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
      transform: translateY(0px);
    }
  } */
`;

const Header = styled.header`
  cursor: pointer;
  width: 100%;
  display: flex;
  justify-content: end;
  overflow: hidden;
  border-bottom: 1px solid ${thirdColor};
  svg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 8px;
  }
`;

const CancleBox = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid ${thirdColor};
`;

const Container = styled.div`
  padding: 20px;
`;

const ViewNumberBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ViewNumber = styled.div`
  font-weight: bold;
`;

const RangeSlideBox = styled.div`
  padding: 0 8px;
  margin-top: 20px;
`;

const RangeNumberBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
  margin-top: 12px;
`;

const RangeNumber = styled.p`
  font-size: 12px;
`;

const ButtonBox = styled.div`
  margin: 0 0px -6px;
  margin-top: 20px;
  display: flex;
  align-content: center;
  justify-content: space-between;
`;

const ResetBtn = styled.button`
  padding: 2px 0;
  font-size: 14px;
  cursor: pointer;
  color: #ff5673;
`;

const DoneBtn = styled.button`
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 9999px;
  border: 1px solid #ff5673;
  background: #fff;
  color: #ff5673;

  &:hover,
  &:active {
    color: #fff;
    background: #ff5673;
  }

  transition: all 0.15s linear;
`;

const CalendarBox = styled.div`
  z-index: 99;
  position: absolute;
  left: -1px;
  top: 37px;
  bottom: 0;
  right: -1px;
  > div:last-of-type {
    padding: 10px;
    border-radius: 0 0 8px 8px;
    border-top: none;
  }
`;

const DateBox = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;

  color: ${secondColor};
`;
const DateText = styled.span`
  font-size: 14px;
`;

const DateIcon = styled.span`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
