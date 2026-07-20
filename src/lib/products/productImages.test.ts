import assert from "node:assert/strict";
import test from "node:test";
import { moveArrayItem } from "./productImages";

test("product image can be moved to the main position", () => {
  assert.deepEqual(moveArrayItem(["first", "second", "third"], 1, 0), [
    "second",
    "first",
    "third",
  ]);
});

test("product image order ignores invalid positions", () => {
  const images = ["first", "second"];
  assert.equal(moveArrayItem(images, 0, 3), images);
});
