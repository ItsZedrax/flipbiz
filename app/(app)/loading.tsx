import { PageSkeleton } from "@/components/shared/skeletons";

export default function Loading() {
  return <PageSkeleton kpis={6} rows={5} />;
}
