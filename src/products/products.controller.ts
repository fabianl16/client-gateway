import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';
import { PaginationDto } from 'src/common';
import { NATS_SERVICE, PRODUCT_SERVICE } from 'src/config';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  @Post()
  createProduct(@Body() createProductDto: CreateProductDto){
    return this.client.send( { cmd: 'create_product'}, createProductDto);
  }

  @Get()
  findAllProducts( @Query() paginationDto: PaginationDto){
    return this.client.send( { cmd: 'find_all_products'}, paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number){

    return this.client.send({ cmd: 'find_one_product'}, { id })
      .pipe(
        catchError( err => { throw new RpcException(err)} )
      )

    // try {

    //  const product = await firstValueFrom(
    //   this.productsClient.send({ cmd: 'find_one_product'}, { id })
    //  );

    //  return product;

    // } catch (error) {
    //   throw new RpcException(error);
    // }


  }

  @Patch(':id')
  patchProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.client
      .send(
        { cmd: 'update_product' },
        {
          id,
          ...updateProductDto,
        },
      )
      .pipe(
        catchError((err) => {
          throw new RpcException(err);
        }),
      );
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string){
    return this.client.send({ cmd: 'delete_product'}, { id })
    .pipe(
      catchError( err => { throw new RpcException(err)} )
    )
  }



}
