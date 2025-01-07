import type { NextPage } from "next";
import { UI } from "./ui";

export const metadata = {
  title: "Change Email",
};

const Page: NextPage<{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}> = async ({ searchParams }) => {
  const token = (await searchParams)["token"] as string;

  return <UI token={token} />;
};

export default Page;
