import CategoryCatalog from "../../components/admin/CategoryCatalog";
import { productCategoriesService } from "../../services/categoryServices";

export default function ProductCategoriesPage() {
  return (
    <CategoryCatalog
      title="Categorias de productos"
      service={productCategoriesService}
    />
  );
}
