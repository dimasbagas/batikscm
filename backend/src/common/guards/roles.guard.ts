import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Role } from '@prisma/client'
import { ROLES_KEY } from '../decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredRoles) return true
    const { user } = context.switchToHttp().getRequest()
    console.log('--- RolesGuard Debug ---')
    console.log('requiredRoles:', requiredRoles)
    console.log('user:', user)
    console.log('user?.role:', user?.role)

    if (!user) {
      throw new ForbiddenException('Akses ditolak: User tidak terotentikasi di server')
    }

    const hasRole = user.role && requiredRoles.some(role => role.toLowerCase() === user.role.toLowerCase())
    console.log('hasRole:', hasRole)

    if (!hasRole) {
      throw new ForbiddenException(`Akses ditolak: Peran Anda (${user.role || 'Tanpa Peran'}) tidak diizinkan. Peran yang diperlukan: ${requiredRoles.join(', ')}`)
    }

    return true
  }
}
