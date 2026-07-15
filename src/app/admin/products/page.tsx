"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const fetchProducts = () => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    try {
      const res = await fetch(`/api/admin/products/${productToDelete}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchProducts();
      } else {
        alert("Ошибка при удалении");
      }
    } catch (err) {
      console.error(err);
      alert("Ошибка при удалении");
    } finally {
      setProductToDelete(null);
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Товары</h1>
        <Link href="/admin/products/new" className="admin-button">
          Добавить товар
        </Link>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <div className="admin-products-grid">
          {products.map((product) => (
            <div key={product.id} className="admin-product-card">
              <Image 
                src={product.imageUrl} 
                alt={product.name} 
                width={200} 
                height={200} 
                className="image-placeholder"
                unoptimized
              />
              <div className="admin-product-info">
                <h3>{product.name}</h3>
                <div className="price">{product.price} ₽</div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div className={`status ${product.isPublished ? 'active' : 'inactive'}`}>
                    {product.isPublished ? 'Опубликован' : 'Черновик'}
                  </div>
                  <button 
                    onClick={() => setProductToDelete(product.id)}
                    className="btn-delete"
                  >
                    Удалить
                  </button>
                </div>
                {product.university && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    Вуз: {product.university.shortName}
                  </div>
                )}
              </div>
            </div>
          ))}
          {products.length === 0 && <p>Товары не найдены.</p>}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>Удаление товара</h3>
            <p>Вы уверены, что хотите удалить этот товар? Это действие нельзя будет отменить.</p>
            <div className="delete-modal-actions">
              <button className="btn-cancel" onClick={() => setProductToDelete(null)}>Отмена</button>
              <button className="btn-confirm-delete" onClick={handleDeleteConfirm}>Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
