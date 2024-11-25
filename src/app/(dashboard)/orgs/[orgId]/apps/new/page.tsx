import Routes from "@/routes/routes";
import { authOptions } from "@/util/auth-options";
import type { NextPage } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UI } from "./ui";

export const metadata = {
  title: "New App",
};

const Page: NextPage<{
  params: {
    orgId: string;
  };
}> = async ({ params: { orgId } }) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return redirect(
      Routes.login({
        redirect: Routes.createApp({ orgId: +orgId }),
      }),
    );
  }

  return <UI orgId={+orgId} />;
};

export default Page;
