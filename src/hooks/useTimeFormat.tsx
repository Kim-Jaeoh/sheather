import React from "react";

const useTimeFormat = () => {
  const timeToString = (timestamp: number) => {
    const today = new Date();
    const timeValue = new Date(timestamp);

    const betweenTime = Math.floor(
      (today.getTime() - timeValue.getTime()) / 1000 / 60
    );
    if (betweenTime < 1) return "방금 전";
    if (betweenTime < 60) {
      return `${betweenTime}분 전`;
    }

    const betweenTimeHour = Math.floor(betweenTime / 60);
    if (betweenTimeHour < 24) {
      return `${betweenTimeHour}시간 전`;
    }

    const betweenTimeDay = Math.floor(betweenTime / 60 / 24);
    if (betweenTimeDay < 365) {
      return `${betweenTimeDay}일 전`;
    }

    return `${Math.floor(betweenTimeDay / 365)}년 전`;
  };

  const timeToString2 = (timestamp: number) => {
    let date = new Date(timestamp);
    let hours = date.getHours();
    let minutes = ("0" + date.getMinutes()).slice(-2);
    let amPm = "오전";

    if (hours >= 12) {
      amPm = "오후";
      hours = hours - 12;
    }

    let timeString = amPm + " " + hours + ":" + minutes;

    let str =
      date.getFullYear() +
      "년 " +
      (date.getMonth() + 1) +
      "월 " +
      date.getDate() +
      "일" +
      " · " +
      timeString;
    return str;
  };

  return { timeToString, timeToString2 };
};

export default useTimeFormat;
