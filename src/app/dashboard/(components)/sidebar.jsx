import Link from "next/link";
import {
  Home,
  ShoppingCart,
  Package,
  BarChart2,
  BookOpen,
  Box,
} from "lucide-react";

export function Sidebar() {
  return (
    <div className="flex flex-col w-64 bg-white border-r">
      <div className="flex items-center justify-center h-16 border-b">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-semibold">Stock Track Pro</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="p-2 space-y-1">
          <SidebarItem href="/dashboard" icon={Home} text="Dashboard" />
          <SidebarItem
            href="/dashboard/sales"
            icon={ShoppingCart}
            text="Sales"
          />
          <SidebarItem
            href="/dashboard/purchases"
            icon={Package}
            text="Purchases"
          />
          <SidebarItem href="/dashboard/products" icon={Box} text="Products" />
          <SidebarItem
            href="/dashboard/inventory"
            icon={BarChart2}
            text="Inventory"
          />
          <SidebarItem
            href="/dashboard/sales-book"
            icon={BookOpen}
            text="Sales Book"
          />
          <SidebarItem
            href="/dashboard/purchase-book"
            icon={BookOpen}
            text="Purchase Book"
          />
        </ul>
      </nav>
    </div>
  );
}

function SidebarItem({ href, icon: Icon, text }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center p-2 text-gray-600 rounded hover:bg-gray-100"
      >
        <Icon className="w-5 h-5 mr-3" />
        {text}
      </Link>
    </li>
  );
}
