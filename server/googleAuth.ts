import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Express } from "express";
import { storage } from "./storage";

export async function setupGoogleAuth(app: Express) {
  // Only setup Google auth if credentials are provided
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log("Google OAuth credentials not provided. Skipping Google authentication setup.");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract user information from Google profile
          const googleUser = {
            id: profile.id,
            email: profile.emails?.[0]?.value || "",
            firstName: profile.name?.givenName || "",
            lastName: profile.name?.familyName || "",
            profileImageUrl: profile.photos?.[0]?.value || "",
          };

          // Check if user already exists
          let user = await storage.getUser(googleUser.id);
          
          if (!user) {
            // Create new user with Google data
            user = await storage.upsertUser({
              id: googleUser.id,
              email: googleUser.email,
              firstName: googleUser.firstName,
              lastName: googleUser.lastName,
              profileImageUrl: googleUser.profileImageUrl,
              role: "student", // Default role for Google sign-ups
              subscriptionPlan: "free", // Default to free plan
            });
          }

          return done(null, user);
        } catch (error) {
          console.error("Error in Google OAuth strategy:", error);
          return done(error, null);
        }
      }
    )
  );

  // Google OAuth routes
  app.get(
    "/api/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/?error=auth_failed",
    }),
    (req, res) => {
      // Successful authentication, redirect to dashboard
      res.redirect("/");
    }
  );

  console.log("✅ Google OAuth authentication setup completed");
}