"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const email_module_1 = require("./email/email.module");
const auth_module_1 = require("./modules/auth.module");
const contact_module_1 = require("./modules/contact.module");
const core_1 = require("@nestjs/core");
const roles_module_1 = require("./modules/roles.module");
const roles_service_1 = require("./services/roles.service");
const all_exceptions_filter_1 = require("./filters/all-exceptions.filter");
const log_module_1 = require("./modules/log.module");
let AppModule = class AppModule {
    constructor(rolesService) {
        this.rolesService = rolesService;
    }
    async onModuleInit() {
        await this.rolesService.createInitialRoles();
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT) || 3306,
                username: process.env.DB_USERNAME || 'root',
                password: process.env.DB_PASSWORD || 'root',
                database: process.env.DB_DATABASE || 'exam_db',
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: true,
            }),
            auth_module_1.AuthModule,
            roles_module_1.RolesModule,
            contact_module_1.ContactModule,
            email_module_1.EmailModule,
            log_module_1.LogModule
        ],
        providers: [
            {
                provide: core_1.APP_FILTER,
                useClass: all_exceptions_filter_1.AllExceptionsFilter,
            },
        ]
    }),
    __metadata("design:paramtypes", [roles_service_1.RolesService])
], AppModule);
//# sourceMappingURL=app.module.js.map