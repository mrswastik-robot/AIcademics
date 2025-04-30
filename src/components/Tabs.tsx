import { useState } from "react";
import { cn } from "@/lib/utils";

interface TabItem {
  key: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultActiveKey?: string;
}

export default function Tabs({ items, defaultActiveKey }: TabsProps) {
  const [activeKey, setActiveKey] = useState(defaultActiveKey || items[0]?.key);

  return (
    <div className="w-full">
      <div className="border-b flex">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveKey(item.key)}
            className={cn(
              "px-4 py-2 font-medium text-sm transition-colors focus:outline-none",
              activeKey === item.key
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {items.find((item) => item.key === activeKey)?.content}
      </div>
    </div>
  );
} 