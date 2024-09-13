import Routes from "@/routes/routes";
import { authOptions } from "@/util/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard",
};

export default async function Page(context: any) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(
      Routes.login({
        redirect: Routes.dashboard,
      }),
    );
  } else {
    redirect(Routes.orgs);
  }
}
