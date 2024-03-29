import React, { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { CurrentUserType, FeedType, CommentType } from "../../../types/type";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import DetailFeedComment from "./DetailFeedComment";
import { useHandleResizeTextArea } from "../../../hooks/useHandleResizeTextArea";
import Emoji from "../../emoji/Emoji";
import useMediaScreen from "../../../hooks/useMediaScreen";
import useComment from "../../../hooks/actions/useComment";
import useSendNoticeMessage from "../../../hooks/actions/useSendNoticeMessage";
import useReply from "../../../hooks/actions/useReply";
import { onSnapshot, doc } from "firebase/firestore";
import { dbService } from "../../../fbase";

type Props = {
  userAccount: CurrentUserType;
  feed: FeedType;
  onIsLogin: () => void;
};

const DetailFeedCommentBox = ({ userAccount, feed, onIsLogin }: Props) => {
  const { currentUser: userObj } = useSelector((state: RootState) => {
    return state.user;
  });
  const [isWriteReply, setIsWriteReply] = useState(false);
  const [commentUser, setCommentUser] = useState(null);
  const [replyData, setReplyData] = useState(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const { handleResizeHeight } = useHandleResizeTextArea(textRef);
  const { getToken } = useSendNoticeMessage(feed);
  const { isMobile } = useMediaScreen();

  const { commentText, setCommentText, onComment, onCommentDelete } =
    useComment({
      feed,
      userAccount,
      commentData: replyData,
      textRef,
      getToken,
    });

  const { replyText, setReplyText, onReply, onReplyDelete } = useReply({
    userObj,
    userAccount: commentUser,
    commentData: replyData,
    textRef,
    getToken,
  });

  // 답글 유저 정보 가져오기
  useEffect(() => {
    if (replyData) {
      const unsubscribe = onSnapshot(
        doc(dbService, "users", replyData.email),
        (doc) => {
          setCommentUser(doc.data());
        }
      );

      return () => {
        unsubscribe();
      };
    }
  }, [replyData]);

  // 답글 (@아이디) 지울 시 댓글 쓰기로 변경
  useEffect(() => {
    if (replyText === "") {
      setIsWriteReply(false);
      setReplyData(null);
    }
  }, [replyText]);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isWriteReply) {
      setReplyText(e.target.value);
    } else {
      setCommentText(e.target.value);
    }
  };

  // Enter 전송 / Shift + Enter 줄바꿈
  const onKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      (commentText !== "" || replyText !== "") &&
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();

      if (isWriteReply) {
        onReply(replyData);
      } else {
        onComment(feed);
      }
    }
  };

  const onClickReply = (data: CommentType) => {
    setReplyData(data);
    setIsWriteReply(true);
    setReplyText(`@${data.displayName} `);
    textRef.current.focus();
  };

  return (
    <Container>
      {feed.comment.length > 0 && (
        <>
          <UserReactNum>댓글 {feed?.comment?.length}개</UserReactNum>
          {feed?.comment?.map((data: CommentType, index: number) => {
            return (
              <DetailFeedComment
                key={data?.time}
                commentData={data}
                onClickReply={onClickReply}
                onCommentDelete={onCommentDelete}
                onReplyDelete={onReplyDelete}
              />
            );
          })}
        </>
      )}
      <CommentEditBox onClick={onIsLogin}>
        <CommentEditText
          spellCheck="false"
          name="comment"
          maxLength={120}
          value={isWriteReply ? replyText : commentText}
          ref={textRef}
          onChange={onChange}
          onKeyDown={(e) => onKeyPress(e)}
          onInput={handleResizeHeight}
          placeholder="댓글 달기..."
        />
        {(replyText.length > 0 || commentText.length > 0) && (
          <CommentEditBtn
            type="button"
            onClick={() =>
              isWriteReply ? onReply(replyData) : onComment(feed)
            }
          >
            게시
          </CommentEditBtn>
        )}
        {!isMobile && (
          <Emoji
            setText={setCommentText}
            textRef={textRef}
            right={0}
            bottom={30}
          />
        )}
      </CommentEditBox>
    </Container>
  );
};

export default DetailFeedCommentBox;

const Container = styled.div`
  padding: 0 16px 16px;
`;

const CommentEditBox = styled.form`
  padding-top: 20px;
  margin-top: 10px;
  padding-bottom: 8px;
  width: 100%;
  height: 100%;
  border-top: 1px solid var(--fourth-color);
  display: flex;
  align-items: center;

  @media (max-width: 767px) {
    padding-top: 16px;
    padding-bottom: 0;
  }
`;

const CommentEditText = styled.textarea`
  display: block;
  width: 100%;
  height: 24px;
  max-height: 80px;
  resize: none;
  border: none;
  outline: none;
  line-height: 24px;

  @media (max-width: 767px) {
    font-size: 14px;
  }
`;

const CommentEditBtn = styled.button`
  display: flex;
  flex: 1 0 auto;
  margin: 0 12px;
  padding: 0;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  outline: none;
  font-weight: 500;
  color: var(--feed-color);
  font-size: 14px;
  cursor: pointer;
`;

const UserReactNum = styled.p`
  font-size: 14px;
  color: var(--third-color);
  margin-bottom: 6px;
`;
