"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const typeorm_1 = require("@nestjs/typeorm");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_service_1 = require("../services/auth.service");
const user_entity_1 = require("../models/user.entity");
const jwt_strategy_1 = require("../middleware/jwt.strategy");
const password_archive_entity_1 = require("../models/password-archive.entity");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const dotenv = require("dotenv");
const jwt_authorization_guard_1 = require("../guards/jwt-authorization.guard");
dotenv.config();
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, password_archive_entity_1.PasswordArchive]),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt',
                session: false }),
            jwt_1.JwtModule.register({
                global: true,
                secret: process.env.JWT_SECRET || 'your-secret-key',
                signOptions: {
                    expiresIn: '1h',
                    issuer: 'auth-service'
                },
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            jwt_strategy_1.JwtStrategy,
            jwt_auth_guard_1.JwtAuthGuard,
            jwt_authorization_guard_1.AuthorizationGuard,
        ],
        exports: [auth_service_1.AuthService, passport_1.PassportModule],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map