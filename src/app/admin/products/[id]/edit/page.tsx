"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { getProductImageValidationResult } from "@/lib/images/clientImageValidation";
import {
  PRODUCT_IMAGE_ACCEPT,
  PRODUCT_IMAGE_MAX_FILES,
  PRODUCT_IMAGE_RULES_TEXT,
} from "@/lib/images/imageUploadRules";
import { variantKey } from "@/lib/products/productVariants";
import { moveArrayItem } from "@/lib/products/productImages";

type ImagesByColor = Record<string, string[]>;
type UniversityOption = {
  id: string;
  shortName: string;
  name: string;
};
type ProductVariantForm = {
  color?: string;
  size?: string;
  stock: number;
  sku?: string;
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: session } = useSession();
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialData, setInitialData] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingImagesByColor, setExistingImagesByColor] = useState<ImagesByColor>({});
  const [files, setFiles] = useState<File[]>([]);
  const [imageErrors, setImageErrors] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [colorFiles, setColorFiles] = useState<Record<string, File[]>>({});
  const [colorPreviewUrls, setColorPreviewUrls] = useState<Record<string, string[]>>({});
  const [newImageIsMain, setNewImageIsMain] = useState(false);
  const [newColorImageIsFirst, setNewColorImageIsFirst] = useState<Record<string, boolean>>({});
  const [stockByVariant, setStockByVariant] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const draggedImageRef = useRef<{
    scope: "general" | "color";
    kind: "existing" | "new";
    index: number;
    colorId?: string;
  } | null>(null);
  const [draggedImageKey, setDraggedImageKey] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ key: string; side: "before" | "after" } | null>(null);
  const [priceStr, setPriceStr] = useState("");
  const [oldPriceStr, setOldPriceStr] = useState("");
  
  const [category, setCategory] = useState("hoodie");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [universities, setUniversities] = useState<UniversityOption[]>([]);

  const sizesList = ["S", "M", "L", "XL"];
  const colorsList = [
    { id: "black", label: "Чёрный", hex: "#1A1A1A" },
    { id: "blue", label: "Синий", hex: "#1C2331" },
    { id: "white", label: "Белый", hex: "#F5F5F5" },
    { id: "gray", label: "Серый", hex: "#A9A9A9" },
    { id: "beige", label: "Бежевый", hex: "#EADDD7" },
    { id: "red", label: "Красный", hex: "#E63946" },
    { id: "green", label: "Зелёный", hex: "#2A9D8F" },
  ];

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (colorId: string) => {
    setSelectedColors(prev => 
      prev.includes(colorId) ? prev.filter(c => c !== colorId) : [...prev, colorId]
    );
  };

  const getColorLabel = (colorId: string) =>
    colorsList.find((color) => color.id === colorId)?.label || colorId;

  useEffect(() => {
    if (session?.user?.role !== "SUPERADMIN") return;

    fetch("/api/admin/universities")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: UniversityOption[]) => setUniversities(data))
      .catch(() => setUniversities([]));
  }, [session]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Товар не найден");
        return res.json();
      })
      .then(data => {
        setInitialData(data);
        setPriceStr(data.price?.toString() || "");
        if (data.oldPrice) setOldPriceStr(data.oldPrice.toString());
        setCategory(data.category || "hoodie");
        setSelectedSizes(data.availableSizes || []);
        setSelectedColors(data.availableColors || []);
        
        const images = data.images && data.images.length > 0 ? data.images : (data.imageUrl ? [data.imageUrl] : []);
        setExistingImages(images);
        setExistingImagesByColor((data.imagesByColor || {}) as ImagesByColor);
        const variantStock: Record<string, string> = {};
        ((data.variants || []) as ProductVariantForm[]).forEach((variant) => {
          variantStock[variantKey(variant.color, variant.size)] =
            variant.stock > 0 ? String(variant.stock) : "";
        });
        setStockByVariant(variantStock);
        
        setInitialLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setInitialLoading(false);
      });
  }, [id]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (!rawValue) {
      setPriceStr("");
      return;
    }
    setPriceStr(Number(rawValue).toLocaleString("ru-RU"));
  };

  const handleOldPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (!rawValue) {
      setOldPriceStr("");
      return;
    }
    setOldPriceStr(Number(rawValue).toLocaleString("ru-RU"));
  };

  const handleFiles = async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validationResult = await getProductImageValidationResult(fileArray);
    const nextImageErrors = [...validationResult.errors];
    const validFiles = validationResult.validFiles;

    const totalCount = existingImages.length + files.length + validFiles.length;
    let allowedFiles = validFiles;
    if (totalCount > PRODUCT_IMAGE_MAX_FILES) {
      nextImageErrors.push(`Можно загрузить не больше ${PRODUCT_IMAGE_MAX_FILES} изображений.`);
      allowedFiles = validFiles.slice(0, Math.max(0, PRODUCT_IMAGE_MAX_FILES - (existingImages.length + files.length)));
    }
    
    const newTotalFiles = [...files, ...allowedFiles];
    setImageErrors(nextImageErrors);
    setFiles(newTotalFiles);
    
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls(newTotalFiles.map(f => URL.createObjectURL(f)));
  };

  const handleColorFiles = async (colorId: string, newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validationResult = await getProductImageValidationResult(fileArray);
    const previousFiles = colorFiles[colorId] || [];
    const existingCount = existingImagesByColor[colorId]?.length || 0;
    const nextImageErrors = [...validationResult.errors];

    if (existingCount + previousFiles.length + validationResult.validFiles.length > PRODUCT_IMAGE_MAX_FILES) {
      nextImageErrors.push(`Для цвета ${getColorLabel(colorId)} можно загрузить не больше ${PRODUCT_IMAGE_MAX_FILES} изображений.`);
    }

    const nextFiles = [...previousFiles, ...validationResult.validFiles].slice(
      0,
      Math.max(0, PRODUCT_IMAGE_MAX_FILES - existingCount),
    );
    setImageErrors(nextImageErrors);
    setColorFiles((prev) => ({ ...prev, [colorId]: nextFiles }));

    colorPreviewUrls[colorId]?.forEach((url) => URL.revokeObjectURL(url));
    setColorPreviewUrls((prev) => ({
      ...prev,
      [colorId]: nextFiles.map((file) => URL.createObjectURL(file)),
    }));
  };

  const removeExistingImage = (idx: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageErrors([]);
    setExistingImages(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingColorImage = (colorId: string, idx: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageErrors([]);
    setExistingImagesByColor((prev) => ({
      ...prev,
      [colorId]: (prev[colorId] || []).filter((_, i) => i !== idx),
    }));
  };

  const removeFile = (idx: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updatedFiles = files.filter((_, i) => i !== idx);
    setImageErrors([]);
    setFiles(updatedFiles);
    if (newImageIsMain && updatedFiles.length === 0) setNewImageIsMain(false);
    
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls(updatedFiles.map(f => URL.createObjectURL(f)));
  };

  const removeColorFile = (colorId: string, idx: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updatedFiles = (colorFiles[colorId] || []).filter((_, i) => i !== idx);
    setImageErrors([]);
    setColorFiles((prev) => ({ ...prev, [colorId]: updatedFiles }));
    if (newColorImageIsFirst[colorId] && updatedFiles.length === 0) {
      setNewColorImageIsFirst((current) => ({ ...current, [colorId]: false }));
    }

    colorPreviewUrls[colorId]?.forEach((url) => URL.revokeObjectURL(url));
    setColorPreviewUrls((prev) => ({
      ...prev,
      [colorId]: updatedFiles.map((file) => URL.createObjectURL(file)),
    }));
  };

  const moveExistingImage = (fromIndex: number, toIndex: number) => {
    setExistingImages((current) => moveArrayItem(current, fromIndex, toIndex));
  };

  const moveNewImage = (fromIndex: number, toIndex: number) => {
    setFiles((current) => moveArrayItem(current, fromIndex, toIndex));
    setPreviewUrls((current) => moveArrayItem(current, fromIndex, toIndex));
  };

  const makeExistingImageMain = (imageIndex: number) => {
    moveExistingImage(imageIndex, 0);
    setNewImageIsMain(false);
  };

  const makeNewImageMain = (imageIndex: number) => {
    moveNewImage(imageIndex, 0);
    setNewImageIsMain(true);
  };

  const moveExistingColorImage = (colorId: string, fromIndex: number, toIndex: number) => {
    setExistingImagesByColor((current) => ({
      ...current,
      [colorId]: moveArrayItem(current[colorId] || [], fromIndex, toIndex),
    }));
  };

  const moveNewColorImage = (colorId: string, fromIndex: number, toIndex: number) => {
    setColorFiles((current) => ({
      ...current,
      [colorId]: moveArrayItem(current[colorId] || [], fromIndex, toIndex),
    }));
    setColorPreviewUrls((current) => ({
      ...current,
      [colorId]: moveArrayItem(current[colorId] || [], fromIndex, toIndex),
    }));
  };

  const makeExistingColorImageMain = (colorId: string, imageIndex: number) => {
    moveExistingColorImage(colorId, imageIndex, 0);
    setNewColorImageIsFirst((current) => ({ ...current, [colorId]: false }));
    setSelectedColors((current) => [colorId, ...current.filter((color) => color !== colorId)]);
  };

  const makeNewColorImageMain = (colorId: string, imageIndex: number) => {
    moveNewColorImage(colorId, imageIndex, 0);
    setNewColorImageIsFirst((current) => ({ ...current, [colorId]: true }));
    setSelectedColors((current) => [colorId, ...current.filter((color) => color !== colorId)]);
  };

  const dropGeneralImage = (targetKind: "existing" | "new", targetIndex: number) => {
    const draggedImage = draggedImageRef.current;
    draggedImageRef.current = null;
    setDraggedImageKey(null);
    setDropIndicator(null);
    if (!draggedImage || draggedImage.scope !== "general") return;

    if (draggedImage.kind === targetKind) {
      if (targetKind === "existing") moveExistingImage(draggedImage.index, targetIndex);
      else moveNewImage(draggedImage.index, targetIndex);
      return;
    }
    if (targetIndex !== 0) return;
    if (draggedImage.kind === "existing") makeExistingImageMain(draggedImage.index);
    else makeNewImageMain(draggedImage.index);
  };

  const dropColorImage = (
    colorId: string,
    targetKind: "existing" | "new",
    targetIndex: number,
  ) => {
    const draggedImage = draggedImageRef.current;
    draggedImageRef.current = null;
    setDraggedImageKey(null);
    setDropIndicator(null);
    if (
      !draggedImage
      || draggedImage.scope !== "color"
      || draggedImage.colorId !== colorId
    ) return;

    if (draggedImage.kind === targetKind) {
      if (targetKind === "existing") moveExistingColorImage(colorId, draggedImage.index, targetIndex);
      else moveNewColorImage(colorId, draggedImage.index, targetIndex);
      if (targetIndex === 0) {
        setSelectedColors((current) => [colorId, ...current.filter((color) => color !== colorId)]);
      }
      return;
    }
    if (targetIndex !== 0) return;
    if (draggedImage.kind === "existing") makeExistingColorImageMain(colorId, draggedImage.index);
    else makeNewColorImageMain(colorId, draggedImage.index);
  };

  const startImageDrag = (
    event: React.DragEvent,
    image: NonNullable<typeof draggedImageRef.current>,
    key: string,
  ) => {
    draggedImageRef.current = image;
    setDraggedImageKey(key);
    event.dataTransfer.effectAllowed = "move";
  };

  const markDropPosition = (
    event: React.DragEvent,
    target: { scope: "general" | "color"; kind: "existing" | "new"; index: number; colorId?: string },
    key: string,
  ) => {
    event.preventDefault();
    const draggedImage = draggedImageRef.current;
    if (
      !draggedImage
      || draggedImage.scope !== target.scope
      || draggedImage.colorId !== target.colorId
    ) return;
    setDropIndicator({
      key,
      side: draggedImage.kind === target.kind && draggedImage.index < target.index ? "after" : "before",
    });
  };

  const clearDragPreview = () => {
    draggedImageRef.current = null;
    setDraggedImageKey(null);
    setDropIndicator(null);
  };

  const getDragClassName = (key: string) => [
    draggedImageKey === key ? "is-dragging" : "",
    dropIndicator?.key === key ? `drop-${dropIndicator.side}` : "",
  ].filter(Boolean).join(" ");

  const uploadFile = async (file: File) => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: uploadData,
    });
    const uploadResult = await uploadRes.json();

    if (!uploadRes.ok) {
      throw new Error(uploadResult.error || "Ошибка загрузки изображения");
    }

    return uploadResult.url as string;
  };

  const buildVariants = (baseSku: string) => {
    if (selectedColors.length === 0) return [];

    const sizes = category === "hoodie" || category === "tshirt" ? selectedSizes : [undefined];

    return selectedColors.flatMap((color) =>
      sizes.map((size) => ({
        color,
        size,
        stock: Number(stockByVariant[variantKey(color, size)] || 0),
        sku: `${baseSku}-${color}${size ? `-${size}` : ""}`.replace(/\s+/g, "-"),
      })),
    );
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const usesColorImages = selectedColors.length > 0;
    const missingColorImages = selectedColors.filter(
      (color) =>
        (existingImagesByColor[color] || []).length === 0 &&
        (colorFiles[color] || []).length === 0,
    );

    if (!usesColorImages && existingImages.length === 0 && files.length === 0) {
      setError("Пожалуйста, загрузите хотя бы одно изображение.");
      setLoading(false);
      return;
    }

    if (usesColorImages && missingColorImages.length > 0) {
      setImageErrors(
        missingColorImages.map(
          (color) => `Загрузите хотя бы одно фото для цвета ${getColorLabel(color)}.`,
        ),
      );
      setLoading(false);
      return;
    }

    if ((category === "hoodie" || category === "tshirt") && selectedSizes.length === 0) {
      setError("Пожалуйста, выберите хотя бы один доступный размер.");
      setLoading(false);
      return;
    }

    try {
      const uploadedUrls: string[] = [];
      const finalImagesByColor: ImagesByColor = {};
      let finalImages: string[] = [];

      if (usesColorImages) {
        for (const color of selectedColors) {
          const newColorUrls: string[] = [];
          for (const file of colorFiles[color] || []) {
            newColorUrls.push(await uploadFile(file));
          }
          const existingColorUrls = existingImagesByColor[color] || [];
          finalImagesByColor[color] = newColorImageIsFirst[color] && newColorUrls.length > 0
            ? [newColorUrls[0], ...existingColorUrls, ...newColorUrls.slice(1)]
            : [...existingColorUrls, ...newColorUrls];
        }

        finalImages = selectedColors.flatMap((color) => finalImagesByColor[color] || []);
      } else {
        for (const file of files) {
          uploadedUrls.push(await uploadFile(file));
        }

        finalImages = newImageIsMain && uploadedUrls.length > 0
          ? [uploadedUrls[0], ...existingImages, ...uploadedUrls.slice(1)]
          : [...existingImages, ...uploadedUrls];
      }
      
      const imageUrl = finalImages[0] || "";
      const baseSku = formData.get("sku")?.toString().trim().replace(/\s+/g, "-") || "";
      const variants = buildVariants(baseSku);

      // 2. Update product
      const productData = {
        name: formData.get("name"),
        sku: baseSku,
        price: priceStr.replace(/\D/g, ""),
        oldPrice: oldPriceStr ? oldPriceStr.replace(/\D/g, "") : null,
        category: formData.get("category"),
        description: formData.get("description"),
        materials: formData.get("materials") ? formData.get("materials")?.toString().split(",").map(s => s.trim()).filter(Boolean) : [],
        imageUrl: imageUrl,
        images: finalImages,
        imagesByColor: finalImagesByColor,
        variants,
        stockCount: formData.get("stockCount"),
        universityId: formData.get("universityId") || initialData?.universityId,
        availableSizes: (category === "hoodie" || category === "tshirt") ? selectedSizes : [],
        availableColors: selectedColors,
        isPublished: true, 
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!res.ok) throw new Error("Ошибка обновления товара");

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div style={{ padding: "2rem" }}>Загрузка данных товара...</div>;
  }

  if (error && !initialData) {
    return <div style={{ padding: "2rem", color: "red" }}>{error}</div>;
  }

  return (
    <div>
      <div className="admin-header">
        <h1>Редактировать товар</h1>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        {error && <div style={{ color: "red" }}>{error}</div>}

        <div className="form-group">
          <label>Название</label>
          <input type="text" name="name" defaultValue={initialData?.name} required />
        </div>

        <div className="form-group">
          <label>Артикул (SKU)</label>
          <input type="text" name="sku" defaultValue={initialData?.sku} required maxLength={30} placeholder="Например: CC-HOOD-001" />
        </div>

        <div className="form-group">
          <label>Цена (₽)</label>
          <input 
            type="text" 
            name="price" 
            value={priceStr}
            onChange={handlePriceChange}
            required 
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label>Старая цена (₽) <span style={{ color: "var(--text-muted)", fontSize: "0.85em", fontWeight: "normal" }}>(необязательно)</span></label>
          <input 
            type="text" 
            name="oldPrice" 
            value={oldPriceStr}
            onChange={handleOldPriceChange}
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label>Категория</label>
          <select 
            name="category" 
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="hoodie">Худи</option>
            <option value="tshirt">Футболка</option>
            <option value="sticker">Стикеры</option>
            <option value="accessories">Аксессуары</option>
            <option value="mug">Кружка</option>
            <option value="other">Шопперы / Разное</option>
          </select>
        </div>

        {(category === "hoodie" || category === "tshirt") && (
          <div className="form-group">
            <label>Доступные размеры</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {sizesList.map(size => (
                <button 
                  key={size}
                  type="button"
                  className={`size-pill ${selectedSizes.includes(size) ? 'active' : ''}`}
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Доступные цвета</label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {colorsList.map(color => (
              <button 
                key={color.id}
                type="button"
                className={`color-pill ${selectedColors.includes(color.id) ? 'active' : ''}`}
                onClick={() => toggleColor(color.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 12px', borderRadius: '20px',
                  border: `2px solid ${selectedColors.includes(color.id) ? 'var(--text-main)' : 'var(--border-color)'}`,
                  background: 'var(--surface-color)', 
                  cursor: 'pointer',
                  color: 'var(--text-main)', 
                  fontWeight: selectedColors.includes(color.id) ? '600' : 'normal',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: color.hex, border: '1px solid var(--text-main)' }}></span>
                {color.label}
              </button>
            ))}
          </div>
        </div>

        {selectedColors.length > 0 && (
          <div className="form-group">
            <div className="variant-stock-header">
              <label>Остатки по вариантам</label>
              <button
                type="button"
                onClick={() => {
                  const sizes = category === "hoodie" || category === "tshirt" ? selectedSizes : [undefined];
                  const nextStock = { ...stockByVariant };

                  selectedColors.forEach((color) => {
                    sizes.forEach((size) => {
                      nextStock[variantKey(color, size)] = "";
                    });
                  });

                  setStockByVariant(nextStock);
                }}
              >
                Очистить
              </button>
            </div>
            <div
              className="variant-stock-matrix"
              style={{
                "--stock-columns": category === "hoodie" || category === "tshirt" ? Math.max(selectedSizes.length, 1) : 1,
              } as React.CSSProperties}
            >
              <div className="variant-stock-row variant-stock-row-head">
                <span>Цвет</span>
                {(category === "hoodie" || category === "tshirt" ? selectedSizes : ["Остаток"]).map((size) => (
                  <span key={size}>{size}</span>
                ))}
              </div>
              {selectedColors.map((color) => {
                const sizes = category === "hoodie" || category === "tshirt" ? selectedSizes : [undefined];

                return (
                  <div className="variant-stock-row" key={color}>
                    <div className="variant-stock-color">
                      <span
                        className="color-dot"
                        style={{ background: colorsList.find((item) => item.id === color)?.hex || "#111" }}
                      />
                      <strong>{getColorLabel(color)}</strong>
                    </div>
                    {sizes.map((size) => {
                      const key = variantKey(color, size);

                      return (
                        <input
                          key={key}
                          type="number"
                          min="0"
                          value={stockByVariant[key] || ""}
                          onChange={(event) =>
                            setStockByVariant((prev) => ({
                              ...prev,
                              [key]: event.target.value === "0" ? "" : event.target.value,
                            }))
                          }
                          placeholder="0"
                          aria-label={`Остаток ${getColorLabel(color)}${size ? ` ${size}` : ""}`}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Описание</label>
          <textarea name="description" defaultValue={initialData?.description || ""} />
        </div>

        <div className="form-group">
          <label>Характеристики (через запятую, например: Хлопок 100%, Плотность 300г/м2)</label>
          <textarea name="materials" defaultValue={initialData?.materials?.join(", ") || ""} />
        </div>

        {selectedColors.length > 0 && (
          <div className="form-group">
            <label>
              Фото по цветам
              <span style={{ display: "block", fontSize: "0.85em", color: "var(--text-muted)", fontWeight: "normal", marginTop: "4px" }}>
                {PRODUCT_IMAGE_RULES_TEXT} Для каждого выбранного цвета нужно хотя бы одно фото.
              </span>
            </label>
            <div className="color-image-groups">
              {selectedColors.map((color) => {
                const existingColorImages = existingImagesByColor[color] || [];
                const newColorPreviews = colorPreviewUrls[color] || [];

                return (
                  <div className="color-image-group" key={color}>
                    <div className="color-image-title">
                      <span
                        className="color-dot"
                        style={{ background: colorsList.find((item) => item.id === color)?.hex || "#111" }}
                      />
                      <strong>{getColorLabel(color)}</strong>
                    </div>
                    <div
                      className="drag-drop-zone compact"
                      onClick={(event) => {
                        if ((event.target as HTMLElement).tagName !== "BUTTON") {
                          document.getElementById(`color-file-${color}`)?.click();
                        }
                      }}
                    >
                      <input
                        id={`color-file-${color}`}
                        type="file"
                        accept={PRODUCT_IMAGE_ACCEPT}
                        multiple
                        onChange={(event) => {
                          if (event.target.files && event.target.files.length > 0) {
                            handleColorFiles(color, event.target.files);
                          }
                          event.target.value = "";
                        }}
                        style={{ display: "none" }}
                      />
                      {existingColorImages.length > 0 || newColorPreviews.length > 0 ? (
                        <div className="preview-gallery" style={{ display: "flex", gap: "10px", flexWrap: "wrap", padding: "10px" }}>
                          {existingColorImages.map((url, idx) => (
                            <div
                              key={url}
                              className={`product-image-preview-item ${selectedColors[0] === color && !newColorImageIsFirst[color] && idx === 0 ? "is-main" : ""} ${getDragClassName(`color-existing-${color}-${url}`)}`}
                              draggable
                              onDragStart={(event) => {
                                startImageDrag(event, { scope: "color", kind: "existing", colorId: color, index: idx }, `color-existing-${color}-${url}`);
                              }}
                              onDragOver={(event) => markDropPosition(event, { scope: "color", kind: "existing", colorId: color, index: idx }, `color-existing-${color}-${url}`)}
                              onDragEnd={clearDragPreview}
                              onDrop={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                dropColorImage(color, "existing", idx);
                              }}
                            >
                              <img src={url} alt={`${getColorLabel(color)} ${idx + 1}`} />
                              {selectedColors[0] === color && !newColorImageIsFirst[color] && idx === 0 && <span className="product-image-main-badge">Главная</span>}
                              <button
                                type="button"
                                onClick={(event) => removeExistingColorImage(color, idx, event)}
                                style={{ position: "absolute", top: "-5px", right: "-5px", background: "red", color: "white", borderRadius: "50%", width: "20px", height: "20px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          {newColorPreviews.map((url, idx) => (
                            <div
                              key={url}
                              className={`product-image-preview-item ${selectedColors[0] === color && newColorImageIsFirst[color] && idx === 0 ? "is-main" : ""} ${getDragClassName(`color-new-${color}-${url}`)}`}
                              draggable
                              onDragStart={(event) => {
                                startImageDrag(event, { scope: "color", kind: "new", colorId: color, index: idx }, `color-new-${color}-${url}`);
                              }}
                              onDragOver={(event) => markDropPosition(event, { scope: "color", kind: "new", colorId: color, index: idx }, `color-new-${color}-${url}`)}
                              onDragEnd={clearDragPreview}
                              onDrop={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                dropColorImage(color, "new", idx);
                              }}
                            >
                              <img src={url} alt={`${getColorLabel(color)} новое ${idx + 1}`} />
                              {selectedColors[0] === color && newColorImageIsFirst[color] && idx === 0 && <span className="product-image-main-badge">Главная</span>}
                              <button
                                type="button"
                                onClick={(event) => removeColorFile(color, idx, event)}
                                style={{ position: "absolute", top: "-5px", right: "-5px", background: "red", color: "white", borderRadius: "50%", width: "20px", height: "20px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          {existingColorImages.length + newColorPreviews.length < PRODUCT_IMAGE_MAX_FILES && (
                            <div style={{ width: "80px", height: "80px", border: "2px dashed var(--border-color)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>+</div>
                          )}
                        </div>
                      ) : (
                        <div className="drag-drop-placeholder">
                          <span>Нажмите, чтобы добавить фото для цвета {getColorLabel(color)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedColors.length === 0 && (
        <div className="form-group">
          <label>
            Изображения (до 8 штук)
            <span style={{ display: 'block', fontSize: '0.85em', color: 'var(--text-muted)', fontWeight: 'normal', marginTop: '4px' }}>
              {PRODUCT_IMAGE_RULES_TEXT} Перетаскивайте фото для изменения порядка. Первое фото станет обложкой.
            </span>
          </label>
          <div 
            className={`drag-drop-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={(e) => {
              if ((e.target as HTMLElement).tagName !== 'BUTTON') {
                fileInputRef.current?.click();
              }
            }}
          >
            <input 
              type="file" 
              accept={PRODUCT_IMAGE_ACCEPT}
              multiple
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFiles(e.target.files);
                }
                e.target.value = '';
              }} 
              style={{ display: 'none' }}
            />
            {existingImages.length > 0 || previewUrls.length > 0 ? (
              <div className="preview-gallery" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '10px' }}>
                {existingImages.map((url, idx) => (
                  <div
                    key={url}
                    className={`product-image-preview-item ${!newImageIsMain && idx === 0 ? "is-main" : ""} ${getDragClassName(`general-existing-${url}`)}`}
                    draggable
                    onDragStart={(event) => {
                      startImageDrag(event, { scope: "general", kind: "existing", index: idx }, `general-existing-${url}`);
                    }}
                    onDragOver={(event) => markDropPosition(event, { scope: "general", kind: "existing", index: idx }, `general-existing-${url}`)}
                    onDragEnd={clearDragPreview}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      dropGeneralImage("existing", idx);
                    }}
                  >
                    <img src={url} alt={`Existing ${idx + 1}`} />
                    {!newImageIsMain && idx === 0 && <span className="product-image-main-badge">Главная</span>}
                    <button 
                      type="button" 
                      onClick={(e) => removeExistingImage(idx, e)}
                      style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', width: '20px', height: '20px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                    >✕</button>
                  </div>
                ))}
                {previewUrls.map((url, idx) => (
                  <div
                    key={url}
                    className={`product-image-preview-item ${newImageIsMain && idx === 0 ? "is-main" : ""} ${getDragClassName(`general-new-${url}`)}`}
                    draggable
                    onDragStart={(event) => {
                      startImageDrag(event, { scope: "general", kind: "new", index: idx }, `general-new-${url}`);
                    }}
                    onDragOver={(event) => markDropPosition(event, { scope: "general", kind: "new", index: idx }, `general-new-${url}`)}
                    onDragEnd={clearDragPreview}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      dropGeneralImage("new", idx);
                    }}
                  >
                    <img src={url} alt={`Preview ${idx + 1}`} />
                    {newImageIsMain && idx === 0 && <span className="product-image-main-badge">Главная</span>}
                    <button 
                      type="button" 
                      onClick={(e) => removeFile(idx, e)}
                      style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', width: '20px', height: '20px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                    >✕</button>
                  </div>
                ))}
                {(existingImages.length + previewUrls.length) < 8 && (
                   <div style={{ width: '80px', height: '80px', border: '2px dashed var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>+</div>
                )}
              </div>
            ) : (
              <div className="drag-drop-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Нажмите или перетащите изображения сюда (до 8 штук)</span>
              </div>
            )}
          </div>
          {imageErrors.length > 0 && (
            <div className="upload-errors" role="alert">
              <div className="upload-errors-icon" aria-hidden="true">!</div>
              <div>
                <strong>Не удалось добавить часть изображений</strong>
                <ul>
                  {imageErrors.map((imageError) => (
                    <li key={imageError}>{imageError}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        )}

        {session?.user?.role === "SUPERADMIN" && (
          <div className="form-group">
            <label>Университет (для СуперАдмина)</label>
            <select name="universityId" defaultValue={initialData?.universityId || ""}>
              <option value="">Без университета (Глобальный)</option>
              {universities.map((university) => (
                <option key={university.id} value={university.id}>
                  {university.shortName || university.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedColors.length === 0 && (
          <div className="form-group">
            <label>Количество на складе</label>
            <input type="number" name="stockCount" defaultValue={initialData?.stockCount || 0} required min="0" />
          </div>
        )}

        <button type="submit" className="admin-button" style={{ width: '100%', marginTop: '20px' }} disabled={loading}>
          {loading ? "Сохранение..." : "Сохранить изменения"}
        </button>
      </form>
    </div>
  );
}
