import { Controller, useForm } from "react-hook-form";
import React, { createRef, useEffect, useState } from "react";
import { API, graphqlOperation } from "aws-amplify";
import {
  FormErrorMessage,
  FormControl,
  Input,
  Button,
  Flex,
  useToast,
  Image,
  Spacer,
  Progress,
  Container,
  IconButton,
  Center,
  Icon,
} from "@chakra-ui/react";
import { toastPosition } from "../../config/constants";
import isEmpty from "lodash/isEmpty";
import { RichTextEditor } from "../texteditor/RichtextEditor";
import { useRouter } from "next/router";
import { BsLock } from "react-icons/bs";
import { useMutation } from "@tanstack/react-query";
import { POSTS_NEW_ROUTE } from "../../pages/posts/new";
import { createEntry, createPost } from "../../graphql/mutations";
import Calendar from "./Calendar";
import ImageManager from "../ImageManager";
import { Image as TImage } from "../../API";

const formSteps = ["mood", "content"];

export type ICreatePostInput = {
  images?: TImage[];
  content: any;
};

/**
 * Renders an Add Post form
 * @return {ReactElement}
 */
export default function AddPost() {
  // Hooks
  const router = useRouter();
  const toast = useToast();
  const uploadInputRef = createRef<HTMLInputElement>();

  const [cover, setCover] = useState<string | ArrayBuffer | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | ArrayBuffer | null>(null);

  const activeStep = router.query["step"] ? parseInt(router.query["step"] as string) : 1;
  const isLastStep = activeStep === formSteps.length;

  const {
    handleSubmit,
    getValues,
    register,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<ICreatePostInput>();

  const images = watch("images");
  const content = watch("content");

  const { mutate, isLoading } = useMutation(
    (data: ICreatePostInput) => {
      return API.graphql<any>(
        graphqlOperation(createPost, {
          input: {
            content: JSON.stringify(data.content),
          },
        })
      );
    },
    {
      onError: () =>
        toast({
          title: "Failure",
          description: "Error",
          status: "error",
          duration: 9000,
          isClosable: true,
          position: toastPosition,
        }),

      onSuccess: () =>
        toast({
          title: "Success",
          description: "Post was created.",
          status: "success",
          duration: 9000,
          isClosable: true,
          position: toastPosition,
        }),
    }
  );

  // Get draft-post from localstorage und reset post form
  useEffect(() => {
    const storedData = localStorage.getItem("draft-post");
    if (!storedData) return;
    reset(JSON.parse(storedData));
  }, []);

  /**
   * Create post with data
   * @param {ICreatePostInput} data
   */
  async function handleFurther(data: ICreatePostInput): Promise<void> {
    if (isLastStep) {
      const postData: any = {
        images: data.images,
        content: data.content,
      };
      mutate(data);
    } else {
      router.push(`${POSTS_NEW_ROUTE}?step=${activeStep + 1}`);
    }
  }

  const onClickUploadFile = () => {
    uploadInputRef.current?.click();
  };

  const handleBack = () => {
    router.push(`${POSTS_NEW_ROUTE}?step=${activeStep - 1}`);
  };

  return (
    <>
      <Progress
        value={(activeStep / (formSteps.length + 1)) * 100}
        colorScheme="teal"
        height={"1"}
      />
      <Container maxW={"container.sm"} py={"10"} minH={"100vh"}>
        <Center>
          <Icon as={BsLock} h={"10"} w={"10"} color={"gray.300"} />
        </Center>
        <form onSubmit={handleSubmit(handleFurther)} noValidate>
          <FormControl isInvalid={Boolean(errors.images)} isRequired>
            <ImageManager
              {...register("images")}
              images={getValues("images") ?? []}
              // onChange={(files: CreateImageInput[]) => {
              //   setValue(name, files);
              // }}
            />
            <FormErrorMessage>{errors.images && errors.images.message}</FormErrorMessage>
          </FormControl>

          <FormControl mt={"10"} isInvalid={Boolean(errors.content)} isRequired>
            <Controller
              control={control}
              rules={{
                required: "This is required",
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <RichTextEditor value={value} onChange={onChange} />
              )}
              name="content"
            />
          </FormControl>

          <Flex justifyContent={"end"}>
            <Button
              mt={4}
              variant={"solid"}
              colorScheme={"teal"}
              size={"xl"}
              isLoading={isLoading}
              type="submit"
            >
              Publish
            </Button>
          </Flex>
        </form>
      </Container>
    </>
  );
}
