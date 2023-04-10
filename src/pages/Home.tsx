import { useState } from "react";
import styled from "@emotion/styled";
import FeedPost from "../components/feed/FeedPost";
import SortFeedCategory from "../components/feed/SortFeedCategory";
import AuthFormModal from "../components/modal/auth/AuthFormModal";
import useUserAccount from "../hooks/useUserAccount";

const Home = () => {
  const [url, setUrl] = useState(
    `${process.env.REACT_APP_SERVER_PORT}/api/feed/recent?`
  );
  const { isAuthModal, onAuthModal, setIsAuthModal, onIsLogin, onLogOutClick } =
    useUserAccount();

  return (
    <>
      {isAuthModal && (
        <AuthFormModal modalOpen={isAuthModal} modalClose={onAuthModal} />
      )}
      <Container>
        <Box>
          <SortFeedCategory url={url} setUrl={setUrl} />
          <FeedPost url={url} onIsLogin={onIsLogin} />
        </Box>
      </Container>
    </>
  );
};
export default Home;

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ff5673;

  @media (max-width: 767px) {
    padding: 16px;
  }
`;

const Box = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;

  @media (max-width: 767px) {
    background: #fff;
    padding: 16px;
    border: 1px solid #222;
    border-radius: 20px;
    box-shadow: ${(props) => {
      let shadow = "";
      for (let i = 1; i < 63; i++) {
        shadow += `#be374e ${i}px ${i}px,`;
      }
      shadow += `#be374e 63px 63px`;
      return shadow;
    }};
  }
`;
