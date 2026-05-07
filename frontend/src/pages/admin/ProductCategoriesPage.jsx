import CategoryCatalog from "../../components/admin/CategoryCatalog";
import { productCategoriesMock } from "../../mocks/productCategories.mock";

export default function ProductCategoriesPage() {
  return (
    <CategoryCatalog
      title="Categorias de productos"
      initialCategories={productCategoriesMock}
    />
  );
}
