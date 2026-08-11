import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const JWT_ALGORITHM = "HS256";
const JWT_ISSUER = "task-management-api";
const JWT_AUDIENCE = "task-management-client";

function createSecretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function generateAccessToken(
  userId: string,
  secret: string,
  expiresIn: string,
): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({
      alg: JWT_ALGORITHM,
    })
    .setSubject(userId)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(createSecretKey(secret));
}

export async function verifyAccessToken(
  token: string,
  secret: string,
): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, createSecretKey(secret), {
    algorithms: [JWT_ALGORITHM],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });

  return payload;
}
