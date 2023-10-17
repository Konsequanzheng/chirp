// import { withClerkMiddleware } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export default withClerkMiddleware(() => {
//   console.log("middleware running");
//   return NextResponse.next();
// });

// export const config = {
//   matcher: "/((?!_next/image|_next/static|favicon.ico).*)",
// };

import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware();

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

// export const config = {
//   matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
// };
