"use client";

import Routes from "@/routes/routes";
import { signOut } from "next-auth/react";
import React from "react";

export const UI: React.FC = () => {
  signOut({
    callbackUrl: Routes.LOGIN,
  });

  return null;
};
