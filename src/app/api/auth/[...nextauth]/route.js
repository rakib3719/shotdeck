import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET || 'aidfjnvociydfnovfadf',

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
 
        token: { type: "text" },
        role: { type: "text" },
        id: { type: "text" },
      },
      async authorize(credentials) {
      

     
        return {
 
   
          token: credentials.token,
          role: credentials.role,
          id: credentials.id
        };
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = {
     
          token: user.token,
          role: user.role,
          id: user.id,
        };
      }
      return token;
    },

    async session({ session, token }) {
      if (token.user) {
        session.user = token.user;
      }
      return session;
    }
  },

  pages: {
    signIn: '/sign-in',
    error: '/sign-in?error='
  },

  debug: process.env.NODE_ENV === 'development'
});

export { handler as GET, handler as POST };