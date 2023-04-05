import React, { useEffect, useState } from "react";
import axios from "axios";
import { getDoc, doc, onSnapshot } from "firebase/firestore";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";
import { dbService } from "../fbase";
import { NoticeArrType } from "../types/type";

const useNoticeCheck = () => {
  const { loginToken: userLogin, currentUser: userObj } = useSelector(
    (state: RootState) => {
      return state.user;
    }
  );
  const [myAccount, setMyAccount] = useState(null);
  const [result, setResult] = useState<NoticeArrType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const feedApi = async () => {
    const { data } = await axios.get(
      `${process.env.REACT_APP_SERVER_PORT}/api/feed`
    );
    return data;
  };

  // 계정 정보 가져오기
  useEffect(() => {
    if (userLogin) {
      const unsubscribe = onSnapshot(
        doc(dbService, "users", userObj?.displayName),
        (doc) => {
          setMyAccount(doc.data());
        }
      );

      return () => unsubscribe();
    }
  }, [userLogin, userObj?.displayName]);

  // 정보 + 프로필 이미지 담기
  useEffect(() => {
    if (myAccount) {
      const getList = async (res: NoticeArrType) => {
        const docSnap = await getDoc(doc(dbService, "users", res.displayName));
        return {
          type: res.type,
          time: res.time,
          displayName: res.displayName,
          postId: res.postId,
          text: res.text,
          imgUrl: res.imgUrl,
          isRead: res.isRead,
          profileURL: docSnap.data().profileURL,
        };
      };

      const promiseList = async () => {
        const list = await Promise.all(
          myAccount?.notice?.map(async (res: NoticeArrType) => {
            return getList(res);
          })
        );
        setResult(list);
        setIsLoading(true);
      };
      promiseList();
    }
  }, [myAccount]);

  return { result, isLoading };
};

export default useNoticeCheck;