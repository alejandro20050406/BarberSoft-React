import test from "node:test";
import assert from "node:assert/strict";
import { productStore } from "./productStore.js";
import { salesStore, __salesFinancialInternals } from "./salesStore.js";

const { allocateDiscountCents, buildCommissionRecord } = __salesFinancialInternals;

test.beforeEach(() => {
  productStore.__resetForTests();
  salesStore.__resetForTests();
});

test("allocateDiscountCents reparte el descuento completo sin perder centavos", () => {
  const allocations = allocateDiscountCents([10000, 10000, 10000], 1);

  assert.deepEqual(allocations, [1, 0, 0]);
  assert.equal(allocations.reduce((sum, value) => sum + value, 0), 1);
});

test("buildCommissionRecord calcula comision exacta para venta de servicio con descuento", () => {
  const commission = buildCommissionRecord({
    saleId: 1,
    employeeId: 1,
    employeeCommissionRate: 20,
    serviceSubtotal: 300,
    productSubtotal: 0,
    discount: 15.55,
    generatedAt: "2026-05-17T12:00:00.000Z",
  });

  assert.equal(commission.serviceNetSales, 284.45);
  assert.equal(commission.serviceDiscount, 15.55);
  assert.equal(commission.amount, 227.56);
  assert.equal(commission.adminAmount, 56.89);
  assert.equal(commission.productAmount, 0);
});

test("buildCommissionRecord calcula comision exacta para venta de producto", () => {
  const commission = buildCommissionRecord({
    saleId: 2,
    employeeId: 1,
    employeeCommissionRate: 15,
    serviceSubtotal: 0,
    productSubtotal: 199.99,
    discount: 9.99,
    generatedAt: "2026-05-17T12:00:00.000Z",
  });

  assert.equal(commission.productNetSales, 190);
  assert.equal(commission.productDiscount, 9.99);
  assert.equal(commission.amount, 28.5);
  assert.equal(commission.adminAmount, 0);
  assert.equal(commission.percentageLabel, "15% productos");
});

test("buildCommissionRecord prorratea descuento y mezcla comisiones de servicio y producto", () => {
  const commission = buildCommissionRecord({
    saleId: 3,
    employeeId: 1,
    employeeCommissionRate: 20,
    serviceSubtotal: 100,
    productSubtotal: 50,
    discount: 10,
    generatedAt: "2026-05-17T12:00:00.000Z",
  });

  assert.equal(commission.serviceDiscount, 6.67);
  assert.equal(commission.productDiscount, 3.33);
  assert.equal(commission.serviceNetSales, 93.33);
  assert.equal(commission.productNetSales, 46.67);
  assert.equal(commission.serviceAmount, 74.66);
  assert.equal(commission.productAmount, 9.33);
  assert.equal(commission.amount, 83.99);
  assert.equal(commission.adminAmount, 18.67);
  assert.equal(commission.percentageLabel, "80% servicios + 20% productos");
});

test("listSoldProducts resume unidades e ingresos de productos vendidos", () => {
  const currentUser = {
    id: 1,
    role: "admin",
    permissions: ["sales:manage"],
  };

  const sale = salesStore.createProductSale(
    {
      clientId: 1,
      employeeId: 1,
      paymentMethod: "cash",
      discount: 0,
      lineItems: [{ productId: 1, quantity: 2, unitPrice: 160, lineTotal: 320 }],
    },
    currentUser,
  );

  assert.equal(sale.ok, true);

  const summary = salesStore.listSoldProducts({ pageSize: 10 });

  assert.equal(summary.ok, true);
  assert.equal(summary.data.products.length, 1);
  assert.equal(summary.data.products[0].productId, 1);
  assert.equal(summary.data.products[0].unitsSold, 2);
  assert.equal(summary.data.products[0].grossRevenue, 320);
  assert.equal(summary.data.totals.unitsSold, 2);
});
