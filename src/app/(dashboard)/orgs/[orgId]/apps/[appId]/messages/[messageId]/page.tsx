import Routes from "@/routes/routes";
import prisma from "@/services/db";
import { authOptions } from "@/util/auth-options";
import type { Metadata, NextPage } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UI } from "./ui";

type Props = {
  params: Promise<{
    orgId: string;
    appId: string;
    messageId: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      title: "Message",
    };
  }
  const { orgId, appId, messageId } = await params;

  const user = await prisma.usersInOrganisations.findUnique({
    where: {
      orgId_userId: {
        orgId: +orgId,
        userId: +session.user.id,
      },
    },
    include: {
      org: {
        include: {
          apps: {
            where: {
              id: +appId,
            },
            include: {
              messages: {
                where: {
                  id: +messageId,
                },
              },
            },
          },
        },
      },
    },
  });
  if (!user?.org?.apps?.[0]?.messages?.[0]?.title) {
    return {
      title: "Message",
    };
  }

  return {
    title: `Message '${user.org.apps[0].messages[0].title}'`,
  };
}

const Page: NextPage<Props> = async ({ params }) => {
  const { orgId, appId, messageId } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return redirect(
      Routes.login({
        redirect: Routes.message({
          orgId: +orgId,
          appId: +appId,
          messageId: +messageId,
        }),
      }),
    );
  }

  return <UI orgId={+orgId} appId={+appId} messageId={+messageId} />;
};

export default Page;
