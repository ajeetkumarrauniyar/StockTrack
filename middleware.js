import { authMiddleware, clerkClient } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { isAllowedEmail } from "./clerk";

export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up"],

  async afterAuth(auth, req) {
    console.log("Middleware - Auth User ID:", auth.userId);

    // Redirect unauthenticated users from protected routes
    if (!auth.userId && !auth.isPublicRoute) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    if (auth.userId) {
      try {
        const user = await clerkClient.users.getUser(auth.userId);
        const email = user.emailAddresses[0]?.emailAddress;

        console.log("Middleware - User Email:", email);
        console.log("Middleware - Is Allowed Email:", isAllowedEmail(email));

        // Determine role based on allowed emails
        const role = isAllowedEmail(email) ? "admin" : "viewer";

        console.log("Middleware - Assigned Role:", role);

        // Update user metadata with role
        await clerkClient.users.updateUserMetadata(auth.userId, {
          publicMetadata: {
            role: role,
            ...user.publicMetadata,
          },
        });

        // Log the updated user to verify
        const updatedUser = await clerkClient.users.getUser(auth.userId);
        console.log(
          "Middleware - Updated User Metadata:",
          updatedUser.publicMetadata
        );
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
