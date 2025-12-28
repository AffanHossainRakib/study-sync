import { NextResponse } from "next/server";

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("auth-token");

  const authPages = ["/login", "/register", "/ForgetPassword"];

  if (authToken?.value && authPages.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/ForgetPassword"],
};
