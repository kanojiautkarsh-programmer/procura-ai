import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, Req, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { Audit } from '../../common/audit/audit.decorator';
import { createInvoiceSchema, updateInvoiceSchema } from '../../common/validation/schemas';
import { ZodValidationPipe } from '../../common/validation/zod-validation.pipe';
import { StorageService } from '../../common/storage/storage.service';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly storage: StorageService,
  ) {}

  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ) {
    const orgId = (req as any).user?.organizationId;
    return this.invoicesService.findAll(orgId, { page, limit, status });
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const orgId = (req as any).user?.organizationId;
    return this.invoicesService.findOne(id, orgId);
  }

  @Post()
  @Audit({ action: 'created', entityType: 'invoice' })
  async create(@Req() req: Request, @Body(new ZodValidationPipe(createInvoiceSchema)) data: any) {
    const userId = (req as any).user?.id;
    data.createdById = userId;
    return this.invoicesService.create(data);
  }

  @Patch(':id')
  @Audit({ action: 'updated', entityType: 'invoice', entityIdParam: 'id' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateInvoiceSchema)) data: any,
  ) {
    const orgId = (req as any).user?.organizationId;
    return this.invoicesService.update(id, data, orgId);
  }

  @Delete(':id')
  @Audit({ action: 'deleted', entityType: 'invoice', entityIdParam: 'id' })
  async remove(@Req() req: Request, @Param('id') id: string) {
    const orgId = (req as any).user?.organizationId;
    return this.invoicesService.remove(id, orgId);
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadInvoice(
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(pdf|png|jpeg|tiff)$/ }),
        ],
      }),
    )
    file: any,
  ) {
    const orgId = (req as any).user?.organizationId;
    const userId = (req as any).user?.id;
    const key = this.storage.generateKey(orgId, file.originalname);
    await this.storage.uploadFile('invoices', key, file.buffer, file.mimetype);

    return this.invoicesService.create({
      vendorId: file.originalname,
      amount: 0,
      issueDate: new Date(),
      dueDate: new Date(),
      organizationId: orgId,
      createdById: userId,
      fileUrl: this.storage.getPublicUrl('invoices', key),
      description: `Uploaded: ${file.originalname}`,
    });
  }
}
