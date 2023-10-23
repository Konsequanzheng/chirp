import Link from "next/link";
import { SignInButton, useUser } from "@clerk/nextjs";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();
  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput(""); // clear input
      void ctx.posts.getAll.invalidate(); // refresh posts
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later");
      }
    },
  });

  const [input, setInput] = useState("");

  console.log(user);

  if (!user) return null;

  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.profileImageUrl}
        alt="Profile image"
        className="rounded-full"
        width={56}
        height={56}
      />
      <input
        placeholder="Type some emojis!"
        className="grow bg-transparent outline-none"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
        disabled={isPosting}
      />

      {input !== "" && !isPosting && (
        <button onClick={() => mutate({ content: input })}>Post</button>
      )}
      {isPosting && (
        <div className="flex items-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
};

type PostWIthUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWIthUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        src={author.profileImageUrl}
        alt={`@${author.username}'s profile picture`}
        className="rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{` · ${dayjs(
              post.createdAt,
            ).fromNow()}`}</span>
          </Link>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  );
};

const Feed = () => {
  // data is already started fetching in Home() -> once it's done fetching the cached data will appear here
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {data?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // start fetching posts ASAP
  // const { data } = api.posts.getAll.useQuery();

  // Return empty div if user isn't loaded yet
  if (!userLoaded) return <div />;

  return (
    <main className="flex h-screen justify-center">
      {/* md: makes it so that stylings only apply once size is medium or larger */}
      <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
        <div className="border-b border-slate-400 p-4">
          {/* if there is no user, show the sign in button */}
          {!isSignedIn && (
            <div className="flex justify-center">
              <SignInButton />
            </div>
          )}
          {/* if there is a user, show the sign out button */}
          {/* {user.isSignedIn && <SignOutButton />} */}
          {isSignedIn && <CreatePostWizard />}
        </div>

        <Feed />
      </div>
    </main>
  );
}
