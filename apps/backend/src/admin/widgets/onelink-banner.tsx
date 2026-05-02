import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Text, Badge } from "@medusajs/ui";

const ONELINK_BLUE = "#2F8BD8";
const ONELINK_CHARCOAL = "#20242C";

const OnelinkBanner = () => {
  return (
    <Container className="p-6 mb-4 border-l-4" style={{ borderLeftColor: ONELINK_BLUE }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <svg width="56" height="32" viewBox="0 0 96 32" fill="none">
            <g
              stroke={ONELINK_BLUE}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            >
              <ellipse cx="34" cy="16" rx="14" ry="10" />
              <ellipse cx="62" cy="16" rx="14" ry="10" />
              <path d="M 18 16 L 4 16 M 9 11 L 4 16 L 9 21" />
              <path d="M 78 16 L 92 16 M 87 11 L 92 16 L 87 21" />
            </g>
          </svg>
          <div>
            <Heading level="h2" className="!text-base" style={{ color: ONELINK_CHARCOAL }}>
              Onelink Admin
            </Heading>
            <Text size="small" className="text-ui-fg-muted">
              Premium delivery, Kingston · One Link. Endless Possibilities.
            </Text>
          </div>
        </div>
        <Badge size="small" color="green">
          Live
        </Badge>
      </div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <Stat label="Region" value="Jamaica (JMD)" />
        <Stat label="Zones" value="10 Kingston" />
        <Stat label="Categories" value="7" />
        <Stat label="Payment" value="COD + Card" />
      </div>
    </Container>
  );
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ui-border-base px-3 py-2">
      <p className="text-ui-fg-muted uppercase tracking-wide text-[10px] font-medium">{label}</p>
      <p className="mt-0.5 font-medium text-ui-fg-base">{value}</p>
    </div>
  );
}

export const config = defineWidgetConfig({
  zone: "product.list.before",
});

export default OnelinkBanner;
