import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { updateDoc, doc } from "firebase/firestore";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../app/store";
import { currentUser } from "../app/user";
import { dbService } from "../fbase";
import { FeedType } from "../types/type";

const useToggleLike = () => {
  const { currentUser: userObj } = useSelector((state: RootState) => {
    return state.user;
  });
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // firebase 계정에 추가
  const fbLike = async (resId: string) => {
    if (!userObj.displayName) {
      return alert("로그인하기~~");
    }
    if (userObj.like?.includes(resId)) {
      const copy = [...userObj.like];
      const filter = copy.filter((id) => id !== resId);
      await updateDoc(doc(dbService, "users", userObj.displayName), {
        like: filter,
      });
      dispatch(
        currentUser({
          ...userObj,
          like: filter,
        })
      );
    } else {
      const copy = [resId, ...userObj.like];
      // copy.push(resId);
      await updateDoc(doc(dbService, "users", userObj.displayName), {
        like: copy,
      });
      dispatch(
        currentUser({
          ...userObj,
          like: copy,
        })
      );
    }
  };

  // 좋아요 api mutate
  const { mutate } = useMutation(
    (response: {
      id: string;
      like: { displayName: string; likedAt: number }[];
    }) => axios.post("http://localhost:4000/api/like", response),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["feed"]);
      },
    }
  );

  const toggleLike = (res: FeedType) => {
    const copy = [...res.like];
    const findEmail = copy.filter(
      (res) => res.displayName === userObj.displayName
    );
    const filter = copy.filter(
      (res) => res.displayName !== userObj.displayName
    );
    if (!userObj.displayName) {
      return alert("로그인하기~~");
    }
    if (findEmail.length === 0) {
      mutate({
        id: res.id,
        like: [
          { displayName: userObj.displayName, likedAt: +new Date() },
          ...copy,
        ],
      });
      fbLike(res.id);
    } else {
      mutate({
        id: res.id,
        like: filter,
      });
      fbLike(res.id);
    }
  };

  return { toggleLike };
};

export default useToggleLike;
