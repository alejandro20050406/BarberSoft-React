import CategoryCatalog from "../../components/admin/CategoryCatalog";
import { serviceCategoriesService } from "../../services/categoryServices";

export default function ServiceCategoriesPage() {
  return (
    <CategoryCatalog
      title="Categorias de servicios"
      service={serviceCategoriesService}
    />
  );
}
