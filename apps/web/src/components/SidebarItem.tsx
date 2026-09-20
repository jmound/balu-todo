import { useState, type CSSProperties } from "react";
import { Icon } from "./Icon.js";
import { Badge } from "./Badge.js";

export interface SidebarItemProps {
  icon?: string;
  label: string;
  count?: number | string;
  active?: boolean;
  projectColor?: string;
  onClick?: () => void;
  action?: {
    icon: string;
    label: string;
    onClick: (e: React.MouseEvent) => void;
  };
  style?: CSSProperties;
}

export function SidebarItem({ icon, label, count, active = false, projectColor, onClick, action, style }: SidebarItemProps) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        height: 34,
        padding: "0 10px",
        border: "none",
        borderRadius: "var(--radius-control)",
        cursor: "pointer",
        textAlign: "left",
        background: active ? "var(--accent-wash)" : hover ? "var(--slate-100)" : "transparent",
        color: active ? "var(--accent)" : "var(--text-primary)",
        transition: "background var(--duration-fast) var(--ease-standard)",
        ...style,
      }}
    >
      {projectColor ? (
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: projectColor, flex: "none", margin: "0 4px" }} />
      ) : (
        <Icon name={icon ?? "circle"} size={18} color={active ? "var(--accent)" : "var(--text-secondary)"} />
      )}
      <span
        style={{
          flex: 1,
          fontFamily: "var(--font-sans)",
          fontSize: "15px",
          fontWeight: active ? "var(--weight-medium)" : "var(--weight-regular)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </span>
      {action && hover ? (
        <span
          role="button"
          tabIndex={0}
          aria-label={action.label}
          title={action.label}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick(e);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              action.onClick(e as unknown as React.MouseEvent);
            }
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 22,
            borderRadius: "var(--radius-control)",
            color: "var(--text-tertiary)",
            cursor: "pointer",
            flex: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red-600)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
        >
          <Icon name={action.icon} size={15} />
        </span>
      ) : (
        count != null && count !== "" && count !== 0 && <Badge tone="count">{count}</Badge>
      )}
    </button>
  );
}
