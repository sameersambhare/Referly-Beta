import NextAuth from 'next-auth';
import { authOptions } from '../options';

// This is important to fix the callback issue
const handler = NextAuth({
  ...authOptions,
  callbacks: {
    ...authOptions.callbacks,
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  }
});

export { handler as GET, handler as POST }; 