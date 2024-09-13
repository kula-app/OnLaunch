import Routes from "@/routes/routes";
import { authOptions } from "@/util/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Organization",
};

export default async function Page({ params }: { params: { orgId: number } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(
      Routes.login({
        redirect: Routes.org(params.orgId),
      }),
    );
  } else {
    redirect(Routes.getOrgAppsByOrgId(params.orgId));
  }
}
