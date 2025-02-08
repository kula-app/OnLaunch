import Routes from "@/routes/routes";
import { authOptions } from "@/util/auth-options";
import type { Metadata, NextPage } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UI } from "./ui";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: "Join Organization",
};

const Page: NextPage<Props> = async ({ searchParams }) => {
  const directInviteToken = (await searchParams)[
    "direct-invite-token"
  ] as string;
  const inviteToken = (await searchParams)["invite-token"] as string;

  const session = await getServerSession(authOptions);
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
