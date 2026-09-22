import { env } from "../configs/env.js";

/*
|--------------------------------------------------------------------------
| Shared admin cookie options
|--------------------------------------------------------------------------
| Login and logout must use the same path, domain, secure and sameSite values.
|--------------------------------------------------------------------------
*/

const getSharedAdminCookieOptions = () => {
  const options = {
    httpOnly: true,

    secure: env.isProduction,

    sameSite: env.adminCookieSameSite,

    path: "/",

    priority: "high",
  };

  /*
  |--------------------------------------------------------------------------
  | Only set domain when explicitly configured.
  |--------------------------------------------------------------------------
  | Do not set a domain for localhost development.
  |--------------------------------------------------------------------------
  */

  if (env.adminCookieDomain) {
    options.domain = env.adminCookieDomain;
  }

  return options;
};

/*
|--------------------------------------------------------------------------
| Set admin authentication cookie
|--------------------------------------------------------------------------
*/

export const getAdminCookieOptions = () => {
  return {
    ...getSharedAdminCookieOptions(),

    maxAge: env.jwtCookieExpire * 24 * 60 * 60 * 1000,
  };
};

/*
|--------------------------------------------------------------------------
| Clear admin authentication cookie
|--------------------------------------------------------------------------
*/

export const getAdminClearCookieOptions = () => {
  return getSharedAdminCookieOptions();
};
