"use client";

import { usePathname } from "next/navigation";
import Commitments from "./Commitments";

export default function CommitmentsOnOtherPages() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return <Commitments />;
}
