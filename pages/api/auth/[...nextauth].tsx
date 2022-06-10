import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"
import SpotifyApi, { LOGIN_URL } from "../../../lib/spotify"

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    SpotifyProvider({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID || "",
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET || "",
      authorization: LOGIN_URL
    }),
    // ...add more providers here
  ],
  secret: process.env.JWT_SECRET,
  pages: {
      signIn: '/login'
  },
  callbacks: {
      async jwt({ token, account, user }) {
        // initial sign in
        if (account && user) {
            return { 
                ...token,
                accessToken: account.access_token,
                refreshToken: account.refresh_token,
                username: account.providerAccountId,
                accessTokenExpiresAt: (account.expires_at || 10) * 1000,
             }
        }
        
        // return previous token if the access token is still valid
        if (Date.now() < (token.accessTokenExpires as any)) {
            return token
        }

        // access token has expired, so refresh it
        return await refreshAccessToken(token)
      },
      async session({ session, token }) {
          const user = session.user as any;
          user.accessToken = token.accessToken;
          user.refreshToken = token.refreshToken;
          user.username = token.username;

          return session;
      }
  }
})

const refreshAccessToken = async (token: any) => {
    try {
        SpotifyApi.setAccessToken(token.accessToken);
        SpotifyApi.setRefreshToken(token.refreshToken);

        const { body: refreshedToken } = await SpotifyApi.refreshAccessToken();
        return {
            ...token,
            accessToken: refreshedToken.access_token,
            refreshToken: refreshedToken.refresh_token ?? token.refreshToken,
            accessTokenExpires: Date.now() + refreshedToken.expires_in * 1000,
        }
    }catch(e) {
        console.error(e)

        return {
            ...token,
            error: "Refresh failed"
        }
    }
}