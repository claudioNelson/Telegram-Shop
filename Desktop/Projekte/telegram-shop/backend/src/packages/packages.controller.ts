import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PackagesService } from './packages.service';

@Controller('api/packages')
export class PackagesController {
  constructor(private packagesService: PackagesService) {}

  @Get()
  async getAllPackages() {
    return this.packagesService.getAllPackages(false);
  }

  @Get('billing/:billingType')
  async getPackagesByBillingType(@Param('billingType') billingType: string) {
    return this.packagesService.getPackagesByBillingType(billingType);
  }

  @Get(':id')
  async getPackageById(@Param('id') id: string) {
    return this.packagesService.getPackageById(parseInt(id));
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createPackage(
    @Request() req,
    @Body() body: any,
  ) {
    return this.packagesService.createPackage(body);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async updatePackage(
    @Param('id') id: string,
    @Request() req,
    @Body() body: any,
  ) {
    return this.packagesService.updatePackage(parseInt(id), body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deletePackage(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.packagesService.deletePackage(parseInt(id));
  }
}