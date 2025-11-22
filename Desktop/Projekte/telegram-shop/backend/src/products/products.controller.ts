// src/products/products.controller.ts
import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';

@Controller('api/shops/:shopId/products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createProduct(
    @Param('shopId') shopId: string,
    @Request() req,
    @Body() body: any,
  ) {
    return this.productsService.createProduct(parseInt(shopId), req.user.userId, body);
  }

  @Get()
  async getProductsByShop(@Param('shopId') shopId: string) {
    return this.productsService.getProductsByShop(parseInt(shopId));
  }

  @Get(':productId')
  async getProductById(@Param('productId') productId: string) {
    return this.productsService.getProductById(parseInt(productId));
  }

  @Put(':productId')
  @UseGuards(AuthGuard('jwt'))
  async updateProduct(
    @Param('productId') productId: string,
    @Request() req,
    @Body() body: any,
  ) {
    return this.productsService.updateProduct(parseInt(productId), req.user.userId, body);
  }

  @Delete(':productId')
  @UseGuards(AuthGuard('jwt'))
  async deleteProduct(
    @Param('productId') productId: string,
    @Request() req,
  ) {
    return this.productsService.deleteProduct(parseInt(productId), req.user.userId);
  }
}