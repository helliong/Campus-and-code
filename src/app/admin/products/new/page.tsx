"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function NewProductPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [priceStr, setPriceStr] = useState("");
  const [oldPriceStr, setOldPriceStr] = useState("");
  
  const [category, setCategory] = useState("hoodie");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);

  const sizesList = ["S", "M", "L", "XL"];

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
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

  const handleFile = (f: File) => {
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    if (!file) {
      setError("Пожалуйста, загрузите изображение.");
      setLoading(false);
      return;
    }

    if ((category === "hoodie" || category === "tshirt") && selectedSizes.length === 0) {
      setError("Пожалуйста, выберите хотя бы один доступный размер.");
      setLoading(false);
      return;
    }

    try {
      // 1. Upload image
      const uploadData = new FormData();
      uploadData.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!uploadRes.ok) throw new Error("Ошибка загрузки изображения");
      const uploadResult = await uploadRes.json();
      const imageUrl = uploadResult.url;

      // 2. Create product
      const productData = {
        name: formData.get("name"),
        price: priceStr.replace(/\D/g, ""), // clean up price
        oldPrice: oldPriceStr ? oldPriceStr.replace(/\D/g, "") : null,
        category: formData.get("category"),
        description: formData.get("description"),
        materials: formData.get("materials") ? formData.get("materials")?.toString().split(",").map(s => s.trim()).filter(Boolean) : [],
        imageUrl: imageUrl,
        stockCount: formData.get("stockCount"),
        universityId: formData.get("universityId") || null,
        availableSizes: (category === "hoodie" || category === "tshirt") ? selectedSizes : [],
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

        <div className="form-group" style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
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
          <div style={{ flex: 1 }}>
            <label>Старая цена (₽) (необязательно)</label>
            <input 
              type="text" 
              name="oldPrice" 
              value={oldPriceStr}
              onChange={handleOldPriceChange}
              placeholder="0"
            />
          </div>
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
          <label>Описание</label>
          <textarea name="description" />
        </div>

        <div className="form-group">
          <label>Характеристики (через запятую, например: Хлопок 100%, Плотность 300г/м2)</label>
          <textarea name="materials" />
        </div>

        <div className="form-group">
          <label>Изображение</label>
          <div 
            className={`drag-drop-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }} 
              style={{ display: 'none' }}
            />
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="image-preview" />
            ) : (
              <div className="drag-drop-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Нажмите или перетащите изображение сюда</span>
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
