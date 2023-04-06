import { useState } from "react";
import { doc, addDoc, collection, updateDoc } from "firebase/firestore";
import { dbService } from "../fbase";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { useNavigate } from "react-router-dom";
import { CurrentUserType } from "../types/type";

type Props = {};

const useCreateChat = () => {
  const { loginToken: userLogin, currentUser: userObj } = useSelector(
    (state: RootState) => {
      return state.user;
    }
  );
  const [clickInfo, setClickInfo] = useState<CurrentUserType>(null);
  const navigate = useNavigate();

  // 채팅 생성
  const onCreateChatClick = async (user: CurrentUserType) => {
    const myFilter = userObj.message.filter(
      (message) => message.user === user.displayName
    );
    const userFilter = user.message.filter(
      (message) => message.user === userObj.displayName
    );

    if (!myFilter.length && !userFilter.length) {
      // 채팅 새로 만들기
      await addDoc(collection(dbService, `messages`), {
        member: [userObj.displayName, user.displayName],
        message: [],
      }).then((document) => {
        // 중복 체크
        const checkMyInfo = userObj?.message?.some(
          (res: { id: string }) => res.id === document?.id
        );
        const checkUserInfo = user?.message?.some(
          (res: { id: string }) => res.id === document?.id
        );

        if (document.id) {
          // 채팅 개설 시 본인 계정 message에 id값 추가
          if (userObj && !checkMyInfo) {
            const myAccountPushId = async () => {
              await updateDoc(doc(dbService, "users", userObj.displayName), {
                message: [
                  ...userObj?.message,
                  {
                    user: user?.displayName, // 상대 아이디
                    id: document?.id,
                    isRead: false,
                  },
                ],
              });
            };
            myAccountPushId();
          }

          // 채팅 개설 시 상대 계정 message에 id값 추가
          if (user && !checkUserInfo) {
            const UserAccountPushId = async () => {
              await updateDoc(doc(dbService, "users", user.displayName), {
                message: [
                  ...user?.message,
                  {
                    user: userObj.displayName, // 본인 아이디
                    id: document?.id,
                    isRead: false,
                  },
                ],
              });
            };
            UserAccountPushId();
          }
        }
      });
    } else {
      // 기존 채팅방 본인 계정 message에 id값 추가
      if (userObj && myFilter.length) {
        console.log("???");
        const myAccountPushId = async () => {
          await updateDoc(doc(dbService, "users", userObj.displayName), {
            message: [
              ...userObj?.message,
              {
                user: user?.displayName,
                id: userFilter[0].id,
                isRead: false,
              },
            ],
          });
        };
        myAccountPushId();
      }

      // 기존 채팅방 상대 계정 message에 id값 추가
      if (user && userFilter.length) {
        console.log("");
        const UserAccountPushId = async () => {
          await updateDoc(doc(dbService, "users", user.displayName), {
            message: [
              ...user?.message,
              {
                user: userObj.displayName,
                id: myFilter[0]?.id,
                isRead: false,
              },
            ],
          });
        };
        UserAccountPushId();
      }
    }
    setClickInfo(user);
    navigate(`/message/${user.displayName}`, { state: user });
  };

  return { clickInfo, setClickInfo, onCreateChatClick };
};

export default useCreateChat;
