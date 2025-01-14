import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserLoginHistory } from 'src/models/auth/user-login-history.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserLoginHistoryService {
  constructor(
    @InjectRepository(UserLoginHistory)
    private loginHistoryRepository: Repository<UserLoginHistory>
  ) {}

  async recordLogin(userId: number, userGuid: string, loginTime: Date, ipAddress: string, userAgent: string): Promise<UserLoginHistory> {
    const loginRecord = this.loginHistoryRepository.create({
      userId,
      userGuid,
      loginTime: loginTime,
      ipAddress,
      userAgent,
      deviceType: this.getDeviceType(userAgent)
    });

    return await this.loginHistoryRepository.save(loginRecord);
  }

  async recordLogout(userGuid: string): Promise<void> {
    // Find the most recent login record without a logout time
    const lastLoginRecord = await this.loginHistoryRepository.findOne({
      where: {
        userGuid,
        logoutTime: null
      },
      order: {
        loginTime: 'DESC'
      }
    });

    if (lastLoginRecord) {
      lastLoginRecord.logoutTime = new Date();
      await this.loginHistoryRepository.save(lastLoginRecord);
    }
  }

  async getUserLoginHistory(userGuid: string): Promise<UserLoginHistory[]> {
    return await this.loginHistoryRepository.find({
      where: { userGuid },
      order: { loginTime: 'DESC' }
    });
  }

  getDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
    const ua = userAgent.toLowerCase();

    // Check for tablets first as they may also match mobile patterns
    if (
      /ipad|tablet|playbook|silk/.test(ua) ||
      (/android/.test(ua) && !/mobile/.test(ua))
    ) {
      return 'tablet';
    }

    // Check for mobile devices
    if (
      /mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|webos|windows phone|iemobile/.test(ua)
    ) {
      return 'mobile';
    }

    // Default to desktop
    return 'desktop';
  }
}