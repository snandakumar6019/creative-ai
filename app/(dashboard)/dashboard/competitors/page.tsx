import { redirect } from "next/navigation";

export default function CompetitorsPage() {
  redirect(
    "/dashboard/product-pages?message=Open%20a%20product%20workspace%20to%20manage%20its%20competitors."
  );
}
