"use client";
import React from "react";
import { Button } from "./ui/button";
import { RainbowButton } from "./ui/rainbow-button";
import { signIn } from "next-auth/react";

type Props = {};

const SignInButton = (props: Props) => {
  return (
    <RainbowButton
      className="rounded-3xl dark:text-white"
      onClick={() => {
        signIn("google");
      }}
    >
      Sign In
    </RainbowButton>
  );
};

export default SignInButton;