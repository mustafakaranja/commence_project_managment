"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import InvoicePreview, { type InvoicePreviewData } from "@/components/InvoicePreview";
import { Download, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  data: InvoicePreviewData & { invoiceNumber: string };
}

export default function InvoicePrintSheet({ open, onClose, data }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${data.invoiceNumber}`,
    pageStyle: `
      @page { size: A4; margin: 12mm 14mm; }
      @media print {
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { font-size: 11px; }
      }
    `,
  });

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:w-[900px] sm:max-w-[95vw] p-0 flex flex-col"
      >
        {/* Toolbar */}
        <SheetHeader className="flex-row items-center justify-between px-5 py-3 border-b bg-white shrink-0">
          <div>
            <SheetTitle className="text-base font-semibold">
              {data.invoiceNumber}
            </SheetTitle>
            <p className="text-xs text-gray-400 mt-0.5">{data.clientName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handlePrint()}
              className="bg-[#0F6E56] hover:bg-[#0d5e49] h-8 text-sm"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Scrollable preview area */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
          <div className="rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* This div is what gets printed */}
            <div ref={printRef} style={{ width: "100%" }}>
              <InvoicePreview data={data} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
