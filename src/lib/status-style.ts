export function statusBadgeClass(status: string) {
  switch (status) {
    case "Paid":
    case "Approved":
      return "bg-[#E1F5EE] text-[#0F6E56] hover:bg-[#E1F5EE] border-transparent";
    case "Unpaid":
    case "Pending":
      return "bg-amber-50 text-amber-800 hover:bg-amber-50 border-transparent";
    case "Close":
      return "bg-gray-100 text-gray-600 hover:bg-gray-100 border-transparent";
    case "Open":
      return "bg-sky-50 text-sky-800 hover:bg-sky-50 border-transparent";
    default:
      return "bg-white text-gray-600";
  }
}
