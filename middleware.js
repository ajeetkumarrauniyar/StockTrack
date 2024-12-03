import { authMiddleware, clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { isAllowedEmail } from "./clerk";

export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up"],

  async afterAuth(auth, req) {
    // Redirect unauthenticated users from protected routes
    if (!auth.userId && !auth.isPublicRoute) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    if (auth.userId) {
      try {
        const user = await clerkClient.users.getUser(auth.userId);
        const email = user.emailAddresses[0]?.emailAddress;

        // Determine role based on allowed emails
        const role = isAllowedEmail(email) ? "admin" : "viewer";

        // Update user metadata with role
        await clerkClient.users.updateUserMetadata(auth.userId, {
          publicMetadata: {
            role: role,
            ...user.publicMetadata,
          },
        });
      } catch (error) {
        console.error("Middleware - Error updating user metadata:", error);
      }
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
