import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const JWT_ALGORITHM = "HS256";

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
  });

  return payload;
}
