import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const items = await query<any[]>(
      "SELECT * FROM InventoryItem ORDER BY name"
    );

    const mapped = items.map((item: any) => {
      let status = "in-stock";
      if (item.stock === 0) status = "out-of-stock";
      else if (item.stock <= item.minStock * 0.3) status = "critical";
      else if (item.stock < item.minStock) status = "low-stock";

      return {
        id: item.id,
        name: item.name,
        category: item.category,
        stock: item.stock,
        minStock: item.minStock,
        price: `$${item.price.toFixed(2)}`,
        priceValue: item.price,
        status,
        supplier: item.supplier || "",
        lastOrdered: item.lastOrdered ? new Date(item.lastOrdered).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Never",
      };
    });

    const stats = {
      total: mapped.length,
      inStock: mapped.filter((i: any) => i.status === "in-stock").length,
      lowStock: mapped.filter((i: any) => i.status === "low-stock").length,
      critical: mapped.filter((i: any) => i.status === "critical" || i.status === "out-of-stock").length,
    };

    return NextResponse.json({ items: mapped, stats });
  } catch (error) {
    console.error("Inventory error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, stock, minStock, price, supplier } = body;
    const id = `inv_${Date.now()}`;
    await query(
      "INSERT INTO InventoryItem (id, name, category, stock, minStock, price, supplier) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, name, category, stock || 0, minStock || 5, price, supplier || null]
    );
    return NextResponse.json({ id, success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create inventory item" }, { status: 500 });
  }
}
