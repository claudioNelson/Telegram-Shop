import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  async createPackage(data: any) {
    if (!data.name || !data.priceEur || !data.billingType) {
      throw new BadRequestException('name, priceEur, and billingType are required');
    }

    return (this.prisma as any).package.create({
      data: {
        name: data.name,
        description: data.description,
        priceEur: data.priceEur,
        commissionPercent: data.commissionPercent || 5.0,
        billingType: data.billingType,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async getAllPackages(includeInactive: boolean = false) {
    return (this.prisma as any).package.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { priceEur: 'asc' },
    });
  }

  async getPackageById(packageId: number) {
    const pkg = await (this.prisma as any).package.findUnique({
      where: { id: packageId },
    });

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    return pkg;
  }

  async updatePackage(packageId: number, data: any) {
    const pkg = await this.getPackageById(packageId);

    return (this.prisma as any).package.update({
      where: { id: packageId },
      data: {
        name: data.name || pkg.name,
        description: data.description !== undefined ? data.description : pkg.description,
        priceEur: data.priceEur || pkg.priceEur,
        commissionPercent: data.commissionPercent || pkg.commissionPercent,
        billingType: data.billingType || pkg.billingType,
        isActive: data.isActive !== undefined ? data.isActive : pkg.isActive,
      },
    });
  }

  async deletePackage(packageId: number) {
    const pkg = await this.getPackageById(packageId);

    return (this.prisma as any).package.delete({
      where: { id: packageId },
    });
  }

  async getPackagesByBillingType(billingType: string) {
    return (this.prisma as any).package.findMany({
      where: {
        billingType,
        isActive: true,
      },
      orderBy: { priceEur: 'asc' },
    });
  }
}