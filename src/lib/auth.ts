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
    async signIn({ user, account, profile }) {
      try {
        console.log('🔐 NextAuth SignIn Callback');
        console.log('👤 User:', user);
        console.log('🔑 Account:', account);
        console.log('📋 Profile:', profile);

        if (!user.email) {
          console.error('❌ No email found in user object');
          return false;
        }

        const supabase = supabaseServer();

        // Cek apakah user sudah ada
        console.log('🔍 Checking if user exists:', user.email);
        
        const { data: existingUser, error: checkError } = await supabase
          .from("users")
          .select("*")
          .eq("email", user.email)
          .maybeSingle();

        console.log('✅ Existing User:', existingUser);
        console.log('⚠️ Check Error:', checkError);

        // Jika belum ada → insert
        if (!existingUser) {
          console.log('➕ User not found, creating new user...');
          
          const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert([
              {
                username: user.name || user.email.split('@')[0],
                email: user.email,
              },
            ])
            .select()
            .single();

          console.log('✅ New User Created:', newUser);
          console.log('⚠️ Insert Error:', insertError);

          if (insertError) {
            console.error('❌ Failed to create user:', insertError);
            // Still allow login even if insert fails
            // return false; // Uncomment to block login on error
          }
        } else {
          console.log('✅ User already exists, skipping insert');
        }

        console.log('✅ SignIn callback completed successfully');
        return true;

      } catch (error) {
        console.error('❌ Error in signIn callback:', error);
        // Allow login even if there's an error (optional)
        return true; // Change to false to block login on error
      }
    },

    async jwt({ token, user, account }) {
      console.log('🔐 JWT Callback');
      console.log('🎫 Token:', token);
      
      // token.sub = ID Google
      token.id = token.sub;
      
      // Add email to token
      if (user?.email) {
        token.email = user.email;
      }
      
      console.log('✅ JWT Token Updated:', token);
      return token;
    },

    async session({ session, token }) {
      console.log('🔐 Session Callback');
      console.log('📋 Session:', session);
      console.log('🎫 Token:', token);
      
      // Add user ID to session
      if (token.id) {
        session.user.id = token.id as string;
      }
      
      // Ensure email is in session
      if (token.email) {
        session.user.email = token.email as string;
      }
      
      console.log('✅ Session Updated:', session);
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  
  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',
};
