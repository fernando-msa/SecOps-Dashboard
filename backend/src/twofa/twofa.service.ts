import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/user.entity";
import * as crypto from "crypto";

@Injectable()
export class TwoFAService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>
  ) {}

  async generateSecret(userId: string) {
    const secret = this.generateBase32Secret();
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    // Store temporarily until verified
    (user as any).twoFASecret = secret;
    (user as any).twoFAEnabled = false;
    await this.usersRepo.save(user);

    const otpauthUrl = `otpauth://totp/SecOps:${user.email}?secret=${secret}&issuer=SecOps&digits=6&period=30`;

    return { secret, otpauthUrl };
  }

  async enable(userId: string, token: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user || !(user as any).twoFASecret) {
      throw new UnauthorizedException("Generate secret first");
    }

    const valid = this.verifyToken((user as any).twoFASecret, token);
    if (!valid) throw new UnauthorizedException("Invalid token");

    (user as any).twoFAEnabled = true;
    await this.usersRepo.save(user);

    return { enabled: true };
  }

  async disable(userId: string, token: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    if ((user as any).twoFAEnabled) {
      const valid = this.verifyToken((user as any).twoFASecret, token);
      if (!valid) throw new UnauthorizedException("Invalid token");
    }

    (user as any).twoFASecret = null;
    (user as any).twoFAEnabled = false;
    await this.usersRepo.save(user);

    return { enabled: false };
  }

  async verify(userId: string, token: string): Promise<boolean> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user || !(user as any).twoFAEnabled) return true; // 2FA not enabled

    return this.verifyToken((user as any).twoFASecret, token);
  }

  async getStatus(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    return {
      enabled: (user as any).twoFAEnabled || false,
    };
  }

  private verifyToken(secret: string, token: string): boolean {
    // TOTP verification - check current and adjacent windows
    const time = Math.floor(Date.now() / 1000 / 30);
    for (let i = -1; i <= 1; i++) {
      if (this.generateTOTP(secret, time + i) === token) return true;
    }
    return false;
  }

  private generateTOTP(secret: string, counter: number): string {
    const key = this.base32Decode(secret);
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(BigInt(counter));
    const hmac = crypto.createHmac("sha1", key).update(buffer).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);
    return String(code % 1000000).padStart(6, "0");
  }

  private generateBase32Secret(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let secret = "";
    const bytes = crypto.randomBytes(20);
    for (let i = 0; i < 32; i++) {
      secret += chars[bytes[i % 20] % 32];
    }
    return secret;
  }

  private base32Decode(encoded: string): Buffer {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = "";
    for (const c of encoded.toUpperCase()) {
      const val = chars.indexOf(c);
      if (val === -1) continue;
      bits += val.toString(2).padStart(5, "0");
    }
    const bytes: number[] = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      bytes.push(parseInt(bits.substring(i, i + 8), 2));
    }
    return Buffer.from(bytes);
  }
}
