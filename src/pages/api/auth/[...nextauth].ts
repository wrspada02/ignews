import { query as q } from 'faunadb';

import NextAuth, { Awaitable, Session } from "next-auth";
import GithubProvider from "next-auth/providers/github";

import { fauna } from "../../../services/fauna";

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      type: 'oauth',
      authorization: {
        url: 'https://github.com/login/oauth/authorize',
        params: { scope: 'read:user user:email' },
      },
    }),
  ],
  pages: {
    signIn: '/api/auth/signin',
    signOut: '/api/auth/signout'
  },
  callbacks: {
    async session(sessionT) : Promise<Session> {
      try {
        const userActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index("subscription_by_user_ref"),
                q.Select(
                  "ref",
                  q.Get(
                    q.Match(
                      q.Index("user_by_email"),
                      q.Casefold(sessionT.session.user?.email as string)
                    )
                  )
                )
              ),
              q.Match(q.Index("subscription_by_status"), "active"),
            ])
          )
        );
        const {session } = sessionT;
        return {
          ...session,
          activeSubscription: userActiveSubscription,
        };
      } catch (error) {
        const {session } = sessionT;

        return {
          ...session,
          activeSubscription: null,
        };
      }
    },
    async signIn(user) {
      const { user: userInfor } = user;

      try {
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(
                  q.Index("user_by_email"),
                  q.Casefold(userInfor.email as string)
                )
              )
            ),
            q.Create(q.Collection("users"), {
              data: { email: userInfor.email },
            }),
            q.Get(
              q.Match(
                q.Index("user_by_email"),
                q.Casefold(userInfor.email as string)
              )
            )
          )
        );
        return true;
      } catch {
        return false;
      }
    },
  },
});