import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { onSnapshot, doc } from "firebase/firestore";
import React, { useLayoutEffect } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Toaster } from "react-hot-toast";
import { FaRegBookmark, FaRegHeart } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { MdGridOn } from "react-icons/md";
import { useSelector } from "react-redux";
import { Link, Route, Routes, useLocation, useParams } from "react-router-dom";
import { RootState } from "../app/store";
import { UserType } from "../app/user";
import ColorList from "../assets/ColorList";
import ExploreSkeleton from "../assets/skeleton/ExploreSkeleton";
import ProfileEditModal from "../components/modal/profile/ProfileEditModal";
import ProfileFollowModal from "../components/modal/profile/ProfileFollowModal";
import ProfilePost from "../components/profile/ProfilePost";
import { dbService } from "../fbase";
import useInfinityScroll from "../hooks/useInfinityScroll";
import useLogout from "../hooks/useLogout";
import useToggleFollow from "../hooks/useToggleFollow";
import { FeedType } from "../types/type";

const Profile = () => {
  const { loginToken: userLogin, currentUser: userObj } = useSelector(
    (state: RootState) => {
      return state.user;
    }
  );
  const [selectCategory, setSelectCategory] = useState(0);
  const [post, setPost] = useState(null);
  const [notInfoText, setNotInfoText] = useState("");
  const [account, setAccount] = useState(null);
  const [followInfo, setFollowInfo] = useState(null);
  const [followCategory, setFollowCategory] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { onLogOutClick } = useLogout();
  const { toggleFollow } = useToggleFollow();
  const { id, "*": type } = useParams();
  const {
    dataList: feedArray,
    isLoading: isLoading2,
    ref,
  } = useInfinityScroll({
    url: `${process.env.REACT_APP_SERVER_PORT}/api/feed/recent?`,
    count: 9,
  });

  const feedApi = async () => {
    const { data } = await axios.get(
      `${process.env.REACT_APP_SERVER_PORT}/api/feed`
    );
    return data;
  };

  // ?????? ????????? ????????????
  const { data: feedData, isLoading } = useQuery<FeedType[]>(
    ["feed"],
    feedApi,
    {
      refetchOnWindowFocus: false,
      onError: (e) => console.log(e),
    }
  );

  // ????????? ??????
  const myPost: FeedType[] = useMemo(() => {
    const filter = feedData?.filter((res) => res.email === account?.email);
    return filter;
  }, [feedData, account?.email]);

  // ?????? ?????? ????????????
  // ????????? ?????? -> ?????? ????????? ?????? -> ????????? ????????? ?????? ????????? ???????????? ?????? ?????? ???????????? ????????? ???????????? ?????? ?????????
  // => if?????? ???????????? ?????? ???????????? ?????? ???????????? Firebase?????? ??? ?????? ?????? ????????????
  useEffect(() => {
    if (userObj.displayName !== id) {
      onSnapshot(doc(dbService, "users", id), (doc) => {
        setAccount(doc.data());
      });
    } else {
      setAccount(userObj);
    }
  }, [id, userObj]);

  //
  useEffect(() => {
    if (type === "post") {
      return setSelectCategory(0);
    }
    if (type === "like") {
      return setSelectCategory(1);
    }
    if (type === "bookmark") {
      return setSelectCategory(2);
    }
  }, [type]);

  useEffect(() => {
    if (selectCategory === 0) {
      const recentFilter = feedArray?.pages
        ?.flat()
        ?.filter((res) => res.email === account?.email)
        .sort((a, b) => b.createdAt - a.createdAt);
      return setPost(recentFilter);
    }

    if (selectCategory === 1) {
      const likeFilter = account?.like
        ?.map((res: string) => {
          return feedArray?.pages?.flat()?.filter((asd) => asd.id === res);
        })
        .flat();

      return setPost(likeFilter);
    }

    if (selectCategory === 2) {
      const bookmarkFilter = account?.bookmark
        ?.map((res: string) => {
          return feedArray?.pages?.flat()?.filter((asd) => asd.id === res);
        })
        .flat();

      return setPost(bookmarkFilter);
    }
  }, [
    account?.bookmark,
    account?.email,
    account?.like,
    feedArray?.pages,
    selectCategory,
  ]);

  useEffect(() => {
    if (myPost?.length !== 0) {
      setNotInfoText("???????????? ???????????? ???????????? ???????????? ???????????????.");
    }
    if (selectCategory === 1) {
      setNotInfoText("???????????? ???????????? ???????????? ????????? ????????? ???????????????.");
    }

    if (selectCategory === 2) {
      setNotInfoText("???????????? ???????????? ???????????? ????????? ????????? ???????????????.");
    }
  }, [myPost?.length, selectCategory]);

  const onModalClick = () => {
    setModalOpen((prev) => !prev);
  };

  const onClickFollowInfo = (res: []) => {
    setFollowInfo(res);
  };

  const onEditModalClick = () => {
    setEditModalOpen((prev) => !prev);
  };

  return (
    <>
      {account && (
        <Wrapper>
          {editModalOpen && (
            <ProfileEditModal
              modalOpen={editModalOpen}
              modalClose={onEditModalClick}
            />
          )}
          {modalOpen && (
            <ProfileFollowModal
              accountName={account?.displayName}
              modalOpen={modalOpen}
              followInfo={followInfo}
              followLength={
                followCategory === "?????????"
                  ? account?.follower.length
                  : account?.following.length
              }
              followCategory={followCategory}
              modalClose={onModalClick}
            />
          )}
          <Container>
            <ProfileBox>
              <ProfileImageBox>
                <ProfileImage src={account?.profileURL} alt="profile image" />
              </ProfileImageBox>
              <ProfileDetailBox>
                <ProfileDetail>
                  <ProfileInfoBox>
                    <ProfileDsName>{account?.displayName}</ProfileDsName>
                    {account?.name && <ProfileName>{account.name}</ProfileName>}
                    {account?.description && (
                      <ProfileDesc>{account.description}</ProfileDesc>
                    )}
                  </ProfileInfoBox>
                  {account?.email === userObj.email ? (
                    <BtnBox>
                      <ProfileEditBtn onClick={onEditModalClick}>
                        ????????? ??????
                      </ProfileEditBtn>
                      <LogoutBtn onClick={onLogOutClick}>
                        <FiLogOut />
                      </LogoutBtn>
                    </BtnBox>
                  ) : (
                    <FollowBtnBox
                      onClick={() => toggleFollow(account?.displayName)}
                    >
                      {userObj?.following.filter((obj) =>
                        obj.displayName.includes(account.displayName)
                      ).length !== 0 ? (
                        <BtnBox>
                          <FollowingBtn>?????????</FollowingBtn>
                        </BtnBox>
                      ) : (
                        <BtnBox>
                          <FollowBtn>?????????</FollowBtn>
                        </BtnBox>
                      )}
                    </FollowBtnBox>
                  )}
                </ProfileDetail>
                <ProfileActBox>
                  <ProfileAct>
                    ????????? <em>{myPost?.length}</em>
                  </ProfileAct>
                  <ProfileAct
                    onClick={() => {
                      onModalClick();
                      onClickFollowInfo(account?.follower);
                      setFollowCategory("?????????");
                    }}
                  >
                    ????????? <em>{account?.follower.length}</em>
                  </ProfileAct>
                  <ProfileAct
                    onClick={() => {
                      onModalClick();
                      onClickFollowInfo(account?.following);
                      setFollowCategory("?????????");
                    }}
                  >
                    ????????? <em>{account?.following.length}</em>
                  </ProfileAct>
                </ProfileActBox>
              </ProfileDetailBox>
            </ProfileBox>
            <CategoryBox>
              <Category
                onClick={() => setSelectCategory(0)}
                select={selectCategory}
                num={0}
                to={`post`}
              >
                <MdGridOn />
                ?????????
              </Category>
              <Category
                onClick={() => setSelectCategory(1)}
                select={selectCategory}
                num={1}
                to={`like`}
              >
                <FaRegHeart />
                ?????????
              </Category>
              <Category
                onClick={() => setSelectCategory(2)}
                select={selectCategory}
                num={2}
                to={`bookmark`}
                state={account?.id}
              >
                ?????????
              </Category>
            </CategoryBox>

            <ProfilePost
              myPost={post}
              loading={isLoading2}
              notInfoText={notInfoText}
              email={account?.email}
              ref={ref}
            />
          </Container>
        </Wrapper>
      )}
    </>
  );
};

export default Profile;

const { mainColor, secondColor, thirdColor, fourthColor } = ColorList();

const Wrapper = styled.div`
  position: relative;
  overflow: hidden;
  height: 100%;
  padding: 34px;
  border-top: 2px solid ${secondColor};
  background: #6f4ccf;
`;

const Container = styled.div`
  position: relative;
  height: 100%;
  padding: 20px;
  border: 2px solid ${secondColor};
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: #422a83 1px 1px, #422a83 0px 0px, #422a83 1px 1px, #422a83 2px 2px,
    #422a83 3px 3px, #422a83 4px 4px, #422a83 5px 5px, #422a83 6px 6px,
    #422a83 7px 7px, #422a83 8px 8px, #422a83 9px 9px, #422a83 10px 10px,
    #422a83 11px 11px, #422a83 12px 12px, #422a83 13px 13px, #422a83 14px 14px,
    #422a83 15px 15px, #422a83 16px 16px, #422a83 17px 17px, #422a83 18px 18px,
    #422a83 19px 19px, #422a83 20px 20px, #422a83 21px 21px, #422a83 22px 22px,
    #422a83 23px 23px, #422a83 24px 24px, #422a83 25px 25px, #422a83 26px 26px,
    #422a83 27px 27px, #422a83 28px 28px, #422a83 29px 29px, #422a83 30px 30px,
    #422a83 31px 31px, #422a83 32px 32px, #422a83 33px 33px, #422a83 34px 34px,
    #422a83 35px 35px, #422a83 36px 36px, #422a83 37px 37px, #422a83 38px 38px,
    #422a83 39px 39px, #422a83 40px 40px, #422a83 41px 41px, #422a83 42px 42px,
    #422a83 43px 43px, #422a83 44px 44px, #422a83 45px 45px, #422a83 46px 46px,
    #422a83 47px 47px, #422a83 48px 48px, #422a83 49px 49px, #422a83 50px 50px,
    #422a83 51px 51px, #422a83 52px 52px, #422a83 53px 53px, #422a83 54px 54px,
    #422a83 55px 55px, #422a83 56px 56px, #422a83 57px 57px, #422a83 58px 58px,
    #422a83 59px 59px, #422a83 60px 60px, #422a83 61px 61px, #422a83 62px 62px,
    #422a83 63px 63px;
`;

const ProfileBox = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  /* padding: 20px; */
  position: relative;
`;

const ProfileImageBox = styled.div`
  width: 120px;
  height: 120px;
  border: 2px solid ${fourthColor};
  border-radius: 50%;
  overflow: hidden;
  flex: 0 0 auto;
`;

const ProfileImage = styled.img`
  display: block;
  width: 100%;
  object-fit: cover;
`;

const ProfileDetailBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
`;

const ProfileDetail = styled.div`
  display: flex;
  align-items: flex-start;
  position: relative;
`;

const ProfileInfoBox = styled.div`
  flex: 1;
  padding-right: 20px;
`;

const ProfileDsName = styled.p`
  font-size: 20px;
  line-height: 34px;
`;

const ProfileName = styled.p`
  font-size: 14px;
  margin-top: 4px;
`;

const ProfileDesc = styled.p`
  margin-top: 8px;
  font-size: 14px;
  white-space: pre-wrap;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  overflow: hidden;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
`;

const ProfileActBox = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const ProfileAct = styled.div`
  font-size: 14px;
  &:not(:first-of-type) {
    cursor: pointer;
  }
  em {
    font-weight: 500;
  }
`;

const BtnBox = styled.div`
  display: flex;
  /* position: absolute;
  top: 0;
  right: 0; */
`;

const ProfileEditBtn = styled.button`
  padding: 8px 10px;
  border: 1px solid #6f4ccf;
  color: #6f4ccf;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.1s linear;

  &:hover,
  &:active {
    background-color: #6f4ccf;
    color: #fff;
  }
`;

const LogoutBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  margin-left: 8px;
  padding: 8px;
  border: 1px solid ${thirdColor};
  color: ${thirdColor};
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.1s linear;

  &:hover,
  &:active {
    border: 1px solid ${secondColor};
    background-color: ${secondColor};
    color: #fff;
  }
`;

const FollowBtnBox = styled.div``;

const FollowBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  padding: 8px 16px;
  color: #fff;
  border-radius: 8px;
  border: 1px solid ${secondColor};
  background: ${secondColor};
  cursor: pointer;
  transition: all 0.1s linear;

  &:hover,
  &:active {
    background: #000;
  }
`;

const FollowingBtn = styled(FollowBtn)`
  border: 1px solid ${thirdColor};
  background: #fff;
  color: ${secondColor};

  &:hover,
  &:active {
    background: ${fourthColor};
  }
`;

const CategoryBox = styled.ul`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  margin-top: 40px;
  border-top: 1px solid ${thirdColor};
`;

const Category = styled(Link)<{ select: number; num: number }>`
  padding: 16px 0 30px;
  /* border-top: ${(props) =>
    props.num === props.select && `2px solid ${secondColor}`}; */
  font-weight: ${(props) => props.num === props.select && "bold"};
  /* margin-top: ${(props) => props.num === props.select && "-1px"}; */
  color: ${(props) => props.num !== props.select && thirdColor};
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;

  &::after {
    content: "";
    display: ${(props) => (props.num === props.select ? "block" : "none")};
    position: absolute;
    top: 0;
    width: 100%;
    height: 2px;
    background: ${(props) => props.num === props.select && secondColor};
  }

  svg {
    max-width: 12px;
    max-height: 12px;
  }
`;

const CardList = styled.ul<{ length: number }>`
  width: 100%;
  padding: 20px;
  /* display: flex; */
  /* flex-wrap: wrap; */
  /* gap: 16px; */
  /* justify-content: ${(props) =>
    props.length > 3 ? "space-between" : "flex-start"}; */
  /* gap: 20px; */
`;

const Card = styled.li`
  cursor: pointer;
  border-radius: 8px;
  position: relative;
  margin-bottom: 30px;
  border: 1px solid #eee;
  /* width: 33%; */
  /* height: 33%; */
  width: 180px;
  height: 180px;
  overflow: hidden;
`;

const WeatherEmojiBox = styled.div`
  position: absolute;
  z-index: 1;
  top: 8px;
  left: 8px;
  background-color: rgba(34, 34, 34, 0.4);
  border-radius: 10px;
  backdrop-filter: blur(5px);
`;

const WeatherEmoji = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 6px;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
`;

const CardLengthBox = styled.div`
  position: absolute;
  z-index: 1;
  top: 8px;
  right: 8px;
  background-color: rgba(34, 34, 34, 0.5);
  border-radius: 10px;
  backdrop-filter: blur(5px);
`;

const CardLength = styled.span`
  display: inline-block;
  padding: 4px 6px;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
`;

const CardImage = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
