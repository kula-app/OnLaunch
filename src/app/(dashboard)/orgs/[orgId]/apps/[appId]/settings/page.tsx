import Routes from "@/routes/routes";
import prisma from "@/services/db";
import { authOptions } from "@/util/auth-options";
import type { NextPage } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UI } from "./ui";

export async function generateMetadata({
  params: { orgId, appId },
}: {
  params: {
    orgId: string;
    appId: string;
  };
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      title: "App Settings",
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
          },
        },
      },
    },
  });
  if (!user?.org.apps?.[0].name) {
    return {
      title: "App Settings",
    };
  }

  return {
    title: `App Settings - ${user.org.apps[0].name}`,
  };
}

const page: NextPage<{
  params: {
    orgId: string;
    appId: string;
  };
}> = async ({ params }) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    return redirect(
      Routes.login({
        redirect: Routes.appSettings({
          orgId: +params.orgId,
          appId: +params.appId,
        }),
      }),
    );
  }

  return <UI orgId={+params.orgId} appId={+params.appId} />;
};

export default page;
