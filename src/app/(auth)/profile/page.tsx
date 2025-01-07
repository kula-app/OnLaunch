import Routes from "@/routes/routes";
import { authOptions } from "@/util/auth-options";
import type { NextPage } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UI } from "./ui";

export const metadata = {
  title: "Profile",
};

const Page: NextPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return redirect(
      Routes.login({
        redirect: Routes.profile,
      }),
    );
  }

  return <UI />;
};

export default Page;
