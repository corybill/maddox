export type ChildPageProps = {
  label: string;
};

export default function ChildPage({ label }: ChildPageProps) {
  return (
    <section data-testid="child-section">
      <p data-testid="child-label">{label}</p>
    </section>
  );
}
