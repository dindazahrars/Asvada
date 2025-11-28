import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { supabaseServer } from "@/lib/supabase_server";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: "/",
  },

  callbacks: {
    async signIn({ user }) {
      const supabase = supabaseServer();

      // Cek apakah user sudah ada
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("email", user.email!)
        .maybeSingle();

      // Jika belum ada → insert
      if (!existingUser) {
        await supabase.from("users").insert([
          {
            username: user.name,
            email: user.email,
            // created_at: new Date(),
          },
        ]);
      }

      return true;
    },

    async jwt({ token }) {
      // token.sub = ID Google
      token.id = token.sub;
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
