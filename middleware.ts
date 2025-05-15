import { NextResponse } from "next/server";

export function middleware(req: Request) {
  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", "http://10.0.38.43");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  return response;
}
