import Routes from "@/routes/routes";
import { authOptions } from "@/util/auth-options";
import type { NextPage } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UI } from "./ui";

export const metadata = {
  title: "Join Organization",
};

const Page: NextPage<{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}> = async ({ searchParams }) => {
  const session = await getServerSession(authOptions);
  const directInviteToken = (await searchParams)[
    "direct-invite-token"
  ] as string;
  const inviteToken = (await searchParams)["invite-token"] as string;

  if (!session) {
    return redirect(
      Routes.login({
        redirect: Routes.orgJoin({
          directInviteToken: directInviteToken,
          inviteToken: inviteToken,
        }),
      }),
    );
  }

  return <UI directInviteToken={directInviteToken} inviteToken={inviteToken} />;
};

export default Page;
