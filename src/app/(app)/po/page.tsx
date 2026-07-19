import { FileCheck } from "lucide-react";

export default function POPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Purchase Orders</h1>
      <p className="text-sm text-gray-500 mb-8">Manage purchase orders from clients</p>
      <div className="bg-white rounded-xl border shadow-sm flex flex-col items-center justify-center py-24 text-gray-400">
        <FileCheck className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-lg font-medium">Coming Soon</p>
        <p className="text-sm mt-1">Purchase Order management will be available here.</p>
      </div>
    </div>
  );
}
