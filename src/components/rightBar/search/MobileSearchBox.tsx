import React, { useCallback, useEffect, useState } from "react";
import styled from "@emotion/styled";
import { FiSearch } from "react-icons/fi";
import {
  IoIosCloseCircleOutline,
  IoMdArrowDropup,
  IoMdClose,
} from "react-icons/io";
import useDebounce from "../../../hooks/useDebounce";
import FollowListBox from "../FollowListBox";
import TagListBox from "../TagListBox";
import SearchList, { localType } from "./SearchList";
import SearchedShowList from "./SearchedShowList";
import ColorList from "../../../assets/data/ColorList";
import useUserAccount from "../../../hooks/useUserAccount";
import AuthFormModal from "../../modal/auth/AuthFormModal";

type Props = {
  modalOpen: boolean;
  modalClose: () => void;
};

const MobileSearchBox = ({ modalOpen, modalClose }: Props) => {
  const [focus, setFocus] = useState(false);
  const [text, setText] = useState("");
  const [debounceText, setDebounceText] = useState("");
  const [toggleAnimation, setToggleAnimation] = useState(false);
  const [url, setUrl] = useState(``);
  const [searched, setSearched] = useState<localType[]>(
    JSON.parse(localStorage.getItem("keywords")) || []
  );
  const debouncedSearchTerm = useDebounce(text, 200);
  const { isAuthModal, setIsAuthModal, onAuthModal, onIsLogin, onLogOutClick } =
    useUserAccount();

  // 검색 목록 api
  useEffect(() => {
    const isHashtag = debounceText.includes("#")
      ? debounceText.split("#")[1]
      : debounceText; // 해시태그 유무
    setUrl(
      `${process.env.REACT_APP_SERVER_PORT}/api/search?keyword=${isHashtag}&`
    );
  }, [debounceText]);

  // debounce된 text 유무
  useEffect(() => {
    if (debouncedSearchTerm) {
      setDebounceText(debouncedSearchTerm);
    } else {
      setDebounceText("");
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (localStorage?.getItem("keywords")?.length) {
      // 중복 제거
      const uniqueArr = searched.filter(
        (obj, index, self) =>
          index ===
          self.findIndex((t) => t.type === obj.type && t.search === obj.search)
      );
      return localStorage.setItem("keywords", JSON.stringify(uniqueArr));
    } else {
      return localStorage.setItem("keywords", JSON.stringify([]));
    }
  }, [searched, text]);

  const onChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = e;
    setText(value);
  };

  const onSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    return false;
  };

  const onDeleteText = useCallback(() => {
    setText("");
  }, []);

  const onListClick = (type: string, word: string, name: string) => {
    if (type === "tag") {
      setSearched((prev: localType[]) => [
        { at: Date.now(), type: "tag", search: word, name: null },
        ...prev,
      ]);
    } else {
      setSearched((prev: localType[]) => [
        { at: Date.now(), type: "user", search: word, name: name },
        ...prev,
      ]);
    }
    setFocus(false);
    modalClose();
  };

  // 검색 리스트 노출할 때 애니메이션
  const onListOpen = () => {
    setFocus(true);
    setToggleAnimation(true);
  };

  const onListClose = () => {
    setToggleAnimation(false);
    const delay = setTimeout(() => {
      setFocus(false);
    }, 100);
    return () => clearTimeout(delay);
  };

  return (
    <>
      {isAuthModal && (
        <AuthFormModal modalOpen={isAuthModal} modalClose={onAuthModal} />
      )}
      <Container>
        <Header>
          <InputTextBox onSubmit={onSubmitText} focus={focus}>
            <IconBox htmlFor="search" focus={focus}>
              <FiSearch />
            </IconBox>
            <SearchInput
              spellCheck="false"
              onFocus={onListOpen}
              // onBlur={onListClose}
              type="text"
              id="search"
              autoComplete="off"
              maxLength={12}
              value={text}
              onChange={onChangeText}
              placeholder="검색어를 입력하세요"
            />
            {text !== "" && (
              <InputCloseBox onClick={onDeleteText} type="button">
                <IoIosCloseCircleOutline />
              </InputCloseBox>
            )}
            {focus && text === "" && (
              <InputCloseBox onClick={onListClose} type="button">
                <IoMdArrowDropup />
              </InputCloseBox>
            )}
          </InputTextBox>
          <ModalCloseBox type="button" onClick={modalClose}>
            <IoMdClose />
          </ModalCloseBox>
        </Header>
        {focus ? (
          <SearchedBox focus={focus} toggleAnimation={toggleAnimation}>
            {debounceText !== "" ? (
              <SearchList
                text={debounceText}
                url={url}
                onListClick={onListClick}
              />
            ) : (
              <SearchedShowList
                searched={searched}
                setSearched={setSearched}
                onListClick={onListClick}
              />
            )}
          </SearchedBox>
        ) : (
          <>
            <TagListBox modalOpen={modalOpen} modalClose={modalClose} />
            <FollowListBox
              modalOpen={modalOpen}
              modalClose={modalClose}
              onIsLogin={onIsLogin}
            />
          </>
        )}
      </Container>
    </>
  );
};

export default MobileSearchBox;

const { mainColor, secondColor, thirdColor, fourthColor } = ColorList();

const Container = styled.article`
  /* width: 100%; */
`;

const Header = styled.div`
  width: 100%;
  padding: 12px 16px;
  min-height: 52px;
  display: flex;
  align-items: center;
  overflow: hidden;
  border-bottom: 1px solid ${thirdColor};
  position: relative;
`;

const InputTextBox = styled.form<{ focus: boolean }>`
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  border: 1px solid ${thirdColor};
  border-radius: 20px;
  padding: 10px 40px 10px 10px;
  transition: all 0.15s linear;
  line-height: 0;
`;

const IconBox = styled.label<{ focus: boolean }>`
  margin-right: 10px;
  color: ${(props) => (props.focus ? secondColor : thirdColor)};
  svg {
    width: 20px;
    height: 20px;
  }
`;

const SearchInput = styled.input`
  margin: 0;
  padding: 0;
  border: none;
  outline: none;
  width: 100%;
  font-size: 16px;

  &::placeholder {
    font-size: 14px;
  }

  &::placeholder:not(:focus) {
    transition: all 0.15s;
    opacity: 1;
  }

  &:focus::placeholder {
    opacity: 0.4;
    color: ${thirdColor};
    transition: all 0.15s;
  }
`;

const InputCloseBox = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 10px;
  cursor: pointer;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  color: ${thirdColor};

  svg {
    width: 20px;
    height: 20px;
  }
`;

const ModalCloseBox = styled.button`
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-right: -14px;
  svg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
  }
`;

const SearchedBox = styled.div<{ focus: boolean; toggleAnimation: boolean }>`
  /* padding: 4px 20px 16px; */
  padding: 4px 16px 16px;

  border-radius: 20px;
  position: relative;
  overflow: hidden;

  animation: ${(props) =>
    props.toggleAnimation ? `open 0.15s linear` : `close 0.1s linear`};

  @keyframes open {
    from {
      opacity: 0;
      height: 0;
    }
    to {
      opacity: 1;
      height: 300px;
    }
  }
  @keyframes close {
    from {
      opacity: 1;
      height: 300px;
    }
    to {
      opacity: 0;
      height: 0;
    }
  }
`;
