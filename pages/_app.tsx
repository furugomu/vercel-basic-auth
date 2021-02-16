import App, { AppContext, AppProps } from "next/app";
import basicAuth from "basic-auth";
import { IncomingMessage } from "http";

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

if (process.env.VERCEL) {
  MyApp.getInitialProps = async (ctx: AppContext) => {
    const appProps = await App.getInitialProps(ctx);

    const { req, res } = ctx.ctx;
    if (!auth(req)) {
      res.statusCode = 401;
      res.setHeader("WWW-Authenticate", 'Basic realm="Access to staging site"');
      res.end();
      return;
    }
    return { ...appProps };
  };
}

const auth = (req: IncomingMessage) => {
  // 両方未設定なら通過
  if (!process.env.BASIC_AUTH_USER && !process.env.BASIC_AUTH_PASSWORD)
    return true;
  // 片方未設定はだめ
  if (!process.env.BASIC_AUTH_USER || !process.env.BASIC_AUTH_PASSWORD)
    return true;
  const user = basicAuth(req);
  if (!user) return false;
  const { name, pass } = user;
  if (name != process.env.BASIC_AUTH_USER) return false;
  if (pass != process.env.BASIC_AUTH_PASSWORD) return false;
  return true;
};
