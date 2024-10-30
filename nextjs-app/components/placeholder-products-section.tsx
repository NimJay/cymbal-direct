'use client';

import styles from './placeholder-products-section.module.css';
import { PRODUCTS } from '../products';


export default function PlaceholderProductsSection() {
  const productsLis = PRODUCTS.map((product, index) => {
    return (
      <li key={index} title="This product is just a placeholder." className={styles.productLi}>
        <div className={styles.productImgContainer}>
          <img src={product.imageHref} alt={product.name} />
          <div className={styles.productImgOverlay}></div>
        </div>
        <h3 className={styles.productName}>{product.name}</h3>
        <p className={styles.productPrice}>${product.price}</p>
      </li>
    );
  });
  return (
    <section className={styles.placeholderProductsSection}>
      <h2>Featured products</h2>
      <ul>{productsLis}</ul>
    </section>
  );
}
