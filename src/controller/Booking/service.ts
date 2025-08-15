

// Fungsi helper untuk mapping nameVilla → class
export function mapVillaToClass(nameVilla: string) {
  const name = nameVilla?.toLowerCase() || '';
  if (name.includes("garden pool villa")) {
    if (name.includes("deluxe")) return "Deluxe";
    return "Superior";
  }
  if (name.includes("residence")) return "Residence";
  return "Unknown";
}
