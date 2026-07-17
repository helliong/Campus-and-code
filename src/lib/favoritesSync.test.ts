import assert from "node:assert/strict";
import test from "node:test";
import {
  filterValidFavoriteIds,
  getMissingFavoriteIds,
  mergeFavoriteIds,
} from "./favoritesSync";

test("api favorites sync merges db and local ids without duplicates", () => {
  assert.deepEqual(mergeFavoriteIds(["one", "two"], ["two", "three"]), [
    "one",
    "two",
    "three",
  ]);
});

test("api favorites sync finds ids absent from db favorites", () => {
  assert.deepEqual(getMissingFavoriteIds(["one", "two", "three"], ["one"]), [
    "two",
    "three",
  ]);
});

test("api favorites sync filters ids by existing product ids", () => {
  assert.deepEqual(
    filterValidFavoriteIds(["one", "missing", "two"], new Set(["one", "two"])),
    ["one", "two"],
  );
});
