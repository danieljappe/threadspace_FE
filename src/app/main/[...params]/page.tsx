import { DynamicRouteClient } from './DynamicRouteClient';

export async function generateStaticParams() {
  // For static export, we'll return an empty array since we can't know all possible routes at build time
  return [];
}

export default function DynamicRoutePage() {
  return <DynamicRouteClient />;
}
