# Testing Checklist — Product Improvements

## 🎯 Quick Test Guide

### Feature 1: Duplicate Name Prevention

#### Test Case 1.1: Create duplicate (exact match)
```
1. Go to /admin/productos/nuevo
2. Create product: name="Shampoo Herbal"
3. Submit → Success
4. Create another: name="Shampoo Herbal"
5. Submit → ❌ Error: "Ya existe un producto con ese nombre."
```

#### Test Case 1.2: Create duplicate (case-insensitive)
```
1. Existing product: "Shampoo Herbal"
2. Create new: name="SHAMPOO HERBAL"
3. Submit → ❌ Error: "Ya existe un producto con ese nombre."
```

#### Test Case 1.3: Create duplicate (whitespace)
```
1. Existing product: "Shampoo Herbal"
2. Create new: name="  shampoo herbal  "
3. Submit → ❌ Error: "Ya existe un producto con ese nombre."
```

#### Test Case 1.4: Update to duplicate name
```
1. Product A: "Acondicionador"
2. Product B: "Mascarilla"
3. Edit B → change name to "Acondicionador"
4. Submit → ❌ Error: "Ya existe un producto con ese nombre."
```

#### Test Case 1.5: Update same name (allowed)
```
1. Edit "Mascarilla"
2. Change description, leave name unchanged
3. Submit → ✅ Success
```

#### Test Case 1.6: Update with different case (allowed)
```
1. Existing name: "Mascarilla Natural"
2. Edit → change to "MASCARILLA NATURAL"
3. Submit → ✅ Success (same product, case doesn't matter)
```

---

### Feature 2: Stable Images

#### Test Case 2.1: Product without images shows fallback
```
1. Query product list with no images
2. ✅ Expected: Card shows gray box with "Sin imagen"
3. Click product → Detail page
4. ✅ Expected: "Sin imágenes disponibles" message
```

#### Test Case 2.2: Product with 1 valid image
```
1. Product has 1 image, displayOrder=0
2. ✅ Expected: 
   - List: Image shows, no hover effect
   - Detail: Single image, no thumbnails
```

#### Test Case 2.3: Product with 2+ images (hover crossfade)
```
1. Product has 3 images (displayOrder: 0, 1, 2)
2. ✅ Expected List:
   - Shows image[0] by default
   - Hover → crossfade to image[1]
   - Leave → fade back to image[0]
3. ✅ Expected Detail:
   - Shows image[0] full-size
   - 3 thumbnails below in correct order
   - Click thumbnail[2] → main image changes
```

#### Test Case 2.4: Edit product images (reorder)
```
1. Product has images A, B, C (displayOrder: 0, 1, 2)
2. Go to /admin/productos/[id]
3. Reorder: drag C to top, B second, A last
4. Submit
5. Refresh product page
6. ✅ Expected: Main image is now C, thumbnails order: C, B, A
```

#### Test Case 2.5: Edit product (remove all images)
```
1. Product has 2 images
2. Edit → remove both images
3. Submit → ❌ Error: "El producto requiere al menos una imagen."
```

#### Test Case 2.6: Edit product (keep 1 image)
```
1. Product has 3 images
2. Edit → remove 2, keep 1
3. Submit → ✅ Success
4. Check product page → Shows remaining image
```

---

## 🔍 Manual Verification Steps

### Database Integrity Check
```sql
-- Check no products share exact name (case-insensitive)
SELECT LOWER(TRIM(name)) as normalized_name, COUNT(*) as count
FROM products
GROUP BY LOWER(TRIM(name))
HAVING COUNT(*) > 1;
-- Expected: 0 rows (if all existing products are unique)

-- Check all products have at least 1 image
SELECT p.id, p.name, COUNT(pi.id) as image_count
FROM products p
LEFT JOIN product_images pi ON pi.product_id = p.id
GROUP BY p.id, p.name
HAVING COUNT(pi.id) = 0;
-- Expected: 0 rows (if constraint is enforced)

-- Check image displayOrder consistency
SELECT product_id, COUNT(DISTINCT display_order) as unique_orders, COUNT(*) as total_images
FROM product_images
GROUP BY product_id
HAVING COUNT(DISTINCT display_order) != COUNT(*);
-- Expected: 0 rows (no duplicates in displayOrder)
```

### Frontend Behavior Check

**Product Card (List View):**
```
✓ Image loads without flicker
✓ Hover crossfade smooth (when 2+ images)
✓ Fallback shows "Sin imagen" if no URL
✓ Alt text present (accessibility)
```

**Product Detail (Gallery):**
```
✓ Main image matches displayOrder=0
✓ Thumbnails in correct order
✓ Click thumbnail changes main image
✓ No broken image icons
✓ Fallback message if no images
```

**Admin Form:**
```
✓ Upload images one-by-one
✓ Preview thumbnails show immediately
✓ Drag to reorder (if implemented)
✓ Remove button on each thumbnail
✓ Can't submit with 0 images
✓ Duplicate name error shows below name field
```

---

## 🐛 Edge Cases to Test

### Edge Case 1: Unicode in product names
```
Input: "Shampoo — Edición Especial 🌿"
Expected: Duplicate check works with Unicode chars
```

### Edge Case 2: Very long product name
```
Input: 200 character name
Expected: No truncation in duplicate check
```

### Edge Case 3: Image URL with query params
```
Input: "https://example.com/image.jpg?w=500&h=500"
Expected: Valid URL, renders correctly
```

### Edge Case 4: Concurrent duplicate creation
```
1. User A starts creating "Shampoo X"
2. User B starts creating "Shampoo X" 
3. Both submit at same time
Expected: One succeeds, other fails (DB handles race)
```

### Edge Case 5: Image upload fails mid-form
```
1. Upload 3 images
2. Network error on 3rd
3. Form shows error for that file only
4. Can retry or submit with 2 images
Expected: Partial failure doesn't break form
```

---

## 📊 Performance Checks

### Query Performance
```sql
-- nameExistsForOther should be fast (<10ms)
EXPLAIN ANALYZE
SELECT id FROM products
WHERE LOWER(TRIM(name)) = LOWER(TRIM('Test Product'))
AND id != 'some-uuid';
-- Check: Uses index scan if name volume >1000

-- Image sync transaction should be atomic
BEGIN;
DELETE FROM product_images WHERE product_id = 'xyz';
INSERT INTO product_images (product_id, url, display_order) VALUES ...;
COMMIT;
-- Check: All or nothing (no orphaned images)
```

### Frontend Performance
```
✓ ProductCard renders <50ms (React DevTools)
✓ Image lazy loading works (no eager load for offscreen)
✓ Hover crossfade doesn't cause layout shift
✓ Gallery thumbnail clicks instant (<100ms)
```

---

## ✅ Definition of Done

- [ ] All test cases pass
- [ ] No TypeScript errors
- [ ] No console errors/warnings
- [ ] Spanish error messages show correctly
- [ ] Images render consistently across list/detail
- [ ] Duplicate names prevented (case-insensitive)
- [ ] Admin can create/edit products without issues
- [ ] Database queries efficient (<50ms for duplicate check)
- [ ] Accessibility: alt text present, keyboard nav works
- [ ] Mobile: Images responsive, no horizontal scroll

---

## 🚨 Rollback Plan (if needed)

If issues found in production:

```bash
# Revert files (Git)
git revert <commit-hash>

# Or manual rollback:
# 1. Remove ProductDuplicateNameError from domain.errors.ts
# 2. Remove nameExistsForOther from repository
# 3. Remove duplicate check from use cases
# 4. Remove images field from UpdateProductData
# 5. Revert ProductCard/Gallery to previous version

# No database migration needed (no schema change)
```

---

**Last Updated:** 2026-06-27  
**Tested By:** [Your Name]  
**Status:** Ready for Testing
