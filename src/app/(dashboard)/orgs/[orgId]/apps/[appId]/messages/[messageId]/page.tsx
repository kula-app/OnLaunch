import Routes from "@/routes/routes";
import prisma from "@/services/db";
import { authOptions } from "@/util/auth-options";
import type { NextPage } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UI } from "./ui";

export async function generateMetadata({
  params: { orgId, appId, messageId },
}: {
  params: {
    orgId: string;
    appId: string;
    messageId: string;
  };
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      title: "Message",
    };
  }

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

const Page: NextPage<{
  params: {
    orgId: string;
    appId: string;
    messageId: string;
  };
}> = async ({ params: { orgId, appId, messageId } }) => {
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
