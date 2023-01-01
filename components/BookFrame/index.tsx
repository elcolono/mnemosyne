import React, { forwardRef, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { Box, Button, IconButton, Textarea } from "@chakra-ui/react";
import { map } from "lodash";
import { Post } from "../../API";
import PageItem from "./PageItem";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

type PageCoverProps = {
  children: React.ReactNode;
  pos: string;
};

const PageCover = forwardRef<HTMLDivElement, PageCoverProps>(
  ({ children, pos }: PageCoverProps, ref) => {
    return (
      <div className={"page page-cover page-cover-" + pos} ref={ref} data-density="hard">
        <div className="page-content">
          <h2>{children}</h2>
        </div>
      </div>
    );
  }
);

type PageProps = {
  children: React.ReactNode;
};

const Page = forwardRef<HTMLDivElement, PageProps>(({ children }: PageProps, ref) => {
  return (
    <Box paddingY={5} className="page" ref={ref} data-density={"soft"}>
      <div className="page-content">
        <div className="page-text">{children}</div>
      </div>
    </Box>
  );
});

type BookFrameProps = {
  posts: Post[];
};

export default function BookFrame({ posts }: BookFrameProps) {
  let flipBook = useRef() as any;
  const [startPage, setStartPage] = useState(3);

  const handlePreviousClick = () => {
    flipBook.pageFlip().flipPrev();
  };

  const handleNextClick = () => {
    flipBook.pageFlip().flipNext();
  };

  const turnToPage = () => {
    flipBook.pageFlip().flip(4);
  };

  return (
    <div>
      <div className="container-md" style={{ position: "relative" }}>
        <Button onClick={() => turnToPage()}>Today</Button>
        <IconButton
          icon={<ChevronLeftIcon />}
          onClick={handlePreviousClick}
          aria-label={"Previous post"}
        />
        <IconButton
          icon={<ChevronRightIcon />}
          onClick={handleNextClick}
          aria-label={"Next post"}
        />
        <HTMLFlipBook
          drawShadow={true}
          startPage={startPage}
          onFlip={(data) => console.log("flipped", data)}
          disableFlipByClick={false}
          width={550}
          height={733}
          size="stretch"
          minWidth={315}
          maxWidth={2000}
          minHeight={100}
          maxHeight={2533}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          className="flip-book html-book demo-book"
          style={{ backgroundImage: "url(images/background.jpg)" }}
          ref={(el) => (flipBook = el)}
        >
          <PageCover key={101} pos="bottom">
            One line by day
          </PageCover>
          {map(posts, (post) => (
            <Page key={post.id}>
              <PageItem post={post} />
            </Page>
          ))}
        </HTMLFlipBook>
      </div>
    </div>
  );
}
