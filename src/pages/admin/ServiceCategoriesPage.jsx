import CategoryCatalog from "../../components/admin/CategoryCatalog";
import { serviceCategoriesMock } from "../../mocks/serviceCategories.mock";

export default function ServiceCategoriesPage() {
  return (
    <CategoryCatalog
      title="Categorias de servicios"
      initialCategories={serviceCategoriesMock}
    />
  );
}
