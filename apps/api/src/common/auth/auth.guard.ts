import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

const client = jwksClient({
  jwksUri: `https://${process.env.CLERK_ISSUER || 'clerk.procura.ai'}/.well-known/jwks.json`,
  cache: true,
  cacheMaxEntries: 10,
  cacheMaxAge: 86400000,
});

function getKey(header: any, callback: (err: Error | null, key?: string) => void) {
  client.getSigningKey(header.kid, (err: Error | null, key: any) => {
    if (err) return callback(err);
    const signingKey = key?.getPublicKey();
    callback(null, signingKey as string);
  });
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      const internalToken = request.headers['x-internal-token'];
      if (internalToken && internalToken === process.env.INTERNAL_API_TOKEN) {
        request.user = { id: 'system', organizationId: request.headers['x-organization-id'] || 'system' };
        return true;
      }
      throw new UnauthorizedException('Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = await new Promise<any>((resolve, reject) => {
        jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
          if (err) return reject(err);
          resolve(decoded);
        });
      });

      request.user = {
        id: decoded.sub || decoded.user_id,
        clerkId: decoded.sub,
        organizationId: decoded.org_id || decoded.organization_id,
        role: decoded.role,
      };
      return true;
    } catch (err) {
      this.logger.warn(`JWT verification failed: ${err instanceof Error ? err.message : err}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
