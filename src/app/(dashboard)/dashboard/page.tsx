import { Routes } from "@/routes/routes";
import { authOptions } from "@/util/auth-options";
import type { Metadata, NextPage } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

type Props = {};

export const metadata: Metadata = {
  title: "Dashboard",
};

const Page: NextPage<Props> = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return redirect(
      Routes.login({
        redirect: Routes.dashboard,
      }),
    );
  }

  return redirect(Routes.organizations);
};

export default Page;
