import React from "react";
import styled from "@emotion/styled";
import { Modal } from "@mui/material";
import { Link } from "react-router-dom";

type Props = {
  modalOpen: boolean;
  selectCategory: number;
  modalClose: () => void;
  onSelectCategory: (e: number) => void;
  onSelectCategory2: () => void;
};

const MobileFeedCategoryModal = (props: Props) => {
  const { modalOpen, selectCategory, modalClose, onSelectCategory } = props;

  return (
    <Modal
      open={modalOpen}
      onClose={modalClose}
      disableScrollLock={false}
      BackdropProps={{ style: { backgroundColor: "transparent" } }}
    >
      <RangeBox>
        <Container>
          <Btn
            to="following/recent"
            select={selectCategory}
            num={0}
            onClick={() => onSelectCategory(0)}
          >
            팔로잉
          </Btn>
          <Btn
            to="explore/recent"
            select={selectCategory}
            num={1}
            onClick={() => onSelectCategory(1)}
          >
            탐색
          </Btn>
        </Container>
      </RangeBox>
    </Modal>
  );
};

export default MobileFeedCategoryModal;

const RangeBox = styled.div`
  position: absolute;
  width: 100px;
  right: 16px;
  top: 100px;
  z-index: 100;
  border-radius: 20px;
  border: 1px solid var(--third-color);
  background: #fff;
  overflow: hidden;
  outline: none;
  filter: drop-shadow(0px 0px 4px #22222222);

  @media (max-width: 767px) {
    right: 32px;
    top: 110px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Btn = styled(Link)<{ num: number; select: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 40px;
  overflow: hidden;
  padding: 4px 8px;
  font-size: 14px;
  color: var(--second-color);
  font-weight: ${(props) => (props.num === props.select ? `700` : `400`)};
  cursor: pointer;
  &:not(:last-of-type) {
    border-bottom: 1px solid var(--third-color);
  }
`;
