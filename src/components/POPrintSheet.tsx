"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import POPreview, { type POPreviewData } from "@/components/POPreview";
import { Download, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  data: POPreviewData;
}

export default function POPrintSheet({ open, onClose, data }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: data.poNumber ?? "Purchase-Order",
    pageStyle: `
      @page { size: A4; margin: 12mm 14mm; }
      @media print {
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
    `,
  });

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[900px] sm:max-w-[95vw] p-0 flex flex-col">
        <SheetHeader className="flex-row items-center justify-between px-5 py-3 border-b bg-white shrink-0">
          <div>
            <SheetTitle className="text-base font-semibold">{data.poNumber}</SheetTitle>
            <p className="text-xs text-gray-400 mt-0.5">{data.clientName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => handlePrint()} className="bg-[#0F6E56] hover:bg-[#0d5e49] h-8 text-sm">
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
          <div className="rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div ref={printRef} style={{ width: "100%" }}>
              <POPreview data={data} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
