import {
  Box,
  Center,
  useColorModeValue,
  IconButton,
  Text,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
import { DeletePostInput, Post } from "../../API";
import { DeleteIcon } from "@chakra-ui/icons";
import { BiPencil } from "react-icons/bi";
import { useRouter } from "next/router";
import DynamicImage from "../DynamicImage";
import { first } from "lodash";
import { Editable, Slate, withReact } from "slate-react";
import { useCallback, useMemo } from "react";
import { createEditor } from "slate";
import { Element } from "../texteditor/Element";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { deletePost } from "../../graphql/mutations";
import { GRAPHQL_AUTH_MODE } from "@aws-amplify/api";
import { toastPosition } from "../../config/constants";
import ConfirmationModal from "../ConfirmationModal";

const deleteMutation = async (id: string) => {
  const input: DeletePostInput = {
    id: id,
  };
  await API.graphql({
    query: deletePost,
    authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
    variables: {
      input: input,
    },
  });
};

type PostItemProps = {
  post: Post;
};

export default function PostItem({ post }: PostItemProps) {
  const renderElement = useCallback((props: any) => <Element {...props} />, []);
  const toast = useToast();
  const editor = useMemo(() => withReact(createEditor()), []);
  const queryClient = useQueryClient();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { mutate: deletePost, isLoading } = useMutation(deleteMutation, {
    onError: () =>
      toast({
        title: "Failure",
        description: "Error",
        status: "error",
        duration: 9000,
        isClosable: true,
        position: toastPosition,
      }),

    onSuccess: (data) => {
      queryClient.refetchQueries(["posts"]);
      return toast({
        title: "Success",
        description: "Post was deleted.",
        status: "success",
        duration: 9000,
        isClosable: true,
        position: toastPosition,
      });
    },
  });

  const router = useRouter();
  const params = router.query;
  const bigImage = first(post.images?.items);

  function handlePostEdit() {
    router.push({ pathname: "posts", query: { postEditId: post.id, ...params } });
  }

  function handlePostDelete() {
    deletePost(post.id);
  }

  return (
    <Center py={6}>
      <Box
        borderWidth="1px"
        height={"400px"}
        maxW={"445px"}
        w={"full"}
        bg={useColorModeValue("white", "gray.900")}
        rounded={"md"}
        p={6}
        overflow={"hidden"}
      >
        <Box h={"210px"} bg={"gray.100"} mt={-6} mx={-6} mb={6} pos={"relative"}>
          {bigImage && <DynamicImage imageKey={bigImage?.fullSize.key as string} />}
          <Box position={"absolute"} right={0} p={2}>
            <IconButton
              icon={<DeleteIcon />}
              aria-label={"Delete post"}
              mr={1}
              onClick={onOpen}
              isLoading={isLoading}
            />
            <IconButton icon={<BiPencil />} aria-label={"Edit post"} onClick={handlePostEdit} />
          </Box>
        </Box>
        {JSON.stringify(post?.content)}
      </Box>
      <ConfirmationModal
        title="Delete Post"
        text="Do you really want to delete this post permanently?"
        isOpen={isOpen}
        isLoading={isLoading}
        onOpen={onOpen}
        onClose={onClose}
        onConfirm={handlePostDelete}
      />
    </Center>
  );
}
