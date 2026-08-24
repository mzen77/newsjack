import { redirect } from "next/navigation";

import { currentUser } from "../../lib/auth";

export default async function AppHome() {
  redirect((await currentUser()) ? "/app/dashboard" : "/app/sign-in");
}
