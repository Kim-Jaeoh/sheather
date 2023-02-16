import React, { MutableRefObject, useRef } from "react";
import styled from "@emotion/styled";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { GrEmoji } from "react-icons/gr";
import { useEmojiModalOutClick } from "../hooks/useEmojiModalOutClick";

type props = {
  textRef?: React.MutableRefObject<HTMLTextAreaElement>;
  setText?: React.Dispatch<React.SetStateAction<string>>;
};

const Emoji = ({ setText, textRef }: props) => {
  const emojiRef = useRef<HTMLDivElement>();
  // 이모지 모달 밖 클릭 시 창 닫기
  const { clickEmoji, toggleEmoji } = useEmojiModalOutClick(emojiRef, textRef);

  // 텍스트 옆에 이모지 추가
  const onEmojiClick = (emojiData: EmojiClickData, event: MouseEvent) => {
    setText((prev) => prev + emojiData.emoji);
  };

  return (
    <EmojiBox ref={emojiRef}>
      <EmojiIcon onClick={toggleEmoji}>
        <GrEmoji />
      </EmojiIcon>
      {/* 해결: clickEmoji이 true일 때만 실행해서 textarea 버벅이지 않음 */}
      {clickEmoji && (
        <EmojiPickerBox>
          <EmojiPicker
            searchDisabled={true}
            lazyLoadEmojis={true}
            onEmojiClick={onEmojiClick}
            width={340}
            height={340}
          />
        </EmojiPickerBox>
      )}
    </EmojiBox>
  );
};

export default Emoji;

const EmojiBox = styled.div`
  /* width: 36px; */
  /* height: 36px; */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 999;
`;

const EmojiIcon = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  cursor: pointer;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const EmojiPickerBox = styled.div`
  position: absolute;
  top: -294px;
  left: -360px;
  z-index: 9999;
`;

const EditInfo = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
`;
