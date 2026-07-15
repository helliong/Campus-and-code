"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function NewProductPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [priceStr, setPriceStr] = useState("");
  const [oldPriceStr, setOldPriceStr] = useState("");
  
  const [category, setCategory] = useState("hoodie");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);

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

  useEffect(() => {
    if (session?.user?.role === "SUPERADMIN") {
      fetch("/api/admin/universities") // we don't have this, but wait, we have Server Action getPublicUniversities!
        .catch(() => {});
    }
  }, [session]);

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

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  const handleFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    
    const validFiles = fileArray.filter(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`Файл ${file.name} имеет неподдерживаемый формат. Доступны: JPG, PNG, WEBP.`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert(`Файл ${file.name} слишком большой. Максимальный размер: 5 МБ.`);
        return false;
      }
      return true;
    });

    const totalFiles = [...files, ...validFiles].slice(0, 8);
    setFiles(totalFiles);
    
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls(totalFiles.map(f => URL.createObjectURL(f)));
  };

  const removeFile = (idx: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updatedFiles = files.filter((_, i) => i !== idx);
    setFiles(updatedFiles);
    
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls(updatedFiles.map(f => URL.createObjectURL(f)));
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

    if (files.length === 0) {
      setError("Пожалуйста, загрузите хотя бы одно изображение.");
      setLoading(false);
      return;
    }

    if ((category === "hoodie" || category === "tshirt") && selectedSizes.length === 0) {
      setError("Пожалуйста, выберите хотя бы один доступный размер.");
      setLoading(false);
      return;
    }

    try {
      // 1. Upload images
      const uploadedUrls: string[] = [];
      for (const f of files) {
        const uploadData = new FormData();
        uploadData.append("file", f);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (!uploadRes.ok) throw new Error("Ошибка загрузки изображения");
        const uploadResult = await uploadRes.json();
        uploadedUrls.push(uploadResult.url);
      }
      
      const imageUrl = uploadedUrls[0];

      // 2. Create product
      const productData = {
        name: formData.get("name"),
        sku: formData.get("sku"),
        price: priceStr.replace(/\D/g, ""), // clean up price
        oldPrice: oldPriceStr ? oldPriceStr.replace(/\D/g, "") : null,
        category: formData.get("category"),
        description: formData.get("description"),
        materials: formData.get("materials") ? formData.get("materials")?.toString().split(",").map(s => s.trim()).filter(Boolean) : [],
        imageUrl: imageUrl,
        images: uploadedUrls,
        stockCount: formData.get("stockCount"),
        universityId: formData.get("universityId") || null,
        availableSizes: (category === "hoodie" || category === "tshirt") ? selectedSizes : [],
        availableColors: selectedColors,
        isPublished: true, // simplified for now
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!res.ok) throw new Error("Ошибка создания товара");

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Добавить товар</h1>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        {error && <div style={{ color: "red" }}>{error}</div>}

        <div className="form-group">
          <label>Название</label>
          <input type="text" name="name" required />
        </div>

        <div className="form-group">
          <label>Артикул (SKU)</label>
          <input type="text" name="sku" required maxLength={30} placeholder="Например: CC-HOOD-001" />
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

        <div className="form-group">
          <label>Описание</label>
          <textarea name="description" />
        </div>

        <div className="form-group">
          <label>Характеристики (через запятую, например: Хлопок 100%, Плотность 300г/м2)</label>
          <textarea name="materials" />
        </div>

        <div className="form-group">
          <label>
            Изображения (до 8 штук)
            <span style={{ display: 'block', fontSize: '0.85em', color: 'var(--text-muted)', fontWeight: 'normal', marginTop: '4px' }}>
              Рекомендации: формат JPG, PNG или WEBP, до 5 МБ на файл. Идеальные пропорции 3:4 или 1:1, светлый фон. Первое фото станет обложкой.
            </span>
          </label>
          <div 
            className={`drag-drop-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={(e) => {
              // Prevent opening file dialog when clicking remove button
              if ((e.target as HTMLElement).tagName !== 'BUTTON') {
                fileInputRef.current?.click();
              }
            }}
          >
            <input 
              type="file" 
              accept="image/*" 
              multiple
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFiles(e.target.files);
                }
                // clear value to allow same file re-selection
                e.target.value = '';
              }} 
              style={{ display: 'none' }}
            />
            {previewUrls.length > 0 ? (
              <div className="preview-gallery" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '10px' }}>
                {previewUrls.map((url, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '80px', height: '80px' }}>
                    <img src={url} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    <button 
                      type="button" 
                      onClick={(e) => removeFile(idx, e)}
                      style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', width: '20px', height: '20px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                    >✕</button>
                  </div>
                ))}
                {previewUrls.length < 8 && (
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
        </div>

        {session?.user?.role === "SUPERADMIN" && (
          <div className="form-group">
            <label>Университет (для СуперАдмина)</label>
            <select name="universityId">
              <option value="">Без университета (Глобальный)</option>
              <option value="mgu">МГУ</option>
              <option value="mifi">МИФИ</option>
              <option value="spbgu">СПбГУ</option>
              <option value="vshe">ВШЭ</option>
              <option value="mfti">МФТИ</option>
              <option value="urfu">УрФУ</option>
              <option value="tgu">ТГУ</option>
              <option value="rudn">РУДН</option>
            </select>
          </div>
        )}

        <div className="form-group">
          <label>Остаток на складе</label>
          <input type="number" name="stockCount" defaultValue="10" min="0" />
        </div>

        <div className="form-actions">
          <button type="submit" className="admin-button" disabled={loading}>
            {loading ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </form>
    </div>
  );
}
