import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import { Modal } from "@mui/material";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoCloseOutline,
} from "react-icons/io5";
import { authService, dbService, createDeviceToken } from "../../../fbase";
import defaultAccount from "../../../assets/image/account_img_default.png";
import useMediaScreen from "../../../hooks/useMediaScreen";
import FindPassword from "./FindPassword";
import { BsArrowLeftShort } from "react-icons/bs";
import { Spinner } from "../../../assets/spinner/Spinner";
import { logIn, currentUser } from "../../../app/user";

type Props = {
  modalOpen: boolean;
  modalClose: () => void;
};

interface ArrType {
  [key: string]: string;
}

const AuthFormModal = ({ modalOpen, modalClose }: Props) => {
  const [inputs, setInputs] = useState<ArrType>({
    email: "",
    dpName: "",
    password: "",
  });
  const [checkMessage, setCheckMessage] = useState({
    email: true,
    dpName: true,
    password: true,
  });
  const [isExistAccount, setIsExistAccount] = useState(true);
  const [isDuplication, setIsDuplication] = useState({
    email: false,
    dpName: false,
  });
  const [isFindPassword, setIsFindPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const { isMobile } = useMediaScreen();
  const toggleAccount = () => setIsExistAccount(!isExistAccount);
  const emailRef = useRef(null);

  const errorMessages: ArrType = {
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
    if (inputs.dpName !== "") {
      const myCollectionRef = collection(dbService, "users");
      const checkDuplication = async () => {
        const querySnapshot = await getDocs(myCollectionRef);
        const emailFilter = querySnapshot.docs.some(
          (doc) => doc.id === inputs.email
        );
        const dpNameFilter = querySnapshot.docs.some(
          (doc) => doc.data().displayName === inputs.dpName
        );
        setIsDuplication({ email: emailFilter, dpName: dpNameFilter });
      };
      checkDuplication();
    }
  }, [inputs.dpName, inputs.email]);

  // 정규식 체크
  useEffect(() => {
    const emailRegex =
      /([\w-.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-z]{2,4}|[0-9]{1,3})(\]?)$/;
    const passwordRegex =
      /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/;
    const dpNameRegex = /^[a-zA-Z0-9_.]+$/;

    const checkRegex = (key: string, regex: RegExp) => {
      setCheckMessage((prev) => ({ ...prev, [key]: regex.test(inputs[key]) }));
    };

    checkRegex("email", emailRegex);
    checkRegex("password", passwordRegex);
    checkRegex("dpName", dpNameRegex);
  }, [inputs]);

  // 인풋 에러
  useMemo(() => {
    if (inputs.email !== "" && !checkMessage.email) {
      return setError("사용할 수 없는 이메일 주소입니다.");
    }
    if (inputs.email !== "" && isDuplication.email) {
      return setError("중복된 이메일입니다.");
    }
    if (inputs.password !== "" && !checkMessage.password) {
      return setError("숫자+영문자+특수문자 조합으로 8자리 이상 입력해주세요.");
    }
    if (inputs.dpName !== "" && !checkMessage.dpName) {
      return setError(
        "사용자 이름에는 문자, 숫자, 밑줄 및 마침표만 사용할 수 있습니다."
      );
    }
    if (
      (inputs.dpName !== "" && isDuplication.dpName) ||
      (inputs.email !== "" && isDuplication.email)
    ) {
      return setError("중복된 닉네임입니다.");
    }
    return setError("");
  }, [
    checkMessage.dpName,
    checkMessage.email,
    checkMessage.password,
    inputs.dpName,
    inputs.email,
    inputs.password,
    isDuplication,
  ]);

  const SignUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let user;
      if (isExistAccount) {
        setIsLoading(true);
        await signInWithEmailAndPassword(
          authService,
          inputs.email,
          inputs.password
        ).then(async (result) => {
          let SignUser = result.user;
          const docRef = doc(dbService, "users", SignUser.email);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            dispatch(
              logIn()
              //   {
              //   expirationTime: new Date().getTime() + 20 * 1000, // 자동 로그인 유지 시간
              // }
            );
            dispatch(
              currentUser({
                ...docSnap.data(),
              })
            );
            // 알림 토큰 생성
            await createDeviceToken(SignUser.email).then(() => {
              alert("로그인 되었습니다.");
              setIsLoading(false);
              modalClose();
              window.location.reload();
            });
          }
        });
      } else {
        await createUserWithEmailAndPassword(
          authService,
          inputs.email,
          inputs.password
        ).then(async (result) => {
          user = result.user;
          updateProfile(authService.currentUser, {
            displayName: inputs.dpName,
          });
          const usersRef = collection(dbService, "users");
          await setDoc(doc(usersRef, user.email), {
            notification: false,
            uid: user.uid,
            createdAt: Date.now(),
            defaultProfileUrl: defaultAccount,
            profileURL: "",
            email: user.email,
            name: "",
            displayName: inputs.dpName,
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
              notification: false,
              uid: user.uid,
              createdAt: Date.now(),
              defaultProfileUrl: defaultAccount,
              profileURL: "",
              email: user.email,
              name: "",
              displayName: inputs.dpName,
              description: "",
              bookmark: [],
              like: [],
              notice: [],
              message: [],
              follower: [],
              following: [],
            })
          );
          await createDeviceToken(user.email).then(() => {
            setIsExistAccount(true);
            setInputs({
              email: "",
              dpName: "",
              password: "",
            });
            setIsDuplication({ email: false, dpName: false });
            setError("");
            emailRef.current.focus();
            alert("회원가입 되었습니다.");
          }); // 알림 토큰 생성
        });
      }
    } catch (error: any) {
      setIsLoading(false);
      const errorKey = Object.keys(errorMessages).find((key) =>
        error.message.includes(key)
      );
      // 웹 푸시 토큰 없을 떄 알림
      if (error.message === "Can't find variable: Notification") {
        alert(
          `웹 알림이 지원되지 않는 환경이므로 알림을 받을 수 없습니다. 알림을 받으시려면,\n'ios: safari - 공유 - 홈 화면에 추가' 후 로그인을 해주세요.`
        );
        modalClose();
        return window.location.reload();
      }
      const errorMessage = errorKey ? errorMessages[errorKey] : error.message;
      return setError(errorMessage);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { name, value },
    } = e;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const onFindPassword = () => {
    setIsFindPassword((prev) => !prev);
  };

  // 이전 버튼
  const onPrevClick = () => {
    setIsFindPassword((prev) => !prev);
  };

  return (
    <Modal open={modalOpen} onClose={modalClose} disableScrollLock={false}>
      <>
        {isLoading && (
          <LoadingBox>
            <Spinner />
          </LoadingBox>
        )}
        <Container isLoading={isLoading}>
          <Header>
            {isFindPassword ? (
              <>
                <IconBox onClick={onPrevClick}>
                  <BsArrowLeftShort />
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
            {!isFindPassword ? (
              <>
                {isMobile && (
                  <LogoBox>
                    <Logo>
                      <LogoImage
                        src="/image/sheather_logo.png"
                        alt="shather logo"
                      />
                    </Logo>
                  </LogoBox>
                )}
                <FormBox>
                  <Form onSubmit={SignUser} method="post">
                    <EmailBox>
                      <Input
                        spellCheck="false"
                        name="email"
                        type="email"
                        ref={emailRef}
                        placeholder="이메일 주소"
                        value={inputs.email}
                        onChange={onChange}
                        autoComplete="off"
                      />
                      {inputs.email !== "" && (
                        <InputCheckBox
                          check={checkMessage.email && !isDuplication.email}
                        >
                          {checkMessage.email && !isDuplication.email ? (
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
                          spellCheck="false"
                          name="dpName"
                          type="dpName"
                          placeholder="사용자 이름"
                          value={inputs.dpName}
                          onChange={onChange}
                          autoComplete="off"
                        />
                        {inputs.dpName !== "" && (
                          <InputCheckBox
                            check={checkMessage.dpName && !isDuplication.dpName}
                          >
                            {checkMessage.dpName && !isDuplication.dpName ? (
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
                        spellCheck="false"
                        name="password"
                        type="password"
                        placeholder="비밀번호"
                        value={inputs.password}
                        onChange={onChange}
                        autoComplete="off"
                        autoCapitalize="off"
                      />
                      {inputs.password !== "" && (
                        <InputCheckBox check={checkMessage.password}>
                          {checkMessage.password ? (
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
                        disabled={
                          isExistAccount
                            ? inputs.email === "" ||
                              inputs.password === "" ||
                              !checkMessage.email ||
                              !checkMessage.password
                            : inputs.email === "" ||
                              inputs.dpName === "" ||
                              inputs.password === "" ||
                              !checkMessage.email ||
                              !checkMessage.dpName ||
                              !checkMessage.password ||
                              isDuplication.dpName ||
                              isDuplication.email
                        }
                      >
                        {isExistAccount ? "로그인" : "회원가입"}
                      </SignBtn>
                    </SignBtnBox>

                    {error !== "" && <ErrorText>{error}</ErrorText>}
                  </Form>
                  <SignInfo>
                    <SignUp onClick={toggleAccount}>
                      {isExistAccount ? "회원가입" : "로그인"}
                    </SignUp>
                    <AccountBox>
                      {/* <AccountFind>계정 찾기</AccountFind> */}
                      <AccountFind onClick={onFindPassword}>
                        비밀번호 찾기
                      </AccountFind>
                    </AccountBox>
                  </SignInfo>
                </FormBox>
              </>
            ) : (
              <FindPassword isMobile={isMobile} />
            )}
          </Box>
        </Container>
      </>
    </Modal>
  );
};

export default AuthFormModal;

const LoadingBox = styled.div`
  position: absolute;
  border-radius: 20px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
  overflow: hidden;

  svg {
    width: 40px;
    height: 40px;
    stroke: #fff;
  }
`;

const Container = styled.div<{ isLoading: boolean }>`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 480px;
  margin: 0 auto;
  background: #fff;
  border-radius: 20px;
  text-align: center;
  border: 2px solid var(--second-color);
  box-shadow: 12px 12px 0 -2px var(--profile-color),
    12px 12px var(--second-color);
  outline: none;
  display: flex;
  flex-direction: column;
  filter: ${(props) => (props.isLoading ? `brightness(0.5)` : "none")};

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
  display: flex;
  align-items: center;
  overflow: hidden;
  border-bottom: 1px solid var(--third-color);
  position: relative;

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
    color: var(--profile-color);
  }

  svg {
    font-size: 24px;
  }
`;

const LogoBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Logo = styled.div`
  width: 300px;
`;

const LogoImage = styled.img`
  display: block;
  width: 100%;
`;

const Box = styled.div`
  flex: 1;
  display: flex;
  position: relative;
  gap: 52px;
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
  border: 1px solid var(--third-color);
`;

const PasswordBox = styled(EmailBox)``;

const Input = styled.input`
  width: 100%;
  padding: 20px;
  font-size: 16px;
  color: var(--second-color);
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
    color: var(--third-color);
    transition: all 0.2s;
  }
`;

const InputCheckBox = styled.div<{ check?: boolean }>`
  width: 48px;
  height: 48px;
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
  background-color: var(--profile-color);
  display: block;
  width: 100%;
  height: 50px;
  border-radius: 8px;
  padding: 0;
  font-size: 16px;
  color: #fff;
  transition: all 0.12s linear;

  &:disabled {
    background: #9489b3;
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
`;

const ErrorText = styled.p`
  display: block;
  text-align: center;
  font-size: 12px;
  color: #eb0000;
  letter-spacing: -0.5px;
  margin-top: 24px;
`;
