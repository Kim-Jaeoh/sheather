import { Modal } from "@mui/material";
import styled from "@emotion/styled";
import { IoMdClose } from "react-icons/io";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import toast, { Toaster } from "react-hot-toast";
import ColorList from "../../../assets/ColorList";
import { useEffect, useRef, useState } from "react";
import TempClothes from "../../../assets/TempClothes";
import { BsCheck, BsFillImageFill } from "react-icons/bs";
import { BiCrop, BiLeftArrowAlt } from "react-icons/bi";
import ShareImageCropper from "./ShareImageCropper";
import { Area, Point } from "react-easy-crop/types";
import imageCompression from "browser-image-compression";
import ShareWeatherCategory from "./ShareWeatherCategory";
import axios from "axios";
import useCurrentLocation from "../../../hooks/useCurrentLocation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MdPlace } from "react-icons/md";
import uuid from "react-uuid";
import ShareWeatherForm from "./ShareWeatherForm";
import { AspectRatio, FeedType, ImageType } from "../../../types/type";
import Flicking from "@egjs/react-flicking";
import getCroppedImg from "../../../assets/CropImage";
import { getInitialCropFromCroppedAreaPercentages } from "react-easy-crop";
import { cloneDeep } from "lodash";
import { Spinner } from "../../../assets/Spinner";
import useTagCurrentWear from "../../../hooks/useTagCurrentWear";

type Props = {
  shareBtn: boolean;
  setShareBtn: React.Dispatch<React.SetStateAction<boolean>>;
};

interface TagType {
  feel: string;
  outer: string;
  top: string;
  innerTop: string;
  bottom: string;
  etc: string;
}

const ShareWeatherModal = ({ shareBtn, setShareBtn }: Props) => {
  const [tags, setTags] = useState<string[]>([]);
  const [checkTag, setCheckTag] = useState<TagType>();
  const [focus, setFocus] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageNum, setSelectedImageNum] = useState(0);
  const fileInput = useRef<HTMLInputElement>();
  const [fileName, setFileName] = useState([]);
  const [text, setText] = useState("");
  const [isNextClick, setIsNextClick] = useState(false);
  const { currentUser: userObj } = useSelector((state: RootState) => {
    return state.user;
  });
  const shareWeatherData = useSelector((state: RootState) => {
    return state.weather;
  });
  const { currentTags } = useTagCurrentWear();
  const { location } = useCurrentLocation();
  const queryClient = useQueryClient();

  // ?????? ?????? ????????????
  const regionApi = async () => {
    return await axios.get(
      `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${location?.coordinates.lon}&y=${location?.coordinates.lat}&input_coord=WGS84`,
      {
        headers: {
          Authorization: `KakaoAK ${process.env.REACT_APP_KAKAO_API_KEY}`,
        },
      }
    );
  };

  // ?????? ?????? ????????????
  const { data: regionData, isLoading: isLoading2 } = useQuery(
    ["RegionApi", location],
    regionApi,
    {
      refetchOnWindowFocus: false,
      onError: (e) => console.log(e),
      enabled: Boolean(location),
    }
  );

  // ????????? ?????? ??? view ?????? ??? ????????? ??????
  useEffect(() => {
    // if (selectedImage == null && attachments.length !== 0) {
    //   setSelectedImage(attachments[0]);
    //   // setSelectedImageNum(0);
    // }
    // if (attachments.length === 0) {
    //   setSelectedImage(null);
    //   // setSelectedImageNum(null);
    // }
    // ????????? ?????????
    setSelectedImage(attachments[selectedImageNum]);
  }, [attachments, selectedImage, selectedImageNum]);

  // ????????? ?????? ??????
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsNextClick(false);
    const {
      currentTarget: { files },
    } = e;

    if (!files) return;
    if (attachments.length + files.length > 4) {
      fileInput.current.value = ""; // ?????? ?????? ?????????
      return toast.error("?????? 4?????? ????????? ????????? ??? ????????????.");
    }

    for (let i = 0; i < files.length; i++) {
      if (fileName.find((file) => files[i].name === file)) {
        return toast.error("????????? ????????? ????????? ??? ????????????.");
      }

      const reader = new FileReader(); // ?????? ?????? ??????

      /* ?????? ?????? ????????? ????????? ??? ??? ?????? ??? ?????? ???????????? ????????? ?????? ?????????
        Failed to execute 'readAsDataURL' on 'FileReader': parameter 1 is not of type 'Blob'. ?????? ????????? ??????. -> if????????? ?????? ?????? */
      if (files[i]) {
        reader.readAsDataURL(files[i]);
      }

      reader.onloadend = (finishedEvent) => {
        const {
          target: { result },
        } = finishedEvent;

        setAttachments((prev) => [
          ...prev,
          {
            imageUrl: result,
            croppedImageUrl: null,
            crop: null,
            zoom: null,
            aspect: null,
            name: files[i].name,
          },
        ]);
      };
      setFileName((prev) => {
        return [...prev, files[i].name];
      });
    }
  };

  const setCroppedImageFor = async (
    name: string,
    crop?: Point,
    zoom?: number,
    aspect?: { value: number; text: string },
    croppedImageUrl?: string
  ) => {
    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 1120,
    };

    // 1) ????????? ????????? ??????(BlobUrl: string)??? File ????????? ??????
    const CroppedImageUrlToFile = await imageCompression.getFilefromDataUrl(
      croppedImageUrl,
      "feed image"
    );

    // 2) 1)?????? ????????? File??? ??????
    const compressedFile = await imageCompression(
      CroppedImageUrlToFile,
      options
    );

    // 3) ????????? File??? ?????? ????????? ????????? ??????
    const compressedCroppedImage = await imageCompression.getDataUrlFromFile(
      compressedFile
    );

    const newAttachmentList = [...attachments];
    const attachmentIndex = attachments.findIndex((x) => x?.name === name);
    const attachment = attachments[attachmentIndex];
    const newAttachment = {
      ...attachment,
      name,
      crop,
      zoom,
      aspect,
      croppedImageUrl: compressedCroppedImage,
    };
    newAttachmentList[attachmentIndex] = newAttachment;
    setAttachments(newAttachmentList);
    // setSelectedImage(null);
  };

  // ????????? ??????
  const onRemoveImage = (res: { imageUrl: string; name: string }) => {
    setAttachments(
      attachments.filter((image) => image.imageUrl !== res.imageUrl)
    );
    setSelectedImage(null);
    const filter = fileName.filter((name) => res.name !== name);
    setFileName(filter);
    // fileInput.current.value = "";
  };

  // ?????? ??????
  const onNextClick = () => {
    if (attachments.length !== 0) {
      // setSelectedImage(attachments[0]);
      // setSelectedImage(null);
      setIsNextClick((prev) => !prev);
    }
  };

  // ?????? ??????
  const onPrevClick = () => {
    if (isNextClick) {
      // setSelectedImage(attachments[0]);
      // setSelectedImage(null);
      return setIsNextClick(false);
    }
    if (attachments.length === 0) {
      return setShareBtn(false);
    }
    return shareBtnClick();
  };

  // ?????? ?????????
  const { mutate } = useMutation(
    (response: FeedType) =>
      axios.post(`${process.env.REACT_APP_SERVER_PORT}/api/feed`, response),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["feed"]);
        setShareBtn(false);
      },
    }
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNextClick) {
      mutate({
        id: uuid(),
        url: attachments.map((res) =>
          res.croppedImageUrl ? res.croppedImageUrl : res.imageUrl
        ),
        imgAspect: attachments[0].aspect.text,
        displayName: userObj.displayName,
        email: userObj.email,
        createdAt: +new Date(),
        like: [],
        text: text,
        feel: checkTag.feel,
        wearInfo: {
          outer: checkTag.outer,
          top: checkTag.top,
          innerTop: checkTag.innerTop,
          bottom: checkTag.bottom,
          etc: checkTag.etc,
        },
        weatherInfo: {
          temp: Math.round(shareWeatherData?.main.temp),
          wind: Math.round(shareWeatherData?.wind.speed),
          weatherIcon: shareWeatherData?.weather[0].icon,
          weather: shareWeatherData?.weather[0].description,
        },
        region: regionData?.data?.documents[0]?.address?.region_1depth_name,
        reply: [],
        tag: tags,
      });
      toast.success("????????? ???????????????.");
    }
  };

  // ?????? ??????
  const shareBtnClick = () => {
    if (attachments.length !== 0) {
      const ok = window.confirm(
        "???????????? ?????????????????????? ?????? ????????? ?????? ????????? ???????????? ????????????."
      );
      if (ok) {
        setShareBtn(false);
      }
    } else {
      setShareBtn(false);
    }
  };

  return (
    <Modal open={shareBtn} onClose={shareBtnClick} disableScrollLock={false}>
      <Container onSubmit={onSubmit}>
        <Header>
          <IconBox onClick={onPrevClick}>
            <BiLeftArrowAlt />
          </IconBox>
          <WeatherInfoBox>
            <DateBox>
              <MdPlace />
              <WeatherCategorySub>
                {!isLoading2 &&
                  regionData?.data?.documents[0]?.address?.region_1depth_name}
              </WeatherCategorySub>
            </DateBox>
            <WeatherIcon>
              <img
                src={`http://openweathermap.org/img/wn/${shareWeatherData?.weather[0].icon}@2x.png`}
                alt="weather icon"
              />
            </WeatherIcon>
            <WeatherCategorySub>
              {shareWeatherData?.weather[0].description}
            </WeatherCategorySub>
            <WeatherCategorySub>
              {Math.round(shareWeatherData?.main.temp)}??
            </WeatherCategorySub>
            <WeatherCategorySub>
              {Math.round(shareWeatherData?.wind.speed)}
              <span>m/s</span>
            </WeatherCategorySub>
          </WeatherInfoBox>

          {!isNextClick ? (
            <NextBtn
              type="button"
              disabled={
                attachments.length === 0 ||
                attachments.filter((asd) => asd?.croppedImageUrl == null)
                  .length !== 0
              }
              onClick={onNextClick}
            >
              <EditText>??????</EditText>
            </NextBtn>
          ) : (
            <EditBtn
              type="submit"
              value={"SHARE"}
              disabled={
                text.length === 0 ||
                checkTag.feel == null ||
                checkTag.outer == null ||
                checkTag.top == null ||
                checkTag.innerTop == null ||
                checkTag.bottom == null ||
                checkTag.etc == null
              }
            >
              <EditText>SHARE</EditText>
            </EditBtn>
          )}
        </Header>
        {!isNextClick && (
          <ShareImageCropper
            attachments={attachments}
            selectedImage={selectedImage}
            setCroppedImageFor={setCroppedImageFor}
          />
        )}
        <ImageWrapper length={attachments.length}>
          <InputImageLabel htmlFor="attach-file">
            <ImageBox style={{ flexDirection: "column" }}>
              <EmojiBox>
                <EmojiIcon>
                  <BsFillImageFill
                    style={{
                      color: `${mainColor}`,
                      width: "24px",
                      height: "24px",
                    }}
                  />
                </EmojiIcon>
                <InputImage
                  id="attach-file"
                  accept="image/*"
                  name="attach-file"
                  multiple
                  ref={fileInput}
                  type="file"
                  onChange={onFileChange}
                />
              </EmojiBox>
              <ImageLength>
                <ImageLengthColor>{attachments.length}</ImageLengthColor>/4
              </ImageLength>
            </ImageBox>
          </InputImageLabel>

          <Flicking
            onChanged={(e) => console.log(e)}
            moveType="freeScroll"
            bound={true}
            align="prev"
          >
            <ImageContainerBox>
              {Array.from({ length: 4 })?.map((res, index) => {
                return (
                  <ImageContainer key={index}>
                    {attachments[index] ? (
                      <ImageBox length={attachments?.length}>
                        <ImageWrap
                          onMouseLeave={() => setFocus("")}
                          onMouseEnter={() => setFocus(index)}
                        >
                          {Boolean(attachments[index].croppedImageUrl) && (
                            <CropBtn>
                              <BsCheck />
                            </CropBtn>
                          )}
                          <ImageRemove
                            onClick={() => {
                              onRemoveImage(attachments[index]);
                              setIsNextClick(false);
                            }}
                          >
                            <IoMdClose />
                          </ImageRemove>
                          <Images
                            onClick={() => {
                              !isNextClick && setSelectedImageNum(index);
                            }}
                            src={
                              attachments[index]?.croppedImageUrl
                                ? attachments[index]?.croppedImageUrl
                                : attachments[index]?.imageUrl
                            }
                            alt=""
                          />
                        </ImageWrap>
                      </ImageBox>
                    ) : (
                      <ImageBox style={{ background: "#dbdbdb" }} />
                    )}
                  </ImageContainer>
                );
              })}
            </ImageContainerBox>
          </Flicking>
        </ImageWrapper>
        {isNextClick && (
          <>
            <ShareWeatherCategory
              bgColor={"#48A3FF"}
              checkTag={checkTag}
              setCheckTag={setCheckTag}
            />
            <ShareWeatherForm
              bgColor={"#48A3FF"}
              text={text}
              setText={setText}
              setTags={setTags}
            />
          </>
        )}
      </Container>
    </Modal>
  );
};

export default ShareWeatherModal;

const { mainColor, secondColor, thirdColor, fourthColor } = ColorList();

const Container = styled.form`
  display: flex;
  outline: none;
  flex-direction: column;
  width: 480px;
  /* height: 736px; */
  box-sizing: border-box;
  position: absolute;
  color: ${secondColor};
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  border-radius: 8px;
  border: 2px solid ${secondColor};
  box-shadow: 12px 12px 0 -2px ${mainColor}, 12px 12px ${secondColor};
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Header = styled.header`
  width: 100%;
  min-height: 52px;
  display: flex;
  align-items: center;
  padding-right: 14px;
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid ${thirdColor};
  position: sticky;
  background: rgba(255, 255, 255, 0.808);
  top: 0px;
  z-index: 10;
`;

const WeatherInfoBox = styled.div`
  div {
    display: flex;
    align-items: center;
    justify-content: center;
    letter-spacing: -0.8px;
  }
  font-size: 16px;
  font-weight: bold;

  user-select: none;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ImageWrapper = styled.div<{ length?: number }>`
  display: flex;
  width: 100%;
  gap: 12px;
  padding: 14px;
  align-items: center;
  /* justify-content: space-evenly; */
  overflow: hidden;
  position: relative;
  &::after {
    right: 0px;
    background: linear-gradient(to right, rgba(255, 255, 255, 0), #fff);
    position: absolute;
    top: 0px;
    z-index: 10;
    border-radius: 0 0 8px 0;
    height: 100%;
    width: 20px;
    content: "";
  }
`;

const InputImageLabel = styled.label`
  cursor: pointer;
  flex: 1;
`;

const ImageBox = styled.div<{ length?: number }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border-radius: 6px;
  border: 1px solid ${fourthColor};
  overflow: hidden;
  background: #fff;
  &:hover,
  &:active {
    background: #f1f1f1;
  }
  transition: all 0.2s;
`;

const EmojiBox = styled.div`
  width: 36px;
  height: 36px;
  position: relative;
`;

const EmojiIcon = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  cursor: pointer;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const InputImage = styled.input`
  display: none;
  opacity: 0;
`;

const ImageLength = styled.p`
  font-size: 14px;
`;

const ImageLengthColor = styled.span`
  color: ${mainColor};
`;

const ImageContainerBox = styled.div`
  display: flex;
  user-select: none;
  flex: nowrap;
  gap: 12px;
`;

const ImageContainer = styled.div`
  font-size: 12px;
  display: flex;
  flex: 0 0 auto;
`;

const ImageWrap = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  display: flex;
  flex: 0 0 auto;
`;

const CropBtn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  user-select: none;
  /* cursor: pointer; */
  bottom: 0px;
  /* border-radius: 9999px; */
  width: 100%;
  font-size: 16px;
  background: rgba(72, 163, 255, 0.7);
  color: #fff;
  transition: all 0.2s;
  z-index: 99;
`;

const ImageRemove = styled.div`
  align-items: center;
  background-color: ${secondColor};
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex;
  font-size: 16px;
  justify-content: center;
  position: absolute;
  right: 4px;
  top: 4px;
  padding: 2px;
  z-index: 10;
`;

const Images = styled.img`
  object-fit: cover;
  display: block;
  width: 100%;
  height: 100%;
  user-select: none;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  -webkit-user-drag: none;
  cursor: pointer;
`;

const DateBox = styled.div`
  svg {
    margin-right: 2px;
    font-size: 14px;
    color: ${secondColor};
  }
`;

const NextBtn = styled.button`
  user-select: none;
  padding: 8px 10px;
  margin-left: auto;
  border-radius: 9999px;
  border: 1px solid ${mainColor};
  color: ${mainColor};
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;

  &:not(:disabled) {
    &:hover {
      background: ${mainColor};
      color: #fff;
      border: 1px solid ${mainColor};
    }
  }

  &:disabled {
    color: ${thirdColor};
    cursor: default;
    border: 1px solid ${thirdColor};
  }
`;

const EditBtn = styled.button`
  user-select: none;
  padding: 8px 10px;
  margin-left: auto;
  border: 1px solid ${mainColor};
  color: ${mainColor};
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;

  &:not(:disabled) {
    :hover {
      background: ${mainColor};
      color: #fff;
      border: 1px solid ${mainColor};
    }
  }

  &:disabled {
    color: ${thirdColor};
    cursor: default;
    border: 1px solid ${thirdColor};
  }
`;

const EditText = styled.p`
  font-family: "GmarketSans", Apple SD Gothic Neo, Malgun Gothic, sans-serif !important;
  margin-bottom: -4px;
`;

const IconBox = styled.div`
  width: 48px;
  height: 48px;
  /* position: absolute; */
  /* right: 0; */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover,
  &:active {
    color: ${mainColor};
  }

  svg {
    font-size: 24px;
  }
`;

const WeatherIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  margin: 0 -14px 0 -10px;
  img {
    display: block;
    width: 100%;
  }
`;

const WeatherCategorySub = styled.span`
  user-select: text;

  font-size: 14px;
  svg {
    font-size: 20px;
  }
  span {
    font-size: 12px;
  }
`;
