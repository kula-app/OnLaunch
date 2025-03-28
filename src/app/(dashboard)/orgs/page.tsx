import { Routes } from "@/routes/routes";
import { authOptions } from "@/util/auth-options";
import type { Metadata, NextPage } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UI } from "./ui";

type Props = {};

export const metadata: Metadata = {
  title: "Organizations",
};

const Page: NextPage<Props> = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return redirect(
      Routes.login({
        redirect: Routes.organizations,
      }),
    );
  }

  return <UI />;
};

export default Page;
