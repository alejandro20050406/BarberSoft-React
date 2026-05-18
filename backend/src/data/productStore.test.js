import test from "node:test";
import assert from "node:assert/strict";
import { productStore } from "./productStore.js";

test.beforeEach(() => {
  productStore.__resetForTests();
});

test("decreaseStock registra movimiento de inventario por venta", () => {
  const result = productStore.decreaseStock(1, 3, {
    saleId: 25,
    reason: "Venta de prueba",
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.product.stock, 7);
  assert.equal(result.data.movement.type, "sale");
  assert.equal(result.data.movement.previousStock, 10);
  assert.equal(result.data.movement.nextStock, 7);
  assert.equal(result.data.movement.saleId, 25);
});

test("update registra ajuste manual cuando cambia el stock", () => {
  const result = productStore.update(1, {
    category: "Geles y ceras",
    brand: "Natura",
    model: "Moco de Gorila",
    stock: 14,
    minStock: 2,
    cost: 80,
    price: 160,
    status: "active",
  });

  assert.equal(result.ok, true);

  const movements = productStore.listInventoryMovements({ type: "manual_adjustment", pageSize: 20 });

  assert.equal(movements.data.movements.length, 1);
  assert.equal(movements.data.movements[0].quantity, 4);
  assert.equal(movements.data.movements[0].nextStock, 14);
});

test("getInventoryStatus devuelve productos con stock bajo", () => {
  productStore.update(1, {
    category: "Geles y ceras",
    brand: "Natura",
    model: "Moco de Gorila",
    stock: 2,
    minStock: 2,
    cost: 80,
    price: 160,
    status: "active",
  });

  const status = productStore.getInventoryStatus();

  assert.equal(status.ok, true);
  assert.equal(status.data.totals.lowStock, 1);
  assert.equal(status.data.lowStockProducts[0].id, 1);
});
