import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          console.log("Auth attempt for email:", credentials?.email);
          
          if (!credentials?.email || !credentials?.password) {
            console.error("Missing credentials");
            return null;
          }

          // Connect to MongoDB directly
          console.log("Connecting to database...");
          const db = await connectToDatabase();
          console.log("Connected to database");
          
          // Get users collection
          const usersCollection = db.collection("users");
          
          // Find user by email
          const user = await usersCollection.findOne({ email: credentials.email });
          
          if (!user) {
            console.error("User not found:", credentials.email);
            return null;
          }
          
          console.log("User found:", user.email, "Role:", user.role);
          
          // Compare password using bcrypt
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            console.error("Invalid password for user:", credentials.email);
            return null;
          }
          
          console.log("Authentication successful for:", credentials.email);
          
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
}; 