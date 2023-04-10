import React, { useEffect, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { Modal } from "@mui/material";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { useDispatch } from "react-redux";
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoCloseOutline,
} from "react-icons/io5";
import { authService, dbService } from "../../../fbase";
import { currentUser, loginToken } from "../../../app/user";
import defaultAccount from "../../../assets/image/account_img_default.png";
import ColorList from "../../../assets/data/ColorList";
import useMediaScreen from "../../../hooks/useMediaScreen";
import { ReactComponent as SheatherLogo } from "../../../assets/image/sheather_logo.svg";
import Deco from "../../leftBar/Deco";
import { FirebaseError } from "firebase/app";
import FindPassword from "./FindPassword";
import { BiLeftArrowAlt } from "react-icons/bi";

type Props = {
  modalOpen: boolean;
  modalClose: () => void;
};

interface ErrorType {
  [key: string]: string;
}

const AuthFormModal = ({ modalOpen, modalClose }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dpName, setDpName] = useState("");
  const [emailMessage, setEmailMessage] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(false);
  const [dpNameMessage, setDpNameMessage] = useState(false);
  const [select, setSelect] = useState({
    email: false,
    password: false,
    dpName: false,
  });
  const [isExistAccount, setIsExistAccount] = useState(true);
  const [isDuplication, setIsDuplication] = useState(false);
  const [isFindPassword, setIsFindPassword] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const { isMobile } = useMediaScreen();
  const toggleAccount = () => setIsExistAccount(!isExistAccount);

  const errorMessages: ErrorType = {
    "(auth/email-already-in-use).": "이미 가입이 되어있는 이메일입니다.",
    "(auth/invalid-email).": "올바르지 않은 이메일 형식입니다.",
    "(auth/weak-password)": "비밀번호를 최소 6글자 이상 입력해주세요.",
    "(auth/wrong-password).": "이메일이나 비밀번호가 틀립니다.",
    "(auth/too-many-requests)":
      "로그인 시도가 여러 번 실패하여 이 계정에 대한 액세스가 일시적으로 비활성화되었습니다. 비밀번호를 재설정하여 즉시 복원하거나 나중에 다시 시도할 수 있습니다.",
    "(auth/user-not-found)": "가입된 아이디를 찾을 수 없습니다.",
  };

  // 닉네임 중복 체크
  useEffect(() => {
    const myCollectionRef = collection(dbService, "users");
    const unsubscribe = onSnapshot(myCollectionRef, (querySnapshot) => {
      const filter = querySnapshot.docs.some((doc) => {
        return doc.data().displayName === dpName;
      });
      setIsDuplication(filter);
    });

    return () => {
      unsubscribe();
    };
  }, [dpName]);

  // 정규식 체크
  useEffect(() => {
    const emailRegex =
      /([\w-.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-z]{2,4}|[0-9]{1,3})(\]?)$/;
    const passwordRegex =
      /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/;
    const dpNameRegex = /^[a-zA-Z0-9_.]+$/;

    if (!emailRegex.test(email)) {
      setEmailMessage(false);
    } else {
      setEmailMessage(true);
    }
    // if (!passwordRegex.test(password)) {
    //   setPasswordMessage(false);
    // } else {
    //   setPasswordMessage(true);
    // }
    if (!dpNameRegex.test(dpName)) {
      setDpNameMessage(false);
    } else {
      setDpNameMessage(true);
    }
  }, [dpName, email, password]);

  // 인풋 에러
  useMemo(() => {
    if (email.length > 0 && select.email && !emailMessage) {
      return setError("사용할 수 없는 이메일 주소입니다.");
    }
    if (password.length > 0 && select.password && !passwordMessage) {
      return setError("숫자+영문자+특수문자 조합으로 8자리 이상 입력해주세요.");
    }
    if (dpName.length > 0 && select.dpName && !dpNameMessage) {
      return setError(
        "사용자 이름에는 문자, 숫자, 밑줄 및 마침표만 사용할 수 있습니다."
      );
    }
    if (isDuplication) {
      return setError("닉네임이 중복입니다.");
    }
    return setError("");
  }, [
    dpName.length,
    dpNameMessage,
    email.length,
    emailMessage,
    isDuplication,
    password.length,
    passwordMessage,
    select.dpName,
    select.email,
    select.password,
  ]);

  const SignUser = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (emailMessage && passwordMessage && dpNameMessage) {
    try {
      let user;
      if (isExistAccount) {
        await signInWithEmailAndPassword(authService, email, password).then(
          async (result) => {
            let SignUser = result.user;
            const docRef = doc(dbService, "users", SignUser.displayName);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              dispatch(loginToken(true));
              dispatch(
                currentUser({
                  ...docSnap.data(),
                })
              );
            }
          }
        );
        alert("로그인 되었습니다.");
        modalClose();
        window.location.reload();
      } else {
        await createUserWithEmailAndPassword(authService, email, password).then(
          async (result) => {
            user = result.user;
            updateProfile(authService.currentUser, {
              displayName: dpName,
            });
            const usersRef = collection(dbService, "users");
            await setDoc(doc(usersRef, dpName), {
              uid: user.uid,
              createdAt: Date.now(),
              profileURL: defaultAccount,
              email: user.email,
              name: "",
              displayName: dpName,
              description: "",
              bookmark: [],
              like: [],
              message: [],
              notice: [],
              follower: [],
              following: [],
            });

            dispatch(
              currentUser({
                uid: user.uid,
                createdAt: Date.now(),
                profileURL: defaultAccount,
                email: user.email,
                name: "",
                displayName: dpName,
                description: "",
                bookmark: [],
                like: [],
                notice: [],
                message: [],
                follower: [],
                following: [],
              })
            );

            alert("회원가입 되었습니다.");
            setIsExistAccount(true);
            setEmail("");
            setPassword("");
            setError("");
          }
        );
      }
    } catch (error: any) {
      const errorKey = Object.keys(errorMessages).find((key) =>
        error.message.includes(key)
      );
      const errorMessage = errorKey ? errorMessages[errorKey] : error.message;
      return setError(errorMessage);
    }
    // }
  };

  // const findUserByEmail = async (email: string) => {
  //   try {
  //     const user = await getUserByEmail(authService, email);
  //     // 주어진 이메일에 해당하는 사용자 정보 반환
  //     return user;
  //   } catch (error) {
  //     // 에러 처리, 특정 에러 코드 확인
  //     if (error instanceof FirebaseError && error.code === "auth/user-not-found") {
  //       throw new Error("해당 이메일로 등록된 계정이 없습니다.");
  //     }
  //     // 다른 에러 처리
  //     throw error;
  //   }
  // };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = e;

    if (name === "email") {
      setEmail(value);
    }
    if (name === "password") {
      setPassword(value);
    }
    if (name === "dpName") {
      setDpName(value);
    }
  };

  const onFindPassword = () => {
    setIsFindPassword((prev) => !prev);
  };

  // 이전 버튼
  const onPrevClick = () => {
    setIsFindPassword((prev) => !prev);
  };

  return (
    <Modal open={modalOpen} onClose={modalClose} disableScrollLock={true}>
      <Container>
        <Header>
          {!isFindPassword ? (
            <>
              <IconBox onClick={onPrevClick}>
                <BiLeftArrowAlt />
              </IconBox>
              <Category>비밀번호 찾기</Category>
            </>
          ) : (
            <Category>{isExistAccount ? "로그인" : "회원가입"}</Category>
          )}
          <IconBox onClick={modalClose}>
            <IoCloseOutline />
          </IconBox>
        </Header>
        <Box>
          {isFindPassword ? (
            <>
              {isMobile && (
                <LogoBox>
                  <Deco />
                  <SheatherLogo width="230px" height="100px" />
                </LogoBox>
              )}
              <FormBox>
                <Form onSubmit={SignUser} method="post">
                  <EmailBox>
                    <Input
                      name="email"
                      type="email"
                      placeholder="이메일 주소"
                      // required
                      value={email}
                      onChange={onChange}
                      autoComplete="off"
                      onFocus={() =>
                        setSelect((prev) => ({ ...prev, email: false }))
                      }
                      onBlur={() =>
                        setSelect((prev) => ({ ...prev, email: true }))
                      }
                    />
                    {email.length > 0 && (
                      <InputCheckBox check={emailMessage}>
                        {emailMessage ? (
                          <IoCheckmarkCircleOutline />
                        ) : (
                          <IoCloseCircleOutline />
                        )}
                      </InputCheckBox>
                    )}
                  </EmailBox>
                  {!isExistAccount && (
                    <EmailBox>
                      <Input
                        name="dpName"
                        type="dpName"
                        placeholder="사용자 이름"
                        // required
                        value={dpName}
                        onChange={onChange}
                        autoComplete="off"
                        onFocus={() =>
                          setSelect((prev) => ({ ...prev, dpName: false }))
                        }
                        onBlur={() =>
                          setSelect((prev) => ({ ...prev, dpName: true }))
                        }
                      />
                      {dpName.length > 0 && (
                        <InputCheckBox check={dpNameMessage && !isDuplication}>
                          {dpNameMessage && !isDuplication ? (
                            <IoCheckmarkCircleOutline />
                          ) : (
                            <IoCloseCircleOutline />
                          )}
                        </InputCheckBox>
                      )}
                    </EmailBox>
                  )}
                  <PasswordBox>
                    <Input
                      name="password"
                      type="password"
                      placeholder="비밀번호"
                      // required
                      value={password}
                      onChange={onChange}
                      autoComplete="off"
                      autoCapitalize="off"
                      onFocus={() =>
                        setSelect((prev) => ({ ...prev, password: false }))
                      }
                      onBlur={() =>
                        setSelect((prev) => ({ ...prev, password: true }))
                      }
                    />
                    {password.length > 0 && (
                      <InputCheckBox check={passwordMessage}>
                        {passwordMessage ? (
                          <IoCheckmarkCircleOutline />
                        ) : (
                          <IoCloseCircleOutline />
                        )}
                      </InputCheckBox>
                    )}
                  </PasswordBox>
                  <SignBtnBox>
                    <SignBtn
                      type="submit"
                      // disabled={
                      //   isExistAccount
                      //     ? email === "" ||
                      //       password === "" ||
                      //       !emailMessage ||
                      //       !passwordMessage
                      //     : email === "" ||
                      //       dpName === "" ||
                      //       password === "" ||
                      //       !emailMessage ||
                      //       !dpNameMessage ||
                      //       !passwordMessage ||
                      //       isDuplication
                      // }
                    >
                      {isExistAccount ? "로그인" : "회원가입"}
                    </SignBtn>
                  </SignBtnBox>
                  {/* {(!emailMessage || !passwordMessage || !dpNameMessage) &&
                    (email !== "" || dpName !== "" || password !== "") &&
                    error !== "" && <ErrorText>{error}</ErrorText>} */}
                </Form>
                <SignInfo>
                  <SignUp onClick={toggleAccount}>
                    {isExistAccount ? "회원가입" : "로그인"}
                  </SignUp>
                  <AccountBox>
                    <AccountFind>계정 찾기</AccountFind>
                    <AccountFind onClick={onFindPassword}>
                      비밀번호 찾기
                    </AccountFind>
                  </AccountBox>
                </SignInfo>
              </FormBox>
            </>
          ) : (
            <FindPassword />
          )}
        </Box>
      </Container>
    </Modal>
  );
};

export default AuthFormModal;

const { mainColor, secondColor, thirdColor, fourthColor } = ColorList();

const Container = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 480px;
  margin: 0 auto;
  background: #fff;
  border-radius: 20px;
  text-align: center;
  border: 2px solid ${secondColor};
  box-shadow: 12px 12px 0 -2px #6f4ccf, 12px 12px ${secondColor};
  outline: none;
  display: flex;
  flex-direction: column;
  /* padding-bottom: 24px; */

  /* @media screen and (min-width: 640px) {
    width: 500px;
  } */
  @media (max-width: 767px) {
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    transform: translate(0, 0);
    width: 100%;
    height: 100%;
    border-radius: 0;
    border: none;
    box-shadow: none;
  }
`;

const Header = styled.header`
  width: 100%;
  padding: 0px 14px;
  /* min-height: 52px; */
  display: flex;
  align-items: center;
  overflow: hidden;
  border-bottom: 1px solid ${thirdColor};
  position: relative;

  > div:first-of-type {
    margin-left: -14px;
    margin-right: auto;
  }
  > div:last-of-type {
    margin-right: -14px;
    margin-left: auto;
  }
`;

const Category = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
  font-size: 14px;
`;

const IconBox = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover,
  &:active {
    color: #6f4ccf;
  }

  svg {
    font-size: 24px;
  }
`;

const LogoBox = styled.div`
  /* position: absolute;
  top: 64px;
  left: 50%;
  transform: translateX(-50%); */
`;

const Logo = styled.img`
  display: block;
  width: 100%;
`;

const Box = styled.div`
  flex: 1;
  display: flex;
  position: relative;
  /* align-items: center; */
  gap: 52px;
  /* justify-content: space-between; */
  flex-direction: column;
  padding: 50px;
`;

const FormBox = styled.article``;

const Form = styled.form``;

const EmailBox = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  width: 100%;
  border-radius: 10px;
  /* padding: 0 12px; */
  border: 1px solid ${thirdColor};
`;

const PasswordBox = styled(EmailBox)``;

const Input = styled.input`
  width: 100%;
  padding: 20px;
  font-size: 16px;
  color: ${secondColor};
  text-overflow: ellipsis;
  white-space: pre-wrap;
  background-color: transparent;
  box-sizing: border-box;
  border: none;
  outline: none;
  transition: all 0.1s linear;
  opacity: 1;
  margin: 0;

  &::placeholder {
    font-size: 12px;
  }

  &:focus::placeholder {
    opacity: 0.4;
    color: ${thirdColor};
    transition: all 0.2s;
  }
`;

const InputCheckBox = styled.div<{ check?: boolean }>`
  width: 48px;
  height: 48px;
  /* margin-right: -12px; */
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) =>
    props.check ? `rgb(111, 76, 207,0.8)` : `rgba(255, 0, 0, 0.8)`};
  svg {
    font-size: 24px;
  }
`;

const SignBtnBox = styled.div`
  padding-top: 40px;
  text-align: center;
`;

const SignBtn = styled.button`
  cursor: pointer;
  background-color: #6f4ccf;
  display: block;
  width: 100%;
  height: 50px;
  border-radius: 8px;
  padding: 0;
  font-size: 16px;
  color: #fff;
  transition: all 0.12s linear;

  &:disabled {
    background: red;
    cursor: default;
  }
`;

const SignInfo = styled.div`
  margin-top: 40px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const SignUp = styled.p`
  cursor: pointer;
`;

const AccountBox = styled.ul`
  display: flex;
  gap: 10px;
`;

const AccountFind = styled.li`
  cursor: pointer;
  &:first-of-type {
    padding-right: 10px;
    border-right: 1px solid ${fourthColor};
    /* ::after {
      content: "";
      float: right;
      width: 1px;
      height: 10px;
      margin: 4px 10px;
      background-color: rgba(34, 34, 34, 0.078);
    } */
  }
`;

const ErrorText = styled.p`
  display: block;
  text-align: center;
  font-size: 12px;
  color: rgb(235, 0, 0);
  letter-spacing: -0.5px;
  margin-top: 24px;
  /* margin: 24px 0 24px; */
`;

const ListDelete = styled.button`
  position: absolute;
  /* z-index: 10; */
  /* padding: 9px; */
  top: 0px;
  right: 0px;

  svg {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    color: #bdbdbd;
  }
`;
