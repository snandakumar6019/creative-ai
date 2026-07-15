import { redirect } from "next/navigation";

export default function CreativeGeneratorPage() {
  redirect(
    "/dashboard/product-pages?message=Open%20a%20product%20workspace%20to%20generate%20creative."
  );
}
