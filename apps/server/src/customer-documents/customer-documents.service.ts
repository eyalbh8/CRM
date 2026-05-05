import { Injectable } from "@nestjs/common";
import type { CustomerDocument } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import {
  CUSTOMER_DOCUMENT_TABLE_COLUMNS,
  type CustomerDocumentColumn,
} from "./customer-documents.columns";

export type CustomerDocumentRow = Record<string, unknown>;

export type CustomerDocumentsTableResponse = {
  columns: CustomerDocumentColumn[];
  data: CustomerDocumentRow[];
};

@Injectable()
export class CustomerDocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CustomerDocumentsTableResponse> {
    const documents = await this.prisma.customerDocument.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return {
      columns: CUSTOMER_DOCUMENT_TABLE_COLUMNS,
      data: documents.map((document) => this.toTableRow(document)),
    };
  }

  private toTableRow(document: CustomerDocument): CustomerDocumentRow {
    return {
      id: document.id,
      name: document.name,
      file_file_name: document.fileFileName,
      object: document.object,
      url: document.url,
      status: document.status,
      validation: document.validation,
      created_at: document.createdAt.toISOString(),
    };
  }
}
